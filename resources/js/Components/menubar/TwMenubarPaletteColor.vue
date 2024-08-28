<script setup lang="ts">
import { ActionPanelView } from '@/types/panel.types';

interface Props {
    isVisible?: boolean;
    paletteColor: string[];
    handleShowPanel: (panel: keyof ActionPanelView) => void;
    handleHidePanel: (panel: keyof ActionPanelView) => void;
    handleChangeColor: (color: string) => void;
    maxWidth?: string;
}

const props = withDefaults(
    defineProps<Props>(),
    {
        isVisible: false,
        maxWidth: '200px'
    }
);

// Destructure the props for easier access
const { handleHidePanel, handleChangeColor } = props
</script>

<template>
<div
    v-show="isVisible"
    class="tw-menubar-palette-color absolute top-full w-full bg-white z-40 p-2 flex flex-wrap gap-[5px]"
    :style="{ maxWidth }"
    @mouseenter="() => handleShowPanel('palette')"
    @mouseleave="() => handleHidePanel('palette')"    
>
    <template v-for="color in paletteColor">
        <button
            class="btn btn-icon p-0 w-6 h-6 rounded-full"
            :style="{ backgroundColor: color }"
            @click="handleChangeColor(color)"></button>
    </template>
</div>
</template>

<style lang="scss">
.tw-menubar-palette-color {
    box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
}
</style>
