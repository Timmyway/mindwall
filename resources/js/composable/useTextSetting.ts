import { ref } from "vue";

export default function useTextSetting() {
    const availableTextSize = [
        6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 27, 32, 48, 54, 60, 72, 80, 96, 100,
        110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300
    ];

    const fontSize = ref(16);

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
        fontSize.value = newValue;
    }

    return { availableTextSize, fontSize, increaseFontSize, decreaseFontSize, setFontSize };
}