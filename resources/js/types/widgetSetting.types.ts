export interface WidgetSettingLoading {
    aiGenerateText: boolean;
}

export interface WidgetTextAlign {
    icon: string;
    value: TextAlign;
}

export type TextAlign = 'left' | 'right' | 'center' | 'justify';
