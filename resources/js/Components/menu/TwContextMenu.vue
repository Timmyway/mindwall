<script setup lang="ts">
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import ContextMenu from 'primevue/contextmenu';
import { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem';
import { ref } from 'vue';

const props = defineProps<{
    handleAddText: (event: MenuItemCommandEvent) => void,
    handleAddImage: (event: MenuItemCommandEvent) => void,
    handleRemoveShape: (event: MenuItemCommandEvent) => void,
    handleBringToTop: (event: MenuItemCommandEvent) => void,
    handleBringToBack: (event: MenuItemCommandEvent) => void,
    handleClone: (event: MenuItemCommandEvent) => void,
    handleTextAiGenerate: (event: MenuItemCommandEvent) => void
    handleCenterOnElement: (event: MenuItemCommandEvent) => void
    handleGroup: (event: MenuItemCommandEvent) => void
    handleUngroup: (event: MenuItemCommandEvent) => void
}>();

const canvaStore = useCanvasStore();
const { menu } = storeToRefs(canvaStore);

const items = ref<MenuItem[]>([
    {
        label: 'Focus',
        icon: 'fas fa-crosshairs',
        command: props.handleCenterOnElement
    },
    {
        label: 'Image',
        icon: 'fas fa-image',
        items: [
            { label: 'Add', icon: 'fas fa-plus', command: props.handleAddImage },
        ]
    },
    {
        label: 'Text',
        icon: 'fas fa-font',
        items: [
            { label: 'Add', icon: 'fas fa-plus', command: props.handleAddText },
            { label: 'Gemini Saves the Day', icon: 'fas fa-plus', command: props.handleTextAiGenerate },
        ]
    },
    {
        label: 'Delete',
        icon: 'fas fa-trash text-red-300',
        command: props.handleRemoveShape
    },
    {
        label: 'Position',
        icon: 'fas fa-layer',
        items: [
            { label: 'Bring to top', icon: 'fas fa-plus', command: props.handleBringToTop },
            { label: 'Bring to back', icon: 'fas fa-plus', command: props.handleBringToBack },
        ]
    },
    {
        label: 'Clone',
        icon: 'fas fa-clone',
        command: props.handleClone
    },
    {
        label: 'Grouping',
        icon: 'fas fa-object-group',
        items: [
            {label: 'Group', icon: 'fas fa-object-group', command: props.handleGroup},
            {label: 'Ungroup', icon: 'fas fa-object-ungroup', command: props.handleUngroup},
        ]
    }

]);

</script>

<template>
<ContextMenu ref="menu" :model="items" />

<slot></slot>
</template>
