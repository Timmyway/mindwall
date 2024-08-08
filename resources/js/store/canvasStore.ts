import { defineStore } from "pinia";
import { Ref, ref, computed, reactive } from 'vue';
import useZoom from '../composable/useZoom';
import { debounce } from "lodash";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage } from "konva/lib/Stage";
import ContextMenu from "primevue/contextmenu";
import { ImageConfig, TextConfig, WallConfig } from "@/types/konva.config";
import { loadImageFromURL } from "@/helpers/utils";
import { useCanvasConditions } from "@/composable/useCanvasConditions";

export const useCanvasStore = defineStore('app', () => {
    // Todo: not working when using typescript
    const stageRef = ref<Stage | null>(null);
    const { scaleBy, minScale, maxScale, zoomLevel } = useZoom();
    const menu: Ref<ContextMenu | null> = ref(null);

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

    const wall = reactive<WallConfig>({});
    const selectedGroupName = ref<string | null>(null);
    const selectedConfigName = ref<string | null>(null);

    const selectedConfig = computed<TextConfig | ImageConfig | null>({
        get: (): TextConfig | ImageConfig | null => {
            if (selectedGroupName.value && selectedConfigName.value) {
                return wall[selectedGroupName.value]?.items[selectedConfigName.value];
            }
            return null;
        },
        set: (newConfig: Partial<TextConfig> | Partial<ImageConfig> | null) => {
            if (selectedGroupName.value && selectedConfigName.value) {
                const currentConfig = wall[selectedGroupName.value].items[selectedConfigName.value];
                if (currentConfig) {
                    wall[selectedGroupName.value].items[selectedConfigName.value] = {
                        ...currentConfig,
                        ...newConfig
                    };
                }
            }
        }
    });

    const { isImageConfig, isTextConfig } = useCanvasConditions();

    const serializeWall = async (): Promise<any> => {
        // Initialize an empty object to store the serialized wall
        const serializedWall: any = {};

        // Loop through each group in the wall object
        for (const groupKey of Object.keys(wall)) {
            // Get the group from the wall object
            const group = wall[groupKey];
            // Create a shallow copy of the group
            const serializedGroup = { ...group };

            // Check if the group has items
            if (group.items) {
                serializedGroup.items = {};

                for (const itemKey of Object.keys(group.items)) {
                    // Get the item from the group
                    const item = group.items[itemKey];
                    const serializedItem: any = { ...item };

                    // Check if the item is an image configuration and the image is an HTMLImageElement
                    if (isImageConfig(item) && item.image instanceof HTMLImageElement) {
                        // Convert the image to a Base64 string and store it in the serialized item
                        console.log('=======------------> 2024: ', item.image.src);
                        // serializedItem.image = await imageToBase64(item.image);
                        serializedItem.image = item.image.src;
                    }

                    serializedGroup.items[itemKey] = serializedItem;
                }
            }

            serializedWall[groupKey] = serializedGroup;
        }

        return serializedWall;
    };

    const deserializeWall = async (serializedWall: any): Promise<any> => {
        const deserializedWall: any = {};

        for (const groupKey of Object.keys(serializedWall)) {
            const group = serializedWall[groupKey];
            const deserializedGroup = { ...group };

            if (group.items) {
                deserializedGroup.items = {};

                for (const itemKey of Object.keys(group.items)) {
                    const item = group.items[itemKey];
                    const deserializedItem = { ...item };

                    if (item.is === 'image' && typeof item.image === 'string') {
                        // deserializedItem.image = await base64ToImage(item.image);

                        // Create an HTMLImageElement from the URL
                        deserializedItem.image = await loadImageFromURL(item.image);
                    }

                    deserializedGroup.items[itemKey] = deserializedItem;
                }
            }

            deserializedWall[groupKey] = deserializedGroup;
        }

        return deserializedWall;
    };

    const prettify = () => {
        if (isTextConfig(selectedConfig.value)) {
            const text = selectedConfig.value.text;
            // Replace multiple consecutive newline characters with a single newline
            selectedConfig.value.text = text.replace(/\n\s*\n/g, '\n').trim();
        }
    }

    return { stageRef, zoomLevel, setZoomLevel, handleWheel, resetZoomLevel,
        menu, selectedConfig, selectedGroupName, selectedConfigName, wall,
        serializeWall, deserializeWall, prettify
    }
});
