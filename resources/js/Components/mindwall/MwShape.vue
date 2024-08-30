<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useTextEditStore } from '@/store/textEditStore';
import { LayerInfo, MwShapeConfig } from '@/types/konva.config';

const props = defineProps<{
config: MwShapeConfig,
    layerInfo: LayerInfo,
}>();

const canvasStore = useCanvasStore();
const textEditStore = useTextEditStore();
const canvasEventsStore = useCanvasEventsStore();

const { isMwTextConfig, isMwImageConfig, isMwRectConfig, isMwCircleConfig } = useCanvasConditions();
</script>

<template>
<v-text
    v-if="isMwTextConfig(config)"
    :config="config"
    @dblclick="textEditStore.enterEditMode"
    @click="canvasEventsStore.handleTextClick($event, config)"
    @mousedown="canvasEventsStore.handleShapeMouseDown($event, config, layerInfo)"
    @dragend="canvasEventsStore.onDragend"
    @transform="canvasEventsStore.handleTransform"
    @transformend="canvasEventsStore.handleTransformEnd"
    @contextmenu="canvasEventsStore.handleGroupContextMenu"
></v-text>
<template v-if="isMwRectConfig(config)">
    <v-rect
        :config="config"
        @mousedown="canvasEventsStore.handleShapeMouseDown($event, config, layerInfo)"
        @dragend="canvasEventsStore.onDragend"
        @transformend="canvasEventsStore.handleTransformEnd"
        @contextmenu="canvasEventsStore.handleGroupContextMenu"
    ></v-rect>
</template>
<template v-if="isMwCircleConfig(config)">
    <v-circle
        :config="config"
        @mousedown="canvasEventsStore.handleShapeMouseDown($event, config, layerInfo)"
        @dragend="canvasEventsStore.onDragend"
        @transformend="canvasEventsStore.handleTransformEnd"
        @contextmenu="canvasEventsStore.handleGroupContextMenu"
    ></v-circle>
</template>
<template v-if="isMwImageConfig(config)">
    <v-image
        :config="config"
        @mousedown="canvasEventsStore.handleShapeMouseDown($event, config, layerInfo)"
        @dragend="canvasEventsStore.onDragend"
        @transformend="canvasEventsStore.handleTransformEnd"
        @contextmenu="canvasEventsStore.handleGroupContextMenu"
    />
</template>
</template>
