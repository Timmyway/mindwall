import { defineStore } from "pinia";
import { Ref, ref, computed, reactive } from 'vue';
import useZoom from '../composable/useZoom';
import { debounce } from "lodash";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage } from "konva/lib/Stage";
import ContextMenu from "primevue/contextmenu";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { Transformer } from "konva/lib/shapes/Transformer";
import { MwGroupConfig, MwImageConfig, MwLayerConfig, MwShapeConfig, MwTextConfig, WallConfig } from "@/types/konva.config";

export const useCanvasStore = defineStore('canvas', () => {
    // Todo: not working when using typescript
    const stageRef = ref<Stage | null>(null);
    const { scaleBy, minScale, maxScale, zoomLevel } = useZoom();
    const menu: Ref<ContextMenu | null> = ref(null);
    const transformer = ref<Transformer[]>([]);
    const { isMwGroupConfig } = useCanvasConditions();

    // Konva configs
    const stageWidth = ref<number>(window.innerWidth);
    const stageHeight = ref<number>(window.innerHeight - 32);

    const center: { x: number, y: number } = {
        x: stageWidth.value / 2,
        y: stageHeight.value / 2,
    };

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
            if (mode === '-') {
                console.log('Zoom --')
                if ((zoomLevel.value < maxScale) && (zoomLevel.value > minScale)) {
                    zoomLevel.value = currentZoom - scaleBy;
                    // Update the scale
                    console.log('====> Current zoom', currentZoom);
                    stageRef.value.getStage().scale({ x: zoomLevel.value / 100, y: zoomLevel.value / 100 });

                    // Redraw the Stage
                    stageRef.value.getStage().batchDraw();
                }
            } else {
                console.log('Zoom ++')
                if (zoomLevel.value > minScale && (zoomLevel.value < maxScale)) {
                    zoomLevel.value = currentZoom + scaleBy;
                    // Update the scale
                    console.log('====> Current zoom', currentZoom);
                    stageRef.value.getStage().scale({ x: zoomLevel.value / 100, y: zoomLevel.value / 100 });

                    // Redraw the Stage
                    stageRef.value.getStage().batchDraw();
                }
            }
        }
    };

    const handleWheel: (e: KonvaEventObject<WheelEvent>) => void = debounce((e) => {
        // Prevent the default scroll behavior
        e.evt.preventDefault();

        // Determine the zoom direction based on the wheel delta
        const direction = e.evt.deltaY > 0 ? 1 : -1;

        if (direction > 0) {
            setZoomLevel('-');
        } else {
            setZoomLevel('+');
        }
    }, 50);

    const wall = ref<WallConfig>({});
    const selectedConfigName = ref<string | null>(null);

    function findConfig(
        config: MwLayerConfig | MwGroupConfig,
        configName: string
    ): MwTextConfig | MwImageConfig | MwGroupConfig | null {
        // Check if the configName exists directly in the items
        if (isMwGroupConfig(config)) {
            if (config.items && config.items[configName]) {
                return config.items[configName] as MwTextConfig | MwImageConfig | MwGroupConfig;
            }
        } else if (isMwTextConfig(config) || isMwImageConfig(config)) {
            return config;
        }

        // Recursively search within nested groups
        for (const item of Object.values(config.items || {})) {
            if (item.is === 'group') {
                const result = findConfig(item as MwGroupConfig, configName);
                if (result) return result;
            }
        }

        return null;
    }

    const selectedConfig = computed<MwTextConfig | MwImageConfig | MwGroupConfig | null>((): MwTextConfig | MwImageConfig | MwGroupConfig | null => {
        if (selectedConfigName.value) {
            // Iterate through layers to find the config
            for (const layer of Object.values(wall.value.layers || {})) {
                const result = findConfig(layer, selectedConfigName.value);
                if (result) return result;
            }
        }
        return null;
    })

    const { isMwImageConfig, isMwTextConfig } = useCanvasConditions();

    const prettify = () => {
        if (isMwTextConfig(selectedConfig.value)) {
            const text = selectedConfig.value.text;
            // Replace multiple consecutive newline characters with a single newline
            selectedConfig.value.text = text.replace(/\n\s*\n/g, '\n').trim();
        }
    }

    const centerOnElement = () => {
        if (!selectedConfig.value?.x || !selectedConfig.value?.y || !stageRef.value) {
            return;
        }
        if (isMwTextConfig(selectedConfig.value) || isMwImageConfig(selectedConfig.value)) {
            const stage = stageRef.value.getStage();
            // Calculate the center of the element
            const elementX = selectedConfig.value.x + (selectedConfig.value?.width ?? 0) / 2;
            const elementY = selectedConfig.value.y + (selectedConfig.value?.height ?? 0) / 2;

            // Get the current scale of the stage
            const scaleX = stage.scaleX();
            const scaleY = stage.scaleY();
            console.log('===> Stage scale x/y: ', scaleX, scaleY);
            console.log('===> Stage w/h: ', stage.width(), stage.height());
            console.log('===> Element x/y: ', elementX, elementY);

            // Calculate the new position of the stage to center the element
            let newX = stage.width() / 2 - (elementX * scaleX);
            let newY = stage.height() / 2 - (elementY * scaleY);

            console.log('===> Center on element: ', newX, newY);
            console.log('====> Selected element: ', selectedConfig.value);

            // Set the new position of the stage
            stageRef.value.getStage().scale({ x: 1, y: 1 });

            // Set a zoom level (e.g., zoom in)
            const newScale = { x: 1, y: 1 };
            stage.scale(newScale);
            zoomLevel.value = 100;

            // Recalculate the position after scaling
            newX = stage.width() / 2 - elementX * newScale.x;
            newY = stage.height() / 2 - elementY * newScale.y;

            // Update the stage position with the recalculated values
            stage.position({ x: newX, y: newY });

            // Redraw the stage
            stage.batchDraw();
        }
    }

    const selectConfig = (configName: string) => {
        selectedConfigName.value = configName;
    };

    const resetConfig = () => {
        selectedConfigName.value = null;
    }

    const backupShape = (): { configName: string | null } => {
        return {
            configName: selectedConfigName.value ?? null
        };
    }

    const restoreShape = (configName: string = '') => {
        if (configName.trim() !== '') {
            selectedConfigName.value = configName;
        }
    }

    const resetWall = () => {
        console.log('-- 998 -> Reset wall');
        wall.value = {};
        console.log('====> ', wall.value)
    }

    const updateTransformer = () => {
        // here we need to manually attach or detach Transformer node
        const transformerNode = transformer.value?.getNode();
        if (stageRef.value) {
            const stage = stageRef.value.getStage();
            const selectedNode = stage.findOne('.' + selectedConfig.value?.name);
            // do nothing if selected node is already attached
            if (transformerNode) {
                if (selectedNode === transformerNode.node()) {
                    return;
                }

                if (selectedNode) {
                    // attach to another node
                    transformerNode.nodes([selectedNode]);
                } else {
                    // remove transformer
                    transformerNode.nodes([]);
                }
            }
        }
    }

    const syncPosition = (x: number, y: number) => {
        if (selectedConfig.value) {
            selectedConfig.value.x = x;
            selectedConfig.value.y = y;
        }
    }

    return { stageRef, zoomLevel, setZoomLevel, handleWheel, resetZoomLevel,
        menu, selectedConfig, selectedConfigName, wall, transformer,
        prettify, centerOnElement,
        backupShape, restoreShape, selectConfig, resetConfig, resetWall,
        updateTransformer, syncPosition, center, stageWidth, stageHeight
    }
});
