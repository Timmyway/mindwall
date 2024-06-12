<script setup lang="ts">
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import ContextMenu from 'primevue/contextmenu';
import { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem';
import { ref } from 'vue';

const props = defineProps<{
    handleAddText: Function,
    handleAddImage: Function,
    handleRemoveShape: Function
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
    }
]);

</script>

<template>
<ContextMenu ref="menu" :model="items" />

<slot></slot>
</template>
