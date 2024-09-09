import { useAppStore } from "@/store/appStore";
import { ref } from "vue";

export default function useAutoSave() {
    let saveInterval = ref();
    const appStore = useAppStore();

    const saveWallData = async () => {
        appStore.isSaving = true;
        try {
            await appStore.saveWallToServer();
            console.log('Wall data saved successfully');
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            appStore.isSaving = false;
        }
    }

    const runAutoSave = (min = 5) => {
        console.log('-- 9000 -> Run auto Save');
        saveInterval.value = setInterval(saveWallData, 60000 * min);
    }

    const clearAutoSave = () => {
        console.log('-- 9999 -> Clear auto Save');
        clearInterval(saveInterval.value);
    }

    return { runAutoSave, clearAutoSave }
}
