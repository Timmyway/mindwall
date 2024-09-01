import { defineStore } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvasStore";
import canvasApi from "@/api/canvasApi";
import { base64ToImage, imageToBase64, safeJsonParse } from "@/helpers/utils";
import { Engine, Language, Thematic } from "@/types/thematic.types";
import { loadImageFromURL } from "@/helpers/utils";
import { useCanvasConditions } from "@/composable/useCanvasConditions";
import { MwLayerConfig, MwNode, WallConfig } from "@/types/konva.config";

export const useAppStore = defineStore('application', () => {
    const canvasStore = useCanvasStore();
    const { isMwImageConfig } = useCanvasConditions();

    const thematic = ref<Thematic>();
    const engines = ref<Engine[]>([]);
    const languages = ref<Language[]>([]);
    const isSaving = ref<boolean>(false);
    const isReady = ref<boolean>(true);

    const setThematic = (newThematic: Thematic) => {
        thematic.value = newThematic;
    }
    const setEngines = (newEngine: Engine[]) => {
        engines.value = [...newEngine];
    }
    const setLanguages = (newLanguages: Language[]) => {
        languages.value = [...newLanguages];
    }

    const saveWallToServer = async () => {
        try {
            isSaving.value = true;
            const serializedWall = await serializeWall();
            // form.wall = JSON.stringify(serializedWall);

            // form.post('/api/wall/update', { preserveScroll: true });
            const payload = {
                thematicId: thematic.value?.id as number,
                wall: JSON.stringify(serializedWall)
            }
            console.log('Save to the server...')
            try {
                const response = await canvasApi.saveCanvas(payload);
                console.log('Wall updated successfully.', response.data);
                isSaving.value = false;
            } catch (axiosError) {
                console.log('====> Error found');
                console.log(axiosError);
            }
        } catch (error) {
            console.error('Failed to update positions on the server:', error);
        } finally {
            isSaving.value = false;
        }
    };

    const serializeWall = async (): Promise<WallConfig> => {
        // Initialize an empty object to store the serialized wall
        const serializedWall: WallConfig = { layers: [] };

        // Loop through each layer in the wall object
        for (const layer of canvasStore.wall.layers) {
            const serializedLayer: MwLayerConfig = {
                ...layer,
                items: [] // Initialize items as an empty array
            };

            // Function to recursively serialize items (groups and shapes)
            const serializeItems = async (items: MwNode[]): Promise<MwNode[]> => {
                const serializedItems: MwNode[] = []; // Initialize as an array

                for (const item of items) {
                    // Ensure item has an ID to avoid undefined index error
                    if (!item.id) {
                        console.warn('Item does not have an ID:', item);
                        continue; // Skip items without an ID
                    }

                    const serializedItem: MwNode = { ...item };

                    // Check if the item is an image configuration and the image is an HTMLImageElement
                    if (isMwImageConfig(item) && item.image instanceof HTMLImageElement) {
                        // Convert the image to a Base64 string and store it in the serialized item
                        serializedItem.image = await imageToBase64(item.image);
                    } else {
                        serializedItem.image = item.image; // Keep existing image reference
                    }

                    // If the item is a group, recursively serialize its items
                    if (item.is === 'group' && Array.isArray(item.items)) {
                        serializedItem.items = await serializeItems(item.items); // Serialize group items
                    }

                    serializedItems.push(serializedItem); // Add serialized item to the array
                }

                return serializedItems; // Return the serialized items array
            };

            // Serialize the layer items
            serializedLayer.items = await serializeItems(layer.items ?? []); // Expecting an array
            serializedWall.layers.push(serializedLayer); // Store the serialized layer
        }

        return serializedWall; // Return the fully serialized wall object
    };

    const deserializeWall = async (serializedWall: WallConfig): Promise<WallConfig> => {
        const deserializedWall: WallConfig = { layers: [] };

        for (const layer of serializedWall.layers) {
            const deserializedLayer: MwLayerConfig = { ...layer, items: [] }; // Initialize items as an array

            // Function to recursively deserialize items (groups and shapes)
            const deserializeItems = async (items: MwNode[]): Promise<MwNode[]> => {
                const deserializedItems: MwNode[] = []; // Initialize as an array

                for (const item of items) {
                    const deserializedItem: MwNode = { ...item };

                    if (item.is === 'image' && typeof item.image === 'string') {
                        // Convert base64 to image
                        deserializedItem.image = await base64ToImage(item.image);
                    } else {
                        deserializedItem.image = item.image; // Keep existing image reference
                    }

                    // If the item is a group, recursively deserialize its items
                    if (item.is === 'group' && Array.isArray(item.items)) {
                        deserializedItem.items = await deserializeItems(item.items); // Deserialize group items
                    }

                    deserializedItems.push(deserializedItem); // Add deserialized item to the array
                }

                return deserializedItems; // Return the deserialized items array
            };

            // Deserialize the layer items
            deserializedLayer.items = await deserializeItems(layer.items ?? []); // Expecting an array
            deserializedWall.layers.push(deserializedLayer); // Store the deserialized layer
        }

        return deserializedWall; // Return the fully deserialized wall object
    };

    const cook = async () => {
        console.log('Start cooking...');

        // Wall should be a JSON string. So we need to parse it first.
        if (thematic.value) {
            const thematicWall = safeJsonParse(thematic.value.wall);

            // Then deserialize it (images).
            if (thematicWall) {
                try {
                    const deserialized = await deserializeWall(thematicWall);

                    // Use Object.assign to merge properties into the reactive wall object
                    Object.assign(canvasStore.wall, deserialized);
                    isReady.value = true; // Indicate that the wall is ready for use
                } catch (error) {
                    console.error('Error deserializing wall:', error);
                    // Handle any errors that occur during deserialization
                }
            } else {
                console.warn('Thematic wall is null or undefined after parsing.');
            }
        } else {
            console.warn('Thematic value is not set.');
        }
    };

    return { isSaving, isReady, engines, thematic, languages,
        saveWallToServer, cook, serializeWall, deserializeWall, setThematic, setEngines, setLanguages,
    }
});
