<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { MwNode, LayerInfo } from '@/types/konva.config';
import TwSidebarGroup from './TwSidebarGroup.vue';
import TwSidebarShape from './TwSidebarShape.vue';

const props = defineProps<{
    node: MwNode,
    layerInfo: LayerInfo,
}>();

const { isMwShapeConfig, isMwGroupConfig } = useCanvasConditions();
</script>

<template>
<div>
    <div
        v-if="isMwShapeConfig(node)"
    >
        <tw-sidebar-shape :node="node" :layer-info="layerInfo"></tw-sidebar-shape>
    </div>
    <div v-if="isMwGroupConfig(node)">
        <tw-sidebar-group :node="node" :layer-info="layerInfo"></tw-sidebar-group>
    </div>
</div>
</template>
<style>
.mw-sidebar--active {
    background-color: rgb(224, 115, 134);
}
</style>
