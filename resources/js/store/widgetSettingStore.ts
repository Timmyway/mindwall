import { Engine } from "@/types/thematic.types";
import { WidgetSettingLoading } from "@/types/widgetSetting.types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useWidgetSettingStore = defineStore('widgetSetting', () => {
    const isLoading = ref<WidgetSettingLoading>({
        aiGenerateText: false
    });

    const defaultEngine = 'descriptor';

    const usedEngine = ref<string>('descriptor');

    const changeEngine = (newEngine: string) => {
        usedEngine.value = newEngine;
    }

    return { isLoading, changeEngine, usedEngine, defaultEngine }
});
