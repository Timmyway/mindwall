<script setup lang="ts">
import { useAppStore } from '@/store/appStore';
import { useCanvasOperationsStore } from '@/store/canvasOperationsStore';
import { useCanvasStore } from '@/store/canvasStore';
import TwButtonGroup from './TwButtonGroup.vue';

const appStore = useAppStore();
const canvasStore = useCanvasStore();
const operationStore = useCanvasOperationsStore();

</script>

<template>
<div class="flex justify-center items-center gap-3">
    <div class="w-8 h-8">
        <button
            v-show="!appStore.isSaving"
            class="btn btn-icon btn-xs btn-icon--flat w-8 h-8 p-2"
            :class="[appStore.isSaving ? 'bg-green-200' : 'bg-green-400']"
            @click.prevent="appStore.saveWallToServer()"
        >
            <i class="fas fa-save text-xl text-black"></i>
        </button>
    </div>
    <div>
        <tw-button-group>
            <template #buttons>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2"
                    @click.prevent="operationStore.addTextToWall()"
                >
                    <i class="fas fa-font text-xl text-black"></i>
                </button>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-200 w-8 h-8 p-2"
                    @click.prevent="operationStore.addShapeToWall('rectangle')"
                >
                    <i class="fas fa-vector-square text-xl text-black"></i>
                </button>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-200 w-8 h-8 p-2"
                    @click.prevent="operationStore.addShapeToWall('circle')"
                >
                    <i class="fas fa-vector-circle text-xl text-black"></i>
                </button>
            </template>
        </tw-button-group>
    </div>
    <div>
        <tw-button-group trigger-icon-class="fas fa-tools">
            <template #buttons>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-200 w-8 h-8 p-2"
                    @click.prevent="operationStore.bringToBack(canvasStore.selectedConfig)"
                >
                    <i class="fas fa-arrow-up text-xl text-black"></i>
                </button>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-200 w-8 h-8 p-2"
                    @click.prevent="operationStore.bringToTop(canvasStore.selectedConfig)"
                >
                    <i class="fas fa-arrow-down text-xl text-black"></i>
                </button>
            </template>
        </tw-button-group>
    </div>
    <button
        class="btn btn-icon btn-xs btn-icon--flat bg-red-400 w-8 h-8 p-2"
        @click.prevent="canvasStore.resetWall()"
    >
        <i class="fas fa-times text-xl text-black"></i>
    </button>
</div>
</template>
