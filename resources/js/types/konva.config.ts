import { TextAlign } from "./widgetSetting.types";

export interface WallConfig {
    layers?: {
        [item: string]: MwLayerConfig;
    }
}

export interface MwLayerConfig {
    id: string,
    name: string,
    is: MwConfigType,
    items?: {
        [item: string]: MwGroupConfig | MwShapeConfig;
    }
}

type MwConfigType = 'layer' | 'group' | MwShapeType;
type MwShapeType = 'text' | 'image';

export interface MwGroupConfig {
    id: string;
    name: string;
    is: MwConfigType;
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
        [item: string]: MwGroupConfig | MwShapeConfig;
    }
}

export type MwShapeConfig = MwTextConfig | MwImageConfig

export interface MwTextConfig {
    id: string;
    name: string;
    is: MwConfigType;
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

export interface MwImageConfig {
    id: string;
    name: string;
    is: MwConfigType;
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
