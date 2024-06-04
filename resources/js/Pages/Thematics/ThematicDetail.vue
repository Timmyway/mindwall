<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { safeJsonParse, uuid } from '../../helpers/utils';
import { randInt, randPos } from '../../helpers/canva';
import { router } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import { QuoteConfig } from '../../types/konva.config';
import { Ref } from 'vue';
import { Thematic } from '../../types/thematic.types';
import { Transformer } from 'konva/lib/shapes/Transformer';

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
const stageWidth = ref<number>(window.innerWidth);
const stageHeight = ref<number>(window.innerHeight - 32);

const center: { x: number, y: number } = {
    x: stageWidth.value / 2,
    y: stageHeight.value / 2,
};

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
        visible: true
    }
}));

const addQuote = (text: string = 'New quote...') => {
    const quoteId = uuid();
    const newQuote = {
        id: quoteId,
        rotation: 0,
        x: center.x - 10,
        y: center.y -50,
        scaleX: 1,
        scaleY: 1,
        fontFamily: 'Calibri',
        fontSize: 16,
        name: quoteId,
        text: text,
        fill: 'black',
        visible: true
    };

    quotesConfig.value.push(newQuote);
}

const removeQuote = (quoteName: string) => {
    const foundIndex = quotesConfig.value.findIndex((quote) => quote.name === quoteName);

    if (foundIndex !== -1) {
        quotesConfig.value.splice(foundIndex, 1);
    } else {
        console.log(`Quote with name ${quoteName} not found.`);
    }
}

// const editQuote = (quoteName: string, updatedProps: Partial<QuoteConfig>) => {
//     const foundQuote = quotesConfig.value.find((quote) => quote.name === quoteName);

//     if (foundQuote) {
//         // Update the properties of the found quote
//         if (updatedProps.fontSize !== undefined) {
//             foundQuote.fontSize = updatedProps.fontSize;
//         }
//         if (updatedProps.text !== undefined) {
//             foundQuote.text = updatedProps.text;
//         }
//         if (updatedProps.fontFamily !== undefined) {
//             foundQuote.fontFamily = updatedProps.fontFamily;
//         }
//     } else {
//         console.log(`Quote with name ${quoteName} not found.`);
//     }
// }

const transformer = ref();

const stageConfig: {
  width: number;
  height: number;
} = {
    width: stageWidth.value,
    height: stageHeight.value,
};

const groupConfig = {

}

const thematicRectConfig = {
    x: center.x,
    y: center.y,
    width: 200, // Add some padding
    height: 40, // Add some padding
    fill: '#000',
    stroke: 'white',
    strokeWidth: 4,
    shadowBlur: 10,
};

const thematicTextConfig = ref({
    x: center.x,
    y: center.y,
    text: props.thematic.name,
    ellipsis: true,
    align: 'center',
    verticalAlign: 'middle',
    fontSize: 20,
    fontFamily: 'Calibri',
    fill: '#fff',
});

const selectedQuoteName = ref();
const selectedQuoteConfig = computed(() => {
    return quotesConfig.value.find(q => q.name === selectedQuoteName.value);
});

const handleTransformEnd = (e: any) => {
    // shape is transformed, let us save new attrs back to the node

    if (selectedQuoteConfig.value) {
        // update the state
        selectedQuoteConfig.value.x = e.target.x();
        selectedQuoteConfig.value.y = e.target.y();
        selectedQuoteConfig.value.rotation = e.target.rotation();
        selectedQuoteConfig.value.scaleX = e.target.scaleX();
        selectedQuoteConfig.value.scaleY = e.target.scaleY();

    }
}

const handleStageMouseDown = (e: any) => {
    console.log('==> Stage mouse down event...');
    // clicked on stage - clear selection
    if (e.target === e.target.getStage()) {
        if (editing.value) {
            exitEditMode();
        }
        selectedQuoteName.value = '';
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
    const rect = findQuote(name);
    if (rect) {
        selectedQuoteName.value = name;
    } else {
        selectedQuoteName.value = '';
    }
    updateTransformer();
}

const updateTransformer = () => {
    // here we need to manually attach or detach Transformer node
    const transformerNode = transformer.value?.getNode();
    const stage = stageRef.value.getStage();
    // console.log('1. ====>', transformer.value)
    // console.log('2. ====>', transformerNode)

    const selectedNode = stage.findOne('.' + selectedQuoteName.value);
    // do nothing if selected node is already attached
    if (transformerNode) {
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

const handleQuoteEditText = (name: string, text: string) => {
    console.log('Edit quote: ', name);
    // Find the quote config that was double-clicked
    const quote = findQuote(name);
    if (quote) {
        quote.text = text;
    }
}

const handleQuoteRemoval = (name: string) => {
    console.log('Handle quote removal');
    removeQuote(name);
}

const editing = ref(false);
const editedQuoteText = ref<string>('');
const quoteAreaRef = ref();

const enterEditMode = (e) => {
    selectedQuoteName.value = e.target.name();
    const textNode = e.target;
    if (selectedQuoteConfig.value) {
        selectedQuoteConfig.value.visible = false;
    }
    // hide text node and transformer:

    transformer.value.getNode().hide();

    // so position of textarea will be the sum of positions above:
    const textPosition = textNode.absolutePosition();
    const areaPosition = {
        x: stageRef.value.getStage().container().offsetLeft + textPosition.x,
        y: stageRef.value.getStage().container().offsetTop + textPosition.y,
    };

    textareaStyle.value.top = areaPosition.x;
    textareaStyle.value.left = areaPosition.y;

    console.log('Edit mode activate...', textNode);
    textareaStyle.value.width = textNode.width() - textNode.padding() * 2 + 'px';
    textareaStyle.value.height =
          textNode.height() - textNode.padding() * 2 + 5 + 'px';
    textareaStyle.value.fontSize = textNode.fontSize() + 'px';
    textareaStyle.value.lineHeight = textNode.lineHeight();
    textareaStyle.value.fontFamily = textNode.fontFamily();
    textareaStyle.value.transformOrigin = 'left top';
    textareaStyle.value.textAlign = textNode.align();
    textareaStyle.value.color = textNode.fill();
    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
        transform += 'rotateZ(' + rotation + 'deg)';
    }

    // let px = 0;
    // // also we need to slightly move textarea on firefox
    // // because it jumps a bit
    // const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    // if (isFirefox) {
    //     px += 2 + Math.round(textNode.fontSize() / 20);
    // }
    // transform += 'translateY(-' + px + 'px)';

    // textareaStyle.value.transform = transform;

    // // reset height
    // textareaStyle.value.height = 'auto';
    // // after browsers resized it we can set actual value
    // textareaStyle.value.height = quoteAreaRef.value.style.scrollHeight + 3 + 'px';

    quoteAreaRef.value.focus();

    console.log('--> TEXTAREA STYLE: ', textareaStyle.value)
    editing.value = true;
}

const exitEditMode = () => {
    if (editedQuoteText.value.trim() === '') {
        // Restore text node and transformer
        console.log('==========> Restore outside !!!!', selectedQuoteConfig.value)
        if (selectedQuoteConfig.value) {
            selectedQuoteConfig.value.visible = true;
            console.log('==========> Restore inside !!!!')
            transformer.value.getNode().show();
        }
        editing.value = false; // Exit edit mode
        return;
    }
    if (selectedQuoteConfig.value) {
        selectedQuoteConfig.value.text = editedQuoteText.value.trim();
        // Restore text node and transformer
        selectedQuoteConfig.value.visible = true;
        transformer.value.getNode().show();
        editedQuoteText.value = '';
        editing.value = false; // Exit edit mode
    }
}

const editQuote = () => {
    exitEditMode();
    console.log('Finished editing...');
};

const textareaStyle = ref({
    position: 'absolute',
    top: '',
    left: '',
    width: '',
    height: '',
    fontSize: '',
    overflow: '',
    lineHeight: '',
    fontFamily: '',
    transformOrigin: '',
    textAlign: '',
    color: '',
    transform: ''
});
</script>
<template>
    <div>
        <div class="py-2 px-3 bg-gray-50 flex flex-wrap items-center gap-4">
            <div class="fixed top-0 right-0 max-w-xs h-10 p-1 overflow-auto bg-black text-white text-xs">
                {{ selectedQuoteConfig }}
            </div>
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
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 btn-icon--xs"
                    @click.prevent="addQuote()"
                >
                    <i class="fas fa-plus-circle"></i>
                </button>
            </div>
            <textarea
                ref="quoteAreaRef"
                class="quote-textarea"
                type="text"
                v-model="editedQuoteText"
                @blur="editQuote"
                @keyup.enter="editQuote"
                :style="textareaStyle"
            ></textarea>
            {{ textareaStyle }}
            Editing: {{ editing }}
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
                                <v-rect :config="thematicRectConfig"></v-rect>
                                <v-text :config="thematicTextConfig"></v-text>
                            </v-group>
                        </div>
                        <div v-for="(quoteConfig, index) in quotesConfig" :key="quoteConfig.id">
                            <v-group :config="{ draggable: true}" @transformend="handleTransformEnd">
                                <v-text
                                    :config="quoteConfig"
                                    @dblclick="enterEditMode"
                                ></v-text>
                                <v-circle
                                    :config="{
                                        fill: 'red', text: 'Del',
                                        x: quoteConfig.x,
                                        y: quoteConfig.y - 10,
                                        width: 10, height: 10
                                    }"
                                    @click="handleQuoteRemoval(quoteConfig.name)"
                                ></v-circle>
                            </v-group>
                        </div>
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
.quote-textarea {
    border: 2px solid yellow;
    padding: 0px;
    margin: 0px;
    overflow: hidden;
    background: none;
    outline: none;
    resize: none;
}
</style>
