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
  setZoomLevel: (mode?: '+' | '-') => void;
  handleWheel: (e: KonvaEventObject<WheelEvent>) => void;
  resetZoomLevel: () => void;
}
