<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { LayerInfo, MwGroupConfig, MwNode, MwShapeConfig } from '@/types/konva.config';
import MwGroup from './MwGroup.vue';
import MwShape from './MwShape.vue';

const props = defineProps<{
    config: MwNode,
    layerInfo: LayerInfo,
}>();

const { isMwGroupConfig, isMwShapeConfig } = useCanvasConditions();
</script>

<template>
    <template v-if="isMwGroupConfig(config)">
        <mw-group :config="config" :layer-info="layerInfo"></mw-group>
    </template>
    <template v-if="isMwShapeConfig(config)">
        <mw-shape :config="config" :layer-info="layerInfo"></mw-shape>
    </template>
</template>
