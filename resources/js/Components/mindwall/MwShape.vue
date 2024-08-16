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

const { handleTextClick, handleTextMouseDown, onDragend, handleTransform, handleTransformEnd } = canvasEventsStore;

const { isMwTextConfig, isMwImageConfig } = useCanvasConditions();
</script>

<template>
<v-text
    v-if="isMwTextConfig(config)"
    :config="config"
    @dblclick="textEditStore.enterEditMode"
    @click="handleTextClick($event, config)"
    @mousedown="handleTextMouseDown($event, config.name ?? '', layerInfo)"
    @dragend="onDragend"
    @transform="handleTransform"
    @transformend="handleTransformEnd"
></v-text>
<template v-if="isMwImageConfig(config)">
    <v-image
        :config="config"
        @mousedown="canvasStore.selectConfig(config.name ?? '', layerInfo)"
        @dragend="onDragend"
        @transformend="handleTransformEnd"
    />
</template>
</template>
