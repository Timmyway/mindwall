import { LayerConfig } from "konva/lib/Layer";
import { GroupConfig } from "konva/lib/Group";
import { TextConfig } from "konva/lib/shapes/Text";
import { ImageConfig } from "konva/lib/shapes/Image";

export interface WallConfig {
    layers: MwLayerConfig[];
}

export interface MwLayerConfig extends LayerConfig {
    is: 'layer',
    items?: MwNode[];
}

export type MwNode = MwGroupConfig | MwShapeConfig;

export interface MwGroupConfig extends GroupConfig {
    is: 'group';
    items: MwNode[];
    parent: string | null;
}

export type MwShapeConfig = MwTextConfig | MwImageConfig;

export interface MwTextConfig extends TextConfig {
    is: 'text';
    parent: string;
}

export interface MwImageConfig extends ImageConfig {
    is: 'image';
    parent: string;
}

export interface TransformerConfig {
    is: 'transformer';
}

export interface LayerInfo {
    id: string;
    index: number;
}
