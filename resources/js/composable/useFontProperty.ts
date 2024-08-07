import { WidgetTextAlign } from "@/types/widgetSetting.types";
import { ref, Ref } from "vue";

export default function useFontProperty(): {
    availableTextAlign: Ref<WidgetTextAlign[]>
} {
    const availableTextAlign = ref<WidgetTextAlign[]>([
        { icon: 'fa fa-align-left', value: 'left' },
        { icon: 'fa fa-align-center', value: 'center' },
        { icon: 'fa fa-align-right', value: 'right' },
        { icon: 'fa fa-align-justify', value: 'justify' }
    ]);

    return { availableTextAlign }
}
