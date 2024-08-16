import { defineStore } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvasStore";
import canvasApi from "@/api/canvasApi";
import { base64ToImage, imageToBase64, safeJsonParse } from "@/helpers/utils";
import { Engine, Language, Thematic } from "@/types/thematic.types";
import { loadImageFromURL } from "@/helpers/utils";
import { useCanvasConditions } from "@/composable/useCanvasConditions";

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
                thematicId: thematic.value?.id,
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

    const serializeWall = async (): Promise<any> => {
        // Initialize an empty object to store the serialized wall
        const serializedWall: any = {};

        // Loop through each group in the wall object
        for (const groupKey of Object.keys(canvasStore.wall)) {
            // Get the group from the wall object
            const group = canvasStore.wall[groupKey];
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
                    if (isMwImageConfig(item) && item.image instanceof HTMLImageElement) {
                        // Convert the image to a Base64 string and store it in the serialized item
                        serializedItem.image = await imageToBase64(item.image);
                    } else {
                        serializedItem.image = item.image;
                    }

                    serializedGroup.items[itemKey] = serializedItem;
                }
            }

            // Check if the group has layers
            if (group.layers) {
                serializedGroup.layers = group.layers.map(layer => ({
                    ...layer,
                    items: layer.items ? Object.fromEntries(
                        Object.entries(layer.items).map(([key, value]) => [key, { ...value }])
                    ) : {}
                }));
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
                    const deserializedItem: any = { ...item };

                    if (item.is === 'image' && typeof item.image === 'string') {
                        // Convert base64 to image
                        deserializedItem.image = await base64ToImage(item.image);
                    } else {
                        deserializedItem.image = item.image;
                    }

                    deserializedGroup.items[itemKey] = deserializedItem;
                }
            }

            if (group.layers) {
                deserializedGroup.layers = group.layers.map((layer: any) => ({
                    ...layer,
                    items: layer.items ? Object.fromEntries(
                        Object.entries(layer.items).map(([key, value]) => [key, { ...value }])
                    ) : {}
                }));
            }

            deserializedWall[groupKey] = deserializedGroup;
        }

        return deserializedWall;
    };

    const cook = async () => {
        console.log('Start cooking...');
        // Wall should be a JSON string. So we need to parse it first.
        if (thematic.value) {
            const thematicWall = safeJsonParse(thematic.value.wall);
            // Then deserialize it (images).
            if (thematicWall) {
                const deserialized = await deserializeWall(thematicWall);

                // Use Object.assign to merge properties into the reactive wall object
                Object.assign(canvasStore.wall, deserialized);
                isReady.value = true;
            }
        }
    }

    return { isSaving, isReady, engines, thematic, languages,
        saveWallToServer, cook, serializeWall, deserializeWall, setThematic, setEngines, setLanguages,
    }
});
