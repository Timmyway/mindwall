<script setup lang="ts">
import useActionPanel from '@/composable/useActionPanel';
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import usePaletteColor from '@/composable/usePaletteColor';
import { useAppStore } from '@/store/appStore';
import { useCanvasOperationsStore } from '@/store/canvasOperationsStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useImageGalleryStore } from '@/store/imageGalleryStore';
import { useTextEditStore } from '@/store/textEditStore';
import { useWidgetSettingStore } from '@/store/widgetSettingStore';
import { useAudioStore } from '@/store/audioStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import TwImageGallery from '../media/TwImageGallery.vue';
import TwImageBankGallery from '../media/TwImageBankGallery.vue';
import TwZoomLevel from '../menubar/TwZoomLevel.vue';
import TwLoading from '../ui/TwLoading.vue';
import TwActionText from '../menubar/TwActionText.vue';
import TwMenubarPaletteColor from '../menubar/TwMenubarPaletteColor.vue';
import Dropdown from 'primevue/dropdown';
import TwContextMenu from '../menu/TwContextMenu.vue';

const galleryStore = useImageGalleryStore();
const operationStore = useCanvasOperationsStore();
const appStore = useAppStore();
const widgetStore = useWidgetSettingStore();
const textEditStore = useTextEditStore();
const audioStore = useAudioStore();

const { isMwTextConfig } = useCanvasConditions();

const debug = ref<boolean>(true);
const canvasStore = useCanvasStore();

const handleCommandBarMouseLeave = () => {
    galleryStore.hideImageGallery();
    galleryStore.hideBankImageGallery();
}

const { paletteColor } = usePaletteColor();

const changeColor = (color: string) => {
    if (isMwTextConfig(canvasStore.selectedConfig)) {
        canvasStore.setSelectedConfig({ fill: color });
    }
    hidePanel('palette');
}

/* RELATED TO ACTION PANEL */
const { viewPanel, showPanel, hidePanel, togglePanel } = useActionPanel();

const handleChangeLanguage = () => {
    const language = appStore.languages.find(lang => widgetStore.usedLanguage === lang.name);
    if (language) {
        console.log('-- 850 -> Handle change language...', language.code);
        audioStore.setVoiceLanguage(language.code);
    }
}
</script>

<template>
<div
    class="tw-mindwall-toolbar relative px-3 flex flex-wrap items-center gap-4 h-16 border-2"
    @mouseleave.prevent="handleCommandBarMouseLeave"
>
    <div v-show="debug" class="mindwall-debug flex items-center fixed top-0 right-0 max-w-2xl h-12 w-full bg-red-600 z-50">
        <div class="bg-black fixed w-[300px] h-[80vh] top-0 right-0 bottom-0 text-lg leading-8 overflow-auto">
            <textarea :value="JSON.stringify(canvasStore.wall, null, 4)" class="text-black w-full h-full"></textarea>
        </div>
        <div class="bg-black text-white text-xs p-1 w-full h-12 overflow-auto scroll-smooth">
            <div class="py-2 flex flex-col gap-2">
                <span>Name: {{ canvasStore.selectedConfig?.name }} | x: {{ canvasStore.selectedConfig?.x }} | y: {{ canvasStore.selectedConfig?.y }}</span>
                <span>StageX{{ canvasStore.stageRef?.getStage()?.x() }} | StageY: {{ canvasStore.stageRef?.getStage()?.y() }}</span>
            </div>
            <div v-for="confValue,confName in canvasStore.selectedConfig" class="p-1 border border-gray-200 py-1">
                <div class="h-12">
                    {{ confName }} => {{ confValue }}
                </div>
            </div>
        </div>
        <div class="bg-indigo-600 text-white text-xs h-12 overflow-auto w-full">
            <div v-for="g in canvasStore.wall">
                <div v-for="sValue,sName in g" class="p-1 border border-gray-200 py-1">
                    {{ sName }} => {{ sValue }}
                </div>
            </div>
        </div>
        <button class="w-6 h-6" @click="debug = false"><i class="fas fa-times"></i></button>
    </div>
    <Link
        :href="route('thematic.list')"
        class="btn btn-icon--xs btn-icon--flat btn-icon py-1"
    >
        <i class="fas fa-chevron-left text-red-600"></i>
    </Link>
    <div class="h-8 flex items-center gap-2">
        <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 h-full">
            <button @mouseover.prevent="galleryStore.viewImageGallery">
                <i class="fas fa-images text-2xl"></i>
            </button>
            <div
                v-show="galleryStore.isGalleryVisible"
                class="absolute top-full left-0 bg-white z-20 p-2"
                @mouseleave.prevent="galleryStore.hideImageGallery"
            >
                <tw-image-gallery
                    :upload="true"
                    :scrollable="true"
                    :user="null"
                    class="max-w-xs"
                    :max-height="480"
                    @select="operationStore.addImageToWall"
                ></tw-image-gallery>
            </div>
        </div>
        <div class="flex items-center gap-3 text-xs bg-yellow-400 border border-gray-300 rounded px-2 h-full">
            <button @mouseover.prevent="galleryStore.viewBankImageGallery">
                <i class="fas fa-images text-2xl text-black"></i>
            </button>
            <div
                v-show="galleryStore.isBankGalleryVisible"
                class="absolute top-full left-0 transform z-20 w-full h-[80vh]"
                @mouseleave.prevent="galleryStore.hideBankImageGallery"
            >
                <tw-image-bank-gallery
                    @select="operationStore.addImageToWall"
                    @close="galleryStore.hideBankImageGallery"
                ></tw-image-bank-gallery>
            </div>
        </div>
        <div class="flex items-center gap-3 text-xs bg-white text-black border border-gray-300 rounded px-2 py-1 h-full transition-all">
            <tw-zoom-level></tw-zoom-level>
        </div>
    </div>
    <div class="flex items-center gap-3 text-xs rounded px-2 py-1 h-full">
        <button
            v-show="!appStore.isSaving"
            class="btn btn-icon btn-xs btn-icon--flat bg-green-400 w-8 h-8 p-2"
            @click.prevent="appStore.saveWallToServer()"
        >
            <i class="fas fa-save text-xl text-black"></i>
        </button>
        <button
            class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2"
            @click.prevent="operationStore.addTextToWall()"
        >
            <i class="fas fa-plus-circle text-xl text-black"></i>
        </button>
        <button
            class="btn btn-icon btn-xs btn-icon--flat bg-red-400 w-8 h-8 p-2"
            @click.prevent="canvasStore.resetWall()"
        >
            <i class="fas fa-times text-xl text-black"></i>
        </button>
        <div class="flex items-center gap-2">
            <tw-loading :is-visible="widgetStore.isLoading.aiGenerateText"></tw-loading>
            <Dropdown
                v-model="widgetStore.usedEngine"
                :options="appStore.engines"
                option-label="name"
                placeholder="Engine"
                class="w-full max-w-xs"
            >
                <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center gap-2">
                        <i :class="['fa', slotProps.value.icon_class]"></i>
                        <div>{{ slotProps.value.name }}</div>
                    </div>
                    <span v-else>
                        {{ slotProps.value.name }}
                    </span>
                </template>
                <template #option="slotProps">
                    <div class="flex items-center gap-4">
                        <i :class="['fa', slotProps.option.icon_class]"></i>
                        <div>{{ slotProps.option.name }}</div>
                    </div>
                </template>
            </Dropdown>
            <Dropdown
                v-model="widgetStore.usedLanguage"
                :options="appStore.languages"
                option-label="flag"
                option-value="name"
                placeholder="Language"
                class="w-full max-[120px]"
                @change="handleChangeLanguage"
            ></Dropdown>
            <div class="flex items-center gap-4 w-[150px]">
                <button
                    v-show="!widgetStore.isLoading.aiGenerateText"
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
                    @click.prevent="operationStore.addAiTextToWall()"
                >
                    <i class="fas fa-robot text-blue-600 text-xl"></i>
                </button>
                <button
                    v-show="!widgetStore.isLoading.aiGenerateText"
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
                    @click.prevent="operationStore.addAiTextToWall('hot')"
                >
                    <i class="fas fa-robot text-orange-600 text-xl"></i>
                </button>
                <button
                    v-show="isMwTextConfig(canvasStore.selectedConfig) && !audioStore.isReading"
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
                    @click.prevent="audioStore.readText()"
                >
                    <i class="fas fa-volume-up text-black"></i>
                </button>
            </div>
        </div>
        <!--
        <button
            class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2"
            @click.prevent="addImageToWall()"
        >
            <i class="fas fa-image text-black"></i>
        </button>
        -->

        <div v-show="isMwTextConfig(canvasStore.selectedConfig)" class="flex items-center gap-2">
            <!-- SETTING: color palette -->
            <div class="flex items-center">
                <button class="btn btn-icon btn-xs btn-icon--flat btn-icon--xs"
                    @mouseover="showPanel('palette')"
                >
                    <i class="fas fa-font"></i>
                </button>
                <tw-menubar-palette-color
                    :palette-color="paletteColor"
                    :is-visible="viewPanel.palette"
                    :handle-change-color="changeColor"
                    :handle-hide-panel="hidePanel"
                ></tw-menubar-palette-color>
            </div>
            <!-- SETTING: text size -->
            <div v-show="isMwTextConfig(canvasStore.selectedConfig)" class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1">
                <tw-action-text></tw-action-text>
            </div>
        </div>
    </div>
    <tw-context-menu
        :handle-add-image="galleryStore.pickImage"
        :handle-remove-shape="operationStore.deleteShape"
        :handle-add-text="(e) => operationStore.addTextToWall()"
        :handle-clone="operationStore.handleCloneGroup"
        :handle-bring-to-top="operationStore.bringToTop"
        :handle-bring-to-back="operationStore.bringToBack"
        :handle-text-ai-generate="(e) => operationStore.addAiTextToWall()"
        :handle-center-on-element="(e) => canvasStore.centerOnElement()"
    ></tw-context-menu>
    <div class="mindwall-debug flex items-center gap-2 max-w-[100px] overflow-x-auto">
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Editing: {{ textEditStore.editing }}</div>
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Ready: {{ appStore.isReady }}</div>
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Draggable: ({{ canvasStore.selectedConfig?.draggable }})</div>
    </div>
    <i :class="['fas', canvasStore.selectedConfig?.draggable ? 'fa-unlock text-green-600' : 'fa-lock text-red-600']"></i>
    <h2 class="text-3xl capitalize font-black ml-auto mr-5">{{ widgetStore.usedEngine?.name }}</h2>
</div>
</template>
