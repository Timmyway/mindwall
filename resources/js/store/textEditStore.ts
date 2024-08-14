import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { defineStore, storeToRefs } from "pinia";
import { reactive, ref } from "vue";
import { useCanvasStore } from "./canvasStore";
import { Text } from "konva/lib/shapes/Text";
import { TextareaStyle } from "@/types/canvas.types";

export const useTextEditStore = defineStore('textEdit', () => {
    const canvaStore = useCanvasStore();
    const { stageRef, selectedConfig, transformer, selectedGroupName, selectedConfigName } = storeToRefs(canvaStore);
    const { isMwTextConfig } = useCanvasConditions();

    const editing = ref(false);
    const editedQuoteText = ref<string>('');
    const lastEditedText = ref({group: '', config: ''});

    const quoteAreaRef = ref();
    const textareaStyle = reactive<TextareaStyle>({
        position: 'absolute',
        top: '',
        left: '',
        width: '',
        height: '',
        fontSize: '',
        overflow: '',
        lineHeight: 1.5,
        fontFamily: 'Montserrat',
        transformOrigin: '',
        textAlign: 'left',
        color: '',
        transform: '',
        zIndex: 0,
    });

    const enterEditMode = (e: Event) => {
        const textNode = e.target as Text | null;

        if (selectedConfig.value && isMwTextConfig(selectedConfig.value)) {
            selectedConfig.value.visible = false;
        }
        // hide text node and transformer:
        if (transformer.value) {
            transformer.value.getNode().hide();
        }

        // So position of textarea will be the sum of positions above:
        const textPosition = textNode?.absolutePosition() ?? { x: 0, y: 0 };
        // const areaPosition = {
        //     x: stageRef.value.getStage().container().offsetLeft + textPosition.x,
        //     y: stageRef.value.getStage().container().offsetTop + textPosition.y,
        // };
        // Set its dimension
        const calculatedWidth = (
            // Get the width of the text node. If it doesn't exist, default to 0.
            // Multiply by 1 (or other ratio) to ensure it's a number
            // Do the same with padding (take it into account)
            (textNode?.width?.() ?? 0) * 1 -
            ((textNode?.padding?.() ?? 0) * 2)
        );
        const textNodeHeight = (textNode?.height() ?? 0) - (textNode?.padding() ?? 0) * 2 + 5;
        const constrainedWidth = Math.max(320, Math.min(calculatedWidth, 480));
        const contrainedHeight = Math.min(360, Math.max(textNodeHeight, 72));
        textareaStyle.width = constrainedWidth + 'px';
        textareaStyle.height = contrainedHeight + 'px';


        if (stageRef.value) {
            const stage = stageRef.value.getStage();
            // const areaPosition = {
            //     x: stage.container().offsetLeft + (textPosition?.x) + (calculatedWidth),
            //     y: stage.container().offsetTop + (textPosition?.y),
            // };
            const areaPosition = {
                x: textPosition?.x + (calculatedWidth / 2) + 10,
                y: textPosition?.y,
            };
            console.log('Offset x: ', stage.container().offsetLeft)
            console.log('Offset y: ', stage.container().offsetTop)
            console.log('Text position: ', textPosition)
            console.log('Area position: ', areaPosition);
            console.log('Text node: ', textNode?.align());
            // Set textarea position
            textareaStyle.left = areaPosition.x + 'px';
            textareaStyle.top = areaPosition.y + 'px';
        }

        // Set typography related styles
        console.log('=====> Scale: ', textNode?.scale()?.x);
        textareaStyle.fontSize = textNode?.fontSize() + 'px';
        textareaStyle.lineHeight = textNode?.lineHeight() ?? 1.5;
        textareaStyle.fontFamily = textNode?.fontFamily() ?? 'Montserrat';
        textareaStyle.transformOrigin = 'left top';
        textareaStyle.textAlign = 'left';
        textareaStyle.color = 'black';
        textareaStyle.zIndex = 999;

        setTimeout(() => {
            quoteAreaRef.value.focus();
        }, 0);

        console.log('--> TEXTAREA STYLE: ', textareaStyle)
        if (selectedConfig.value && isMwTextConfig(selectedConfig.value)) {
            editedQuoteText.value = selectedConfig.value.text.trim();
        }
        backupLastEditedText();
        editing.value = true;
    }

    const editQuote = (e: any) => {
        if (selectedConfig.value && isMwTextConfig(selectedConfig.value)) {
            // selectedConfig.value.fontSize = 20;
            // selectedConfig.value.fontFamily = 'Monospace';
            selectedConfig.value.rotation = 0;
        }
        if (e.key === 'Enter') {
            console.log('-- 270 -> Enter key pressed from edit textarea');
            if (e.altKey) {
                exitEditMode();
                console.log('Finished editing...');
            }
        }
    };

    const exitEditMode = () => {
        console.log('-- 00 -> Exit mode');
        if (editedQuoteText.value.trim() === '') {
            // Restore text node and transformer
            console.log('-- 01 -> Restore text and transformer');
            restoreTextAndTransformer();
            editing.value = false; // Exit edit mode
            return;
        }
        if (selectedConfig.value) {
            if (isMwTextConfig(selectedConfig.value)) {
                console.log('-- 100 -> Exit mode - is Text');
                selectedConfig.value.text = editedQuoteText.value.trim();
                restoreTextAndTransformer();
                restoreLastEditedText();
                editing.value = false; // Exit edit mode
            } else {
                console.log('-- 101 -> Exit mode - Other shape');
                // Backup other shape (may be Image or other shape)
                const { groupName, configName } = canvaStore.backupShape();
                restoreLastEditedText();
                restoreTextAndTransformer();
                // Restore the backed up shape
                canvaStore.restoreShape(groupName ?? '', configName ?? '');

                editing.value = false; // Exit edit mode
            }
        }
    }

    const backupLastEditedText = () => {
        console.log('-- 80 -> Backup last edited text')
        if (selectedConfig.value && lastEditedText.value && isMwTextConfig(selectedConfig.value)) {
            lastEditedText.value.group = selectedGroupName.value ?? '';
            lastEditedText.value.config = selectedConfigName.value ?? '';
        }
        console.log('-- 70 -> Last edited text backed up');
    }

    const restoreLastEditedText = () => {
        console.log('-- 80 -> Restoring last backup')
        if (lastEditedText.value && (selectedConfig.value?.name !== lastEditedText.value.config)) {
            console.log('--> 89 -> Restoring backup from the same Text is not allowed')
            selectedGroupName.value = lastEditedText.value.group;
            selectedConfigName.value = lastEditedText.value.config;
            lastEditedText.value = { group: '', config: '' };
        }
    };

    const restoreTextAndTransformer = () => {
        // Restore text node and transformer
        if (selectedConfig.value && isMwTextConfig(selectedConfig.value)) {
            selectedConfig.value.visible = true;
            if (transformer.value) {
                transformer.value.getNode().show();
            }
            editedQuoteText.value = '';
        }
    }

    const autoResizeTextarea = () => {
        if (quoteAreaRef.value) {
            quoteAreaRef.value.style.height = 'auto'; // Reset the height
            quoteAreaRef.value.style.height = `${quoteAreaRef.value.scrollHeight}px`;
        }
    };


    return { editedQuoteText, lastEditedText, editing, quoteAreaRef, textareaStyle,
        exitEditMode, enterEditMode, backupLastEditedText, restoreLastEditedText, editQuote,
    }
})

