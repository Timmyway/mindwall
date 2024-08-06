import { ImageConfig, TextConfig } from "@/types/konva.config";

export function useCanvasConditions() {
    const isTextConfig = (config: any): config is TextConfig => {
        if (!config) {
            return false;
        }
        return (config as TextConfig).is === 'text';
    };

    const isImageConfig = (config: any): config is ImageConfig => {
        if (!config) {
            return false;
        }
        return (config as ImageConfig).is === 'image';
    };

    return { isTextConfig, isImageConfig }
}
