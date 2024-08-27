<script setup lang="ts">
import { useTextPreviewStore } from '@/store/textPreviewStore';

// interface Props {
    
// }
// const props = withDefaults(defineProps<Props>(), {
    
// });

const textPreviewStore = useTextPreviewStore();

</script>

<template>
<transition name="slide-up-down">
    <div
        v-if="textPreviewStore.isPreviewMode"
        class="markdown-preview-overlay"
        @click.prevent="textPreviewStore.closePreview"
    >    
        <div class="markdown-preview-overlay__content relative text-lg" @click.stop>
            <button
                class="group absolute top-1 right-1 btn btn-icon btn-xs btn-icon--flat bg-gray-200 w-8 h-8 p-2 transition-all duration-400 hover:bg-red-600"
                @click.prevent="textPreviewStore.closePreview"
            >
                <i class="fas fa-times text-red-600 group-hover:text-white"></i>
            </button>
            <div v-html="textPreviewStore.htmlRendered"></div>
        </div>
    </div>
</transition>
</template>
<style>
.markdown-preview-overlay {    
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%; height: 100dvh;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 999;
}
.markdown-preview-overlay__content {    
    background-color: white;
    padding: 15px 15px;
    max-width: 960px;
    height: 100%;
    max-height: 95vh;
    margin: auto;
    font-family: 'Nunito';
    line-height: 2;
    border-radius: 4px;
}
</style>