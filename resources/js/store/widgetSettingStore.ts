import { Engine } from "@/types/thematic.types";
import { WidgetSettingLoading } from "@/types/widgetSetting.types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useWidgetSettingStore = defineStore('widgetSetting', () => {
    const isLoading = ref<WidgetSettingLoading>({
        aiGenerateText: false
    });

    const defaultEngine = {
        id: 8,
        name: "The all-rounder",
        slug: "descriptor",
        blade_view: "descriptor",
        icon_class: "fa-pen-alt"
    };

    const usedEngine = ref<Engine>(defaultEngine);
    const usedLanguage = ref<string>('English');

    const changeEngine = (newEngine: Engine) => {
        usedEngine.value = newEngine;
    }

    const changeLanguage = (newLanguage: string) => {
        usedLanguage.value = newLanguage;
    }

    return { isLoading, changeEngine, changeLanguage, usedEngine, defaultEngine, usedLanguage }
});
