import { TextAlign } from "./widgetSetting.types";

export interface WallConfig {
    [group: string]: GroupConfig;
}

type ConfigType = 'group' | 'text' | 'image';

export interface GroupConfig {
    id: string;
    name: string;
    is: ConfigType;
    scaleX?: number;
    scaleY?: number;
    x?: number;
    y?: number;
    visible?: boolean;
    draggable?: boolean;
    width?: number;
    height?: number;
    drawBorder?: boolean;
    items: {
        [item: string]: TextConfig | ImageConfig;
    }
}

export interface TextConfig  {
    id: string;
    name: string;
    is: ConfigType;
    text: string;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    fontSize: number;
    fontFamily: string;
    fill: string;
    x?: number;
    y?: number;
    visible?: boolean;
    draggable?: boolean;
    zIndex?: number;
    width?: number;
    height?: number;
    align?: TextAlign;
    lineHeight?: number;
}

export interface ImageConfig {
    id: string;
    name: string;
    is: ConfigType;
    width: number;
    height: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    x?: number;
    y?: number;
    visible?: boolean,
    image?: string | File | HTMLElement;
    draggable?: boolean;
    zIndex?: number
}

export interface TransformerConfig {

}
