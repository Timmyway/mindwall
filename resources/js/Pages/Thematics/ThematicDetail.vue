<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { safeJsonParse } from '../../helpers/utils';
import { randInt, randPos } from '../../helpers/canva';
import { router } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import { CanvasState } from '../../types/canvas.types'

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

const canvaStore = useCanvasStore();
const { stageRef } = storeToRefs(canvaStore);

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
const stageWidth = ref(window.innerWidth);
const stageHeight = ref(window.innerHeight - 32);

const center = {
    x: stageWidth.value / 2,
    y: stageHeight.value / 2,
};

const selectedQuote = ref();
const quotesConfig = ref(props.thematic.quotes.map((quote) => {
    return {
        id: `quote-${quote.id}`,
        rotation: randInt(0, 360),
        x: randPos('x'),
        y: randPos('y'),
        scaleX: 1,
        scaleY: 1,
        fontFamily: 'Calibri',
        fontSize: 12,
        name: `quote-${quote.id}`,
        text: quote.name,
        fill: 'black',
        draggable: true
    }
}));
const transformer = ref();

const stageConfig = {
  width: stageWidth.value,
  height: stageHeight.value,
};

const groupConfig = {

}

const rectConfig = {
    x: center.x,
    y: center.y,
    width: 200, // Add some padding
    height: 15, // Add some padding
    fill: '#000',
    stroke: 'white',
    strokeWidth: 4,
    shadowBlur: 10
};

const textConfig = ref({
    x: center.x,
    y: center.y,
    text: props.thematic.name,
    ellipsis: true,
    align: 'center',
    verticalAlign: 'middle',
    fontSize: 13,
    fontFamily: 'Calibri',
    fill: '#fff',
});

const handleTransformEnd = (e) => {
    // shape is transformed, let us save new attrs back to the node
    // find element in our state
    const quoteConfig = quotesConfig.value.find(
        (r) => r.name === selectedQuote.value
    );

    if (quoteConfig) {
        // update the state
        quoteConfig.x = e.target.x();
        quoteConfig.y = e.target.y();
        quoteConfig.rotation = e.target.rotation();
        quoteConfig.scaleX = e.target.scaleX();
        quoteConfig.scaleY = e.target.scaleY();
    }
}

const handleStageMouseDown = (e) => {
    console.log('==> Stage mouse down event...');
    // clicked on stage - clear selection
    if (e.target === e.target.getStage()) {
        selectedQuote.value = '';
        updateTransformer();
        return;
    }

    // clicked on transformer - do nothing
    const clickedOnTransformer = e.target.getParent().className === 'Transformer';
    if (clickedOnTransformer) {
        return;
    }

    // find clicked rect by its name
    const name = e.target.name();
    const rect = quotesConfig.value.find((r) => r.name === name);
    if (rect) {
        selectedQuote.value = name;
    } else {
        selectedQuote.value = '';
    }
    updateTransformer();
}

const updateTransformer = () => {
    // here we need to manually attach or detach Transformer node
    const transformerNode = transformer.value.getNode();
    const stage = transformerNode.getStage();

    const selectedNode = stage.findOne('.' + selectedQuote.value);
    // do nothing if selected node is already attached
    if (selectedNode === transformerNode.node()) {
        return;
    }

    if (selectedNode) {
        // attach to another node
        transformerNode.nodes([selectedNode]);
    } else {
        // remove transformer
        transformerNode.nodes([]);
    }
}

const findQuote = (name: string) => {
    return quotesConfig.value.find(
        (q) => q.name === name
    );
}

const handleQuoteDblClicked = (e) => {
    console.log('Double clicked');
    // Find the quote config that was double-clicked
    const quote = findQuote(e.target.name());

    if (quote) {
        // Reset the rotation to 0
        quote.rotation = 0;
    }
}
</script>
<template>
    <div>
        <div class="py-2 px-3 bg-gray-50 flex flex-wrap items-center gap-4">
            <Link
                :href="route('thematic.list')"
                class="btn btn-icon--xs btn-icon--flat btn-icon py-1"
            >
                <i class="fas fa-chevron-left text-red-600"></i>
            </Link>
            <div class="h-8 flex items-center">
                <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1 h-full">
                    <button @click.prevent="canvaStore.setZoomLevel('-')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="text-xs">{{ canvaStore.zoomLevel }}%</span>
                    <button @click.prevent="canvaStore.setZoomLevel('+')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button
                        v-show="canvaStore.zoomLevel !== 100"
                        class="btn btn-xs text-xs py-1 px-1 bg-orange-300 font-normal"
                        @click="canvaStore.resetZoomLevel()"
                    >Reset</button>
                </div>
            </div>
            <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1 h-full">
                <button class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 btn-icon--xs" @click.prevent="canvaStore.setZoomLevel('-')">
                    <i class="fas fa-plus-circle"></i>
                </button>
            </div>
        </div>
        <div class="bg-white canva">
            <v-stage
                ref="stageRef"
                :config="stageConfig"
                @mousedown="handleStageMouseDown"
                @touchstart="handleStageMouseDown"
                @wheel="canvaStore.handleWheel"
                :draggable="true"
            >
                <v-layer>
                    <div>
                        <div class="px-4 py-2 shadow-lg bg-green-400 text-black font-bold rounded-full">
                            <v-group :config="groupConfig">
                                <v-rect :config="rectConfig"></v-rect>
                                <v-text :config="textConfig"></v-text>
                            </v-group>
                            <v-transformer ref="transformer"></v-transformer>
                        </div>
                        <v-text
                            v-for="(quoteConfig, index) in quotesConfig" :key="quoteConfig.id"
                            :config="quoteConfig"
                            @transformend="handleTransformEnd"
                            @dblclick="handleQuoteDblClicked"
                        ></v-text>
                        <v-transformer ref="transformer" />
                    </div>
                </v-layer>
            </v-stage>
        </div>
    </div>
</template>

<style>
.canva {
    height: calc(100vh - 48px);
    overflow: hidden;
}
</style>
