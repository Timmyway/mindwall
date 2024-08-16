<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { LayerInfo, MwGroupConfig, MwShapeConfig } from '@/types/konva.config';
import MwGroup from './MwGroup.vue';
import MwShape from './MwShape.vue';

const props = defineProps<{
    config: MwGroupConfig | MwShapeConfig,
    layerInfo: LayerInfo,
}>();

const { isMwGroupConfig } = useCanvasConditions();
</script>

<template>
    <template v-if="isMwGroupConfig(config)">
        <mw-group :config="config" :layer-info="layerInfo"></mw-group>
    </template>
    <template v-else>
        <mw-shape :config="config" :layer-info="layerInfo"></mw-shape>
    </template>
</template>
