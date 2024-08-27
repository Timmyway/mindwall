import useMarkdownParser from "@/composable/useMarkdownParser";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTextPreviewStore = defineStore('textPreview', () => {
    const { htmlRendered, mdToHtml, resetHtml } = useMarkdownParser();
    const isPreviewMode = ref<boolean>(false)

    const preview = (mdString: string) => {        
        isPreviewMode.value = true;
        mdToHtml(mdString);        
    }

    const closePreview = () => {
        isPreviewMode.value = false;
        resetHtml();
    }

    return { htmlRendered, preview, isPreviewMode, closePreview }
});
