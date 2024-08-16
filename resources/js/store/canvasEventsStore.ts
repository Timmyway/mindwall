import { defineStore, storeToRefs } from "pinia";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { ref } from "vue";
import { useTextEditStore } from "./textEditStore";
import { useCommandBarStore } from "./commandBarStore";
import { LayerInfo, MwGroupConfig, MwNode, MwShapeConfig, MwTextConfig } from "@/types/konva.config";
import { TextAlign } from "@/types/widgetSetting.types";

export const useCanvasEventsStore = defineStore('canvasEvents', () => {
    var MIN_WIDTH = 20;

    const canvasStore = useCanvasStore();
    const commandBarStore = useCommandBarStore();
    const editTextStore = useTextEditStore();

    const { isMwTextConfig, isMwShapeConfig, isMwGroupConfig } = useCanvasConditions();
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
        // shape is transformed, let us save new attrs back to the node
        console.log('============> Tranform has ended');
        if (selectedConfig.value) {
            // update the state
            selectedConfig.value.x = e.target.x();
            selectedConfig.value.y = e.target.y();
            selectedConfig.value.rotation = e.target.rotation();
            selectedConfig.value.scaleX = e.target.scaleX();
            selectedConfig.value.scaleY = e.target.scaleY();
            if (isMwTextConfig(selectedConfig.value)) {
                selectedConfig.value.width = e.target.width();
            }
        }
    }

    const handleStageMouseDown = (e: any) => {
        // clicked on stage - clear selection
        if (e.target === e.target.getStage()) {
            console.log('==> Clicked on stage...');
            if (editing.value) {
                editTextStore.exitEditMode();
            }
            canvasStore.resetConfig();
            canvasStore.updateTransformer();
            return;
        } else {
            console.log('CLicked element ==> ', e.target.name());
            console.log('-- 60 -> Editing value: ', editing.value);
            console.log('-- 61 -> Selected config name: ', selectedConfig.value?.name);
            console.log('-- 62 -> Last edited config: ', lastEditedText.value.config);
            console.log(`-- 63 -> Assert equal: ${editing.value} && ${selectedConfig.value?.name} !== ${lastEditedText.value.config}: `, selectedConfig.value?.name !== lastEditedText.value.config);
            // if (editing.value && (selectedConfig.value?.name !== lastEditedText.value.config)) {
            //     console.log('-- 65 -> Should exit...')
            //     exitEditMode();
            // }
            if (editing.value) {
                editTextStore.exitEditMode();
            }
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
                console.log('===> We are on an empty place of the stage');
                return;
            }
        }
        if (canvasStore.menu) {
            canvasStore.menu.show(e.evt);
            const currentShape = e.target;
            console.log('===> Current shape: ', currentShape);
        }
    }

    const handleTextClick = (e: any, clickedItem: MwNode) => {
        // const ctrl = e.evt.ctrlKey || e.evt.metaKey;

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
        console.log('-- 850 -> Text shape has losen focus');
        // if (selectedConfig.value) {
        //     selectedConfig.value.draggable = false;
        // }
    }

    const handleTextMouseDown = (e: any, configName: string, layerInfo: LayerInfo) => {
        canvasStore.selectConfig(configName, layerInfo);

        const ctrl = e.evt.ctrlKey || e.evt.metaKey;

        if (isMwGroupConfig(canvasStore.selectedConfig) || isMwShapeConfig(canvasStore.selectedConfig)) {
            if (ctrl) {
                if (canvasStore.selectedItems.find(item => item.id === canvasStore.selectedConfig?.id)) {
                    // If item is already selected, remove it
                    canvasStore.removeSelectedItem(canvasStore.selectedConfig);
                } else {
                    // Otherwise, add it to the selection
                    canvasStore.addSelectedItem(canvasStore.selectedConfig);
                }
            } else {
                // If Ctrl is not held, clear previous selections and select only the clicked item
                if (!canvasStore.selectedItems.find(item => item.id === canvasStore.selectedConfig?.id)) {
                    canvasStore.clearSelectedItems();
                    canvasStore.addSelectedItem(canvasStore.selectedConfig);
                }
            }
        }
        console.log(JSON.stringify(canvasStore.selectedItems));
        canvasStore.updateTransformer();
        // Because each text have their own properties,
        // we need to synchronise with text toolbar values
        console.log('-- 11 -> Set fontsize & family');
        if (isMwTextConfig(selectedConfig.value)) {
            console.log('======================> Selected config: ', selectedConfig.value)
            if (selectedConfig.value?.fontSize) {
                commandBarStore.setFontSize(selectedConfig.value.fontSize);
            }
            if (selectedConfig.value?.fontFamily) {
                commandBarStore.setFontFamily(selectedConfig.value.fontFamily);
            }
            if (typeof selectedConfig.value.align !== 'undefined') {
                console.log('-- 12 -> Update alignement: ', selectedConfig.value.align)
                const align = selectedConfig.value.align as TextAlign; // Type assertion
                commandBarStore.setTextAlign(align);
            } else {
                commandBarStore.setTextAlign('left');
            }
            console.log('-- 13 -> Set fontsize to : ', selectedConfig.value.fontSize);
            console.log('-- 14 -> Mouse down on text shape');
        }
    }

    const onGroupDragstart = (e: any) => {
        console.log('-- 750 ->', selectedConfig.value?.is);
        console.log('-- 751 ->', e.target.getType());

        if (e.target) {
            if (e.target.getType() === 'Group') {
                e.target.opacity(0.5);
                console.log('-- 300 -> Group draggable: ', e.target.draggable());
                console.log('--- 301 --> Selected config when group is dragged: ', selectedConfig.value)
            }
        }
    }

    const handleMouseRelease = () => {
        if (selectedConfig.value) {
            if (isMwTextConfig(selectedConfig.value)) {
                console.log('-- 122 -> Mouse release');
                // selectedConfig.value.draggable = false;
            }
        }
    }

    const updateWallPositionRecursively = (targetName: string, x: number, y: number, items: MwNode[]): boolean => {
        for (const item of items) {
            if (item.id === targetName) {
                item.x = x;
                item.y = y;
                return true;
            }
            if (item.is === 'group') {
                const group = item as MwGroupConfig;
                if (updateWallPositionRecursively(targetName, x, y, group.items)) {
                    return true;
                }
            }
        }
        return false;
    };

    const onDragend = (e: any) => {
        if (e.target) {
            console.log('-- 308 -> Target: ', e.target.getType());

            const targetName = e.target.name();
            const x = e.target.x();
            const y = e.target.y();

            // Update position of the group in the wall object
            for (const layer of canvasStore.wall.layers) {
                if (updateWallPositionRecursively(targetName, x, y, layer.items ?? [])) {
                    break;
                }
            }

            if (e.target.getType() === 'Group') {
                console.log('-- 309 -> Group selected: ', targetName);
                e.target.opacity(1);
            } else if (isMwTextConfig(selectedConfig.value)) {
                handleTextBlur();
            } else if (e.target.constructor.name === '_Image') {
                console.log('-- 311 -> Synchronize Image positions');
                const groupName = e.target.getParent().name();
                const imageName = e.target.name();
                canvasStore.selectConfig(groupName, imageName);
                canvasStore.syncPosition(x, y);
            }
        }
    };

    return { handleStageMouseDown, handleTransformEnd, handleGroupContextMenu, handleTransform,
        onGroupDragstart, onDragend, handleTextBlur, handleTextClick, handleTextMouseDown
    }
});
