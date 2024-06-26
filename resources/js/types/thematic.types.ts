import { WallConfig } from "./konva.config";

interface User {
    id: number;
    name: string;
    email: string;
}

export interface Thematic {
    id: string;
    name: string;
    user: User;
    wall: WallConfig;
}

export interface QuotePositionObject {
    x: number,
    y: number
}