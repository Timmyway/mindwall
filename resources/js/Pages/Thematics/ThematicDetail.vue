<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import { Thematic, Engine, Language } from '../../types/thematic.types';
import { User } from '@/types';
import { onUnmounted } from 'vue';
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useAppStore } from '@/store/appStore';
import { useCanvasOperationsStore } from '@/store/canvasOperationsStore';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';
import { useCanvasConfig } from '@/store/canvasConfigStore';
import { useTextEditStore } from '@/store/textEditStore';
import MwTextarea from '@/Components/mindwall/MwTextarea.vue';
import MwLayerItem from '@/Components/mindwall/MwLayerItem.vue';
import MwToolbar from '@/Components/mindwall/MwToolbar.vue';
import TwMarkdownPreview from '@/Components/ui/TwMarkdownPreview.vue';

const props = defineProps<{
    thematic: Thematic,
    engines: Engine[],
    languages: Language[]
}>();

console.log('-------> TT', props.thematic)

const canvaStore = useCanvasStore();
const appStore = useAppStore();
appStore.setThematic(props.thematic);
const operationStore = useCanvasOperationsStore();
const canvasEventStore = useCanvasEventsStore();
const textEditStore = useTextEditStore();
const canvasConfigStore = useCanvasConfig();

const { stageRef, transformer } = storeToRefs(canvaStore);
const { isMwTextConfig, isMwImageConfig } = useCanvasConditions();

appStore.setEngines(props.engines);
appStore.setLanguages(props.languages);

const page = usePage();
const user = computed<User | null>((): User | null => page.props.user as User | null);

appStore.cook();

onMounted(() => {
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            // Handle delete key press
            if (!textEditStore.editing) {
                operationStore.deleteShape();
            }
        }
        // Check for the ctrl + shift + g combination for ungrouping
        if (event.ctrlKey && event.altKey && event.key === 'g') {
            event.preventDefault(); // Prevent the default action (if any)
            console.log('-- Event key -> Pressed ctrl + shift + g');

            // Assume you have a way to get the current group ID to ungroup
            operationStore.ungroupItems(); // Call your ungroup method with the group ID
        }
        if (event.altKey) {
            event.preventDefault();
            return;
        }
        // Check if Ctrl (or Command on Mac) is pressed and the key is 'g'
        if (event.ctrlKey && event.key === 'g') {
            event.preventDefault(); // Prevent the default action (if any)
            console.log('-- Event key -> Pressed ctrl + g')
            operationStore.groupSelectedItems(); // Call your method
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
<tw-markdown-preview></tw-markdown-preview>
<div class="bg-white tw-canva relative" v-if="appStore.isReady">    
    <mw-textarea></mw-textarea>
    <mw-toolbar></mw-toolbar>
    <v-stage
        ref="stageRef"
        :config="canvasConfigStore.stageConfig"
        @mousedown="canvasEventStore.handleStageMouseDown"
        @touchstart="canvasEventStore.handleStageMouseDown"
        @wheel="canvaStore.handleWheel"
        @keyup="handleKeyup"
        :draggable="true"
    >
        <v-layer>            
            <v-circle :config="canvasConfigStore.kernelConfig"></v-circle>
        </v-layer>        
        <template>
            <v-layer v-for="(layer, layerIndex) in canvaStore.wall.layers" :key="layer.id">
                <v-transformer ref="transformer" :config="canvasConfigStore.transformerConfig" />
                <template v-for="(layerItemConfig, layerItemIndex) in layer?.items" :key="layerItemConfig.id">
                    <mw-layer-item :config="layerItemConfig" :layer-info="{ id: layer.id ?? '', index: layerIndex }"></mw-layer-item>
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
</style>
