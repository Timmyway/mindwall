<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { safeJsonParse, uuid, imageToBase64, base64ToImage, resizeImage } from '../../helpers/utils';
import { randInt, randPos } from '../../helpers/canva';
import { router, useForm } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import { WallConfig, TextConfig, ImageConfig } from '../../types/konva.config';
import { Ref } from 'vue';
import { Thematic } from '../../types/thematic.types';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Text } from 'konva/lib/shapes/Text';
import { reactive } from 'vue';
import { TextareaStyle } from '../../types/canvas.types'
import TwContextMenu from '../../Components/menu/TwContextMenu.vue';
import { useFileDialog } from '@vueuse/core'
import { Rect } from 'konva/lib/shapes/Rect';
import { Image } from 'konva/lib/shapes/Image';
import usePaletteColor from '../../composable/usePaletteColor';
import canvasApi from '../../api/canvasApi';
import ThematicList from './ThematicList.vue';

const props = defineProps<{
    thematic: Thematic
}>();

const canvaStore = useCanvasStore();
const { stageRef } = storeToRefs(canvaStore);

const { files, open, reset, onChange } = useFileDialog({
    accept: 'image/*', // Set to accept only image files
    directory: false, // Select directories instead of files if set true
})

const wall = reactive<WallConfig>({});

const serializeWall = async (): Promise<any> => {
    const serializedWall: any = {};

    for (const groupKey of Object.keys(wall)) {
        const group = wall[groupKey];
        const serializedGroup = { ...group };

        if (group.items) {
            serializedGroup.items = {};

            for (const itemKey of Object.keys(group.items)) {
                const item = group.items[itemKey];
                const serializedItem: any = { ...item };

                if (isImageConfig(item) && item.image instanceof HTMLImageElement) {
                    serializedItem.image = await imageToBase64(item.image);
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
                    deserializedItem.image = await base64ToImage(item.image);
                }

                deserializedGroup.items[itemKey] = deserializedItem;
            }
        }

        deserializedWall[groupKey] = deserializedGroup;
    }

    return deserializedWall;
};

// const form = useForm({
//     thematicId: props.thematic.id,
//     wall: ''
// });

const isSaving = ref<boolean>(false);

const saveWallToServer = async () => {
    try {
        isSaving.value = true;
        const serializedWall = await serializeWall(wall);
        // form.wall = JSON.stringify(serializedWall);

        // form.post('/api/wall/update', { preserveScroll: true });
        const payload = {
            thematicId: props.thematic.id,
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

// Konva configs
const stageWidth = ref<number>(window.innerWidth);
const stageHeight = ref<number>(window.innerHeight - 32);

const center: { x: number, y: number } = {
    x: stageWidth.value / 2,
    y: stageHeight.value / 2,
};

const isReady = ref<boolean>(true);

const cook = async () => {
    console.log('Start cooking...');
    // Wall should be a JSON string. So we need to parse it first.
    const thematicWall = safeJsonParse(props.thematic.wall);
    // Then deserialize it (images).
    if (thematicWall) {
        const deserialized = await deserializeWall(thematicWall);

        // Use Object.assign to merge properties into the reactive wall object
        Object.assign(wall, deserialized);
        isReady.value = true;
    }
}

cook();
// props.thematic.quotes.forEach((quote) => {
//     const config = {
//         id: `quote-${quote.id}`,
//         rotation: randInt(0, 360),
//         x: randPos('x'),
//         y: randPos('y'),
//         scaleX: 1,
//         scaleY: 1,
//         fontFamily: 'Verdana',
//         fontSize: 12,
//         name: `quote-${quote.id}`,
//         text: quote.name,
//         fill: 'black',
//         visible: true,
//         image: null
//     }
//     quotesConfig.value.push(config);
// });

const pickImage = async () => {
    open();
}

onChange((files) => {
    if (files && files.length > 0) {
        const selectedImage = files[0];
        addImageToWall(selectedImage);
    }
})

const deleteImage = (e: Event) => {
    console.log('===> Event', e);

    // Check if the selected config is available and is an ImageConfig
    if (selectedConfig.value && selectedConfig.value.is === 'image') {
        // Get the selected group and config name
        const groupName = selectedGroupName.value;
        const configName = selectedConfigName.value;

        if (groupName && configName) {
            // Check if the group exists
            if (wall[groupName] && wall[groupName].items[configName]) {
                // Delete the image config from the items object
                delete wall[groupName].items[configName];
                console.log(`===> ImageConfig '${configName}' removed from group '${groupName}'`);
            }
        }
    }
};

const addGroup = () => {
    const groupName = `group-${uuid()}`;
    wall[groupName] = {
        id: groupName,
        name: groupName,
        is: 'group',
        scaleX: 1,
        scaleY: 1,
        visible: true,
        draggable: true,
        items: {}
    };
};

const isTextConfig = (config: any): config is TextConfig => {
    return (config as TextConfig).is === 'text';
};

const isImageConfig = (config: any): config is ImageConfig => {
    return (config as ImageConfig).is === 'image';
};

const addTextToWall = (groupName: string, text: string = 'New text...') => {
      const textId = `${groupName}-text-${uuid()}`;
      const newTextConfig: TextConfig = {
        id: textId,
        name: textId,
        is: 'text',
        rotation: 0,
        x: center.x - 10,
        y: center.y -50,
        scaleX: 1,
        scaleY: 1,
        fontFamily: 'Calibri',
        fontSize: 16,
        text: text,
        fill: 'black',
        visible: true,
    };

    if (!wall[groupName]) {
        wall[groupName] = {
            id: groupName,
            name: groupName,
            is: 'text',
            scaleX: 1,
            scaleY: 1,
            visible: true,
            draggable: true,
            items: {}
        };
    }

    wall[groupName].items[textId] = newTextConfig;
};

const calcOptimizedImageDimension = (im: HTMLImageElement, maxWidth = 300, maxHeight = 300): { w:number, h:number } => {
    // Get the real size of the image
    const realWidth = im.width;
    const realHeight = im.height;

    // Calculate the aspect ratio
    let width = realWidth;
    let height = realHeight;
    if (realWidth > maxWidth || realHeight > maxHeight) {
        const widthRatio = maxWidth / realWidth;
        const heightRatio = maxHeight / realHeight;
        const minRatio = Math.min(widthRatio, heightRatio);
        width = realWidth * minRatio;
        height = realHeight * minRatio;
    }
    console.log('===> Width|Height: ', width, height);
    return { w: width, h: height };
}

const addImageToWall = (src: string | File = 'https://www.pngall.com/wp-content/uploads/5/Yellow-Jersey.png') => {
    const imageIdentifier = `${selectedGroupName.value}-image-${uuid()}`;
    const newImageConfig: ImageConfig = {
        id: imageIdentifier,
        name: imageIdentifier,
        is: 'image',
        width: 100,
        height: 100,
        x: selectedConfig.value?.x ?? 0,
        y: selectedConfig.value?.y ?? 0,
        draggable: true
    };

    if (typeof src === 'string') {
        // Handle loading an image from a URL
        const im = new window.Image();
        im.src = src;
        im.onload = () => {
            newImageConfig.image = im;
            const { w, h } = calcOptimizedImageDimension(im);
            newImageConfig.width = w;
            newImageConfig.height = h;

            if (selectedGroupName.value) {
                wall[selectedGroupName.value].items[imageIdentifier] = newImageConfig;
            }
        }
    } else {
        // Handle loading an image from a File object
        // Handle loading an image from a File object
        const reader = new FileReader();
        reader.onload = (event) => {
            const im = new window.Image();
            im.src = event.target?.result as string;
            im.onload = () => {
                const { w, h } = calcOptimizedImageDimension(im);
                newImageConfig.width = w;
                newImageConfig.height = h;
                newImageConfig.image = im;

                // Resize the image before adding it to the wall
                const resizedImage = resizeImage(im, w, h); // Example max width and height
                newImageConfig.image = resizedImage;

                if (selectedGroupName.value) {
                    wall[selectedGroupName.value].items[imageIdentifier] = newImageConfig;
                }
            }
        };
        reader.readAsDataURL(src);
    }
};

const removeConfig = (groupName: string, configName: string) => {
    if (wall[groupName] && wall[groupName].items[configName]) {
    delete wall[groupName].items[configName];
    } else {
    console.log(`Config with name ${configName} not found in group ${groupName}.`);
    }
};

const removeText = (groupName: string, textId: string) => {
    if (wall[groupName] && wall[groupName].items[textId]) {
        delete wall[groupName].items[textId];
    } else {
    console.log(`Text with id ${textId} not found in group ${groupName}.`);
    }
};

const selectedGroupName = ref<string | null>(null);
const selectedConfigName = ref<string | null>(null);

const selectConfig = (groupName: string, configName: string) => {
    selectedGroupName.value = groupName;
    selectedConfigName.value = configName;
};

const resetConfig = () => {
    selectedGroupName.value = '';
    selectedConfigName.value = '';
}

const transformer = ref();

const stageConfig: {
  width: number;
  height: number;
} = {
    width: stageWidth.value,
    height: stageHeight.value,
};

const groupConfig = {

}

const thematicRectConfig = {
    x: center.x,
    y: center.y,
    width: 200, // Add some padding
    height: 40, // Add some padding
    fill: '#000',
    stroke: 'white',
    strokeWidth: 4,
    shadowBlur: 10,
};

const thematicTextConfig = ref({
    x: center.x,
    y: center.y,
    text: props.thematic.name,
    ellipsis: true,
    align: 'center',
    verticalAlign: 'middle',
    fontSize: 20,
    fontFamily: 'Calibri',
    fill: '#fff',
});

const selectedConfig = computed<TextConfig | ImageConfig | null>({
    get: (): TextConfig | ImageConfig | null => {
        if (selectedGroupName.value && selectedConfigName.value) {
            return wall[selectedGroupName.value].items[selectedConfigName.value];
        }
        return null;
    },
    set: (newConfig: Partial<TextConfig> | Partial<ImageConfig>) => {
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

const handleTransformEnd = (e: any) => {
    // shape is transformed, let us save new attrs back to the node
    console.log('============> Tranform has ended');
    if (selectedConfig.value) {
        // update the state
        selectedConfig.value.x = e.target.x();
        selectedConfig.value.y = e.target.y();
        selectedConfig.value.rotation = e.target.rotation();
        selectedConfig.value.scaleX = e.target.scaleX();
        selectedConfig.value.scaleY = e.target.scaleY();
    }
}

const handleStageMouseDown = (e: any) => {
    // clicked on stage - clear selection
    if (e.target === e.target.getStage()) {
        console.log('==> Clicked on stage...');
        if (editing.value) {
            exitEditMode();
        }
        resetConfig();
        updateTransformer();
        return;
    }

    // clicked on transformer - do nothing
    const clickedOnTransformer = e.target.getParent().className === 'Transformer';
    if (clickedOnTransformer) {
        return;
    }

    updateTransformer();
}

const handleGroupContextMenu = (e: any) => {
    e.evt.preventDefault();
    if (e.target === stageRef.value.getStage()) {
        console.log('===> We are on an empty place of the stage');
        return;
    }
    canvaStore.menu.show(e.evt);
    const currentShape = e.target;
    console.log('===> Current shape: ', currentShape);

}

const updateTransformer = () => {
    // here we need to manually attach or detach Transformer node
    const transformerNode = transformer.value?.getNode();
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

const handleQuoteDblClicked = (e: Event) => {
    console.log('Double clicked');
    const textNode = e.target as Text | null;
    // Find the quote config that was double-clicked
    const quote = findQuote(textNode?.name() ?? '');

    if (quote) {
        // Reset the rotation to 0
        quote.rotation = 0;
    }
}

const handleQuoteEditText = (name: string, text: string) => {
    console.log('Edit quote: ', name);
    // Find the quote config that was double-clicked
    const quote = findQuote(name);
    if (quote) {
        quote.text = text;
    }
}

const editing = ref(false);
const editedQuoteText = ref<string>('');
const quoteAreaRef = ref();

const enterEditMode = (e: Event) => {
    console.log('===> T', typeof e)
    const textNode = e.target as Text | null;
    console.log('====> Text node: ', textNode);
    if (selectedConfig.value) {
        selectedConfig.value.visible = false;
    }
    // hide text node and transformer:
    transformer.value.getNode().hide();

    // so position of textarea will be the sum of positions above:
    const textPosition = textNode?.absolutePosition();
    // const areaPosition = {
    //     x: stageRef.value.getStage().container().offsetLeft + textPosition.x,
    //     y: stageRef.value.getStage().container().offsetTop + textPosition.y,
    // };
    // Set its dimension
    const calculatedWidth = (textNode?.width() ?? 0) - (textNode?.padding() ?? 0) * 2;
    textareaStyle.width = calculatedWidth + 'px';
    textareaStyle.height =
        (textNode?.height() ?? 0) - (textNode?.padding() ?? 0) * 2 + 5 + 'px';
    const areaPosition = {
        x: stageRef.value.getStage().container().offsetLeft + (textPosition?.x) + (calculatedWidth / 2),
        y: stageRef.value.getStage().container().offsetTop + (textPosition?.y),
    };
    console.log('Offset x: ', stageRef.value.getStage().container().offsetLeft)
    console.log('Offset y: ', stageRef.value.getStage().container().offsetTop)
    console.log('Text position: ', textPosition)
    console.log('Area position: ', areaPosition);
    console.log('Text node: ', textNode?.align());
    // Set textarea position
    textareaStyle.left = areaPosition.x + 'px';
    textareaStyle.top = areaPosition.y + 'px';
    // Set typography related styles
    textareaStyle.fontSize = textNode?.fontSize() + 'px';
    textareaStyle.lineHeight = textNode?.lineHeight() ?? 1;
    textareaStyle.fontFamily = textNode?.fontFamily() ?? 'Verdana';
    textareaStyle.transformOrigin = 'left top';
    textareaStyle.textAlign = 'left';
    textareaStyle.color = 'black';

    setTimeout(() => {
        quoteAreaRef.value.focus();
    }, 0);

    console.log('--> TEXTAREA STYLE: ', textareaStyle)
    editing.value = true;
}

const exitEditMode = () => {
    if (editedQuoteText.value.trim() === '') {
        // Restore text node and transformer
        console.log('-- 01 -> Restore text and transformer')
        if (selectedConfig.value) {
            selectedConfig.value.visible = true;
            transformer.value.getNode().show();
        }
        editing.value = false; // Exit edit mode
        return;
    }
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        selectedConfig.value.text = editedQuoteText.value.trim();
        // Restore text node and transformer
        selectedConfig.value.visible = true;
        transformer.value.getNode().show();
        editedQuoteText.value = '';
        editing.value = false; // Exit edit mode
    }
}

const editQuote = () => {
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        selectedConfig.value.fontSize = 20;
        selectedConfig.value.fontFamily = 'Monospace';
        selectedConfig.value.rotation = 0;
    }
    exitEditMode();
    console.log('Finished editing...');
};

const textareaStyle = reactive<TextareaStyle>({
    position: 'absolute',
    top: '',
    left: '',
    width: '',
    height: '',
    fontSize: '',
    overflow: '',
    lineHeight: 1,
    fontFamily: 'Verdana',
    transformOrigin: '',
    textAlign: '',
    color: '',
    transform: ''
});

const onDragend = (e: any) => {
    if (e.target) {
        if (e.target.getType() === 'Group') {
            console.log('===> Group selected: ', e.target.name());
            wall[e.target.name()].x = e.target.x();
            wall[e.target.name()].y = e.target.y();
        } else if (e.target.constructor.name === '_Image') {
            const groupName = e.target.getParent().name();
            const imageName = e.target.name();
            selectConfig(groupName, imageName);
            syncPosition(e.target.x(), e.target.y());
        }
    }
}

const syncPosition = (x: number, y: number) => {
    if (selectedConfig.value) {
        selectedConfig.value.x = x;
        selectedConfig.value.y = y;
    }
}

const { paletteColor } = usePaletteColor();

const changeColor = (color: string) => {
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        selectedConfig.value.fill = color;
    }
}
</script>
<template>
    <div>
        <div class="py-2 px-3 bg-gray-50 flex flex-wrap items-center gap-4">
            <div class="flex items-center fixed top-0 right-0 max-w-2xl h-12 w-full bg-red-600">
                <div class="bg-black text-white text-xs p-1 w-full h-12 overflow-auto">
                    <div v-for="conf in selectedConfig">
                        <div v-for="confValue,confName in selectedConfig" class="p-1 border border-gray-200 py-1">
                            {{ confName }} => {{ confValue }}
                        </div>
                    </div>
                </div>
                <div class="bg-indigo-600 text-white text-xs h-12 overflow-auto w-full">
                    <div v-for="g in wall">
                        <div v-for="sValue,sName in g" class="p-1 border border-gray-200 py-1">
                            {{ sName }} => {{ sValue }}
                        </div>
                    </div>
                </div>
            </div>
            <Link
                :href="route('thematic.list')"
                class="btn btn-icon--xs btn-icon--flat btn-icon py-1"
            >
                <i class="fas fa-chevron-left text-red-600"></i>
            </Link>
            <div class="h-8 flex items-center">
                <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1 h-full">
                    <button @click.prevent="canvaStore.setZoomLevel('-')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="text-xs">{{ canvaStore.zoomLevel }}%</span>
                    <button @click.prevent="canvaStore.setZoomLevel('+')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button
                        v-show="canvaStore.zoomLevel !== 100"
                        class="btn btn-xs text-xs py-1 px-1 bg-orange-300 font-normal"
                        @click="canvaStore.resetZoomLevel()"
                    >Reset</button>
                </div>
            </div>
            <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1 h-full">
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 btn-icon--xs"
                    @click.prevent="addGroup()"
                >
                    <i class="fas fa-plus-circle"></i>
                </button>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 btn-icon--xs"
                    @click.prevent="addImageToWall()"
                >
                    <i class="fas fa-image"></i>
                </button>
                <div class="flex items-center">
                    <template v-for="color in paletteColor">
                        <button
                            class="w-4 h-4"
                            :style="{ backgroundColor: color }"
                            @click="changeColor(color)"></button>
                    </template>
                </div>
                <button
                    v-show="!isSaving"
                    class="btn btn-icon btn-xs btn-icon--flat bg-green-400 btn-icon--xs"
                    @click.prevent="saveWallToServer()"
                >
                    <i class="fas fa-save"></i>
                </button>
            </div>
            <tw-context-menu
                :on-image-add="pickImage"
                :on-image-remove="deleteImage"
            ></tw-context-menu>
            E: {{ editing }}
            Is ready: {{ isReady }}
        </div>
        <div class="bg-white canva relative" v-if="isReady">
            <textarea
                v-show="editing"
                ref="quoteAreaRef"
                class="quote-textarea"
                type="text"
                v-model="editedQuoteText"
                @blur="editQuote"
                @keyup.enter="editQuote"
                @keyup.escape="exitEditMode"
                :style="textareaStyle"
            ></textarea>
            <v-stage
                ref="stageRef"
                :config="stageConfig"
                @mousedown="handleStageMouseDown"
                @touchstart="handleStageMouseDown"
                @wheel="canvaStore.handleWheel"
                :draggable="true"
            >
                <v-layer>
                    <div>
                        <div class="px-4 py-2 shadow-lg bg-green-400 text-black font-bold rounded-full">
                            <v-group :config="groupConfig">
                                <v-rect :config="thematicRectConfig"></v-rect>
                                <v-text :config="thematicTextConfig"></v-text>
                            </v-group>
                        </div>
                        <div v-for="(group, groupName) in wall" :key="groupName">
                            <v-group
                                :config="group"
                                @transformend="handleTransformEnd"
                                @contextmenu="handleGroupContextMenu"
                                @dragend="onDragend"
                            >
                                <template v-for="config, configName in group.items" :key="configName">
                                    <v-text
                                        v-if="isTextConfig(config)"
                                        :config="config"
                                        @dblclick="enterEditMode"
                                        @mousedown="selectConfig(groupName, configName)"
                                        @transformend="handleTransformEnd"
                                    ></v-text>
                                    <v-image
                                        v-if="isImageConfig(config)"
                                        :config="config"
                                        @mousedown="selectConfig(groupName, configName)"
                                        @dragend="onDragend"
                                        @transformend="handleTransformEnd"
                                    />
                                </template>
                            </v-group>
                        </div>
                        <v-transformer ref="transformer" />
                    </div>
                </v-layer>
            </v-stage>
        </div>
    </div>
</template>

<style>
.canva {
    height: calc(100vh - 48px);
    overflow: hidden;
}
.quote-textarea {
    border: 2px solid yellow;
    padding: 0px;
    margin: 0px;
    overflow: hidden;
    background: none;
    outline: none;
    resize: none;
    top: 0; left: 50%;
    transform: translate(-50%, 0);
    outline: none;
}
</style>
