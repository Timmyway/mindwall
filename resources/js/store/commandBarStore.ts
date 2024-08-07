import { TextAlign, WidgetSettingLoading } from "@/types/widgetSetting.types";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import useTextSetting from "@/composable/useTextSetting";
import useFontFamily from "@/composable/useFontFamily";
import useFontProperty from "@/composable/useFontProperty";

export const useCommandBarStore = defineStore('commandBar', () => {
    const canvasStore = useCanvasStore();
    const { isTextConfig } = useCanvasConditions();
    const { fontSize, fontFamily, availableTextSize, textAlign,
        setFontSize, decreaseFontSize, increaseFontSize, setFontFamily,
        setTextAlign
    } = useTextSetting();
    const { fontFamilies } = useFontFamily();
    const { availableTextAlign } = useFontProperty();

    const updateFontSize = (mode: '+' | '-' | null = null) => {
        if (isTextConfig(canvasStore.selectedConfig)) {
            if (mode === '+') {
                increaseFontSize();
            } else if (mode === '-') {
                decreaseFontSize();
            }
            canvasStore.selectedConfig.fontSize = fontSize.value;
        }
    }

    const updateFontFamily = () => {
        if (isTextConfig(canvasStore.selectedConfig)) {
            canvasStore.selectedConfig.fontFamily = fontFamily.value;
        }
    }

    const updateTextAlign = () => {
        if (isTextConfig(canvasStore.selectedConfig)) {
            const newAlign = textAlign.value as TextAlign;
            console.log('=====> New align set: ', newAlign)
            if (['left', 'right', 'center', 'justify'].includes(newAlign)) {
                canvasStore.selectedConfig.align = newAlign;
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
