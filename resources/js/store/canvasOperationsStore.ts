import { defineStore, storeToRefs } from "pinia";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { getNanoid, imageToBase64 } from "@/helpers/utils";
import { MwCircleConfig, MwGroupConfig, MwImageConfig, MwLayerConfig, MwNode, MwRectConfig, MwShapeConfig, MwTextConfig } from "@/types/konva.config";
import useImageUtility from "@/composable/useImageUtility";
import { useImageGalleryStore } from "./imageGalleryStore";
import { useWidgetSettingStore } from "./widgetSettingStore";
import { TextGeneratorOption } from "@/types/infinidea.types";
import AiApi from "@/api/AiApi";
import { MenuItemCommandEvent } from "primevue/menuitem";
import useBasicOperations from "@/composable/canvas/useBasicOperations";

export const useCanvasOperationsStore = defineStore('canvasOperations', () => {
    const canvasStore = useCanvasStore();
    const galleryStore = useImageGalleryStore();
    const widgetStore = useWidgetSettingStore();
    const { calcOptimizedImageDimension } = useImageUtility();
    const { isMwTextConfig, isMwImageConfig, isMwGroupConfig, isMwShapeConfig} = useCanvasConditions();
    const { setupNewLayer } = useBasicOperations();

    const addImageToWall = (
        src: string | File = 'https://www.pngall.com/wp-content/uploads/5/Yellow-Jersey.png'
    ) => {
        // Determine parent ID based on selectedLayerInfo or selectedConfig
        const parentId = autodetectParentId();

        // Generate unique identifier for the image
        const imageIdentifier = `image-${getNanoid()}`;

        // Estimate position for the new image
        let estimateX = canvasStore.center.x - 50;
        let estimateY = canvasStore.center.y - 50;

        if (canvasStore.selectedConfig) {
            if (canvasStore.selectedConfig.is === 'group') {
                // If the selected config is a group, estimate the position based on the last item in the group
                const { x, y } = estimateLastItemGroupPosition(canvasStore.selectedConfig);
                estimateX = x;
                estimateY = y + 25; // Add offset for the new item
            } else {
                // Otherwise, position relative to the selected config
                estimateX = canvasStore.selectedConfig.x ?? canvasStore.center.x - 50;
                estimateY = canvasStore.selectedConfig.y ?? canvasStore.center.y - 50;
            }
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
            image: undefined,
        };

        // Find the layer or group where we need to add the image
        const parent = canvasStore.wall.layers.find(layer => layer.id === parentId) ||
            findParentIteratively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

        if (parent && 'items' in parent) {
            // Ensure items is defined before pushing
            if (!parent.items) {
                parent.items = []; // Initialize items if it's undefined
            }

            // Handle image loading
            const handleImageLoad = (im: HTMLImageElement) => {
                const { w, h } = calcOptimizedImageDimension(im);
                newMwImageConfig.width = w;
                newMwImageConfig.height = h;
                newMwImageConfig.image = im;

                // Add the new image to the parent group/layer
                if (parent.items) {
                    parent.items.push(newMwImageConfig);
                }
            };

            if (typeof src === 'string') {
                const im = new window.Image();
                im.src = src;
                im.onload = () => handleImageLoad(im);
                im.onerror = () => {
                    console.error(`Failed to load image from URL: ${src}`);
                };
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const im = new window.Image();
                    im.src = event.target?.result as string;
                    im.onload = () => handleImageLoad(im);
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
        if (!canvasStore.selectedConfig) return;

        if (isMwGroupConfig(canvasStore.selectedConfig) || isMwShapeConfig(canvasStore.selectedConfig)) {
            canvasStore.deleteConfig(canvasStore.selectedConfig);
        } else {
            console.error('Selected config is neither a group nor a shape.');
        }
        //     const configName = canvasStore.selectedConfigName;

        //     if (configName) {
        //         // Create a stack to handle layers and groups
        //         const stack: (MwLayerConfig|MwNode)[] = [...canvasStore.wall.layers];
        //         let found = false;

        //         while (stack.length > 0) {
        //             const currentLayer = stack.pop();

        //             // Ensure that currentLayer is of the expected type
        //             if (currentLayer && currentLayer.items) {
        //                 // Check if the item exists in the current layer's items
        //                 const itemIndex = currentLayer.items.findIndex((item: MwNode) => item.id === configName);
        //                 if (itemIndex !== -1) {
        //                     const itemToDelete = currentLayer.items[itemIndex];

        //                     // If the found item is a group, delete its items first
        //                     if (isMwGroupConfig(itemToDelete)) {
        //                         // Add all nested groups and their items to the stack
        //                         const nestedItems = itemToDelete.items;
        //                         currentLayer.items.splice(itemIndex, 1); // Remove the group itself
        //                         stack.push(...nestedItems); // Push nested items to the stack for deletion
        //                         console.log(`Group '${itemToDelete.id}' and all its items have been removed from layer '${currentLayer.id}'`);
        //                     } else {
        //                         // Delete the shape or group config from the items array
        //                         currentLayer.items.splice(itemIndex, 1); // Remove the item
        //                         console.log(`'${configName}' shape or group has been removed from layer '${currentLayer.id}'`);
        //                     }

        //                     found = true;

        //                     // Check if the layer's items are empty after deleting the shape or group
        //                     if (currentLayer.items.length === 0) {
        //                         console.log(`Layer '${currentLayer.id}' has no more items.`);
        //                     }

        //                     // Exit the loop after deletion
        //                     break;
        //                 }

        //                 // Push nested groups onto the stack for further inspection
        //                 const nestedGroups = currentLayer.items.filter((item: MwNode) => isMwGroupConfig(item)) as MwGroupConfig[];
        //                 stack.push(...nestedGroups);
        //             }

        //             // Exit the loop if the shape or group was found and deleted
        //             if (found) {
        //                 break;
        //             }
        //         }

        //         if (!found) {
        //             console.log(`'${configName}' shape or group not found.`);
        //         }
        //     }
        // }
    };    

    /* Add options */
    const addLayer = (): string => {
        if (!canvasStore.wall.layers) {
            // Initialize layers if it doesn't exist
            canvasStore.wall.layers = [];
        }

        const { newLayer, layerId } = setupNewLayer();

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
            const parentId = autodetectParentId();
            console.log('---------> 5666 ->', parentId)
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

                addTextToWall(generatedText, { parentId });
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

    const autodetectParentId = () => {
        // Determine parent ID based on groupId or selectedLayerInfo
        let parentId = '';
        // let selectedConfigGroup = null;
        // if (canvasStore.selectedConfig) {
        //     selectedConfigGroup = canvasStore.findParentGroup(canvasStore.selectedConfig);
        // }
        if (!isMwGroupConfig(canvasStore.selectedConfig)) {
            if (isMwShapeConfig(canvasStore.selectedConfig)) {
                // If any shapes are selected, their group will be returned as a priority.
                if (canvasStore.selectedConfig?.parent.startsWith('group')) {
                    return canvasStore.selectedConfig?.parent;
                }
            }
            if (canvasStore.selectedLayerInfo) {
                // We add to the selected item's layer
                parentId = canvasStore.selectedLayerInfo.id;
                console.log('-- 541 -> add to selected layer')
            } else {
                // We default to adding to the first layer
                console.log('-- 540 -> add to first layer')
                if (canvasStore.wall.layers[0]?.id) {
                    parentId = canvasStore.wall.layers[0].id;
                }
            }
        } else {
            // We add to a group
            console.log('-- 542 -> add to selected group', canvasStore.selectedConfig)
            parentId = canvasStore.selectedConfig.id ?? '';
        }

        console.log('-- 543 -> PID: ', parentId)
        return parentId;
    }

    const addShapeToWall = (
        shapeType: 'circle' | 'rectangle',
        { width = 100, height = 100, radius = 50, fill = 'black', parentId = autodetectParentId() }:
        { width?: number, height?: number, radius?: number, fill?: string, parentId?: string | null } = {}
    ) => {
        const resolvedParentId = parentId ?? autodetectParentId();

        // Generate unique identifier for the shape
        const shapeIdentifier = `${shapeType}-${getNanoid()}`;

        // Estimate position for the new shape
        const { x: estimateX, y: estimateY } = generatePosition();

        // Create the shape configuration
        const newMwShapeConfig: MwRectConfig | MwCircleConfig = {
            id: shapeIdentifier,
            name: shapeIdentifier,
            parent: resolvedParentId,
            is: shapeType,
            x: estimateX,
            y: estimateY,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            draggable: true,
            fill: fill,
            visible: true,
            ...(shapeType === 'circle' ? { radius } : { width, height })
        };

        console.log('---------> New shape config: ', newMwShapeConfig);

        // Find the layer or group where we need to add the shape
        const parent = parentId ? findOrCreateParent(parentId, resolvedParentId) : null;
        if (parent && parent.items) {
            parent.items.push(newMwShapeConfig);
            console.log('================> PPPPPP', parent)
        }
    };


    const addTextToWall = (
        text: string = 'Unleash your thoughts!',
        { defaultTextSize = 320, parentId = autodetectParentId() }: { defaultTextSize?: number, parentId?: string | null } = {}
    ) => {
        const resolvedParentId = parentId ?? autodetectParentId();

        // Generate unique identifier for the text
        const textIdentifier = `text-${getNanoid()}`;

        // Find the layer or group where we need to add the text
        const parent = parentId ? findOrCreateParent(parentId, resolvedParentId) : null;

        // Ensure items array is defined
        if (parent && !parent.items) {
            parent.items = [];
        }

        let estimatePosition = generatePosition();

        // If the parent is a group, use the last item's position in the group
        if (parent && parent.items && parent.items.length > 0) {
            estimatePosition = estimateLastItemGroupPosition(parent);
        }

        const newMwTextConfig: MwTextConfig = {
            id: textIdentifier,
            name: textIdentifier,
            parent: resolvedParentId,
            is: 'text',
            rotation: 0,
            x: estimatePosition.x,
            y: estimatePosition.y,
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

        if (parent && parent.items) {
            parent.items.push(newMwTextConfig);
        }
    };


    const findOrCreateParent = (parentId: string, resolvedParentId: string): (MwLayerConfig | MwGroupConfig | null) => {
        const parentCandidate = canvasStore.wall.layers.find(layer => layer.id === parentId) ||
        findParentIteratively(resolvedParentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

        console.log('-- 547 -> Parent: ', parent)
        if (parentCandidate && 'items' in parentCandidate) {
            // Ensure items is defined before pushing
            const parent = parentCandidate as MwLayerConfig | MwGroupConfig;
            if (!parent.items) {
                parent.items = []; // Initialize items if it's undefined
            }

            return parent;
        } else {
            // Handle case where parent wasn't found
            console.error(`Parent with ID ${parentId} not found`);
            return null;
        }
    };

    const generatePosition = (defaultXOffset: number = -10, defaultYOffset: number = -50): { x: number, y: number } => {
        let x = canvasStore.center.x + defaultXOffset;
        let y = canvasStore.center.y + defaultYOffset;

        if (canvasStore.selectedConfig) {
            x = canvasStore.selectedConfig.x ?? canvasStore.center.x + defaultXOffset;
            y = canvasStore.selectedConfig.y ?? canvasStore.center.y + defaultYOffset;
        }

        return { x, y };
    };

    const estimateLastItemGroupPosition = (
        group: MwLayerConfig | MwGroupConfig,
        yOffset: number = 50
    ): { x: number; y: number } => {
        if (!group.items || group.items.length === 0) {
            // Default position if the group has no items
            return { x: 0, y: 0 };
        }

        // Find the item with the largest y coordinate
        const bottomElement = group.items.reduce((prev, current) => {
            const prevY = prev.y ?? 0;
            const currentY = current.y ?? 0;
            return currentY > prevY ? current : prev;
        });

        // If bottomElement has no defined x or y, provide defaults
        const x = bottomElement.x ?? 0;
        const y = (bottomElement.y ?? 0) + yOffset;

        console.log(`-- 6324 -> Group: ${group.items.map(item => item.id)}`);
        console.log(`-- 6324 -> Bottom element pos: ${bottomElement.x}|${bottomElement.y}`);
        console.log(`-- 6325 -> Estimated pos: ${x}|${y}`);

        return { x, y };
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

    const ungroupItems = (): void => {
        const groupId = canvasStore.selectedConfig?.id;

        if (!canvasStore.selectedConfig || !isMwGroupConfig(canvasStore.selectedConfig)) {
            console.error(`Group with ID ${groupId} not found or is not a valid group.`);
            return;
        }

        // Store the parent ID for later use
        const parentId = canvasStore.selectedConfig.parent;

        // Check if the parent exists
        const parentLayer = canvasStore.wall.layers.find(layer => layer.id === parentId);

        if (!parentLayer || !parentLayer.items) {
            console.error(`Parent layer with ID ${parentId} not found.`);
            return;
        }

        // Move items from the group back to the parent
        for (const item of canvasStore.selectedConfig.items) {
            // Update the item's parent to the group's parent
            item.parent = parentId;

            // Add the item back to the parent layer's items
            parentLayer.items.push(item);
        }

        // Remove the group from its parent's items
        const groupIndex = parentLayer.items.findIndex(item => item.id === groupId);
        if (groupIndex !== -1) {
            parentLayer.items.splice(groupIndex, 1);
        }

        // Optional: Clear selected items if needed (similar to grouping)
        canvasStore.clearSelectedItems();

        console.log(`Ungrouped items from group ${groupId} back to parent.`);
    };

    // const addGroup = (parentId: string = ''): string => {
    //     const groupId = `group-${getNanoid()}`;

    //     const newGroup: MwGroupConfig = {
    //         id: groupId,
    //         name: groupId,
    //         is: 'group',
    //         scaleX: 1,
    //         scaleY: 1,
    //         visible: true,
    //         draggable: true,
    //         items: [],
    //         parent: parentId || null,
    //     };

    //     // Find the parent layer or group where the new group should be added
    //     const parent = canvasStore.wall.layers.find(layer => layer.id === parentId) ||
    //         findParentRecursively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

    //     if (parent && 'items' in parent) {
    //         // Ensure items is defined before pushing
    //         if (!parent.items) {
    //             parent.items = []; // Initialize items if it's undefined
    //         }
    //         parent.items.push(newGroup);
    //     } else if (!parentId && canvasStore.wall.layers[0]?.id) {
    //         // Add to the first layer if no parent is specified
    //         if (canvasStore.wall.layers[0]?.items) {
    //             canvasStore.wall.layers[0].items.push(newGroup);
    //         }
    //     } else {
    //         console.error(`Parent with ID ${parentId} not found`);
    //     }

    //     return groupId;
    // };

    // const groupShapesOrGroups = (selectedItems: MwNode[], groupId: string = ''): string => {
    //     const parentId = groupId || addGroup();

    //     // Move selected items into the new or existing group
    //     const parent = findParentRecursively(parentId, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));

    //     if (parent && 'items' in parent) {
    //         selectedItems.forEach(item => {
    //             // Remove item from its original location
    //             const originalParent = findParentRecursively(item.parent, canvasStore.wall.layers.flatMap(layer => layer.items ?? []));
    //             originalParent?.items?.splice(originalParent.items?.findIndex(i => i.id === item.id), 1);

    //             // Update item's parent reference
    //             item.parent = parentId;

    //             // Add item to the new group's items
    //             if (!parent.items) {
    //                 parent.items = []; // Initialize items if it's undefined
    //             }
    //             parent.items.push(item);
    //         });
    //     } else {
    //         console.error(`Parent group with ID ${parentId} not found`);
    //     }

    //     return parentId;
    // };

    const cloneGroup = (groupId: string): string | null => {
        const originalGroup = canvasStore.findGroupById(groupId);
        if (!originalGroup) return null;

        const newGroupId = `group-${getNanoid()}`;
        const newGroup: MwGroupConfig = { ...originalGroup, id: newGroupId, name: newGroupId, items: [] };

        // Stack for iterative cloning
        const stack: { originalGroup: MwGroupConfig; newGroup: MwGroupConfig }[] = [{ originalGroup, newGroup }];

        while (stack.length > 0) {
            const { originalGroup, newGroup } = stack.pop()!;

            for (const originalItem of originalGroup.items) {
                const newItemId = `${originalItem.is}-${getNanoid()}`;
                const newItem: MwNode = { ...originalItem, id: newItemId, name: newItemId, parent: newGroup.id ?? '' };

                // If the item is a group, clone it and push it to the stack
                if (isMwGroupConfig(newItem)) {
                    const clonedSubGroup: MwGroupConfig = { ...newItem, id: newItemId, items: [] };
                    newGroup.items.push(clonedSubGroup);
                    stack.push({ originalGroup: originalItem as MwGroupConfig, newGroup: clonedSubGroup });
                } else {
                    newGroup.items.push(newItem);
                }
            }
        }

        console.log('=================================> NG', newGroup)
        if (canvasStore.wall.layers[0]?.items) {
            canvasStore.wall.layers[0].items.push(newGroup);
        } else {
            console.error(`Parent with ID ${originalGroup.parent} not found`);
            return null;
        }

        return newGroupId;
    };

    const handleCloneGroup = (event: MenuItemCommandEvent) => {
        if (isMwGroupConfig(canvasStore.selectedConfig) && canvasStore.selectedConfig?.id) {
            const clonedGroupName = cloneGroup(canvasStore.selectedConfig.id);
            console.log('Cloned group:', clonedGroupName);
        }
    };

    /* SET ZINDEX */
    const bringToTop = (config: MwShapeConfig | MwGroupConfig | null) => {
        if (config === null) return;
        const parent = canvasStore.findParent(config);
        if (isMwGroupConfig(parent) || parent?.is === 'layer') {
            if (parent.items) {
                // Remove the shape from its current position
                const index = parent.items.findIndex(item => item.id === config?.id);
                parent.items.splice(index, 1); // Remove the item at the found index
                // Add it back to the end of the items array
                parent.items.push(config);

                // Force a reactivity update
                parent.items = [...parent.items];
            }
        }
    };

    const bringToBack = (config: MwShapeConfig | MwGroupConfig | null) => {
        if (config === null) return;
        const parent = canvasStore.findParent(config);
        if (isMwGroupConfig(parent) || parent?.is === 'layer') {
            console.log('----------> Parent: ', parent)
            if (parent.items) {
                const index = parent.items.findIndex(item => item.id === config?.id);
                parent.items.splice(index, 1); // Remove the item at the found index
                // Add it back to the start of the items array
                parent.items.unshift(config);

                // Force a reactivity update
                parent.items = [...parent.items];
            }
        }
    };

    return { addLayer, addTextToWall, aiImageExplain, addImageToWall,
        removeConfig, removeText, addAiTextToWall, deleteShape, handleCloneGroup,
        bringToTop, bringToBack, groupSelectedItems, ungroupItems, addShapeToWall,        
    }
});
