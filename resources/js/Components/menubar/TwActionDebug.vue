<script setup lang="ts">
import { useAppStore } from '@/store/appStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useTextEditStore } from '@/store/textEditStore';
import { useWidgetSettingStore } from '@/store/widgetSettingStore';
import { ref } from 'vue';

const debug = ref<boolean>(true);

const canvasStore = useCanvasStore();
const textEditStore = useTextEditStore();
const appStore = useAppStore();
const widgetStore = useWidgetSettingStore();

</script>

<template>
<div v-show="debug" class="mx-2 mindwall-debug flex items-center max-w-2xl w-full bg-red-600 z-50">
    <div class="flex items-center">
        <i :class="['fas', canvasStore.selectedConfig?.draggable ? 'fa-unlock text-green-600' : 'fa-lock text-red-600']"></i>
        <h2 class="whitespace-nowrap flex flex-col items-center gap-2">
            <span class="text-lg capitalize font-black">{{ appStore.thematic?.name }}</span>
            <span class="text-xs">{{ widgetStore.usedEngine?.name }}</span>
        </h2>
    </div>
    <div class="flex py-1 px-1 items-center gap-2 max-w-[100px] overflow-x-auto scrollbar-thin">
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Editing: {{ textEditStore.editing }}</div>
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Ready: {{ appStore.isReady }}</div>
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Draggable: ({{ canvasStore.selectedConfig?.draggable }})</div>
    </div>
    <div class="bg-black text-white text-xs px-2 w-full h-12 overflow-auto scroll-smooth scrollbar-thin">
        <div class="py-2 flex flex-col gap-2">
            <span>Name: {{ canvasStore.selectedConfig?.name }} | x: {{ canvasStore.selectedConfig?.x }} | y: {{ canvasStore.selectedConfig?.y }}</span>
            <span>StageX{{ canvasStore.stageRef?.getStage()?.x() }} | StageY: {{ canvasStore.stageRef?.getStage()?.y() }}</span>
        </div>
        <div v-for="confValue,confName in canvasStore.selectedConfig" class="p-1 border border-gray-200 py-1">
            <div class="h-12">
                {{ confName }} => {{ confValue }}
            </div>
        </div>
    </div>    
    <button class="w-6 h-6" @click="debug = false"><i class="fas fa-times"></i></button>
</div>
</template>