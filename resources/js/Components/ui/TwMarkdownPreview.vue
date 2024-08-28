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
<style lang="scss">
.markdown-preview-overlay {    
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%; height: 100dvh;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 999;
}
.markdown-preview-overlay__content {    
    background-color: white;
    padding: 15px 40px;
    max-width: 960px;
    height: 100%;
    max-height: 95vh;
    overflow: auto;
    margin: auto;
    font-family: 'Nunito';
    line-height: 1.7;
    border-radius: 4px;
    h1 {
        font-weight: bold;        
        font-size: 2.4rem;
    }    
    h2 { font-weight: bold; font-size: 2rem; }
    h3, h4, h5, h6 {
        font-weight: bold;
        font-size: 1rem;
    }
    p {
        padding: 10px 0;        
    }
    strong {
        font-weight: bold;
    }
    ul {
        display: flex; flex-direction: column;
        li {
            padding: 10px 0;
            list-style-type: disc;
        }
    }
    blockquote {
        background: #f9f9f9;
        border-left: 10px solid #F6AE2D;
        margin: 10px 0;
        padding: 0.5em 10px;
        quotes: "\201C""\201D""\2018""\2019";
        p {
            display: inline;
        }
    }
    blockquote:before {
        color: #ccc;
        content: open-quote;
        font-size: 1rem;
        line-height: 2;
        font-style: italic;
    }
    hr {
        border: none;
        height: 5px;
        background: linear-gradient(to right, #ff7e5f, #F6AE2D);
        max-width: 70%;
        border-radius: 0 15px 0 15px;
        margin: 20px 0;
    }
}
</style>