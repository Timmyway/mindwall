<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { MwGroupConfig, MwShapeConfig } from '@/types/konva.config';
import MwGroup from './MwGroup.vue';
import MwShape from './MwShape.vue';

const props = defineProps<{
    config: MwGroupConfig | MwShapeConfig
}>();

const { isMwGroupConfig } = useCanvasConditions();
</script>

<template>
    <template v-if="isMwGroupConfig(config)">
        <mw-group :config="config"></mw-group>
    </template>
    <template v-else>
        <mw-shape :config="config"></mw-shape>
    </template>
</template>
