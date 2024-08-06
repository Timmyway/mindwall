import { WidgetSettingLoading } from "@/types/widgetSetting.types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useWidgetSettingStore = defineStore('widgetSetting', () => {
    const isLoading = ref<WidgetSettingLoading>({
        aiGenerateText: false
    });

    return { isLoading }
});
