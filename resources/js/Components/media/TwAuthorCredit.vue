<script setup lang="ts">
const props = defineProps({
    href: String,
    dark: { type: Boolean, default: false }
})
</script>

<template>
<div class="absolute bottom-3 right-3 text-sm" :class="[dark ? 'text-white' : 'text-black']">
    <slot></slot>
</div>
</template>
<style lang="">

</style>
