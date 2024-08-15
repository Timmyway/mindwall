<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { MwGroupConfig, MwShapeConfig } from '@/types/konva.config';
import MwGroup from './MwGroup.vue';
import MwShape from './MwShape.vue';

const props = defineProps<{
    config: MwGroupConfig | MwShapeConfig,
    layerIndex: number,
}>();

const { isMwGroupConfig } = useCanvasConditions();
</script>

<template>
    <template v-if="isMwGroupConfig(config)">
        <mw-group :config="config" :layerIndex="layerIndex"></mw-group>
    </template>
    <template v-else>
        <mw-shape :config="config" :layerIndex="layerIndex"></mw-shape>
    </template>
</template>
