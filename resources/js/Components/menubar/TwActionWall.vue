<script setup lang="ts">
import { useAppStore } from '@/store/appStore';
import { useCanvasOperationsStore } from '@/store/canvasOperationsStore';
import { useCanvasStore } from '@/store/canvasStore';

const appStore = useAppStore();
const canvasStore = useCanvasStore();
const operationStore = useCanvasOperationsStore();

</script>

<template>
<div class="flex justify-center items-center gap-3">
    <button
        v-show="!appStore.isSaving"
        class="btn btn-icon btn-xs btn-icon--flat bg-green-400 w-8 h-8 p-2"
        @click.prevent="appStore.saveWallToServer()"
    >
        <i class="fas fa-save text-xl text-black"></i>
    </button>
    <button
        class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2"
        @click.prevent="operationStore.addTextToWall()"
    >
        <i class="fas fa-plus-circle text-xl text-black"></i>
    </button>
    <button
        class="btn btn-icon btn-xs btn-icon--flat bg-red-400 w-8 h-8 p-2"
        @click.prevent="canvasStore.resetWall()"
    >
        <i class="fas fa-times text-xl text-black"></i>
    </button>
</div>
</template>