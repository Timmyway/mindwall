<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { safeJsonParse, uuid, imageToBase64, base64ToImage, resizeImage, loadImageFromURL } from '../../helpers/utils';
import { randInt, randPos } from '../../helpers/canva';
import { router, useForm, usePage } from '@inertiajs/vue3';
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
import useActionPanel from '../../composable/useActionPanel';
import TwImageGallery from '@/Components/media/TwImageGallery.vue';
import { User } from '@/types';
import { onUnmounted } from 'vue';
import { MenuItemCommandEvent } from 'primevue/menuitem';
import AiApi from '../../api/AiApi';
import useTextSetting from '@/composable/useTextSetting';
import Dropdown from 'primevue/dropdown';
import useMarkdownParser from '@/composable/useMarkdownParser';

const props = defineProps<{
    thematic: Thematic,
}>();

const canvaStore = useCanvasStore();
const { stageRef } = storeToRefs(canvaStore);

var MIN_WIDTH = 20;
const page = usePage();

const user = computed<User | null>((): User | null => page.props.user as User | null);

const isGalleryVisible = ref<boolean>(false);

const viewImageGallery = () => {
    isGalleryVisible.value = true;
}

const hideImageGallery = () => {
    setTimeout(() => {
        isGalleryVisible.value = false;
    }, 200);
}

const toggleImageGallery = () => {
    isGalleryVisible.value = !isGalleryVisible.value;
}

const { files, open, reset, onChange } = useFileDialog({
    accept: 'image/*', // Set to accept only image files
    directory: false, // Select directories instead of files if set true
})

const wall = reactive<WallConfig>({});

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

// const form = useForm({
//     thematicId: props.thematic.id,
//     wall: ''
// });

const isSaving = ref<boolean>(false);

const saveWallToServer = async () => {
    try {
        isSaving.value = true;
        const serializedWall = await serializeWall();
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

const deleteShape = () => {
    // Check if the selected config is available and is an ImageConfig
    if (selectedConfig.value) {
        // Get the selected group and config name
        const groupName = selectedGroupName.value;
        const configName = selectedConfigName.value;

        if (groupName && configName) {
            // Check if the group exists
            if (wall[groupName] && wall[groupName].items[configName]) {
                // Delete the shape config from the items object
                delete wall[groupName].items[configName];
                console.log(`---- 99 -> '${configName}' shape has been removed from group '${groupName}'`);

                // Check if the group is empty after deleting the shape
                if (Object.keys(wall[groupName].items).length === 0) {
                    // If the group is empty, delete the group itself
                    delete wall[groupName];
                    console.log(`---- 99 -> Group '${groupName}' has been removed because it became empty.`);
                }
            }
        }
    }
};

const addGroup = () => {
    const groupName = `group-${uuid()}`;
    console.log('==> Add new group: ', groupName);
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
    return groupName;
};

const isTextConfig = (config: any): config is TextConfig => {
    return (config as TextConfig).is === 'text';
};

const isImageConfig = (config: any): config is ImageConfig => {
    return (config as ImageConfig).is === 'image';
};

const { parseTextFromMarkDown } = useMarkdownParser();

const addAiTextToWall = async (e: any) => {
    // const thematicName = prompt('For which thematic?');
    // if (!thematicName || thematicName.trim() === '') {
    //     return;
    // }
    let thematicName = null;
    if (selectedConfig.value) {
        if (isTextConfig(selectedConfig.value)) {
            thematicName = selectedConfig.value.text;
        }
    } else {
        thematicName = prompt('For which thematic?');
        if (!thematicName || thematicName.trim() === '') {
            return;
        }
    }
    if (thematicName) {
        const response = await AiApi.aiGenerateText(thematicName);
        const generatedText = await parseTextFromMarkDown(response.data.generatedText);

        addTextToWall(e, generatedText);
    }
}

const addTextToWall = (e: MenuItemCommandEvent, text: string = 'New text...') => {
    let newGroupName = addGroup();
    let textIdentifier: string;
    if (selectedGroupName.value) {
        textIdentifier = `${selectedGroupName.value}-text-${uuid()}`;
    } else {
        textIdentifier = `${newGroupName}-text-${uuid()}`;
    }

    const newTextConfig: TextConfig = {
        id: textIdentifier,
        name: textIdentifier,
        is: 'text',
        rotation: 0,
        x: center.x - 10,
        y: center.y -50,
        scaleX: 1,
        scaleY: 1,
        fontFamily: 'Calibri',
        fontSize: 24,
        text: text,
        fill: 'black',
        visible: true,
        width: 320
    };

    if (selectedGroupName.value) {
        console.log('==========> Add into group: ', selectedGroupName.value);
        console.log('==========> the following text: ', newTextConfig);
        wall[selectedGroupName.value].items[textIdentifier] = newTextConfig;
    } else {
        wall[newGroupName] = {
            id: newGroupName,
            name: newGroupName,
            is: 'group',
            scaleX: 1,
            scaleY: 1,
            visible: true,
            draggable: true,
            items: {}
        };
        wall[newGroupName].items[textIdentifier] = newTextConfig;
    }
};

const calcOptimizedImageDimension = (
    im: HTMLImageElement,
    maxWidth = 300,
    maxHeight = 300
): { w:number, h:number } => {
    // Get the real size of the image
    const realWidth = im.naturalWidth;
    const realHeight = im.naturalHeight;

    // Calculate the aspect ratio
    let width = realWidth;
    let height = realHeight;

    // If the image exceeds the maximum dimensions, resize it while maintaining the aspect ratio
    if (realWidth > maxWidth || realHeight > maxHeight) {
        const widthRatio = maxWidth / realWidth;
        const heightRatio = maxHeight / realHeight;
        const minRatio = Math.min(widthRatio, heightRatio);
        width = Math.round(realWidth * minRatio);
        height = Math.round(realHeight * minRatio);
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

const handleMouseRelease = () => {
    if (selectedConfig.value) {
        if (isTextConfig(selectedConfig.value)) {
            console.log('-- 12 -> Mouse release');
            // selectedConfig.value.draggable = false;
        }
    }
}

const handleTextBlur = () => {
    console.log('-- 20 -> Text shape has losen focus');
    if (selectedConfig.value) {
        selectedConfig.value.draggable = false;
    }
}

const handleTextMouseDown = (e: any, groupName: string, configName: string) => {
    selectConfig(groupName, configName)
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        console.log('-- 11 -> Set fontsize to : ', selectedConfig.value.fontSize);
        setFontSize(selectedConfig.value.fontSize);
        console.log('-- 12 -> Mouse down on text shape');
        // Check if Ctrl key is pressed
        const ctrl = e.evt.ctrlKey || e.evt.metaKey;
        if (ctrl) {
            selectedConfig.value.draggable = true;
            console.log('-- 13 -> Text should be draggable', selectedConfig.value.draggable);
        } else {
            selectedConfig.value.draggable = false;
        }
    }
    updateTransformer();
}

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
        if (isTextConfig(selectedConfig.value)) {
            selectedConfig.value.width = e.target.width();
        }
    }
}

const onTextClick = (e: any) => {
    // Check if Ctrl key is pressed
    const ctrl = e.evt.ctrlKey || e.evt.metaKey; // metaKey for Mac Command key
    console.log('-- 11 -> Is Ctrl key holded: ', ctrl);
    if (selectedConfig.value) {
        selectedConfig.value.draggable = ctrl ? true : false;
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
    const calculatedWidth = (
        (textNode?.width?.() ?? 0) * 5 -
        ((textNode?.padding?.() ?? 0) * 2)
    );
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

const onDragstart = (e: any) => {
    if (e.target) {
        if (e.target.getType() === 'Group') {
            e.target.opacity(0.5);
            console.log('==> Group draggable: ', e.target.draggable());
        }
    }
}

const onDragend = (e: any) => {
    if (e.target) {
        if (e.target.getType() === 'Group') {
            console.log('===> Group selected: ', e.target.name());
            e.target.opacity(1)
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
const { fontSize, setFontSize, availableTextSize, decreaseFontSize, increaseFontSize } = useTextSetting();
const updateFontSize = (mode: '+' | '-' | null = null) => {
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        if (mode === '+') {
            increaseFontSize();
        } else if (mode === '-') {
            decreaseFontSize();
        }
        selectedConfig.value.fontSize = fontSize.value;
    }
}

const changeColor = (color: string) => {
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        selectedConfig.value.fill = color;
    }
    hidePanel('palette');
}

/* RELATED TO ACTION PANEL */
const { viewPanel, showPanel, hidePanel, togglePanel } = useActionPanel();

/* SET ZINDEX */
const bringToTop = () => {
    if (selectedConfig.value && selectedGroupName.value) {
        const groupName = selectedGroupName.value;
        const configName = selectedConfig.value.name;

        const group = wall[groupName];
        if (group && group.items) {
            const items = Object.values(group.items);

            // Find the maximum zIndex among siblings
            const maxZIndex = items.reduce((maxIndex, item) => {
                return item.zIndex !== undefined && item.zIndex > maxIndex ? item.zIndex : maxIndex;
            }, -1);

            // Calculate the new zIndex
            const newZIndex = maxZIndex + 1;

            // Check if the new zIndex exceeds the expected range
            if (newZIndex >= items.length) {
                // Adjust zIndex to stay within valid range
                selectedConfig.value.zIndex = items.length - 1;
                console.warn(`Adjusted zIndex to ${items.length - 1} to stay within valid range.`);
            } else {
                selectedConfig.value.zIndex = newZIndex;
            }

            console.log(`Set zIndex of ${configName} to ${selectedConfig.value.zIndex}`);
        }
    }
};

const bringToBack = () => {
    if (selectedConfig.value && selectedGroupName.value) {
        const groupName = selectedGroupName.value;
        const configName = selectedConfig.value.name;

        const group = wall[groupName];
        if (group && group.items) {
            const items = Object.values(group.items);

            // Find the minimum zIndex among siblings, ensuring undefined zIndexes are ignored
            const minZIndex = items.reduce((minIndex, item) => {
                if (item.zIndex !== undefined) {
                    return item.zIndex < minIndex ? item.zIndex : minIndex;
                }
                return minIndex;
            }, Number.MAX_SAFE_INTEGER);

            // Calculate the new zIndex
            let newZIndex = minZIndex - 1;

            // Ensure newZIndex is non-negative and within the range of siblings
            newZIndex = Math.max(0, newZIndex);

            // If the newZIndex is still higher than the zIndex of all items, set it to 0
            if (newZIndex < minZIndex) {
                newZIndex = 0;
            }

            // Set the zIndex
            selectedConfig.value.zIndex = newZIndex;

            console.log(`Set zIndex of ${configName} to ${selectedConfig.value.zIndex}`);
        }
    }
};

const cloneGroup = (groupName: string): string | null => {
    const originalGroup = wall[groupName];
    if (!originalGroup) return null;

    const newGroupName = addGroup();
    const newGroup = wall[newGroupName];

    // Clone properties of the original group
    newGroup.scaleX = originalGroup.scaleX;
    newGroup.scaleY = originalGroup.scaleY;
    newGroup.visible = originalGroup.visible;
    newGroup.draggable = originalGroup.draggable;

    // Clone items of the original group and generate unique IDs for each
    Object.keys(originalGroup.items).forEach(itemId => {
        const originalItem = originalGroup.items[itemId];
        const itemCopyName = `${newGroupName}-${originalItem.is}-${uuid()}`;
        const newItem = { ...originalItem, id: itemCopyName, name: itemCopyName };
        newGroup.items[newItem.id] = newItem;
    });

    return newGroupName;
};

const handleCloneGroup = (event: MenuItemCommandEvent) => {
    if (selectedGroupName.value) {
        const clonedGroupName = cloneGroup(selectedGroupName.value);
        console.log('Cloned group:', clonedGroupName);
    }
};

onMounted(() => {
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            // Handle delete key press
            deleteShape();
        }
    };

    window.addEventListener('keydown', handleKeydown);

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
    });
});
const handleKeyup = () => {

}

const handleTransform = (e: any) => {
    if (e.target) {
        const textNode = e.target;
        console.log('=====> New width: ', textNode.width() * textNode.scaleX())
        textNode.setAttrs({
            width: Math.max(textNode.width() * textNode.scaleX(), MIN_WIDTH),
            scaleX: 1,
            scaleY: 1,
        });
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
            <div class="h-8 flex items-center relative">
                <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1 h-full">
                    <button @mouseover.prevent="viewImageGallery">
                        <i class="fas fa-images"></i>
                    </button>
                    <div
                        v-show="isGalleryVisible"
                        class="fixed top-10 left-0 bg-white z-20 p-2"
                        @mouseleave.prevent="hideImageGallery"
                    >
                        <tw-image-gallery
                            :upload="true"
                            :scrollable="true"
                            :user="user"
                            class="max-w-xs"
                            :max-height="480"
                            @select="addImageToWall"
                        ></tw-image-gallery>
                    </div>
                </div>
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
            <div class="relative flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1 h-full">
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 btn-icon--xs"
                    @click.prevent="addTextToWall"
                >
                    <i class="fas fa-plus-circle"></i>
                </button>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-pink-400 btn-icon--xs"
                    @click.prevent="addAiTextToWall"
                >
                    <i class="fas fa-robot"></i>
                </button>
                <button
                    class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 btn-icon--xs"
                    @click.prevent="addImageToWall()"
                >
                    <i class="fas fa-image"></i>
                </button>
                <div class="flex items-center">
                    <button class="btn btn-icon btn-xs btn-icon--flat btn-icon--xs"
                        @mouseover="showPanel('palette')"
                    >
                        <i class="fas fa-font"></i>
                    </button>
                    <div
                        v-show="viewPanel.palette"
                        class="absolute top-full w-full max-w-xs bg-white z-10 p-2 flex flex-wrap gap-[3px]"
                        style="box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;"
                        @mouseleave="hidePanel('palette')">
                        <template v-for="color in paletteColor">
                            <button
                                class="btn btn-icon p-0 w-4 h-4 rounded-full"
                                :style="{ backgroundColor: color }"
                                @click="changeColor(color)"></button>
                        </template>
                    </div>
                </div>
                <div v-show="selectedConfig && isTextConfig(selectedConfig)" class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1">
                    <button @click.prevent="updateFontSize('-')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <Dropdown
                        v-model="fontSize"
                        :options="availableTextSize"
                        placeholder="Font size"
                        class="w-full md:w-23"
                        @change="updateFontSize()"
                    />
                    <button @click.prevent="updateFontSize('+')">
                        <i class="fas fa-plus"></i>
                    </button>
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
                :handle-add-image="pickImage"
                :handle-remove-shape="deleteShape"
                :handle-add-text="addTextToWall"
                :handle-clone="handleCloneGroup"
                :handle-bring-to-top="bringToTop"
                :handle-bring-to-back="bringToBack"
            ></tw-context-menu>
            <div class="flex items-center gap-2 max-w-[100px] overflow-x-auto">
                <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Editing: {{ editing }}</div>
                <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Ready: {{ isReady }}</div>
                <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Draggable: ({{ selectedConfig?.draggable }})</div>
            </div>
            <i :class="['fas', selectedConfig?.draggable ? 'fa-unlock text-green-600' : 'fa-lock text-red-600']"></i>
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
                @keyup="handleKeyup"
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
                                @dragstart="onDragstart"
                                @dragend="onDragend"
                            >
                                <template v-for="config, configName in group.items" :key="configName">
                                    <v-text
                                        v-if="isTextConfig(config)"
                                        :config="config"
                                        @dblclick="enterEditMode"
                                        @click="handleTextMouseDown($event, String(groupName), String(configName))"
                                        @dragend="handleTextBlur"
                                        @transform="handleTransform"
                                        @transformend="handleTransformEnd"
                                    ></v-text>
                                    <v-image
                                        v-if="isImageConfig(config)"
                                        :config="config"
                                        @mousedown="selectConfig(String(groupName), String(configName))"
                                        @dragend="onDragend"
                                        @transformend="handleTransformEnd"
                                    />
                                </template>
                            </v-group>
                        </div>
                        <v-transformer ref="transformer" :config="{
                            enabledAnchors: ['middle-left', 'middle-right', 'bottom-right'],
                        }" />
                    </div>
                </v-layer>
            </v-stage>
        </div>
    </div>
</template>

<style>
.canva {
    width: 100%;
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
