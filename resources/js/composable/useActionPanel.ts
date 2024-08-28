import { ActionPanelView } from "@/types/panel.types";
import { Ref, ref } from "vue";

export default function useActionPanel(): {
    viewPanel: Ref<ActionPanelView>;
    showPanel: (panel: keyof ActionPanelView) => void;
    hidePanel: (panel: keyof ActionPanelView) => void;
    togglePanel: (panel: keyof ActionPanelView) => void;
    hidePanelDelayed: (panel: keyof ActionPanelView) => void;
} {
    const viewPanel = ref<ActionPanelView>({
        palette: false
    });

    const showPanel = (panel: keyof ActionPanelView) => {
        viewPanel.value[panel] = true;
    }

    const hidePanel = (panel: keyof ActionPanelView) => {        
        viewPanel.value[panel] = false;
    }

    const hidePanelDelayed = (panel: keyof ActionPanelView, delay: number = 200) => {        
        setTimeout(() => {
            hidePanel(panel);
        }, delay);
    }

    const togglePanel = (panel: keyof ActionPanelView) => {
        viewPanel.value[panel] = !viewPanel.value[panel];
    }

    return { viewPanel, showPanel, hidePanel, togglePanel, hidePanelDelayed };
}
