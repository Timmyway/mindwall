<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useTextEditStore } from '@/store/textEditStore';
import { MwShapeConfig } from '@/types/konva.config';

const props = defineProps<{
config: MwShapeConfig,
    layerIndex: number,
}>();

const canvasStore = useCanvasStore();
const textEditStore = useTextEditStore();
const canvasEventsStore = useCanvasEventsStore();

const { handleTextClick, handleTextMouseDown, onDragend, handleTransform, handleTransformEnd } = canvasEventsStore;

const { isMwTextConfig, isMwImageConfig } = useCanvasConditions();
console.log('------------------> JJJJJJJJJJJJJJ', props.layerIndex);
</script>

<template>
<v-text
    v-if="isMwTextConfig(config)"
    :config="config"
    @dblclick="textEditStore.enterEditMode"
    @click="handleTextClick"
    @mousedown="handleTextMouseDown(config.name ?? '', layerIndex)"
    @dragend="onDragend"
    @transform="handleTransform"
    @transformend="handleTransformEnd"
></v-text>
<template v-if="isMwImageConfig(config)">
    <v-image
        :config="config"
        @mousedown="canvasStore.selectConfig(config.name ?? '', layerIndex)"
        @dragend="onDragend"
        @transformend="handleTransformEnd"
    />
</template>
</template>
