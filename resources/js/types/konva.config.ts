export interface WallConfig {
    [group: string]: GroupConfig;
}

export interface GroupConfig {
    id: string;
    name: string;
    is: string;
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
    is: string;
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
}

export interface ImageConfig {
    id: string;
    name: string;
    is: string;
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
}
