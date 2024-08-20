<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';
import { LayerInfo, MwNode } from '@/types/konva.config';
import MwShape from './MwShape.vue';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { ref, watch } from 'vue';

const props = defineProps<{
    config: MwNode,
    layerInfo: LayerInfo,
}>();

const canvasEventsStore = useCanvasEventsStore();

const { isMwGroupConfig, isMwShapeConfig } = useCanvasConditions();

// Create a ref for the border dimensions
const borderConfig = ref<RectConfig>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    stroke: 'red',
    strokeWidth: 2,
    dash: [10, 5],
    listening: false, // Disable event handling for the border
});

// // Watch for changes in the group config to update border dimensions
// watch(() => props.config, (newConfig) => {
//     // Update the border dimensions based on the group config
//     borderConfig.value = {
//         x: newConfig.x || 0,
//         y: newConfig.y || 0,
//         width: newConfig.width || 100, // Adjust as necessary
//         height: newConfig.height || 100, // Adjust as necessary
//         stroke: 'red',
//         strokeWidth: 2,
//         dash: [10, 5],
//         listening: false,
//     };
// });
</script>

<template>
    <template>
        <v-group
            :config="config"
            @transformend="canvasEventsStore.handleTransformEnd"
            @contextmenu="canvasEventsStore.handleGroupContextMenu"
            @dragstart="canvasEventsStore.onGroupDragstart"
            @dragend="canvasEventsStore.onDragend"
        >
            <template v-for="nestedConfig, nestedConfigIndex in config.items" :key="nestedConfig.id">
                <mw-shape
                    v-if="isMwShapeConfig(nestedConfig)"
                    :config="nestedConfig"
                    :layer-info="layerInfo"
                ></mw-shape>
                <mw-group
                    v-if="isMwGroupConfig(nestedConfig)"
                    :config="nestedConfig"
                    :layer-info="layerInfo"
                ></mw-group>
            </template>
        </v-group>
    </template>
</template>
