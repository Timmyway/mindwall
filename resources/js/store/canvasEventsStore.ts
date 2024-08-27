import { defineStore, storeToRefs } from "pinia";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { ref } from "vue";
import { useTextEditStore } from "./textEditStore";
import { useCommandBarStore } from "./commandBarStore";
import { LayerInfo, MwGroupConfig, MwNode, MwShapeConfig, MwTextConfig } from "@/types/konva.config";
import { TextAlign } from "@/types/widgetSetting.types";
import { useSidebarStore } from "./sidebarStore";

export const useCanvasEventsStore = defineStore('canvasEvents', () => {
    var MIN_WIDTH = 20;

    const canvasStore = useCanvasStore();
    const commandBarStore = useCommandBarStore();
    const editTextStore = useTextEditStore();
    const sidebarStore = useSidebarStore();

    const { isMwTextConfig, isMwImageConfig, isMwShapeConfig, isMwGroupConfig } = useCanvasConditions();
    // Store refs
    const { stageRef, selectedConfig } = storeToRefs(canvasStore);
    const { editing, lastEditedText } = storeToRefs(editTextStore);

    const handleTransform = (e: any) => {
        if (e.target) {
            const textNode = e.target;

            textNode.setAttrs({
                width: Math.max(textNode.width() * textNode.scaleX(), MIN_WIDTH),
                scaleX: 1,
                scaleY: 1,
            });
        }
    }

    const handleTransformEnd = (e: any) => {
        // Retrieve the node that was transformed
        const node = e.target;
        let configTarget = node;

        // If the selected config is a group, find the group's node instead of using the individual shape
        if (isMwGroupConfig(selectedConfig.value)) {
            const group = node.findAncestors(`#${selectedConfig.value.id}`);
            if (group.length > 0) {
                configTarget = group[0]; // Set the config target to the group node
            }
        }

        // Construct the new configuration based on the node's current attributes
        const newConfig: {
            x: number;
            y: number;
            rotation: number;
            scaleX: number;
            scaleY: number;
            width?: number;
        } = {
            x: configTarget.x(),
            y: configTarget.y(),
            rotation: configTarget.rotation(),
            scaleX: configTarget.scaleX(),
            scaleY: configTarget.scaleY(),
        };

        // If the selected config is a shape, include its width in the configuration
        if (isMwShapeConfig(selectedConfig.value)) {
            newConfig.width = configTarget.width();
        }

        // Log the transformation details for debugging
        canvasStore.setSelectedConfig(newConfig);
    }

    const handleStageMouseDown = (e: any) => {
        // clicked on stage - clear selection
        if (e.target === e.target.getStage()) {
            console.log('-- 001 -> Clicked on stage...');
            if (editing.value) {
                editTextStore.exitEditMode();
            }
            canvasStore.resetConfig({ layerInfo: false });
            canvasStore.updateTransformer();
            return;
        } else {
            console.log(`-- 002 -> Clicked other than stage: ${e.target.name()} (${e.target.getType()})`);
            console.log(`-- 003 -> Selected config name: ${canvasStore.selectedConfigName}`);
            // console.log('-- 61 -> Editing value: ', editing.value);
            // console.log('-- 62 -> Selected config name: ', selectedConfig.value?.name);
            // console.log('-- 63 -> Last edited config: ', lastEditedText.value.config);
            // console.log(`-- 64 -> Assert equal: ${editing.value} && ${selectedConfig.value?.name} !== ${lastEditedText.value.config}: `, selectedConfig.value?.name !== lastEditedText.value.config);            
            // if (editing.value) {
            //     editTextStore.exitEditMode();
            // }
        }

        // clicked on transformer - do nothing
        const clickedOnTransformer = e.target.getParent().className === 'Transformer';
        if (clickedOnTransformer) {
            return;
        }

        // canvasStore.updateTransformer();
    }

    const handleGroupContextMenu = (e: any) => {
        e.evt.preventDefault();
        if (stageRef.value) {
            if (e.target === stageRef.value.getStage()) {
                // console.log('===> We are on an empty place of the stage');
                return;
            }
        }
        if (canvasStore.menu) {
            canvasStore.menu.show(e.evt);
            const currentShape = e.target;
            // console.log('===> Current shape: ', currentShape);
        }
    }

    const handleTextClick = (e: any, clickedItem: MwNode) => {

        // if (isMwGroupConfig(canvasStore.selectedConfig) || isMwShapeConfig(canvasStore.selectedConfig)) {
        //     if (ctrl) {
        //         if (canvasStore.selectedItems.find(item => item.id === clickedItem.id)) {
        //             // If item is already selected, remove it
        //             canvasStore.removeSelectedItem(clickedItem);
        //         } else {
        //             // Otherwise, add it to the selection
        //             canvasStore.addSelectedItem(clickedItem);
        //         }
        //     } else {
        //         // If Ctrl is not held, clear previous selections and select only the clicked item
        //         canvasStore.clearSelectedItems();
        //         canvasStore.addSelectedItem(clickedItem);
        //     }
        // }
        // console.log(JSON.stringify(canvasStore.selectedItems));
        // canvasStore.updateTransformer();
    }

    const handleTextBlur = () => {
        // console.log('-- 850 -> Text shape has losen focus');
        // if (selectedConfig.value) {
        //     selectedConfig.value.draggable = false;
        // }
    }

    const handleShapeMouseDown = (e: any, config: MwNode, layerInfo: LayerInfo) => {
        editTextStore.finalizeEdit();
        canvasStore.ctrlPressed = (e.evt?.ctrlKey || e.evt?.metaKey) ?? false;
        const shift = e.evt?.shiftKey ?? false;

        canvasStore.selectConfig(config, layerInfo);

        console.log('-- 7778 -> Handle shape mouse down: ', canvasStore.selectedConfig)
        if (isMwShapeConfig(canvasStore.selectedConfig)) {
            if (shift) {
                if (canvasStore.selectedItems.find(item => item.id === canvasStore.selectedConfig?.id)) {
                    // If item is already selected, remove it
                    canvasStore.removeSelectedItem(canvasStore.selectedConfig);
                } else {
                    // Otherwise, add it to the selection
                    canvasStore.addSelectedItem(canvasStore.selectedConfig);
                }
            }
            if (canvasStore.ctrlPressed) {
                // if (canvasStore.selectedItems.find(item => item.id === canvasStore.selectedConfig?.id)) {
                //     // If item is already selected, remove it
                //     canvasStore.removeSelectedItem(canvasStore.selectedConfig);
                // } else {
                //     // Otherwise, add it to the selection
                //     canvasStore.addSelectedItem(canvasStore.selectedConfig);
                // }
                // console.log('-- 360 -> Verify selected config: ', canvasStore.selectedConfig)
            } else {
                canvasStore.ctrlPressed = false;
                // If Ctrl is not held, clear previous selections and select only the clicked item
                if (!canvasStore.selectedItems.find(item => item.id === canvasStore.selectedConfig?.id)) {
                    canvasStore.clearSelectedItems();
                    canvasStore.addSelectedItem(canvasStore.selectedConfig);
                }
            }

            // sidebarStore.viewDetails();
            canvasStore.updateTransformer();
        }
        canvasStore.updateTransformer();
        // Because each text have their own properties,
        // we need to synchronise with text toolbar values
        // console.log('-- 11 -> Set fontsize & family');
        if (isMwTextConfig(selectedConfig.value)) {
            if (selectedConfig.value?.fontSize) {
                commandBarStore.setFontSize(selectedConfig.value.fontSize);
            }
            if (selectedConfig.value?.fontFamily) {
                commandBarStore.setFontFamily(selectedConfig.value.fontFamily);
            }
            if (typeof selectedConfig.value.align !== 'undefined') {
                // console.log('-- 12 -> Update alignement: ', selectedConfig.value.align)
                const align = selectedConfig.value.align as TextAlign; // Type assertion
                commandBarStore.setTextAlign(align);
            } else {
                commandBarStore.setTextAlign('left');
            }
            // console.log('-- 13 -> Set fontsize to : ', selectedConfig.value.fontSize);
            // console.log('-- 14 -> Mouse down on text shape');
        }
    }

    const onGroupDragstart = (e: any) => {
        // console.log('-- 750 ->', selectedConfig.value?.is);
        // console.log('-- 751 ->', e.target.getType());

        if (e.target) {
            if (e.target.getType() === 'Group') {
                e.target.opacity(0.5);
                // console.log('-- 300 -> Group draggable: ', e.target.draggable());
                // console.log('--- 301 --> Selected config when group is dragged: ', selectedConfig.value)
            }
        }
    }

    const handleMouseRelease = () => {
        if (selectedConfig.value) {
            if (isMwTextConfig(selectedConfig.value)) {
                // console.log('-- 122 -> Mouse release');
                // selectedConfig.value.draggable = false;
            }
        }
    }

    const updateWallPositionIteratively = (targetName: string, x: number, y: number, items: MwNode[]): boolean => {
        const stack: MwNode[] = [...items]; // Create a stack initialized with the top-level items

        while (stack.length > 0) {
            const item = stack.pop();

            // Check if the item is defined and matches the target name
            if (item && item.id === targetName) {
                item.x = x;
                item.y = y;
                return true; // Target found and position updated
            }

            // If the item is a group, add its items to the stack for further processing
            if (item?.is === 'group') {
                const group = item as MwGroupConfig;
                stack.push(...(group.items ?? [])); // Add the group's items, ensuring it's defined
            }
        }

        return false; // Target not found in the entire hierarchy
    };

    const onDragend = (e: any) => {
        if (e.target) {
            // console.log('-- 308 -> Target: ', e.target.getType());

            const targetName = e.target.name();
            const x = e.target.x();
            const y = e.target.y();

            // Update position of the group in the wall object
            for (const layer of canvasStore.wall.layers) {
                if (updateWallPositionIteratively(targetName, x, y, layer.items ?? [])) {
                    break;
                }
            }

            if (e.target.getType() === 'Group') {
                // console.log('-- 309 -> Group selected: ', targetName);
                e.target.opacity(1);
            } else if (isMwTextConfig(selectedConfig.value)) {
                handleTextBlur();
            } else if (isMwImageConfig(selectedConfig.value)) {
                // console.log('-- 311 -> Synchronize Image positions');
                // const groupName = e.target.getParent().name();
                // const imageName = e.target.name();
                // canvasStore.selectConfig(groupName, imageName, e.evt.ctrl);
                // canvasStore.syncPosition(targetName, x, y);
            }
        }
    };

    return { handleStageMouseDown, handleTransformEnd, handleGroupContextMenu, handleTransform,
        onGroupDragstart, onDragend, handleTextBlur, handleTextClick, handleShapeMouseDown,
    }
});
