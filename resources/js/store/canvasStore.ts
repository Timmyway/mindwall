import { defineStore } from "pinia";
import { Ref, ref } from 'vue';
import useZoom from '../composable/useZoom';
import { debounce } from "lodash";
import { KonvaEventObject } from "konva/lib/Node";
import { CanvasStore, CanvasState } from "../types/canvas.types";
import { Stage } from "konva/lib/Stage";
import ContextMenu from "primevue/contextmenu";

export const useCanvasStore = defineStore<'app', CanvasState, {}, CanvasStore>('app', () => {
    // Todo: not working when using typescript
    const stageRef = ref<Stage | null>(null);
    const { scaleBy, minScale, maxScale, zoomLevel } = useZoom();
    const menu = ref<ContextMenu>();

    const resetZoomLevel: () => void = () => {
        console.log('==> Reset');
        // Check if the Stage ref is available
        if (stageRef.value) {
            // Reset scale, position and zoom level
            stageRef.value.getStage().scale({ x: 1, y: 1 });
            stageRef.value.getStage().position({ x: 0, y: 0 });
            zoomLevel.value = 100;

            // Redraw the Stage
            stageRef.value.getStage().batchDraw();
        }
    };

    const setZoomLevel: (mode?: '+' | '-') => void = (mode = '+') => {
        // Check if the Stage ref is available
        if (stageRef.value) {
            console.log('=====> StageRef value: ', stageRef.value)
            // Get the current zoom level
            const currentZoom = zoomLevel.value;

            // Two mode are supported: + and -
            if (mode === '+') {
                console.log('Zoom ++')
                if (zoomLevel.value < maxScale) {
                    zoomLevel.value = currentZoom - scaleBy;
                }
            } else {
                console.log('Zoom --')
                if (zoomLevel.value > minScale) {
                    zoomLevel.value = currentZoom + scaleBy;
                }
            }

            // Update the scale
            console.log('====> Current zoom', currentZoom);
            stageRef.value.getStage().scale({ x: zoomLevel.value / 100, y: zoomLevel.value / 100 });

            // Redraw the Stage
            stageRef.value.getStage().batchDraw();
        }
    };

    const handleWheel: (e: KonvaEventObject<WheelEvent>) => void = debounce((e) => {
        // Prevent the default scroll behavior
        e.evt.preventDefault();

        // Determine the zoom direction based on the wheel delta
        const direction = e.evt.deltaY > 0 ? 1 : -1;

        if (direction > 0) {
            setZoomLevel('+');
        } else {
            setZoomLevel('-');
        }
    }, 50);

    return { stageRef, zoomLevel, setZoomLevel, handleWheel, resetZoomLevel, menu,
    }
});
