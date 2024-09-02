import { getNanoid } from "@/helpers/utils";
import { MwLayerConfig } from "@/types/konva.config";

export default function useBasicOperations() {
    const setupNewLayer = (): { newLayer: MwLayerConfig, layerId: string } => {
        const layerId = `layer-${getNanoid()}`;

        const newLayer: MwLayerConfig = {
            id: layerId,
            name: layerId,
            is: 'layer',
            items: [], // Initialize with an empty items object
        };
        return { newLayer, layerId };
    }

    return { setupNewLayer }
}