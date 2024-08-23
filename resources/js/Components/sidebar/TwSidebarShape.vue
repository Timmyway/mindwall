<script setup lang="ts">
import { useCanvasStore } from '@/store/canvasStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { LayerInfo, MwNode } from '@/types/konva.config';
import { truncateString } from '@/helpers/utils';

const props = defineProps<{
    node: MwNode,
    layerInfo: LayerInfo,
}>();
const canvaStore = useCanvasStore();
const sidebarStore = useSidebarStore();
</script>

<template>
<div
    class="mw-sidebar-shape space-y-4 w-full"
    :class="{
        'mw-sidebar--active': (canvaStore.selectedConfig?.id === node?.id) || canvaStore.selectedConfig?.id === node?.parent,
    }"
>
    <div class="flex gap-4">
        <button class="btn btn-icon btn-xs btn-icon--flat bg-gray-200 w-6 h-6 p-2" @click="sidebarStore.toogleDetails">
            <i :class="['fas', sidebarStore.areDetailsShown? 'fa-caret-down': 'fa-caret-right']"></i>
        </button>
        <button class="btn btn-icon btn-xs btn-icon--flat bg-emerald-200 w-6 h-6 p-2" @click="sidebarStore.findOnCanva($event, node, layerInfo)">
            <i class="fas fa-crosshairs"></i>
        </button>
        <div>{{ truncateString(node?.name ?? '', 20) }}</div>
    </div>
    <ul v-show="sidebarStore.areDetailsShown" class="mw-sidebar-shape__items">
        <li
            v-for="(shapeValue, shapeKey) in node"
            :key="`shape-detail-${shapeKey}`"
            class="py-2 mw-sidebar-shape__items__item"
        >
            <span><span class="font-bold">{{ shapeKey }}:</span> {{ typeof shapeValue === 'string' ? truncateString(shapeValue, 120) : shapeValue }}</span>
        </li>
    </ul>
</div>
</template>

<style lang="scss">
.mw-sidebar-shape {
    padding: 15px 4px;
    margin-bottom: 10px;
    background-color: white;
    transition: all .4s;
    &__items {
        display: flex; flex-direction: column;
        gap: 10px;
        &__item {
            padding: 5px 0;
            border-bottom: 1px solid #aaa;
        }
    }
}
.mw-sidebar--active {
    background-color: rgb(194, 238, 238);
}
</style>
