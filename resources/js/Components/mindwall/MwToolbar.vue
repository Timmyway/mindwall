<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useAppStore } from '@/store/appStore';
import { useCanvasOperationsStore } from '@/store/canvasOperationsStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useImageGalleryStore } from '@/store/imageGalleryStore';
import { useWidgetSettingStore } from '@/store/widgetSettingStore';
import { useAudioStore } from '@/store/audioStore';
import TwImageGallery from '../media/TwImageGallery.vue';
import TwImageBankGallery from '../media/TwImageBankGallery.vue';
import TwZoomLevel from '../menubar/TwZoomLevel.vue';
import TwLoading from '../ui/TwLoading.vue';
import TwActionText from '../menubar/TwActionText.vue';
import Dropdown from 'primevue/dropdown';
import TwContextMenu from '../menu/TwContextMenu.vue';
import TwSidebar from '../sidebar/TwSidebar.vue';
import TwActionWall from '../menubar/TwActionWall.vue';
import TwActionAi from '../menubar/TwActionAi.vue';
import TwActionDebug from '../menubar/TwActionDebug.vue';
import TwActionShape from '../menubar/TwActionShape.vue';

const galleryStore = useImageGalleryStore();
const operationStore = useCanvasOperationsStore();
const appStore = useAppStore();
const widgetStore = useWidgetSettingStore();
const audioStore = useAudioStore();

const { isMwTextConfig, isMwRectConfig, isMwCircleConfig } = useCanvasConditions();

const canvasStore = useCanvasStore();

const handleCommandBarMouseLeave = () => {
    galleryStore.hideImageGallery();
    galleryStore.hideBankImageGallery();
}

const handleChangeLanguage = () => {
    const language = appStore.languages.find(lang => widgetStore.usedLanguage === lang.name);
    if (language) {
        console.log('-- 850 -> Handle change language...', language.code);
        audioStore.setVoiceLanguage(language.code);
    }
}

const { isMwGroupConfig } = useCanvasConditions();

const ungroup = () => {
    if (isMwGroupConfig(canvasStore.selectedConfig)) {
        operationStore.ungroupSelectedItems(canvasStore.selectedConfig.id ?? '');
    }
}
</script>

<template>
<div
    class="tw-mindwall-toolbar relative px-3 gap-4 border-2"
    @mouseleave.prevent="handleCommandBarMouseLeave"
>
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
    <div class="flex items-center overflow-x-auto scrollbar-thin">
        <div class="flex items-center gap-3 text-xs rounded px-2 py-1 h-full">
            <tw-action-wall></tw-action-wall>
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
                    class="w-fit max-[70px]"
                    @change="handleChangeLanguage"
                ></Dropdown>

                <tw-action-ai></tw-action-ai>
            </div>
            <!--
            <button
                class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2"
                @click.prevent="addImageToWall()"
            >
                <i class="fas fa-image text-black"></i>
            </button>
            -->
            <!-- SETTING: text size -->
            <div v-show="isMwTextConfig(canvasStore.selectedConfig)" class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1">
                <tw-action-text></tw-action-text>
            </div>
            <div v-show="isMwRectConfig(canvasStore.selectedConfig) || isMwCircleConfig(canvasStore.selectedConfig)" class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1">
                <tw-action-shape></tw-action-shape>
            </div>
        </div>
        <tw-sidebar></tw-sidebar>
        <tw-action-debug class="mx-2"></tw-action-debug>
    </div>
    <tw-context-menu
        :handle-add-image="galleryStore.pickImage"
        :handle-remove-shape="operationStore.deleteShape"
        :handle-add-text="(e) => operationStore.addTextToWall()"
        :handle-clone="(e) => operationStore.handleClone()"
        :handle-bring-to-top="(e) => operationStore.bringToTop(canvasStore.selectedConfig)"
        :handle-bring-to-back="(e) => operationStore.bringToBack(canvasStore.selectedConfig)"
        :handle-text-ai-generate="(e) => operationStore.addAiTextToWall()"
        :handle-center-on-element="(e) => canvasStore.centerOnElement()"
        :handle-group="(e) => operationStore.groupSelectedItems()"
        :handle-ungroup="(e) => ungroup()"
    ></tw-context-menu>

</div>
</template>

<style>
.tw-mindwall-toolbar {
    background:
        linear-gradient(#062FD9 0%, #FD000D 90%),
        linear-gradient(to right, #A7F200 0%, #560CBE 60%),
        url('@/../images/pages/thematics/wall.WebP') 30px,
        url('@/../images/pages/thematics/wall.WebP') 20px;
        background-blend-mode: multiply, difference, lighten;
    color: white;
    height: 64px;
    display: flex; align-items: center;
    /* overflow-x: auto; */
    scrollbar-width: thin;
}
</style>
