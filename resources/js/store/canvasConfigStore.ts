import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { useAppStore } from "./appStore";

export const useCanvasConfig = defineStore('canvasConfig', () => {
    const canvasStore = useCanvasStore();
    const appStore = useAppStore();
    const { selectedConfig, stageWidth, stageHeight } = storeToRefs(canvasStore);
    const { isMwTextConfig, isMwImageConfig } = useCanvasConditions();

    const transformerConfig = computed(() => {
        const tempConfig = { enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] };

        if (selectedConfig.value) {
            if (selectedConfig.value && isMwTextConfig(selectedConfig.value)) {
            tempConfig.enabledAnchors = ['middle-left', 'middle-right'];
            } else if (isMwImageConfig(selectedConfig.value)) {
                tempConfig.enabledAnchors = ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'];
            }
        }
        return tempConfig;
    });

    const stageConfig: {
        width: number;
        height: number;
    } = {
        width: stageWidth.value,
        height: stageHeight.value,
    };

    const groupConfig = {

    }

    const thematicRectConfig = {
        x: canvasStore.center.x,
        y: canvasStore.center.y,
        width: 100, // Add some padding
        height: 30, // Add some padding
        fill: 'transparent',
        stroke: 'white',
        strokeWidth: 2,
        shadowBlur: 1,
    };

    const mwTextConfig = ref({
        x: canvasStore.center.x + 20,
        y: canvasStore.center.y + 5,
        text: appStore.thematic?.name,
        ellipsis: true,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 16,
        fontFamily: 'Impact',
        color: 'black',
    });

    return { transformerConfig, mwTextConfig, thematicRectConfig,
        groupConfig, stageConfig,
    }
});
