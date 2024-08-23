<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { LayerInfo, MwNode } from '@/types/konva.config';
import TwSidebarShape from './TwSidebarShape.vue';

const props = defineProps<{
    node: MwNode,
    layerInfo: LayerInfo,
}>();

const { isMwShapeConfig, isMwGroupConfig } = useCanvasConditions();
</script>

<template>
<div class="mw-sidebar-group">
    <template v-for="innerNode in node.items">
        <div
            v-if="isMwShapeConfig(innerNode)"
            class="flex flex-column gap-2"
        >
            <tw-sidebar-shape :node="innerNode" :layer-info="layerInfo"></tw-sidebar-shape>
        </div>
        <div v-if="isMwGroupConfig(innerNode)">
            <tw-sidebar-group :node="innerNode" :layer-info="layerInfo"></tw-sidebar-group>
        </div>
    </template>
</div>
</template>
