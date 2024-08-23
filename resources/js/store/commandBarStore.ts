import { TextAlign } from "@/types/widgetSetting.types";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import useTextSetting from "@/composable/useTextSetting";
import useFontFamily from "@/composable/useFontFamily";
import useFontProperty from "@/composable/useFontProperty";

export const useCommandBarStore = defineStore('commandBar', () => {
    const canvasStore = useCanvasStore();
    const { isMwTextConfig } = useCanvasConditions();
    const { fontSize, fontFamily, availableTextSize, textAlign,
        setFontSize, decreaseFontSize, increaseFontSize, setFontFamily,
        setTextAlign
    } = useTextSetting();
    const { fontFamilies } = useFontFamily();
    const { availableTextAlign } = useFontProperty();

    const updateFontSize = (mode: '+' | '-' | null = null) => {
        if (isMwTextConfig(canvasStore.selectedConfig)) {
            if (mode === '+') {
                increaseFontSize();
            } else if (mode === '-') {
                decreaseFontSize();
            }
            // canvasStore.selectedConfig.fontSize = fontSize.value;
            canvasStore.setSelectedConfig({ fontSize: fontSize.value });
        }
    }

    const updateFontFamily = () => {
        if (isMwTextConfig(canvasStore.selectedConfig)) {
            canvasStore.setSelectedConfig({ fontFamily: fontFamily.value });
        }
    }

    const updateTextAlign = () => {
        if (isMwTextConfig(canvasStore.selectedConfig)) {
            const newAlign = textAlign.value as TextAlign;
            console.log('=====> New align set: ', newAlign)
            if (['left', 'right', 'center', 'justify'].includes(newAlign)) {
                canvasStore.setSelectedConfig({ align : newAlign });
            } else {
                console.error('Invalid text alignment value:', newAlign);
            }
        }
    }

    return {
        fontSize, fontFamily, textAlign,
        availableTextSize, fontFamilies, availableTextAlign,
        setFontSize, setFontFamily, updateFontSize, updateFontFamily, updateTextAlign,
        setTextAlign,
    }
});
