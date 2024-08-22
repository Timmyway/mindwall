import { defineStore, storeToRefs } from "pinia";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { getNanoid, imageToBase64 } from "@/helpers/utils";
import { MwGroupConfig, MwImageConfig, MwLayerConfig, MwNode, MwTextConfig } from "@/types/konva.config";
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
    const { selectedConfigName, transformer, wall, selectedLayerInfo } = storeToRefs(canvasStore);
    const { calcOptimizedImageDimension, resizeImage } = useImageUtility();
    const { isMwTextConfig, isMwImageConfig, isMwGroupConfig, isMwLayerConfig } = useCanvasConditions();

    const addImageToWall = (
        src: string | File = 'https://www.pngall.com/wp-content/uploads/5/Yellow-Jersey.png'
    ) => {
        // Determine parent ID based on selectedLayerInfo or selectedConfig
        let parentId = '';
        let selectedConfigGroup = null;
        if (canvasStore.selectedConfig) {
            selectedConfigGroup = canvasStore.findParentGroup(canvasStore.selectedConfig);
        }
        console.log('==============> Selected config group: ', selectedConfigGroup)
        if (!isMwGroupConfig(selectedConfigGroup)) {
            if (!canvasStore.selectedLayerInfo) {
                // Add to the first layer if no layer is selected
                console.log('-- 540 -> Add to the first layer');
                if (canvasStore.wall.layers[0]?.id) {
                    parentId = canvasStore.wall.layers[0].id;
                }
            } else {
                // Add to the selected item's layer
                parentId = canvasStore.selectedLayerInfo.id;
                console.log('-- 541 -> Add to selected layer');
            }
        } else {
            // Add to the selected group
            console.log('-- 542 -> Add to selected group', selectedConfigGroup);
            parentId = selectedConfigGroup.id ?? '';
        }

        console.log('-- 543 -> PID: ', parentId);

        // Generate unique identifier for the image
        const imageIdentifier = `image-${getNanoid()}`;

        // Estimate position for the new image
        let estimateX = canvasStore.center.x - 50;
        let estimateY = canvasStore.center.y - 50;
        if (canvasStore.selectedConfig) {
            estimateX = canvasStore.selectedConfig.x ?? canvasStore.center.x - 50;
            estimateY = canvasStore.selectedConfig.y ?? canvasStore.center.y - 50;
        }

        const newMwImageConfig: MwImageConfig = {
            id: imageIdentifier,
            name: imageIdentifier,
            parent: parentId,
            is: 'image',
            x: estimateX,
            y: estimateY,
            width: 100,
            height: 100,
            draggable: true,
        };

        // Find the layer or group where we need to add the image
        const parent = canvasStore.wall.layers.find(layer => layer.id === parentId) ||
            findParentIteratively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

        console.log('-- 547 -> Parent: ', parent);
        if (parent && 'items' in parent) {
            // Ensure items is defined before pushing
            if (!parent.items) {
                parent.items = []; // Initialize items if it's undefined
            }

            // Handle image loading
            if (typeof src === 'string') {
                const im = new window.Image();
                im.src = src;
                im.onload = () => {
                    const { w, h } = calcOptimizedImageDimension(im);
                    newMwImageConfig.width = w;
                    newMwImageConfig.height = h;
                    newMwImageConfig.image = im;

                    parent.items.push(newMwImageConfig);
                };
                im.onerror = () => {
                    console.error(`Failed to load image from URL: ${src}`);
                };
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const im = new window.Image();
                    im.src = event.target?.result as string;
                    im.onload = () => {
                        const { w, h } = calcOptimizedImageDimension(im);
                        newMwImageConfig.width = w;
                        newMwImageConfig.height = h;
                        newMwImageConfig.image = im;

                        parent.items.push(newMwImageConfig);
                    };
                    im.onerror = () => {
                        console.error('Failed to load image from file.');
                    };
                };
                reader.readAsDataURL(src);
            }
        } else {
            console.error(`Parent with ID ${parentId} not found`);
        }

        galleryStore.hideBankImageGallery();
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
        if (canvasStore.selectedConfig) {
            const configName = canvasStore.selectedConfigName;

            if (configName) {
                // Create a stack to handle layers and groups
                const stack: (MwLayerConfig|MwNode)[] = [...canvasStore.wall.layers];
                let found = false;

                while (stack.length > 0) {
                    const currentLayer = stack.pop();

                    // Ensure that currentLayer is of the expected type
                    if (currentLayer && currentLayer.items) {
                        // Check if the item exists in the current layer's items
                        const itemIndex = currentLayer.items.findIndex((item: MwNode) => item.id === configName);
                        if (itemIndex !== -1) {
                            const itemToDelete = currentLayer.items[itemIndex];

                            // If the found item is a group, delete its items first
                            if (isMwGroupConfig(itemToDelete)) {
                                // Add all nested groups and their items to the stack
                                const nestedItems = itemToDelete.items;
                                currentLayer.items.splice(itemIndex, 1); // Remove the group itself
                                stack.push(...nestedItems); // Push nested items to the stack for deletion
                                console.log(`Group '${itemToDelete.id}' and all its items have been removed from layer '${currentLayer.id}'`);
                            } else {
                                // Delete the shape or group config from the items array
                                currentLayer.items.splice(itemIndex, 1); // Remove the item
                                console.log(`'${configName}' shape or group has been removed from layer '${currentLayer.id}'`);
                            }

                            found = true;

                            // Check if the layer's items are empty after deleting the shape or group
                            if (currentLayer.items.length === 0) {
                                console.log(`Layer '${currentLayer.id}' has no more items.`);
                            }

                            // Exit the loop after deletion
                            break;
                        }

                        // Push nested groups onto the stack for further inspection
                        const nestedGroups = currentLayer.items.filter((item: MwNode) => isMwGroupConfig(item)) as MwGroupConfig[];
                        stack.push(...nestedGroups);
                    }

                    // Exit the loop if the shape or group was found and deleted
                    if (found) {
                        break;
                    }
                }

                if (!found) {
                    console.log(`'${configName}' shape or group not found.`);
                }
            }
        }
    };

    /* Add options */
    const addLayer = (): string => {
        if (!canvasStore.wall.layers) {
            // Initialize layers if it doesn't exist
            canvasStore.wall.layers = [];
        }

        const layerId = `layer-${getNanoid()}`;

        const newLayer: MwLayerConfig = {
            id: layerId,
            name: layerId,
            is: 'layer',
            items: [], // Initialize with an empty items object
        };

        canvasStore.wall.layers.push(newLayer);

        return layerId ?? '';
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

            if (canvasStore.selectedConfig) {
                if (isMwTextConfig(canvasStore.selectedConfig)) {
                    thematicName = canvasStore.selectedConfig.text;
                }
                else if (isMwImageConfig(canvasStore.selectedConfig)) {
                    thematicName = 'Infinidea-Image';
                    aiOption.base64Image = await imageToBase64(canvasStore.selectedConfig.image as HTMLImageElement);
                }
            } else {
                thematicName = prompt('For which thematic?');
                if (!thematicName || thematicName.trim() === '') {
                    widgetStore.isLoading.aiGenerateText = false;
                    return;
                }
            }
            if (thematicName) {
                console.log('-- 570 -> Thematic found: ', thematicName);
                // Back up the initial group to which the generated text belongs
                const response = await AiApi.aiGenerateText(thematicName, iaFeeling, aiOption);
                // const generatedText = await parseTextFromMarkDown(response.data.generatedText);
                const generatedText = await response.data.generatedText;

                addTextToWall(generatedText);
                widgetStore.isLoading.aiGenerateText = false;
            } else {
                console.warn('-- 570 -> No thematic found');
                console.warn('-- 571 -> Config: ', canvasStore.selectedConfig);
                widgetStore.isLoading.aiGenerateText = false;
            }
        } catch (error) {
            console.log('Error: ', error);
            widgetStore.isLoading.aiGenerateText = false;
        }
    }

    const aiImageExplain = async (iaFeeling: string) => {
        if (isMwImageConfig(canvasStore.selectedConfig)) {
            // console.log('Ai image explain', canvasStore.selectedConfig.image.src);
            const base64Image = await imageToBase64(canvasStore.selectedConfig.image as HTMLImageElement);
            if (base64Image) {
                addAiTextToWall(iaFeeling, base64Image);
            }
        }
    }

    const addTextToWall = (
        text: string = 'Unleash your thoughts!',
        options: { defaultTextSize: number } = { defaultTextSize: 320 }
    ) => {
        const { defaultTextSize } = options;

        // Determine parent ID based on groupId or selectedLayerInfo
        let parentId = '';
        if (!isMwGroupConfig(canvasStore.selectedConfig)) {
            if (!canvasStore.selectedLayerInfo) {
                // We add to the first layer
                console.log('-- 540 -> add to first layer')
                if (canvasStore.wall.layers[0]?.id) {
                    parentId = canvasStore.wall.layers[0].id;
                }
            } else {
                // We add to the selected item's layer
                parentId = canvasStore.selectedLayerInfo.id;
                console.log('-- 541 -> add to selected layer')
            }
        } else {
            // We add to a group
            console.log('-- 542 -> add to selected group', canvasStore.selectedConfig)
            parentId = canvasStore.selectedConfig.id ?? '';
        }

        console.log('-- 543 -> PID: ', parentId)

        // Generate unique identifier for the text
        const textIdentifier = `text-${getNanoid()}`;

        // Estimate position for the new text
        let estimateX = canvasStore.center.x - 10;
        let estimateY = canvasStore.center.y - 50;
        if (canvasStore.selectedConfig) {
            estimateX = canvasStore.selectedConfig.x ?? canvasStore.center.x - 10;
            estimateY = canvasStore.selectedConfig.y ?? canvasStore.center.y - 50;
        }

        const newMwTextConfig: MwTextConfig = {
            id: textIdentifier,
            name: textIdentifier,
            parent: parentId,
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

        // Find the layer or group where we need to add the text
        const parent = canvasStore.wall.layers.find(layer => layer.id === parentId) ||
            findParentIteratively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

        console.log('-- 547 -> Parent: ', parent)
        if (parent && 'items' in parent) {
            // Ensure items is defined before pushing
            if (!parent.items) {
                parent.items = []; // Initialize items if it's undefined
            }
            parent.items.push(newMwTextConfig);
        } else {
            // Handle case where parent wasn't found
            console.error(`Parent with ID ${parentId} not found`);
        }
    };

    const findParentIteratively = (parentId: string, items: MwNode[]): MwGroupConfig | undefined => {
        const stack: MwNode[] = [...items]; // Initialize the stack with the root items

        while (stack.length > 0) {
            const item = stack.pop()!; // Get the last item from the stack

            if (item.id === parentId && item.is === 'group') {
                return item as MwGroupConfig;
            }

            // If the item is a group, push its children onto the stack
            if (item.is === 'group') {
                const group = item as MwGroupConfig;
                if (group.items) {
                    stack.push(...group.items);
                }
            }
        }

        return undefined; // If no parent found, return undefined
    };

    const groupSelectedItems = (parentId: string = ''): string => {
        // Check if there are selected items to group
        if (canvasStore.selectedItems.length === 0) {
            console.error('No items selected to group');
            return ''; // Return an empty string or handle as needed
        }

        const groupId = `group-${getNanoid()}`;

        // Create a new group configuration
        const newGroup: MwGroupConfig = {
            id: groupId,
            name: groupId, // Use a meaningful name if needed
            is: 'group',
            scaleX: 1,
            scaleY: 1,
            visible: true,
            draggable: true,
            items: [], // Start with an empty items array
            parent: parentId || null,
        };

        // Iterate over selected items to move them to the new group
        for (const selectedItem of canvasStore.selectedItems) {
            // Find the current layer or group of the selected item
            const parentLayer = canvasStore.wall.layers.find(layer =>
                layer.items?.some(item => item.id === selectedItem.id)
            );

            if (parentLayer && parentLayer.items) {
                // Update the parent of the selected item to the new group
                selectedItem.parent = groupId;

                // Add the selected item to the new group's items
                newGroup.items.push(selectedItem);

                // Remove the selected item from its original parent
                const itemIndex = parentLayer.items.findIndex(item => item.id === selectedItem.id);
                if (itemIndex !== -1) {
                    parentLayer.items.splice(itemIndex, 1);
                }
            }
        }

        // Find the parent layer or group where the new group should be added
        const parent = canvasStore.wall.layers.find(layer => layer.id === parentId) ||
            findParentIteratively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

        if (parent && 'items' in parent) {
            // Ensure items is defined before pushing
            if (!parent.items) {
                parent.items = []; // Initialize items if it's undefined
            }
            parent.items.push(newGroup); // Add the new group to the parent
        } else if (!parentId && canvasStore.wall.layers[0]?.id) {
            // Add to the first layer if no parent is specified
            if (canvasStore.wall.layers[0]?.items) {
                canvasStore.wall.layers[0].items.push(newGroup);
            }
        } else {
            console.error(`Parent with ID ${parentId} not found`);
        }

        // Clear selected items after grouping
        canvasStore.clearSelectedItems();

        return groupId; // Return the ID of the new group
    };

    const addGroup = (parentId: string = ''): string => {
        const groupId = `group-${getNanoid()}`;

        const newGroup: MwGroupConfig = {
            id: groupId,
            name: groupId,
            is: 'group',
            scaleX: 1,
            scaleY: 1,
            visible: true,
            draggable: true,
            items: [],
            parent: parentId || null,
        };

        // Find the parent layer or group where the new group should be added
        const parent = canvasStore.wall.layers.find(layer => layer.id === parentId) ||
            findParentRecursively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

        if (parent && 'items' in parent) {
            // Ensure items is defined before pushing
            if (!parent.items) {
                parent.items = []; // Initialize items if it's undefined
            }
            parent.items.push(newGroup);
        } else if (!parentId && canvasStore.wall.layers[0]?.id) {
            // Add to the first layer if no parent is specified
            if (canvasStore.wall.layers[0]?.items) {
                canvasStore.wall.layers[0].items.push(newGroup);
            }
        } else {
            console.error(`Parent with ID ${parentId} not found`);
        }

        return groupId;
    };

    const groupShapesOrGroups = (selectedItems: MwNode[], groupId: string = ''): string => {
        const parentId = groupId || addGroup();

        // Move selected items into the new or existing group
        const parent = findParentRecursively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

        if (parent && 'items' in parent) {
            selectedItems.forEach(item => {
                // Remove item from its original location
                const originalParent = findParentRecursively(item.parent, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));
                originalParent?.items?.splice(originalParent.items?.findIndex(i => i.id === item.id), 1);

                // Update item's parent reference
                item.parent = parentId;

                // Add item to the new group's items
                if (!parent.items) {
                    parent.items = []; // Initialize items if it's undefined
                }
                parent.items.push(item);
            });
        } else {
            console.error(`Parent group with ID ${parentId} not found`);
        }

        return parentId;
    };

    const cloneGroup = (groupName: string): string | null => {
        const originalGroup = canvasStore.wall[groupName];
        if (!originalGroup) return null;

        const newGroupName = addGroup();
        const newGroup = canvasStore.wall[newGroupName];

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
        if (canvasStore.selectedConfig && selectedGroupName.value) {
            const groupName = selectedGroupName.value;
            const configName = canvasStore.selectedConfig.name;

            const group = canvasStore.wall[groupName];
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
                    canvasStore.selectedConfig.zIndex = items.length - 1;
                    transformer.value.zIndex = items.length - 1;
                    console.warn(`Adjusted zIndex to ${items.length - 1} to stay within valid range.`);
                } else {
                    canvasStore.selectedConfig.zIndex = newZIndex;
                    transformer.value.zIndex = newZIndex;
                    // console.log('-- 400 -> Transformer value: ', transformer.value.getNode());
                }

                console.log(`Set zIndex of ${configName} to ${canvasStore.selectedConfig.zIndex}`);
            }
        }
    };

    const bringToBack = () => {
        if (canvasStore.selectedConfig && selectedGroupName.value) {
            const groupName = selectedGroupName.value;
            const configName = canvasStore.selectedConfig.name;

            const group = canvasStore.wall[groupName];
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
                canvasStore.selectedConfig.zIndex = newZIndex;

                console.log(`Set zIndex of ${configName} to ${canvasStore.selectedConfig.zIndex} of ${minZIndex}`);
            }
        }
    };

    return { addLayer, addGroup, addTextToWall, aiImageExplain, addImageToWall,
        removeConfig, removeText, addAiTextToWall, deleteShape, handleCloneGroup,
        bringToTop, bringToBack, groupSelectedItems,
    }
});
