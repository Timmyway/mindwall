import { defineStore, storeToRefs } from "pinia";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { getNanoid, imageToBase64 } from "@/helpers/utils";
import { MwGroupConfig, MwImageConfig, MwLayerConfig, MwTextConfig } from "@/types/konva.config";
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
    const { selectedConfigName, transformer, wall, selectedConfig } = storeToRefs(canvasStore);
    const { calcOptimizedImageDimension, resizeImage } = useImageUtility();
    const { isMwTextConfig, isMwImageConfig, isMwGroupConfig, isMwLayerConfig } = useCanvasConditions();

    const addImageToWall = (src: string | File = 'https://www.pngall.com/wp-content/uploads/5/Yellow-Jersey.png') => {
        let groupName: string;

        // Determine the group name
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
                const { w, h } = calcOptimizedImageDimension(im);
                newMwImageConfig.width = w;
                newMwImageConfig.height = h;
                newMwImageConfig.image = im;

                // Ensure the layer exists before adding the image
                if (wall.value.layers && wall.value.layers[groupName]) {
                    wall.value.layers[groupName].items![imageIdentifier] = newMwImageConfig;
                }
            }
            im.onerror = () => {
                console.error(`Failed to load image from URL: ${src}`);
            };
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

                    // Resize the image if necessary
                    const resizedImage = resizeImage(im, w, h); // Ensure this function is implemented
                    newMwImageConfig.image = resizedImage;

                    // Ensure the layer exists before adding the image
                    if (wall.value.layers && wall.value.layers[groupName]) {
                        wall.value.layers[groupName].items![imageIdentifier] = newMwImageConfig;
                    }
                }
                im.onerror = () => {
                    console.error('Failed to load image from file.');
                };
            };
            reader.readAsDataURL(src);
        }

        galleryStore.hideBankImageGallery(); // Ensure galleryStore is properly imported and used
    };

    const removeConfig = (groupName: string, configName: string) => {
        // if (wall[groupName] && wall[groupName].items[configName]) {
        // delete wall[groupName].items[configName];
        // } else {
        // console.log(`Config with name ${configName} not found in group ${groupName}.`);
        // }
    };

    const removeText = (groupName: string, textId: string) => {
        // if (wall[groupName] && wall[groupName].items[textId]) {
        //     delete wall[groupName].items[textId];
        // } else {
        // console.log(`Text with id ${textId} not found in group ${groupName}.`);
        // }
    };

    const deleteShape = () => {
        // Check if the selected config is available
        if (selectedConfig.value) {
            const configName = selectedConfigName.value;

            if (configName) {
                // Iterate through all layers to find the shape or group
                for (const layerKey in wall.value.layers) {
                    const layer = wall.value.layers[layerKey];

                    // Ensure that items is defined before accessing it
                    if (layer.items && layer.items[configName]) {
                        // Delete the shape or group config from the items object
                        delete layer.items[configName];
                        console.log(`'${configName}' shape or group has been removed from layer '${layerKey}'`);

                        // Check if the layer's items are empty after deleting the shape or group
                        if (Object.keys(layer.items).length === 0) {
                            // Optionally handle the case where the layer is empty
                            console.log(`Layer '${layerKey}' has no more items.`);
                        }
                        break; // Exit the loop once the shape or group is found and deleted
                    }
                }
            }
        }
    };

    /* Add options */
    const addLayer = (): string => {
        if (!wall.value.layers) {
            // Initialize layers if it doesn't exist
            wall.value.layers = [];
        }

        const layerId = `layer-${getNanoid()}`;

        const newLayer: MwLayerConfig = {
            id: layerId,
            name: layerId,
            is: 'layer',
            items: [], // Initialize with an empty items object
        };

        wall.value.layers.push(newLayer);

        return layerId ?? '';
    };

    const addGroup = (layerName: string): string | null => {
        // Check if the layer exists in the wall configuration
        const layer = wall.value.layers?.[layerName];
        if (!layer) {
            console.error(`Layer "${layerName}" not found.`);
            return null;
        }

        const groupName = `group-${getNanoid()}`;
        console.log('==> Add new group: ', groupName);

        const newGroup: MwGroupConfig = {
            id: groupName,
            name: groupName,
            is: 'group',
            scaleX: 1,
            scaleY: 1,
            visible: true,
            draggable: true,
            items: {},
        };

        // Add the new group to the layer's items
        layer.items![groupName] = newGroup;

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

    const addTextToWall = (
        text: string = 'Unleash your thoughts !',
        options: { defaultTextSize: number } = { defaultTextSize: 320 }
    ) => {
        const { defaultTextSize } = options;

        // Ensure addLayer returns the layer ID
        const parentLayerId = addLayer();

        // Generate unique identifier for the text
        const textIdentifier = `text-${getNanoid()}`;

        // Estimate position for the new text
        let estimateX = canvasStore.center.x - 10;
        let estimateY = canvasStore.center.y - 50;
        if (selectedConfig.value) {
            estimateX = selectedConfig.value.x ?? canvasStore.center.x - 10;
            estimateY = selectedConfig.value.y ?? canvasStore.center.y - 50;
        }

        const newMwTextConfig: MwTextConfig = {
            id: textIdentifier,
            name: textIdentifier,
            parent: parentLayerId,
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

        // Find the layer where we need to add the text
        const layer = wall.value.layers.find(layer => layer.id === parentLayerId);

        if (layer) {
            // Add the text config to the items of the parent layer
            layer.items?.push(newMwTextConfig);
        } else {
            // Handle case where layer wasn't found
            console.error(`Layer with ID ${parentLayerId} not found`);
        }
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
