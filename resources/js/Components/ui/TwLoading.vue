<script setup lang="ts">
interface Props {
    isVisible: boolean
}

const props = defineProps<Props>();
</script>

<template>
<img
    v-show="isVisible" src="../../../images/loading.gif" alt="..."
    class="w-6 h-6 block"
>
</template>
