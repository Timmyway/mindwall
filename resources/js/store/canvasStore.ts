import { defineStore } from "pinia";
import { Ref, ref, computed, reactive, nextTick } from 'vue';
import useZoom from '../composable/useZoom';
import { debounce, remove } from "lodash";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import { Stage } from "konva/lib/Stage";
import ContextMenu from "primevue/contextmenu";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { Transformer } from "konva/lib/shapes/Transformer";
import { LayerInfo, MwGroupConfig, MwImageConfig, MwLayerConfig, MwNode, MwShapeConfig, MwTextConfig, WallConfig } from "@/types/konva.config";
import { useCanvasOperationsStore } from "./canvasOperationsStore";
import { LayerConfig } from "konva/lib/Layer";

export const useCanvasStore = defineStore('canvas', () => {
    // Todo: not working when using typescript
    const stageRef = ref<Stage | null>(null);
    const { scaleBy, minScale, maxScale, zoomLevel } = useZoom();
    const menu: Ref<ContextMenu | null> = ref(null);
    const transformer = ref<Transformer[]>([]);
    const { isMwGroupConfig, isMwShapeConfig } = useCanvasConditions();
    const canvasOperations = useCanvasOperationsStore();
    const ctrlPressed = ref<boolean>(false);

    // Konva configs
    const stageWidth = ref<number>(window.innerWidth);
    const stageHeight = ref<number>(window.innerHeight - 32);

    const center: { x: number, y: number } = {
        x: stageWidth.value / 2,
        y: stageHeight.value / 2,
    };

    const selectedItems = ref<MwNode[]>([]);

    const selectItem = (item: MwNode | null) => {
        if (item) {
            console.log('-- 487 -> Selecting item: ', item);

            // Directly set the selectedItems list to contain only the provided item
            selectedItems.value = [item];
        }
    };

    const addSelectedItem = (item: MwNode | null) => {
        // Check if the item is not null and is not already in the selectedItems list
        if (item && !selectedItems.value.some(i => i.id === item.id)) {
            console.log('-- 487 -> Add selected item: ', item);

            // Add the item to the selectedItems lis
            selectedItems.value.push(item);
        }
    };

    const removeSelectedItem = (item: MwNode | null) => {
        // Check if the item is not null and exists in the selectedItems list
        if (item && selectedItems.value.some(i => i.id === item.id)) {
            console.log('-- 488 -> Remove selected item: ', item);

            // Remove the item from the selectedItems list by filtering out the item with the matching id
            selectedItems.value = selectedItems.value.filter(i => i.id !== item.id);
        }
    };

    const clearSelectedItems = () => {
        selectedItems.value = [];
    };

    const resetZoomLevel: () => void = () => {
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
            // Get the current zoom level
            const currentZoom = zoomLevel.value;

            // Two mode are supported: + and -
            if (mode === '-') {
                if ((zoomLevel.value < maxScale) && (zoomLevel.value > minScale)) {
                    zoomLevel.value = currentZoom - scaleBy;
                    // Update the scale
                    stageRef.value.getStage().scale({ x: zoomLevel.value / 100, y: zoomLevel.value / 100 });

                    // Redraw the Stage
                    stageRef.value.getStage().batchDraw();
                }
            } else {
                if (zoomLevel.value > minScale && (zoomLevel.value < maxScale)) {
                    zoomLevel.value = currentZoom + scaleBy;
                    // Update the scale
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
        config: MwLayerConfig | MwGroupConfig, // Accept both Layer and Group configs
        configName: string
    ): MwLayerConfig | MwGroupConfig | MwShapeConfig | null {
        const stack: (MwLayerConfig | MwGroupConfig)[] = [config]; // Initialize stack with the top-level config

        while (stack.length > 0) {
            const currentConfig = stack.pop(); // Get the current configuration from the stack

            // Check if the currentConfig is defined
            if (currentConfig) {
                // Check if the currentConfig matches the configuration name
                if (currentConfig.id === configName) {
                    return currentConfig; // Return the matching Layer or Group configuration
                }

                // Iterate through items to find the configuration
                for (const item of currentConfig.items ?? []) {
                    // Check if the item matches the configuration name
                    if (item.id === configName) {
                        // Type guard to ensure we return the correct type
                        if (isMwShapeConfig(item) || isMwGroupConfig(item)) {
                            return item; // Return the found item
                        }
                    }

                    // If the item is a group, add it to the stack for further exploration
                    if (isMwGroupConfig(item)) {
                        stack.push(item); // Push the group onto the stack
                    }
                }
            }
        }

        return null; // Return null if not found at any level
    }

    const selectedConfig = ref<MwShapeConfig | MwGroupConfig | null>(null);

    const deleteConfig = (config: MwNode) => {
        if (!config?.id || !wall.value.layers) return;

        const stack: (MwLayerConfig | MwGroupConfig)[] = [...wall.value.layers];

        while (stack.length > 0) {
            const parent = stack.pop();

            if (parent?.items) {
                const configIndex = parent.items.findIndex(item => item.id === config.id);

                if (configIndex !== -1) {
                    parent.items.splice(configIndex, 1);

                    console.log('-- Found and deleted config:', config);
                    console.log('-- Parent after deletion:', parent);

                    resetConfig({ layerInfo: false });
                    updateTransformer();

                    return; // Exit after deleting the config
                }

                // Add nested groups to the stack for further checking
                stack.push(...parent.items.filter(isMwGroupConfig));
            }
        }

        console.error('Config not found in any layer or group');
    };

    const findGroupById = (configId: string): MwGroupConfig | null => {
        if (configId && wall.value.layers) {
            for (const layer of wall.value.layers) {
                const foundConfig = findConfig(layer, configId);
                console.log('-----------> FFF', foundConfig)
                if (isMwGroupConfig(foundConfig)) {
                    return foundConfig;
                }
            }
        }
        return null;
    };

    const findParentGroup = (config: MwNode): MwGroupConfig | null => {
        if (config?.name && wall.value.layers) {
            for (const layer of wall.value.layers) {
                if (config.parent) {
                    const parentConfig = findConfig(layer, config.parent);
                    if (parentConfig?.is === 'group') {
                        return parentConfig;
                    }
                }
            }
        }
        return null;
    }

    const findParent = (config: MwNode): MwLayerConfig | MwGroupConfig | null => {
        if (config?.name && wall.value.layers) {
            for (const layer of wall.value.layers) {
                if (config.parent) {
                    const parentConfig = findConfig(layer, config.parent);
                    if (isMwGroupConfig(parentConfig) || parentConfig?.is === 'layer') {
                        return parentConfig;
                    }
                }
            }
        }
        return null;
    }

    const getSelectedConfig = (config: MwNode): MwNode | null => {
        if (config?.name && wall.value.layers) {
            for (const layer of wall.value.layers) {
                selectedConfig.value = findConfig(layer, config.name) as MwShapeConfig;

                if (selectedConfig.value) {
                    // Check if the found config is part of a group
                    console.log('============> FOUND config: ', selectedConfig.value)
                    if (selectedConfig.value.parent) {
                        const groupConfig = findConfig(layer, selectedConfig.value.parent);

                        if (isMwGroupConfig(groupConfig)) {
                            console.log('-- 7776 --> Shape belongs to a group');
                            console.log('-- 7779 -> CTR key is pressed: ', ctrlPressed.value);
                            if (ctrlPressed.value) {
                                // If Ctrl is pressed, find the item inside the group and select it
                                const selectedGroupItem = groupConfig.items.find(item => item.id === config.id);
                                if (selectedGroupItem) {
                                    console.log('--------> Selected item from group: ', selectedGroupItem);
                                    selectItem(selectedGroupItem);
                                    selectedConfig.value = selectedGroupItem as MwTextConfig | MwImageConfig; // Return the selected item
                                }
                            } else {
                                // If Ctrl is not pressed, select the entire group
                                clearSelectedItems();
                                console.log('===========> FOUND elements in group: ', groupConfig.items)
                                groupConfig.items.forEach((item: MwNode) => {
                                    addSelectedItem(item);
                                });
                                selectedConfig.value = groupConfig as MwGroupConfig; // Return the group configuration
                            }
                        }
                    }
                }
            }
        }
        return null; // Return null if no config is found
    }

    const setSelectedConfig = (newConfig: Partial<MwTextConfig> | Partial<MwImageConfig> | Partial<MwGroupConfig> | null) => {
        // if (selectedConfig.value?.name && wall.value.layers && newConfig) {
        //     for (const layer of wall.value.layers) {
        //         const foundConfig = findConfig(layer, selectedConfig.value?.name);

        //         if (foundConfig) {
        //             // Check if the found config is part of a group
        //             if (foundConfig.parent) {
        //                 const groupConfig = findConfig(layer, foundConfig.parent);

        //                 if (isMwGroupConfig(groupConfig)) {
        //                     if (ctrlPressed.value) {
        //                         // If Ctrl is pressed, update the selected item inside the group
        //                         const selectedItem = groupConfig.items.find(item => item.id === selectedConfig.value?.name);
        //                         if (selectedItem) {
        //                             Object.assign(selectedItem, newConfig);
        //                             console.log('--------> Updated selected item: ', selectedItem);
        //                         }
        //                     } else {
        //                         // If Ctrl is not pressed, update the entire group
        //                         Object.assign(groupConfig, newConfig);
        //                         console.log('--------> Updated group config: ', groupConfig);
        //                     }
        //                 }
        //             } else {
        //                 // Update the config if it's not part of a group
        //                 Object.assign(foundConfig, newConfig);
        //                 console.log('--------> Updated config: ', foundConfig);
        //             }
        //             break;
        //         }
        //     }
        // }
        if (selectedConfig.value) {
            Object.assign(selectedConfig.value, newConfig);
        }
    }

    const { isMwImageConfig, isMwTextConfig } = useCanvasConditions();

    const prettify = () => {
        if (isMwTextConfig(selectedConfig.value)) {
            const text = selectedConfig.value.text;

            if (text) {
                // Replace multiple consecutive newline characters with a single newline
                setSelectedConfig({ text: text.replace(/\n\s*\n/g, '\n').trim() });
            }
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
            // console.log('===> Stage scale x/y: ', scaleX, scaleY);
            // console.log('===> Stage w/h: ', stage.width(), stage.height());
            // console.log('===> Element x/y: ', elementX, elementY);

            // Calculate the new position of the stage to center the element
            let newX = stage.width() / 2 - (elementX * scaleX);
            let newY = stage.height() / 2 - (elementY * scaleY);

            // console.log('===> Center on element: ', newX, newY);
            // console.log('====> Selected element: ', selectedConfig.value);

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

    const selectConfig = (config: MwNode | null, layerInfo: LayerInfo) => {
        // console.log('-- 562 -> Select config name: ', configName);
        // console.log('-- 563 -> Select config from layer: ', layerInfo);
        // console.log('-- 564 -> CTRL pressed: ', ctrlPressed.value);
        // selectedConfigName.value = config?.name;
        if (config) {
            getSelectedConfig(config);
        }
        // console.log('-- 9999 -> Current config: ', currentConfig);
        // selectedConfig.value = config;
        selectedLayerInfo.value = layerInfo;
    };

    const resetConfig = (options: { layerInfo?: boolean; configName?: boolean; selectedItems?: boolean } = {}) => {
        const { layerInfo = true, configName = true, selectedItems = true } = options;

        if (selectedItems) {
            clearSelectedItems();
            // console.log('-- 77 -> Items cleared')
        }

        if (configName) {
            selectedConfigName.value = '';
            selectedConfig.value = null;
            // console.log('-- 78 -> Config name cleared')
        }

        if (layerInfo) {
            selectedLayerInfo.value = null;
            // console.log('-- 79 -> Layer info cleared')
        }

        // console.log('-- 80 -> Selected config name: ', selectedConfigName.value)
    };



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
        // console.log('-- 998 -> Reset wall');

        resetConfig();
        // Use the WallConfig type to reset the wall
        wall.value = { layers: [] } as WallConfig;
        canvasOperations.addLayer();

        // console.log('====> Wall value after reset: ', wall.value)
    }

    const updateTransformer = () => {
        if (!selectedLayerInfo.value) {
            // console.log('-- 464 -> Transformer: ', transformer.value);
            // console.log('-- 465 -> Selected config: ', selectedConfig.value);
            return;
        }

        const transformerInstance = transformer.value[selectedLayerInfo.value.index];
        const transformerNode = transformerInstance.getNode() as Transformer;

        if (!stageRef.value) {
            // console.error('Stage reference is not available.');
            return;
        }

        const stage = stageRef.value.getStage();

        // Handle multiple selected items
        const selectedNodes = selectedItems.value
            .map(item => stage.findOne(`#${item.name}`)) // Find nodes by ID
            .filter((node): node is Node => node !== undefined); // Type guard to filter out undefined nodes

        // console.log('-- 466 -> Selected nodes: ', selectedNodes);
        if (selectedNodes.length === 0) {
            // console.log('No nodes selected or nodes not found.');
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
        // console.log('Transformer attached to nodes:', selectedNodes.map(node => node.name()));
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
        ctrlPressed, setSelectedConfig, findParentGroup, deleteConfig,
        findGroupById, findParent,
    }
});
