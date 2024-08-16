import { defineStore } from "pinia";
import { Ref, ref, computed, reactive } from 'vue';
import useZoom from '../composable/useZoom';
import { debounce, remove } from "lodash";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage } from "konva/lib/Stage";
import ContextMenu from "primevue/contextmenu";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { Transformer } from "konva/lib/shapes/Transformer";
import { LayerInfo, MwGroupConfig, MwImageConfig, MwLayerConfig, MwNode, MwShapeConfig, MwTextConfig, WallConfig } from "@/types/konva.config";
import { useCanvasOperationsStore } from "./canvasOperationsStore";

export const useCanvasStore = defineStore('canvas', () => {
    // Todo: not working when using typescript
    const stageRef = ref<Stage | null>(null);
    const { scaleBy, minScale, maxScale, zoomLevel } = useZoom();
    const menu: Ref<ContextMenu | null> = ref(null);
    const transformer = ref<Transformer[]>([]);
    const { isMwGroupConfig } = useCanvasConditions();
    const canvasOperations = useCanvasOperationsStore();

    // Konva configs
    const stageWidth = ref<number>(window.innerWidth);
    const stageHeight = ref<number>(window.innerHeight - 32);

    const center: { x: number, y: number } = {
        x: stageWidth.value / 2,
        y: stageHeight.value / 2,
    };

    const selectedItems = ref<MwNode[]>([]);

    const addSelectedItem = (item: MwNode | null) => {
        if (item && !selectedItems.value.some(i => i.id === item.id)) {
            selectedItems.value.push(item);
        }
    };

    const removeSelectedItem = (item: MwNode | null) => {
        if (item && selectedItems.value.some(i => i.id === item.id)) {
            selectedItems.value = selectedItems.value.filter(i => i.id !== item.id);
        }
    };

    const clearSelectedItems = () => {
        selectedItems.value = [];
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

    const wall = ref<WallConfig>({ layers: [] });
    const selectedConfigName = ref<string | null>(null);
    const selectedLayerInfo = ref<LayerInfo | null>(null);

    function findConfig(
        config: MwLayerConfig | MwGroupConfig,
        configName: string
    ): MwTextConfig | MwImageConfig | MwGroupConfig | null {
        // Check if the configName exists directly in the items
        if (isMwGroupConfig(config)) {
            const foundItem = config.items.find(item => item.id === configName);
            if (foundItem) {
                return foundItem as MwTextConfig | MwImageConfig | MwGroupConfig;
            }
        }

        // Recursively search within nested groups
        for (const item of config.items || []) {
            if (isMwGroupConfig(item)) {
                const result = findConfig(item, configName);
                if (result) return result;
            } else if (item.id === configName) {
                return item as MwTextConfig | MwImageConfig;
            }
        }

        return null;
    }

    const selectedConfig = computed<MwTextConfig | MwImageConfig | MwGroupConfig | null>(() => {
        if (selectedConfigName.value) {
            // Iterate through layers to find the config
            for (const layer of wall.value.layers || []) {
                const result = findConfig(layer, selectedConfigName.value);
                if (result) return result;
            }
        }
        return null;
    });

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

    const selectConfig = (configName: string, layerInfo: LayerInfo) => {
        console.log('-- 562 -> Select config name: ', configName);
        console.log('-- 563 -> Select config from layer: ', layerInfo);
        selectedConfigName.value = configName;
        selectedLayerInfo.value = layerInfo;
    };

    const resetConfig = () => {
        clearSelectedItems();
        selectedConfigName.value = '';
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

    const resetWall = (): void => {
        console.log('-- 998 -> Reset wall');

        // Use the WallConfig type to reset the wall
        wall.value = { layers: [] } as WallConfig;
        canvasOperations.addLayer();

        console.log('====> ', wall.value)
    }

    const updateTransformer = () => {
        if (!selectedLayerInfo.value) {
            console.log('-- 464 -> Transformer: ', transformer.value);
            console.log('-- 465 -> Selected config: ', selectedConfig.value);
            return;
        }

        const transformerInstance = transformer.value[selectedLayerInfo.value.index];
        const transformerNode = transformerInstance.getNode() as Transformer;

        if (!stageRef.value) {
            console.error('Stage reference is not available.');
            return;
        }

        const stage = stageRef.value.getStage();


        // Handle multiple selected items
        const selectedNodes = selectedItems.value.map(item => stage.findOne(`#${item.name}`)).filter(Boolean);

        if (selectedNodes.length === 0) {
            console.log('No nodes selected or nodes not found.');
            transformerNode.nodes([]);
            return;
        }

        // Check if the transformer is already attached to the selected nodes
        const currentNodes = transformerNode.nodes();
        const isAlreadyAttached = selectedNodes.every(node => currentNodes.includes(node));

        if (isAlreadyAttached) {
            // Transformer is already attached to the selected nodes, no action needed
            return;
        }


        // Attach the transformer to the selected nodes
        transformerNode.nodes(selectedNodes);
        console.log('Transformer attached to nodes:', selectedNodes.map(node => node.name()));
    };

    const syncPosition = (itemId: string, x: number, y: number) => {
        const item = selectedItems.value.find(i => i.id === itemId);
        if (item) {
            item.x = x;
            item.y = y;
        }
    };

    return { stageRef, zoomLevel, setZoomLevel, handleWheel, resetZoomLevel,
        menu, selectedConfig, selectedConfigName, wall, transformer,
        prettify, centerOnElement, selectedLayerInfo,
        backupShape, restoreShape, selectConfig, resetConfig, resetWall,
        updateTransformer, syncPosition, center, stageWidth, stageHeight,
        addSelectedItem, removeSelectedItem, clearSelectedItems, selectedItems,
    }
});
