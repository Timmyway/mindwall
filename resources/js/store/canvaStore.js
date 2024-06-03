import { defineStore } from "pinia";
import { Stage } from 'vue-konva';
import { ref } from 'vue';
import useZoom from '../composable/useZoom';
import { debounce } from "lodash";

export const useCanvaStore = defineStore('app', () => {
    // Todo: not working when using typescript
    const stageRef = ref<Stage | null>(null);
    const zoomLevel = ref(1);

    const { scaleBy, minScaleChange, minScale, maxScale } = useZoom();
    let { lastScale } = useZoom();

    const resetZoomLevel = () => {
        console.log('==> Reset');
        console.log('====> StageRef.v', stageRef.value);
        // Check if the Stage ref is available
        if (stageRef.value) {
            // Reset scale, position and zoom level
            stageRef.value.getStage().scale({ x: 1, y: 1 });
            stageRef.value.getStage().position({ x: 0, y: 0 });
            zoomLevel.value = 1;

            // Redraw the Stage
            stageRef.value.getStage().batchDraw();
        }
    };

    const setZoomLevel = (mode = '+') => {
        // Check if the Stage ref is available
        if (stageRef.value) {
            // Get the current zoom level
            const currentZoom = zoomLevel.value;

            // Two mode are supported: + and -
            if (mode === '+' && maxScale) {
                zoomLevel.value = currentZoom + 0.1;
            } else {
                zoomLevel.value = currentZoom - 0.1;
            }

            // Update the scale
            stageRef.value.getStage().scale({ x: currentZoom, y: currentZoom });

            // Redraw the Stage
            stageRef.value.getStage().batchDraw();
        }
    };

    const handleWheel = debounce((e) => {
        // Prevent the default scroll behavior
        e.evt.preventDefault();

        // Get the current stage, scale and pointer position
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        // Calculate the mouse position relative to the stage
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // Determine the zoom direction based on the wheel delta
        const direction = e.evt.deltaY > 0 ? 1 : -1;

        // Calculate the new scale based on the zoom direction and limits
        const newScale = direction > 0
            ? Math.min(oldScale / scaleBy, maxScale)
            : Math.max(oldScale * scaleBy, minScale);

        // Check if the scale change is significant enough
        if (Math.abs(newScale - oldScale) > minScaleChange) {
            // Set the new scale on the stage
            stage.scale({ x: newScale, y: newScale });
        }

        if (Math.abs(newScale - lastScale) > minScaleChange) {
            lastScale = newScale;
            zoomLevel.value = newScale;
            requestAnimationFrame(() => {
                stage.scale({ x: newScale, y: newScale });
                // Calculate the new position based on the mouse pointer
                const newPos = {
                    x: pointer.x - mousePointTo.x * newScale,
                    y: pointer.y - mousePointTo.y * newScale,
                };
                // Set the new position on the stage
                stage.position(newPos);
                // Redraw the stage
                stage.batchDraw();
            });
        }
    }, 50);

    return { stageRef, zoomLevel, setZoomLevel, handleWheel, resetZoomLevel }
})
