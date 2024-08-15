import { defineStore, storeToRefs } from "pinia";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { ref } from "vue";
import { useTextEditStore } from "./textEditStore";
import { useCommandBarStore } from "./commandBarStore";
import { MwGroupConfig, MwShapeConfig, MwTextConfig } from "@/types/konva.config";

export const useCanvasEventsStore = defineStore('canvasEvents', () => {
    var MIN_WIDTH = 20;

    const canvasStore = useCanvasStore();
    const commandBarStore = useCommandBarStore();
    const editTextStore = useTextEditStore();

    const { isMwTextConfig } = useCanvasConditions();
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

        canvasStore.updateTransformer();
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

    const handleTextClick = (e: any) => {
        if (isMwTextConfig(selectedConfig.value)) {
            // Check if selectedConfig.value.align is not undefined
            // Check if Ctrl key is pressed
            // const ctrl = e.evt.ctrlKey || e.evt.metaKey;
            // if (ctrl) {
            //     selectedConfig.value.draggable = true;
            //     console.log('-- 15 -> Text should be draggable', selectedConfig.value.draggable);
            // } else {
            //     selectedConfig.value.draggable = false;
            // }
        }
        canvasStore.updateTransformer();
    }

    const handleTextBlur = () => {
        console.log('-- 850 -> Text shape has losen focus');
        // if (selectedConfig.value) {
        //     selectedConfig.value.draggable = false;
        // }
    }

    const handleTextMouseDown = (configName: string, layerIndex: number) => {
        canvasStore.selectConfig(configName, layerIndex);
        // Because each text have their own properties,
        // we need to synchronise with text toolbar values
        console.log('-- 11 -> Set fontsize & family');
        if (isMwTextConfig(selectedConfig.value)) {
            commandBarStore.setFontSize(selectedConfig.value.fontSize);
            commandBarStore.setFontFamily(selectedConfig.value.fontFamily);
            if (typeof selectedConfig.value.align !== 'undefined') {
                console.log('-- 12 -> Update alignement: ', selectedConfig.value.align)
                commandBarStore.setTextAlign(selectedConfig.value.align);
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

    const onDragend = (e: any) => {
        if (e.target) {
            console.log('-- 308 -> Target: ', e.target.getType());
            if (e.target.getType() === 'Group') {
                const targetName = e.target.name();
                console.log('-- 309 -> Group selected: ', targetName);
                e.target.opacity(1)

                // if (selectedConfig.value) {
                //     console.log('-- 330 -> Selected: ', selectedConfig.value);
                //     selectedConfig.value.draggable = false;
                // }

                canvasStore.wall[targetName].x = e.target.x();
                canvasStore.wall[targetName].y = e.target.y();
            } else if (isMwTextConfig(selectedConfig.value)) {
                console.log('-- 310 -> Synchronise Text positions');
                canvasStore.syncPosition(e.target.x(), e.target.y());
                handleTextBlur();
            } else if (e.target.constructor.name === '_Image') {
                console.log('-- 311 -> Synchronise Image positions');
                const groupName = e.target.getParent().name();
                const imageName = e.target.name();
                canvasStore.selectConfig(groupName, imageName);
                canvasStore.syncPosition(e.target.x(), e.target.y());
            }
        }
    }

    return { handleStageMouseDown, handleTransformEnd, handleGroupContextMenu, handleTransform,
        onGroupDragstart, onDragend, handleTextBlur, handleTextClick, handleTextMouseDown
    }
});
