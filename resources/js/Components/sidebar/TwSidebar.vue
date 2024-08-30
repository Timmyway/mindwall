<script setup lang="ts">
import { useCanvasStore } from '@/store/canvasStore';
import TwSidebarGroup from './TwSidebarGroup.vue';
import TwSidebarShape from './TwSidebarShape.vue';
import { useCanvasConditions } from '@/composable/useCanvasConditions';

interface Props {
    height?: string;
}
const props = withDefaults(defineProps<Props>(), {
    height: '90vh'
});

const canvasStore = useCanvasStore();
const { isMwShapeConfig, isMwGroupConfig } = useCanvasConditions();
</script>

<template>
<aside class="mw-sidebar" :style="{ height }">
    <div v-for="layer, layerIndex in canvasStore.wall.layers" :key="`mwa-${layer.id}`">
        <div v-for="node in layer.items" :key="`mwa-${node.id}`">            
            <div
                v-if="isMwShapeConfig(node)"
            >
                <tw-sidebar-shape :node="node" :layer-info="{ id: layer.id ?? '', index: layerIndex }"></tw-sidebar-shape>
            </div>
            <div v-if="isMwGroupConfig(node)">
                <tw-sidebar-group :node="node" :layer-info="{ id: layer.id ?? '', index: layerIndex }"></tw-sidebar-group>
            </div>
        </div>
    </div>
    <div class="flex overflow-x-auto h-12 scrollbar-thin">
        <span v-show="canvasStore.selectedItems?.length > 0" class="whitespace-nowrap">{{ canvasStore.selectedItems.map(item => item.name ) }}</span>
    </div>    
</aside>
</template>

<style>
.mw-sidebar {
    position: fixed;    
    top: 85px; right: 0; bottom: 0;
    z-index: 30;
    background-color: #f5f1f1;
    color: black;    
    width: 300px;
    font-size: 1rem;
    overflow-y: auto;
    box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}
</style>
