import { defineStore } from "pinia";
import { useCanvasEventsStore } from "./canvasEventsStore";
import { ref } from "vue";
import { LayerInfo, MwNode } from "@/types/konva.config";

export const useSidebarStore = defineStore('sidebar', () => {
    const canvasEventsStore = useCanvasEventsStore();

    const areDetailsShown = ref<{ [key: string]: boolean }>({});

    const toggleDetails = (uid: string) => {
        if (!uid)  return;
        areDetailsShown.value[uid] = !areDetailsShown.value[uid];
    };

    const viewDetails = (uid: string) => {
        areDetailsShown.value[uid] = true;
    };

    const hideDetails = (uid: string) => {
        areDetailsShown.value[uid] = false;
    };

    const findOnCanva = (e: any, node: MwNode, layerInfo: LayerInfo) => {
        canvasEventsStore.handleShapeMouseDown(e, node, layerInfo)
    }

    return { areDetailsShown, viewDetails, hideDetails, toggleDetails, findOnCanva }
});
