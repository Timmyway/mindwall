import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useCanvasStore } from "./canvasStore";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { useAppStore } from "./appStore";

export const useCanvasConfig = defineStore('canvasConfig', () => {
    const canvasStore = useCanvasStore();
    const appStore = useAppStore();
    const { isMwTextConfig, isMwImageConfig, isMwGroupConfig, isMwRectConfig, isMwCircleConfig } = useCanvasConditions();

    const transformerConfig = computed(() => {
        const tempConfig = { enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] };

        if (canvasStore.selectedConfig) {
            if (canvasStore.selectedConfig && isMwTextConfig(canvasStore.selectedConfig)) {
            tempConfig.enabledAnchors = ['middle-left', 'middle-right'];
            } else if (isMwGroupConfig(canvasStore.selectedConfig)) {
                tempConfig.enabledAnchors = ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'];
            } else if (isMwImageConfig(canvasStore.selectedConfig) || isMwRectConfig(canvasStore.selectedConfig) || isMwCircleConfig(canvasStore.selectedConfig)) {
                tempConfig.enabledAnchors = ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'];
            }
        }
        return tempConfig;
    });

    const stageConfig = ref({
        width: canvasStore.stageWidth,
        height: canvasStore.stageHeight,
    });

    const groupConfig = ref({});

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

    const kernelConfig = ref({
        x: canvasStore.center.x + 2.5,
        y: canvasStore.center.y + 2.5,
        text: appStore.thematic?.name?.slice(0, 26),
        width: 5,
        height: 5,
        fill: '#880205',
        ellipsis: true,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fontFamily: 'Impact',
        color: 'black',
    });    

    return { transformerConfig, kernelConfig, thematicRectConfig,
        groupConfig, stageConfig
    }
});
