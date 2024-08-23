import { defineStore } from "pinia";
import { useCanvasEventsStore } from "./canvasEventsStore";
import { ref } from "vue";
import { LayerInfo, MwNode } from "@/types/konva.config";

export const useSidebarStore = defineStore('sidebar', () => {
    const canvasEventsStore = useCanvasEventsStore();

    const areDetailsShown = ref<boolean>(false);
    const toogleDetails = () => {
        areDetailsShown.value = !areDetailsShown.value;
    }
    const viewDetails = () => {
        areDetailsShown.value = true;
    }
    const hideDetails = () => {
        areDetailsShown.value = false;
    }
    const findOnCanva = (e: any, node: MwNode, layerInfo: LayerInfo) => {
        canvasEventsStore.handleShapeMouseDown(e, node, layerInfo)
    }

    return { areDetailsShown, viewDetails, hideDetails, toogleDetails, findOnCanva }
});
