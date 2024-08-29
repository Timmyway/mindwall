<script setup lang="ts">
import { useAudioStore } from '@/store/audioStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useCommandBarStore } from '@/store/commandBarStore';
import { useTextPreviewStore } from '@/store/textPreviewStore';
import { storeToRefs } from 'pinia';
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';
import usePaletteColor from '@/composable/usePaletteColor';
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import useActionPanel from '@/composable/useActionPanel';
import TwMenubarPaletteColor from '../menubar/TwMenubarPaletteColor.vue';

const commandBarStore = useCommandBarStore();
const canvasStore = useCanvasStore();
const audioStore = useAudioStore();
const textPreviewStore = useTextPreviewStore();

const { isFillable } = useCanvasConditions();
const { fontSize, fontFamily, textAlign } = storeToRefs(commandBarStore);
const { paletteColor } = usePaletteColor();

const changeColor = (color: string) => {
    if (isFillable(canvasStore.selectedConfig)) {
        canvasStore.setSelectedConfig({ fill: color });
    }
    hidePanel('palette');
}

/* RELATED TO ACTION PANEL */
const { viewPanel, showPanel, hidePanel, togglePanel } = useActionPanel();
</script>

<template>
<div class="flex items-center gap-3">
    <div class="flex items-center gap-2">
        <!-- SETTING: color palette -->
        <div class="flex items-center">
            <button class="btn btn-icon btn-xs btn-icon--flat btn-icon--xs"
                @mouseover="showPanel('palette')"                
            >
                <i class="fas fa-font"></i>
            </button>
            <tw-menubar-palette-color
                :palette-color="paletteColor"
                :is-visible="viewPanel.palette"
                :handle-change-color="changeColor"
                :handle-show-panel="showPanel"
                :handle-hide-panel="hidePanel"
            ></tw-menubar-palette-color>
        </div>       
    </div>
    <div class="flex items-center gap-2">
        <button @click.prevent="commandBarStore.updateFontSize('-')">
            <i class="fas fa-minus"></i>
        </button>
        <Dropdown
            v-model="fontSize"
            :options="commandBarStore.availableTextSize"
            placeholder="Font size"
            class="w-full md:w-23"
            @change="commandBarStore.updateFontSize()"
        />
        <button @click.prevent="commandBarStore.updateFontSize('+')">
            <i class="fas fa-plus"></i>
        </button>
    </div>
    <div class="flex items-center">
        <!-- SETTING: text family. Note: fontFamilies is not reactive -->
        <Dropdown
            v-model="fontFamily"
            :options="commandBarStore.fontFamilies"
            placeholder="Font"
            class="w-full md:w-23"
            @change="commandBarStore.updateFontFamily()"
        />
    </div>
    <div class="flex items-center whitespace-nowrap">
        <!-- SETTING: text family. Note: fontFamilies is not reactive -->
        <SelectButton
            v-model="textAlign"
            :options="commandBarStore.availableTextAlign"
            optionValue="value"
            aria-labelledby="custom"
            @change="commandBarStore.updateTextAlign()"
        >
            <template #option="slotProps">
                <i :class="slotProps.option.icon"></i>
            </template>
        </SelectButton>
    </div>
    <div class="flex items-center gap-2">
        <button
            v-show="!audioStore.isReading"
            class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
            @click.prevent="audioStore.readText()"
        >
            <i class="fas fa-volume-up text-black"></i>
        </button>
        <button            
            class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
            @click.prevent="textPreviewStore.preview(canvasStore.selectedConfig?.text)"
        >
            <i class="fas fa-eye text-black"></i>
        </button>
    </div>
</div>
</template>

<style>
.p-selectbutton .p-button.p-highlight::before {
    background: rgba(255, 209, 102, 0.2);
    color: black;
}
</style>
