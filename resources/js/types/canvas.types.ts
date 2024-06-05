import { Ref } from 'vue';
import { Stage } from 'konva/lib/Stage';
import { KonvaEventObject } from 'konva/lib/Node';

export interface CanvasState {
  stageRef: Stage | null;
  zoomLevel: number;
}

export interface CanvasStore {
  stageRef: Ref<Stage | null>;
  zoomLevel: Ref<number>;
  scaleBy: Ref<number>;
  minScale: Ref<number>;
  maxScale: Ref<number>;
  setZoomLevel: (mode?: '+' | '-') => void;
  handleWheel: (e: KonvaEventObject<WheelEvent>) => void;
  resetZoomLevel: () => void;
}

export interface TextareaStyle {
    position: 'absolute';
    top: string;
    left: string;
    width: string;
    height: string;
    fontSize: string;
    overflow: string;
    lineHeight: number;
    fontFamily: string;
    transformOrigin: string;
    textAlign: string;
    color: string;
    transform: string;
}
