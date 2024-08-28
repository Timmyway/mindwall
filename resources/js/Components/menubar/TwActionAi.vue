<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useCanvasOperationsStore } from '@/store/canvasOperationsStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useWidgetSettingStore } from '@/store/widgetSettingStore';

const widgetStore = useWidgetSettingStore();
const canvasStore = useCanvasStore();
const operationStore = useCanvasOperationsStore();

const { isMwShapeConfig } = useCanvasConditions();
</script>

<template>
<div class="flex items-center gap-4 w-[200px]">
    <div
        v-show="!widgetStore.isLoading.aiGenerateText && isMwShapeConfig(canvasStore.selectedConfig)"
        class="flex items-center gap-2"
    >
        <!-- IA related commands -->
        <button
            class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
            @click.prevent="operationStore.addAiTextToWall()"
        >
            <i class="fas fa-robot text-blue-600 text-xl"></i>
        </button>
        <button
            class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
            @click.prevent="operationStore.addAiTextToWall('hot')"
        >
            <i class="fas fa-robot text-orange-600 text-xl"></i>
        </button>
    </div>    
</div>
</template>