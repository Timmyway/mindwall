<script setup lang="ts">
import { ref } from 'vue';
import { useDraggable } from '@vueuse/core';
import { safeJsonParse } from '../../helpers/utils';
import { onMounted } from 'vue';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Quote {
    id: number;
    name: string;
    position: string
}

// Define interface for thematic object
interface Thematic {
    id: number;
    name: string;
    user: User;
    quotes: Quote[]
}

const props = defineProps<{
    thematic: Thematic
}>();

const quoteRefs = ref<HTMLElement[]>([]);

onMounted(() => {
    // Initialize quoteRefs with null values
    props.thematic.quotes.forEach(() => {
        quoteRefs.value.push(null);
    });
});

const handleDragStart = (index: number) => {
    const { x, y, style } = useDraggable(quoteRefs.value[index], {
        initialValue: { x: 40, y: 40 },
    });

    // Update the position of the quote
    props.thematic.quotes[index].position = JSON.stringify({ x: x.value, y: y.value });
};
</script>
<template>
<div class="p-4 bg-gray-100 flex justify-center items-center h-dvh">
    <div>
        <div class="px-4 py-2 shadow-lg bg-green-400 text-black font-bold rounded-full">
            {{ thematic.name }}
        </div>
        <div
            v-for="(quote, index) in thematic.quotes" :key="quote.id"
            :style="{
                position: 'fixed',
                top: `${safeJsonParse(quote.position).x}px`,
                left: `${safeJsonParse(quote.position).y}px`
            }"
        >
            <div class="px-4 py-2 shadow-lg bg-blue-600 text-white font-bold rounded-sm">
                {{ quote.name }}
            </div>
        </div>
    </div>
</div>
</template>
