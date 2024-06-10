<script setup lang="ts">
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import ContextMenu from 'primevue/contextmenu';
import { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem';
import { ref } from 'vue';

const props = defineProps<{
    onImageAdd: Function,
    onImageRemove: Function
}>();

const canvaStore = useCanvasStore();
const { menu } = storeToRefs(canvaStore);

const items = ref<MenuItem[]>([
    {
        label: 'Image',
        icon: 'fas fa-image',
        items: [
            { label: 'Add', icon: 'fas fa-plus', command: props.onImageAdd },
            { label: 'Delete', icon: 'fas fa-trash', command: props.onImageRemove },
        ]
    }
]);

</script>

<template>
<ContextMenu ref="menu" :model="items" />

<slot></slot>
</template>
