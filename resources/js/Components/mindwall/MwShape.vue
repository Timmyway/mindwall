<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useTextEditStore } from '@/store/textEditStore';
import { MwGroupConfig, MwShapeConfig } from '@/types/konva.config';

const props = defineProps<{
    config: MwGroupConfig | MwShapeConfig
}>();

const canvasStore = useCanvasStore();
const textEditStore = useTextEditStore();
const canvasEventsStore = useCanvasEventsStore();

const { handleTextClick, handleTextMouseDown, onDragend, handleTransform, handleTransformEnd } = canvasEventsStore;

const { isMwTextConfig, isMwImageConfig, isMwGroupConfig } = useCanvasConditions();
</script>

<template>
<v-text
    v-if="isMwTextConfig(config)"
    :config="config"
    @dblclick="textEditStore.enterEditMode"
    @click="handleTextClick"
    @mousedown="handleTextMouseDown(config)"
    @dragend="onDragend"
    @transform="handleTransform"
    @transformend="handleTransformEnd"
></v-text>
<template v-if="isMwImageConfig(config)">
    <v-image
        :config="config"
        @mousedown="canvasStore.selectConfig(config.name)"
        @dragend="onDragend"
        @transformend="handleTransformEnd"
    />
</template>
</template>
