import { MwGroupConfig, MwImageConfig, MwLayerConfig, MwRectConfig, MwTextConfig } from "@/types/konva.config";

export function useCanvasConditions() {
    const isMwTextConfig = (config: any): config is MwTextConfig => {
        if (!config) {
            return false;
        }
        return (config as MwTextConfig).is === 'text';
    };

    const isMwImageConfig = (config: any): config is MwImageConfig => {
        if (!config) {
            return false;
        }
        return (config as MwImageConfig).is === 'image';
    };

    const isMwRectConfig = (config: any): config is MwImageConfig => {
        if (!config) {
            return false;
        }
        return (config as MwRectConfig).is === 'rectangle';
    };

    const isMwLayerConfig = (config: any): config is MwLayerConfig => {
        if (!config) {
            return false;
        }
        return (config as MwLayerConfig).is === 'layer';
    };

    const isMwGroupConfig = (config: any): config is MwGroupConfig => {
        if (!config) {
            return false;
        }
        return (config as MwGroupConfig).is === 'group';
    };

    const isMwShapeConfig = (config: any): boolean => {
        return isMwTextConfig(config) || isMwImageConfig(config) || isMwRectConfig(config);
    };

    return { isMwGroupConfig, isMwLayerConfig, isMwShapeConfig, 
        isMwRectConfig, isMwTextConfig, isMwImageConfig,
    }
}
