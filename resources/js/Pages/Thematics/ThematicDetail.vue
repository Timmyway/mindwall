<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import { Thematic, Engine, Language } from '../../types/thematic.types';
import { User } from '@/types';
import { onUnmounted } from 'vue';
import useMarkdownParser from '@/composable/useMarkdownParser';
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useAppStore } from '@/store/appStore';
import { useCanvasOperationsStore } from '@/store/canvasOperationsStore';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';
import { useCanvasConfig } from '@/store/canvasConfigStore';
import { useTextEditStore } from '@/store/textEditStore';
import MwTextarea from '@/Components/mindwall/MwTextarea.vue';
import MwLayerItem from '@/Components/mindwall/MwLayerItem.vue';
import MwToolbar from '@/Components/mindwall/MwToolbar.vue';

const props = defineProps<{
    thematic: Thematic,
    engines: Engine[],
    languages: Language[]
}>();

const canvaStore = useCanvasStore();
const appStore = useAppStore();
const operationStore = useCanvasOperationsStore();
const canvasEventStore = useCanvasEventsStore();
const canvasConfigStore = useCanvasConfig();
const textEditStore = useTextEditStore();

const { stageRef, transformer, wall } = storeToRefs(canvaStore);
const { isMwTextConfig, isMwImageConfig } = useCanvasConditions();
const { stageConfig, groupConfig, textConfig, transformerConfig } = storeToRefs(canvasConfigStore);

appStore.setEngines(props.engines);
appStore.setThematic(props.thematic);
appStore.setLanguages(props.languages);

const page = usePage();
const user = computed<User | null>((): User | null => page.props.user as User | null);

appStore.cook();

const { parseTextFromMarkDown } = useMarkdownParser();

onMounted(() => {
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            // Handle delete key press
            if (!textEditStore.editing) {
                operationStore.deleteShape();
            }
        }
        if (event.altKey) {
            event.preventDefault();
            return;
        }
    };

    const preventZoom = (event: WheelEvent) => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('wheel', preventZoom, { passive: false });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('wheel', preventZoom);
        console.log('-- 999 -> Unmount now... Clean up & destory the wall');
        canvaStore.resetWall();
        stageRef.value?.getStage().destroy();
    });
});
const handleKeyup = () => {

}

const debug = ref<boolean>(true);
const transformV = ref([]);
</script>
<template>



<div class="bg-white tw-canva relative" v-if="appStore.isReady">
    {{ textConfig }}
    {{ groupConfig }}
    Transformer: {{ JSON.stringify(transformer) }}
    <mw-textarea></mw-textarea>
    <mw-toolbar></mw-toolbar>
    <v-stage
        ref="stageRef"
        :config="stageConfig"
        @mousedown="canvasEventStore.handleStageMouseDown"
        @touchstart="canvasEventStore.handleStageMouseDown"
        @wheel="canvaStore.handleWheel"
        @keyup="handleKeyup"
        :draggable="true"
    >
        <template>
            <v-layer v-for="(layer, layerIndex) in wall.layers" :key="layer.id">
                <v-transformer ref="transformer":config="transformerConfig" />
                <v-text :config="{ fill: '#ff0000', fontSize: 27, x: 0, y: 0, width: 320, height: 240, text: `=============> ${JSON.stringify(layerIndex)}` }"></v-text>
                <template>
                    <div class="px-4 py-2 shadow-lg bg-green-400 text-black font-bold rounded-full">
                        <v-group :config="groupConfig">
                            <v-text :config="textConfig"></v-text>
                        </v-group>
                    </div>
                    <div v-for="(layerItemConfig, layerItemIndex) in layer?.items" :key="layerItemConfig.id">
                        <mw-layer-item :config="layerItemConfig" :layer-index="layerIndex"></mw-layer-item>
                    </div>
                </template>
            </v-layer>
        </template>
    </v-stage>
</div>
</template>

<style>
.tw-canva {
    width: 100%;
    height: calc(100vh - 48px);
    overflow: hidden;
}

.tw-mindwall-toolbar {
    background:
        linear-gradient(#062FD9 0%, #FD000D 90%),
        linear-gradient(to right, #A7F200 0%, #560CBE 60%),
        url('images/pages/thematics/wall.WebP') 30px,
        url('images/pages/thematics/wall.WebP') 20px;
        background-blend-mode: multiply, difference, lighten;
    color: white;
}
</style>
