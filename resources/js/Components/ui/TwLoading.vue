<script setup lang="ts">
interface Props {
    isVisible: boolean;
    width?: string;
    height?: string;
}

const props = defineProps<Props>();
</script>

<template>
<img
    v-show="isVisible" src="../../../images/loading.gif" alt="..."
    class="block"
    :style="{ width: width || '24px', height: height || '24px' }"
>
</template>
