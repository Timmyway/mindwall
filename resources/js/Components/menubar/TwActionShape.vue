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
                <i class="fas fa-palette"></i>
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
</div>
</template>

<style>
.p-selectbutton .p-button.p-highlight::before {
    background: rgba(255, 209, 102, 0.2);
    color: black;
}
</style>
