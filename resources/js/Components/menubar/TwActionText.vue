<script setup lang="ts">
import { useCommandBarStore } from '@/store/commandBarStore';
import { storeToRefs } from 'pinia';
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';

const commandBarStore = useCommandBarStore();
const { fontSize, fontFamily, textAlign } = storeToRefs(commandBarStore);
</script>

<template>
<div class="flex items-center gap-3">
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
</div>
</template>

<style>
.p-selectbutton .p-button.p-highlight::before {
    background: rgba(255, 209, 102, 0.2);
    color: black;
}
</style>
