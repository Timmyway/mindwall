import { defineStore, storeToRefs } from "pinia";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { getNanoid, imageToBase64 } from "@/helpers/utils";
import { MwImageConfig, MwTextConfig } from "@/types/konva.config";
import useImageUtility from "@/composable/useImageUtility";
import { useImageGalleryStore } from "./imageGalleryStore";
import { useWidgetSettingStore } from "./widgetSettingStore";
import { TextGeneratorOption } from "@/types/infinidea.types";
import AiApi from "@/api/AiApi";
import { MenuItemCommandEvent } from "primevue/menuitem";

export const useCanvasOperationsStore = defineStore('canvasOperations', () => {
    const canvasStore = useCanvasStore();
    const galleryStore = useImageGalleryStore();
    const widgetStore = useWidgetSettingStore();
    const { selectedConfigName, transformer, wall, selectedGroupName, selectedConfig } = storeToRefs(canvasStore);
    const { calcOptimizedImageDimension, resizeImage } = useImageUtility();
    const { isMwTextConfig, isMwImageConfig } = useCanvasConditions();

    const addImageToWall = (src: string | File = 'https://www.pngall.com/wp-content/uploads/5/Yellow-Jersey.png') => {
        let groupName;
        if (selectedGroupName.value) {
            groupName = selectedGroupName.value;
        } else {
            groupName = addGroup();
        }
        const imageIdentifier = `${groupName}-image-${getNanoid()}`;
        const newMwImageConfig: MwImageConfig = {
            id: imageIdentifier,
            name: imageIdentifier,
            is: 'image',
            width: 100,
            height: 100,
            x: selectedConfig.value?.x ?? 0,
            y: selectedConfig.value?.y ?? 0,
            draggable: true
        };

        if (typeof src === 'string') {
            // Handle loading an image from a URL
            const im = new window.Image();
            im.src = src;
            im.onload = () => {
                newMwImageConfig.image = im;
                const { w, h } = calcOptimizedImageDimension(im);
                newMwImageConfig.width = w;
                newMwImageConfig.height = h;

                wall[groupName].items[imageIdentifier] = newMwImageConfig;
            }
        } else {
            // Handle loading an image from a File object
            const reader = new FileReader();
            reader.onload = (event) => {
                const im = new window.Image();
                im.src = event.target?.result as string;
                im.onload = () => {
                    const { w, h } = calcOptimizedImageDimension(im);
                    newMwImageConfig.width = w;
                    newMwImageConfig.height = h;
                    newMwImageConfig.image = im;

                    // Resize the image before adding it to the wall
                    const resizedImage = resizeImage(im, w, h); // Example max width and height
                    newMwImageConfig.image = resizedImage;

                    wall[groupName].items[imageIdentifier] = newMwImageConfig;
                }
            };
            reader.readAsDataURL(src);
        }
        galleryStore.hideBankImageGallery();
    };

    const removeConfig = (groupName: string, configName: string) => {
        if (wall[groupName] && wall[groupName].items[configName]) {
        delete wall[groupName].items[configName];
        } else {
        console.log(`Config with name ${configName} not found in group ${groupName}.`);
        }
    };

    const removeText = (groupName: string, textId: string) => {
        if (wall[groupName] && wall[groupName].items[textId]) {
            delete wall[groupName].items[textId];
        } else {
        console.log(`Text with id ${textId} not found in group ${groupName}.`);
        }
    };

    const deleteShape = () => {
        // Check if the selected config is available and is an MwImageConfig
        if (selectedConfig.value) {
            // Get the selected group and config name
            const groupName = selectedGroupName.value;
            const configName = selectedConfigName.value;

            if (groupName && configName) {
                // Check if the group exists
                if (wall.value[groupName] && wall.value[groupName].items[configName]) {
                    // Delete the shape config from the items object
                    delete wall.value[groupName].items[configName];
                    console.log(`---- 99 -> '${configName}' shape has been removed from group '${groupName}'`);

                    // Check if the group is empty after deleting the shape
                    if (Object.keys(wall.value[groupName].items).length === 0) {
                        // If the group is empty, delete the group itself
                        delete wall.value[groupName];
                        console.log(`---- 99 -> Group '${groupName}' has been removed because it became empty.`);
                    }
                }
            }
        }
    };

    /* Add options */
    const addLayer = () => {
        const layerName = `group-${getNanoid()}`;
        wall.value.layers[layerName] = {
            id: layerName,
            name: layerName,
            is: 'layer',
        }
    }

    const addGroup = (layerName: string) => {
        const groupName = `group-${getNanoid()}`;
        console.log('==> Add new group: ', groupName);
        const newGroup = {
            id: groupName,
            name: groupName,
            is: 'group',
            scaleX: 1,
            scaleY: 1,
            visible: true,
            draggable: true,
            items: {},
        };
        wall.value.layers[layerName][groupName] = newGroup;
        return groupName;
    };

    const addAiTextToWall = async (iaFeeling = 'cold', base64Image: string | null = null) => {
        // const thematicName = prompt('For which thematic?');
        // if (!thematicName || thematicName.trim() === '') {
        //     return;
        // }
        widgetStore.isLoading.aiGenerateText = true;
        try {
            let thematicName = null;
            const aiOption: TextGeneratorOption = {
                engine: widgetStore.usedEngine.slug,
                base64Image: null,
                language: widgetStore.usedLanguage,
            }

            if (selectedConfig.value) {
                if (isMwTextConfig(selectedConfig.value)) {
                    thematicName = selectedConfig.value.text;
                }
                else if (isMwImageConfig(selectedConfig.value)) {
                    thematicName = 'Infinidea-Image';
                    aiOption.base64Image = await imageToBase64(selectedConfig.value.image as HTMLImageElement);
                }
            } else {
                thematicName = prompt('For which thematic?');
                if (!thematicName || thematicName.trim() === '') {
                    widgetStore.isLoading.aiGenerateText = false;
                    return;
                }
            }
            console.log('===> Detail: ');
            if (thematicName) {
                // Back up the initial group to which the generated text belongs
                const response = await AiApi.aiGenerateText(thematicName, iaFeeling, aiOption);
                // const generatedText = await parseTextFromMarkDown(response.data.generatedText);
                const generatedText = await response.data.generatedText;

                addTextToWall(generatedText);
                widgetStore.isLoading.aiGenerateText = false;
            } else {
                widgetStore.isLoading.aiGenerateText = false;
            }
        } catch (error) {
            console.log('Error: ', error);
            widgetStore.isLoading.aiGenerateText = false;
        }
    }

    const aiImageExplain = async (iaFeeling: string) => {
        if (isMwImageConfig(selectedConfig.value)) {
            // console.log('Ai image explain', selectedConfig.value.image.src);
            const base64Image = await imageToBase64(selectedConfig.value.image as HTMLImageElement);
            if (base64Image) {
                addAiTextToWall(iaFeeling, base64Image);
            }
        }
    }

    const addTextToWall = (text: string = 'Unleash your thoughts !', options = { defaultTextSize: 320 }) => {
        // Create a new group
        let textIdentifier: string;
        const { defaultTextSize } = options;
        if (selectedGroupName.value) {
            textIdentifier = `${selectedGroupName.value}-text-${getNanoid()}`;
        } else {
            let newGroupName = addGroup();
            selectedGroupName.value = newGroupName;
            textIdentifier = `${newGroupName}-text-${getNanoid()}`;
        }

        // Estimate the position of a new Text, place it near the parent if possible.
        let estimateX = canvasStore.center.x - 10;
        let estimateY = canvasStore.center.y -50;
        if (selectedConfig.value) {
            estimateX = selectedConfig.value.x ?? (canvasStore.center.x - 10);
            estimateY = selectedConfig.value?.y ? (selectedConfig.value?.y - 50) : (center.y - 50);
        }

        const newMwTextConfig: MwTextConfig = {
            id: textIdentifier,
            name: textIdentifier,
            is: 'text',
            rotation: 0,
            x: estimateX,
            y: estimateY,
            scaleX: 1,
            scaleY: 1,
            fontFamily: 'Montserrat',
            fontSize: 20,
            text: text,
            fill: 'black',
            visible: true,
            width: defaultTextSize,
            align: 'left',
            lineHeight: 1.7,
            draggable: true,
        };

        wall.value[selectedGroupName.value].items[textIdentifier] = newMwTextConfig;
    };

    const cloneGroup = (groupName: string): string | null => {
        const originalGroup = wall.value[groupName];
        if (!originalGroup) return null;

        const newGroupName = addGroup();
        const newGroup = wall.value[newGroupName];

        // Clone properties of the original group
        newGroup.scaleX = originalGroup.scaleX;
        newGroup.scaleY = originalGroup.scaleY;
        newGroup.visible = originalGroup.visible;
        newGroup.draggable = originalGroup.draggable;

        // Clone items of the original group and generate unique IDs for each
        Object.keys(originalGroup.items).forEach(itemId => {
            const originalItem = originalGroup.items[itemId];
            const itemCopyName = `${newGroupName}-${originalItem.is}-${getNanoid()}`;
            const newItem = { ...originalItem, id: itemCopyName, name: itemCopyName };
            newGroup.items[newItem.id] = newItem;
        });

        return newGroupName;
    };

    const handleCloneGroup = (event: MenuItemCommandEvent) => {
        if (selectedGroupName.value) {
            const clonedGroupName = cloneGroup(selectedGroupName.value);
            console.log('Cloned group:', clonedGroupName);
        }
    };

    /* SET ZINDEX */
    const bringToTop = () => {
        if (selectedConfig.value && selectedGroupName.value) {
            const groupName = selectedGroupName.value;
            const configName = selectedConfig.value.name;

            const group = wall.value[groupName];
            if (group && group.items) {
                const items = Object.values(group.items);

                // Find the maximum zIndex among siblings
                const maxZIndex = items.reduce((maxIndex, item) => {
                    return item.zIndex !== undefined && item.zIndex > maxIndex ? item.zIndex : maxIndex;
                }, -1);

                // Calculate the new zIndex
                const newZIndex = maxZIndex + 1;

                // Check if the new zIndex exceeds the expected range
                if (newZIndex >= items.length) {
                    // Adjust zIndex to stay within valid range
                    selectedConfig.value.zIndex = items.length - 1;
                    transformer.value.zIndex = items.length - 1;
                    console.warn(`Adjusted zIndex to ${items.length - 1} to stay within valid range.`);
                } else {
                    selectedConfig.value.zIndex = newZIndex;
                    transformer.value.zIndex = newZIndex;
                    // console.log('-- 400 -> Transformer value: ', transformer.value.getNode());
                }

                console.log(`Set zIndex of ${configName} to ${selectedConfig.value.zIndex}`);
            }
        }
    };

    const bringToBack = () => {
        if (selectedConfig.value && selectedGroupName.value) {
            const groupName = selectedGroupName.value;
            const configName = selectedConfig.value.name;

            const group = wall.value[groupName];
            if (group && group.items) {
                const items = Object.values(group.items);

                // Find the minimum zIndex among siblings, ensuring undefined zIndexes are ignored
                const minZIndex = items.reduce((minIndex, item) => {
                    if (item.zIndex !== undefined) {
                        return item.zIndex < minIndex ? item.zIndex : minIndex;
                    }
                    return minIndex;
                }, Number.MAX_SAFE_INTEGER);

                // Calculate the new zIndex
                let newZIndex = minZIndex - 1;

                // Ensure newZIndex is non-negative and within the range of siblings
                newZIndex = Math.max(0, newZIndex);

                // If the newZIndex is still higher than the zIndex of all items, set it to 0
                if (newZIndex < minZIndex) {
                    newZIndex = 0;
                }

                // Set the zIndex
                selectedConfig.value.zIndex = newZIndex;

                console.log(`Set zIndex of ${configName} to ${selectedConfig.value.zIndex} of ${minZIndex}`);
            }
        }
    };

    return { addLayer, addGroup, addTextToWall, aiImageExplain, addImageToWall,
        removeConfig, removeText, addAiTextToWall, deleteShape, handleCloneGroup,
        bringToTop, bringToBack,
    }
});
