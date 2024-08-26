import useMarkdownParser from "@/composable/useMarkdownParser";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTextPreviewStore = defineStore('textPreview', () => {
    const { htmlRendered, mdToHtml } = useMarkdownParser();
    const isPreviewMode = ref<boolean>(false)

    const preview = (mdString: string) => {
        isPreviewMode.value = true;
        mdToHtml(mdString);
        console.log('============> PReview : ', htmlRendered);
    }

    return { htmlRendered, preview, isPreviewMode }
});
