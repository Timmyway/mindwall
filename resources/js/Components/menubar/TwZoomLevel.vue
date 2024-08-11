<script setup lang="ts">
import { useCanvasStore } from '@/store/canvasStore';

const canvaStore = useCanvasStore();
</script>

<template>
<button @click.prevent="canvaStore.setZoomLevel('-')">
    <i class="fas fa-minus"></i>
</button>
<span class="text-xs">{{ canvaStore.zoomLevel }}%</span>
<button @click.prevent="canvaStore.setZoomLevel('+')">
    <i class="fas fa-plus"></i>
</button>
<transition name="fade-slide">
    <button
        v-show="canvaStore.zoomLevel !== 100"
        class="btn btn-xs text-xs py-1 px-1 bg-orange-300 text-black font-normal"
        @click="canvaStore.resetZoomLevel()"
    >Reset</button>
</transition>
</template>

<style scoped>
/* .fade-slide-enter-active, .fade-slide-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

// .fade-leave-active in <2.1.8
.fade-slide-enter, .fade-slide-leave-to {
    opacity: 0;
    // Slide up effect
    transform: translateY(-5px);
} */
</style>
