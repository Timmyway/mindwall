<script setup lang="ts">
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import ContextMenu from 'primevue/contextmenu';
import { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem';
import { ref } from 'vue';

const props = defineProps<{
    handleAddText: Function,
    handleAddImage: Function,
    handleRemoveShape: Function,
    handleBringToTop: Function,
    handleBringToBack: Function
}>();

const canvaStore = useCanvasStore();
const { menu } = storeToRefs(canvaStore);

const items = ref<MenuItem[]>([
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
            { label: 'Bring to top', icon: 'fas fa-plus', command: props.handleBringToBack },
        ]
    },

]);

</script>

<template>
<ContextMenu ref="menu" :model="items" />

<slot></slot>
</template>
