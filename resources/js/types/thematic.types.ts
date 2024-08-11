import { WallConfig } from "./konva.config";

interface User {
    id: number;
    name: string;
    email: string;
}

export interface Thematic {
    id: number;
    name: string;
    user: User;
    wall: WallConfig;
}

export interface QuotePositionObject {
    x: number,
    y: number
}

export interface Engine {
    id: number;
    name: string;
    slug: string;
    blade_view: string;
    icon_class?: string;
    thumbnail_url?: string;
}

export interface Language {
    id: number;
    name: string;
    flag?: string;
}
