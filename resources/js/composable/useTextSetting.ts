import { TextAlign } from "@/types/widgetSetting.types";
import { ref } from "vue";

export default function useTextSetting() {
    const availableTextSize = [
        6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 27, 32, 48, 54, 60, 72, 80, 96, 100,
        110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300
    ];

    const fontSize = ref<number>(16);
    const fontFamily = ref<string>('Montserrat');
    const textAlign = ref<string>('left');
    const defaultSetting = {
        fontSize: 16,
        fontFamily: 'Montserrat',
        textAlign: 'left',
    };

    const increaseFontSize = () => {
        const currentSizeIndex = availableTextSize.indexOf(fontSize.value);
        if (currentSizeIndex !== -1 && currentSizeIndex < availableTextSize.length - 1) {
            setFontSize(availableTextSize[currentSizeIndex + 1]);
        }
    };

    const decreaseFontSize = () => {
        const currentSizeIndex = availableTextSize.indexOf(fontSize.value);
        if (currentSizeIndex !== -1 && currentSizeIndex > 0) {
            setFontSize(availableTextSize[currentSizeIndex - 1]);
        }
    };

    const setFontSize = (newValue: number) => {
        if (newValue && newValue >= 6) {
            fontSize.value = newValue;
        } else {
            fontSize.value = defaultSetting.fontSize;
        }
    }

    const setFontFamily = (newValue: string) => {
        console.log('===========> New FF', newValue)
        fontFamily.value = newValue ?? defaultSetting.fontFamily;
    }

    const setTextAlign = (newValue: TextAlign) => {
        textAlign.value = newValue ?? defaultSetting.textAlign;
    }

    return { availableTextSize, fontSize, fontFamily, textAlign, increaseFontSize, decreaseFontSize, setFontSize, setFontFamily, defaultSetting, setTextAlign };
}
