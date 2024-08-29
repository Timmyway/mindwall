
<script setup lang="ts">

interface Props {
    triggerIconClass?: string;
    isRelative?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    triggerIconClass: 'fas fa-plus-circle',
    isRelative: false
});

</script>

<template>
<div class="group flex justify-center" :class="{ 'relative': isRelative }">
    <div class="btn btn-icon btn-xs btn-icon--flat bg-gray-200 w-8 h-8 p-2">
        <i class="text-xl text-black" :class="triggerIconClass"></i>
    </div>
    <div class="absolute z-30 top-100 hidden transition-all duration-1000 flex-col justify-center bg-white shadow-lg px-2 py-2 rounded-b-md group-hover:flex hover:flex">
        <slot name="buttons"></slot>
    </div>
</div>  
</template>