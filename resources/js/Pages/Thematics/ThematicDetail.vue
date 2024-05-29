<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { safeJsonParse } from '../../helpers/utils';
import { router } from '@inertiajs/vue3'

interface User {
    id: number;
    name: string;
    email: string;
}

interface QuotePositionObject {
  x: number;
  y: number;
}

interface Quote {
    id: number;
    name: string;
    position: string | QuotePositionObject;
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

onMounted(() => {

});

const randPos = (axis: string): number => {
    if (axis === 'x') {
        return Math.floor(Math.random() * window.innerWidth);
    } else {
        return Math.floor(Math.random() * window.innerHeight);
    }
}

const savePositionsToServer = (positions: { x: number; y: number }[]) => {
    try {
        router.post('/api/quotes/update-positions', {
            thematicId: props.thematic.id,
            positions
        });
    } catch (error) {
        console.error('Failed to update positions on the server:', error);
    }
};

// Konva configs
const configKonva = ref({
    width: window.innerWidth,
    height: window.innerHeight - 32
});

const configCircle = ref({
    x: 100,
    y: 100,
    radius: 70,
    fill: "red",
    stroke: "black",
    strokeWidth: 4,
    draggable: true,
});
const configRect = ref({
    x: 50,
    y: 50,
    width: 100,
    height: 50,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 2,
    draggable: true
});

const onDragCircleEnd = () => {
    const randomColors = ['indigo', 'green', 'blue', 'yellow', 'red'];
    const randomIndex = Math.floor(Math.random() * randomColors.length);
    configCircle.value.fill = randomColors[randomIndex];
}
</script>
<template>
    <div class="bg-gray-200 h-8">
        <button class="btn btn-link py-1">Cancel</button>
    </div>
    <div class="flex items-center bg-gray-100">
        <v-stage :config="configKonva">
            <v-layer>
                <div>
                    <div class="px-4 py-2 shadow-lg bg-green-400 text-black font-bold rounded-full">
                        <v-rect :config="{
                            x: 1000,
                            y: 400,
                            width: 200,
                            height: 70,
                            fill: 'green',
                            stroke: 'black',
                            strokeWidth: 4
                        }"></v-rect>
                        <v-text :config="{
                            x: 1000 - 100,
                            y: 400 - 35,
                            fontFamily: 'Calibri',
                            fontSize: 12,
                            text: thematic.name
                        }"></v-text>
                    </div>
                    <template v-for="(quote, index) in thematic.quotes" :key="quote.id">
                        <v-text
                            :config="{
                                x: randPos('x'),
                                y: randPos('y'),
                                fontFamily: 'Calibri',
                                fontSize: 12,
                                text: quote.name,
                                fill: 'black',
                                draggable: true
                            }"
                        ></v-text>
                    </template>
                </div>
            </v-layer>
        </v-stage>
    </div>
<!-- <div class="p-4 bg-gray-100 flex justify-center items-center h-dvh">
    <div>
        <div class="px-4 py-2 shadow-lg bg-green-400 text-black font-bold rounded-full">
            {{ thematic.name }}
        </div>
        <template v-for="(quote, index) in thematic.quotes" :key="quote.id">
            <UseDraggable
                class="fixed"
                :storage-key="`draggable-${thematic.id}-quote-${quote.id}`"
                storage-type="session"
                :initial-value="{ x: randPos(1920), y: randPos(1080) }"
                v-slot="{ x, y }"
            >
                <div class="px-4 py-2 shadow-lg bg-blue-600 text-white font-bold rounded-sm text-xs">
                    {{ quote.name }} {{ x }}, {{ y }}
                </div>
            </UseDraggable>
        </template>
    </div>
</div> -->
</template>
