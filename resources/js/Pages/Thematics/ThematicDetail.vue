<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { safeJsonParse, uuid, imageToBase64, base64ToImage, resizeImage, loadImageFromURL } from '../../helpers/utils';
import { randInt, randPos } from '../../helpers/canva';
import { router, useForm, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useCanvasStore } from '../../store/canvasStore';
import { storeToRefs } from 'pinia';
import { TextConfig, ImageConfig } from '../../types/konva.config';
import { Thematic, Engine, Language } from '../../types/thematic.types';
import { Text } from 'konva/lib/shapes/Text';
import { reactive } from 'vue';
import { TextareaStyle } from '../../types/canvas.types'
import TwContextMenu from '../../Components/menu/TwContextMenu.vue';
import { useFileDialog } from '@vueuse/core'
import usePaletteColor from '../../composable/usePaletteColor';
import canvasApi from '../../api/canvasApi';
import useActionPanel from '../../composable/useActionPanel';
import TwImageGallery from '@/Components/media/TwImageGallery.vue';
import { User } from '@/types';
import { onUnmounted } from 'vue';
import { MenuItemCommandEvent } from 'primevue/menuitem';
import AiApi from '../../api/AiApi';
import useMarkdownParser from '@/composable/useMarkdownParser';
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useWidgetSettingStore } from '@/store/widgetSettingStore';
import TwLoading from '@/Components/ui/TwLoading.vue';
import { TextGeneratorOption } from '@/types/infinidea.types';
import TwMenubarPaletteColor from '@/Components/menubar/TwMenubarPaletteColor.vue';
import TwZoomLevel from '@/Components/menubar/TwZoomLevel.vue';
import TwActionText from '@/Components/menubar/TwActionText.vue';
import { useCommandBarStore } from '@/store/commandBarStore';
import TwImageBankGallery from '@/Components/media/TwImageBankGallery.vue';
import Dropdown from 'primevue/dropdown';

const props = defineProps<{
    thematic: Thematic,
    engines: Engine[],
    languages: Language[]
}>();

const canvaStore = useCanvasStore();
const widgetStore = useWidgetSettingStore();
const commandBarStore = useCommandBarStore();

const { stageRef } = storeToRefs(canvaStore);
const { isTextConfig, isImageConfig } = useCanvasConditions();

var MIN_WIDTH = 20;
const page = usePage();
const user = computed<User | null>((): User | null => page.props.user as User | null);

const isGalleryVisible = ref<boolean>(false);
const isBankGalleryVisible = ref<boolean>(false);

const viewImageGallery = () => {
    isGalleryVisible.value = true;
}

const hideImageGallery = () => {
    setTimeout(() => {
        isGalleryVisible.value = false;
    }, 200);
}

const viewBankImageGallery = () => {
    isBankGalleryVisible.value = true;
}

const hideBankImageGallery = () => {
    setTimeout(() => {
        isBankGalleryVisible.value = false;
    }, 200);
}

const toggleImageGallery = () => {
    isGalleryVisible.value = !isGalleryVisible.value;
}

const { files, open, reset, onChange } = useFileDialog({
    accept: 'image/*', // Set to accept only image files
    directory: false, // Select directories instead of files if set true
})

// const form = useForm({
//     thematicId: props.thematic.id,
//     wall: ''
// });

const isSaving = ref<boolean>(false);

const saveWallToServer = async () => {
    try {
        isSaving.value = true;
        const serializedWall = await canvaStore.serializeWall();
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
        const deserialized = await canvaStore.deserializeWall(thematicWall);

        // Use Object.assign to merge properties into the reactive wall object
        Object.assign(canvaStore.wall, deserialized);
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
//         fontFamily: 'Montserrat',
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
            if (canvaStore.wall[groupName] && canvaStore.wall[groupName].items[configName]) {
                // Delete the shape config from the items object
                delete canvaStore.wall[groupName].items[configName];
                console.log(`---- 99 -> '${configName}' shape has been removed from group '${groupName}'`);

                // Check if the group is empty after deleting the shape
                if (Object.keys(canvaStore.wall[groupName].items).length === 0) {
                    // If the group is empty, delete the group itself
                    delete canvaStore.wall[groupName];
                    console.log(`---- 99 -> Group '${groupName}' has been removed because it became empty.`);
                }
            }
        }
    }
};

const addGroup = () => {
    const groupName = `group-${uuid()}`;
    console.log('==> Add new group: ', groupName);
    canvaStore.wall[groupName] = {
        id: groupName,
        name: groupName,
        is: 'group',
        scaleX: 1,
        scaleY: 1,
        visible: true,
        draggable: true,
        items: {},
    };
    return groupName;
};

const { parseTextFromMarkDown } = useMarkdownParser();

const addAiTextToWall = async (iaFeeling = 'cold', base64Image: string | null = null) => {
    // const thematicName = prompt('For which thematic?');
    // if (!thematicName || thematicName.trim() === '') {
    //     return;
    // }
    widgetStore.isLoading.aiGenerateText = true;
    try {
        let thematicName = null;
        const aiOption: TextGeneratorOption = {
            engine: widgetStore.usedEngine.slug,
            base64Image: null,
            language: widgetStore.usedLanguage,
        }

        if (selectedConfig.value) {
            if (isTextConfig(selectedConfig.value)) {
                thematicName = selectedConfig.value.text;
            }
            else if (isImageConfig(selectedConfig.value)) {
                thematicName = 'Infinidea-Image';
                aiOption.base64Image = await imageToBase64(selectedConfig.value.image as HTMLImageElement);
            }
        } else {
            thematicName = prompt('For which thematic?');
            if (!thematicName || thematicName.trim() === '') {
                widgetStore.isLoading.aiGenerateText = false;
                return;
            }
        }
        console.log('===> Detail: ');
        if (thematicName) {
            // Back up the initial group to which the generated text belongs
            const groupName = selectedGroupName.value ?? '';
            const response = await AiApi.aiGenerateText(thematicName, iaFeeling, aiOption);
            // const generatedText = await parseTextFromMarkDown(response.data.generatedText);
            const generatedText = await response.data.generatedText;

            addTextToWall(generatedText, groupName);
            widgetStore.isLoading.aiGenerateText = false;
        } else {
            widgetStore.isLoading.aiGenerateText = false;
        }
    } catch (error) {
        console.log('Error: ', error);
        widgetStore.isLoading.aiGenerateText = false;
    }
}

const aiImageExplain = async (iaFeeling: string) => {
    if (isImageConfig(selectedConfig.value)) {
        // console.log('Ai image explain', selectedConfig.value.image.src);
        const base64Image = await imageToBase64(selectedConfig.value.image as HTMLImageElement);
        if (base64Image) {
            addAiTextToWall(iaFeeling, base64Image);
        }
    }
}

const addTextToWall = (text: string = 'Unleash your thoughts !', groupName = '') => {
    let newGroupName = addGroup();
    let textIdentifier: string;
    if (selectedGroupName.value) {
        textIdentifier = `${selectedGroupName.value}-text-${uuid()}`;
    } else {
        textIdentifier = `${newGroupName}-text-${uuid()}`;
    }

    // Estimate the position of a new Text, place it near the parent if possible.
    let estimateX = center.x - 10;
    let estimateY = center.y -50;
    if (selectedConfig.value) {
        estimateX = selectedConfig.value.x ?? (center.x - 10);
        estimateY = selectedConfig.value?.y ? (selectedConfig.value?.y - 50) : (center.y - 50);
    }

    const newTextConfig: TextConfig = {
        id: textIdentifier,
        name: textIdentifier,
        is: 'text',
        rotation: 0,
        x: estimateX,
        y: estimateY,
        scaleX: 1,
        scaleY: 1,
        fontFamily: 'Montserrat',
        fontSize: 20,
        text: text,
        fill: 'black',
        visible: true,
        width: 640,
        align: 'left',
        lineHeight: 1.7,
    };

    const targetGroup = groupName || selectedGroupName.value;

    if (targetGroup) {
        console.log('==========> Add into group: ', targetGroup);
        console.log('==========> the following text: ', newTextConfig);
        console.log('==========> Found groupname: ', groupName);

        canvaStore.wall[targetGroup].items[textIdentifier] = newTextConfig;
    } else {
        canvaStore.wall[newGroupName] = {
            id: newGroupName,
            name: newGroupName,
            is: 'group',
            scaleX: 1,
            scaleY: 1,
            visible: true,
            draggable: true,
            items: {}
        };
        canvaStore.wall[newGroupName].items[textIdentifier] = newTextConfig;
    }
};

const calcOptimizedImageDimension = (
    im: HTMLImageElement,
    maxWidth = 480,
    maxHeight = 320
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
    let groupName;
    if (selectedGroupName.value) {
        groupName = selectedGroupName.value;
    } else {
        groupName = addGroup();
    }
    const imageIdentifier = `${groupName}-image-${uuid()}`;
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

            canvaStore.wall[groupName].items[imageIdentifier] = newImageConfig;
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

                canvaStore.wall[groupName].items[imageIdentifier] = newImageConfig;
            }
        };
        reader.readAsDataURL(src);
    }
    hideBankImageGallery();
};

const removeConfig = (groupName: string, configName: string) => {
    if (canvaStore.wall[groupName] && canvaStore.wall[groupName].items[configName]) {
    delete canvaStore.wall[groupName].items[configName];
    } else {
    console.log(`Config with name ${configName} not found in group ${groupName}.`);
    }
};

const removeText = (groupName: string, textId: string) => {
    if (canvaStore.wall[groupName] && canvaStore.wall[groupName].items[textId]) {
        delete canvaStore.wall[groupName].items[textId];
    } else {
    console.log(`Text with id ${textId} not found in group ${groupName}.`);
    }
};

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
        console.log('-- 11 -> Set fontsize & family');
        commandBarStore.setFontSize(selectedConfig.value.fontSize);
        commandBarStore.setFontFamily(selectedConfig.value.fontFamily);
        // Check if selectedConfig.value.align is not undefined
        if (typeof selectedConfig.value.align !== 'undefined') {
            console.log('====================> Update alignement: ', selectedConfig.value.align)
            commandBarStore.setTextAlign(selectedConfig.value.align);
        } else {
            commandBarStore.setTextAlign('left');
        }
        console.log('-- 11 -> Set fontsize to : ', selectedConfig.value.fontSize);
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

const transformerConfig = computed(() => {
    const tempConfig = { enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] };

    if (selectedConfig.value) {
        if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        tempConfig.enabledAnchors = ['middle-left', 'middle-right'];
        } else if (isImageConfig(selectedConfig.value)) {
            tempConfig.enabledAnchors = ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'];
        }
    }
    return tempConfig;
});

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
    width: 100, // Add some padding
    height: 30, // Add some padding
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 2,
    shadowBlur: 1,
};

const thematicTextConfig = ref({
    x: center.x + 20,
    y: center.y + 5,
    text: props.thematic.name,
    ellipsis: true,
    align: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontFamily: 'Impact',
    color: 'black',
});

const { selectedConfig, selectedGroupName, selectedConfigName, wall } = storeToRefs(canvaStore);

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
    } else {
        console.log('CLicked element ==> ', e.target);
        console.log('Last text ==> ', lastEditedText.value?.config);
        if (editing.value && selectedConfig.value?.name !== lastEditedText.value.config) {
            exitEditMode();
        }
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
    if (stageRef.value) {
        if (e.target === stageRef.value.getStage()) {
            console.log('===> We are on an empty place of the stage');
            return;
        }
    }
    if (canvaStore.menu) {
        canvaStore.menu.show(e.evt);
        const currentShape = e.target;
        console.log('===> Current shape: ', currentShape);
    }

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

// const handleQuoteDblClicked = (e: Event) => {
//     console.log('Double clicked');
//     const textNode = e.target as Text | null;
//     // Find the quote config that was double-clicked
//     const quote = findQuote(textNode?.name() ?? '');

//     if (quote) {
//         // Reset the rotation to 0
//         quote.rotation = 0;
//     }
// }

// const handleQuoteEditText = (name: string, text: string) => {
//     console.log('Edit quote: ', name);
//     // Find the quote config that was double-clicked
//     const quote = findQuote(name);
//     if (quote) {
//         quote.text = text;
//     }
// }

const editing = ref(false);
const editedQuoteText = ref<string>('');
const quoteAreaRef = ref();

const enterEditMode = (e: Event) => {
    const textNode = e.target as Text | null;

    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        selectedConfig.value.visible = false;
    }
    // hide text node and transformer:
    transformer.value.getNode().hide();

    // So position of textarea will be the sum of positions above:
    const textPosition = textNode?.absolutePosition() ?? { x: 0, y: 0 };
    // const areaPosition = {
    //     x: stageRef.value.getStage().container().offsetLeft + textPosition.x,
    //     y: stageRef.value.getStage().container().offsetTop + textPosition.y,
    // };
    // Set its dimension
    const calculatedWidth = (
        // Get the width of the text node. If it doesn't exist, default to 0.
        // Multiply by 1 (or other ratio) to ensure it's a number
        // Do the same with padding (take it into account)
        (textNode?.width?.() ?? 0) * 1 -
        ((textNode?.padding?.() ?? 0) * 2)
    );
    const textNodeHeight = (textNode?.height() ?? 0) - (textNode?.padding() ?? 0) * 2 + 5;
    const constrainedWidth = Math.max(320, Math.min(calculatedWidth, 480));
    const contrainedHeight = Math.min(360, Math.max(textNodeHeight, 72));
    textareaStyle.width = constrainedWidth + 'px';
    textareaStyle.height = contrainedHeight + 'px';


    if (stageRef.value) {
        const stage = stageRef.value.getStage();
        // const areaPosition = {
        //     x: stage.container().offsetLeft + (textPosition?.x) + (calculatedWidth),
        //     y: stage.container().offsetTop + (textPosition?.y),
        // };
        const areaPosition = {
            x: textPosition?.x + (calculatedWidth / 2) + 10,
            y: textPosition?.y,
        };
        console.log('Offset x: ', stage.container().offsetLeft)
        console.log('Offset y: ', stage.container().offsetTop)
        console.log('Text position: ', textPosition)
        console.log('Area position: ', areaPosition);
        console.log('Text node: ', textNode?.align());
        // Set textarea position
        textareaStyle.left = areaPosition.x + 'px';
        textareaStyle.top = areaPosition.y + 'px';
    }

    // Set typography related styles
    console.log('=====> Scale: ', textNode?.scale()?.x);
    textareaStyle.fontSize = textNode?.fontSize() + 'px';
    textareaStyle.lineHeight = textNode?.lineHeight() ?? 1.5;
    textareaStyle.fontFamily = textNode?.fontFamily() ?? 'Montserrat';
    textareaStyle.transformOrigin = 'left top';
    textareaStyle.textAlign = 'left';
    textareaStyle.color = 'black';
    textareaStyle.zIndex = 999;

    setTimeout(() => {
        quoteAreaRef.value.focus();
    }, 0);

    console.log('--> TEXTAREA STYLE: ', textareaStyle)
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        editedQuoteText.value = selectedConfig.value.text.trim();
    }
    backupLastEditedText();
    editing.value = true;
}

const lastEditedText = ref({group: '', config: ''});
const backupLastEditedText = () => {
    if (selectedConfig.value && lastEditedText.value && isTextConfig(selectedConfig.value)) {
        lastEditedText.value.group = selectedGroupName.value ?? '';
        lastEditedText.value.config = selectedConfigName.value ?? '';
    }
}

const restoreLastEditedText = () => {
    if (lastEditedText.value) {
        selectedGroupName.value = lastEditedText.value.group;
        selectedConfigName.value = lastEditedText.value.config;
    }
    lastEditedText.value = { group: '', config: '' };
};

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
    restoreLastEditedText();
}

const autoResizeTextarea = () => {
    if (quoteAreaRef.value) {
        quoteAreaRef.value.style.height = 'auto'; // Reset the height
        quoteAreaRef.value.style.height = `${quoteAreaRef.value.scrollHeight}px`;
    }
};

const editQuote = (e: any) => {
    if (selectedConfig.value && isTextConfig(selectedConfig.value)) {
        // selectedConfig.value.fontSize = 20;
        // selectedConfig.value.fontFamily = 'Monospace';
        selectedConfig.value.rotation = 0;
    }
    if (e.key === 'Enter') {
        if (e.altKey) {
            // User pressed Alt + Enter, do not exit edit mode
            console.log('===> Alt + Enter pressed, staying in edit mode');
            // editedQuoteText.value += '\n';
            exitEditMode();
            // setTimeout(() => {
            //     autoResizeTextarea();
            // }, 0);
            // Trigger textarea resize

            return; // Prevent exiting edit mode
        }
        console.log('===> From Enter');
    }
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
    lineHeight: 1.5,
    fontFamily: 'Montserrat',
    transformOrigin: '',
    textAlign: 'left',
    color: '',
    transform: '',
    zIndex: 0,
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
        console.log('================> Target: ', e.target.getType());
        if (e.target.getType() === 'Group') {
            const targetName = e.target.name();
            console.log('===> Group selected: ', targetName);
            e.target.opacity(1)

            canvaStore.wall[targetName].x = e.target.x();
            canvaStore.wall[targetName].y = e.target.y();
        } else if (isTextConfig(selectedConfig.value)) {
            console.log('================> TTTTTTTTTTTT');
            syncPosition(e.target.x(), e.target.y());
            handleTextBlur();
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
    hidePanel('palette');
}

/* RELATED TO ACTION PANEL */
const { viewPanel, showPanel, hidePanel, togglePanel } = useActionPanel();

/* SET ZINDEX */
const bringToTop = () => {
    if (selectedConfig.value && selectedGroupName.value) {
        const groupName = selectedGroupName.value;
        const configName = selectedConfig.value.name;

        console.log('============> S', selectedConfig.value);

        const group = canvaStore.wall[groupName];
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
                transformer.value.zIndex = items.length - 1;
                console.warn(`Adjusted zIndex to ${items.length - 1} to stay within valid range.`);
            } else {
                selectedConfig.value.zIndex = newZIndex;
                transformer.value.zIndex = newZIndex;
                console.log('====> Transformer: ', transformer.value.getNode());
            }

            console.log(`Set zIndex of ${configName} to ${selectedConfig.value.zIndex}`);
        }
    }
};

const bringToBack = () => {
    if (selectedConfig.value && selectedGroupName.value) {
        const groupName = selectedGroupName.value;
        const configName = selectedConfig.value.name;

        const group = canvaStore.wall[groupName];
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

            console.log(`Set zIndex of ${configName} to ${selectedConfig.value.zIndex} of ${minZIndex}`);
        }
    }
};

const cloneGroup = (groupName: string): string | null => {
    const originalGroup = canvaStore.wall[groupName];
    if (!originalGroup) return null;

    const newGroupName = addGroup();
    const newGroup = canvaStore.wall[newGroupName];

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
            if (!editing.value) {
                deleteShape();
            }
        }
        if (event.altKey) {
            event.preventDefault();
            return;
        }
    };

    const preventZoom = (event: WheelEvent) => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('wheel', preventZoom, { passive: false });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('wheel', preventZoom);
        console.log('==> Unmount now... Destory the wall');
        canvaStore.wall = {};
        stageRef.value?.getStage().destroy();
    });
});
const handleKeyup = () => {

}

const handleTransform = (e: any) => {
    if (e.target) {
        const textNode = e.target;
        textNode.setAttrs({
            width: Math.max(textNode.width() * textNode.scaleX(), MIN_WIDTH),
            scaleX: 1,
            scaleY: 1,
        });
    }
}

const handleCommandBarMouseLeave = () => {
    hideImageGallery();
    hideBankImageGallery();
}
</script>
<template>
<div
    class="tw-mindwall-toolbar relative px-3 flex flex-wrap items-center gap-4 h-16 border-2"
    @mouseleave.prevent="handleCommandBarMouseLeave"
>
    <div class="mindwall-debug flex items-center fixed top-0 right-0 max-w-2xl h-12 w-full bg-red-600 z-50">
        <div class="bg-black text-white text-xs p-1 w-full h-12 overflow-auto scroll-smooth">
            <div class="py-2 flex flex-col gap-2">
                <span>x: {{ selectedConfig?.x }} | y: {{ selectedConfig?.y }}</span>
                <span>StageX{{ stageRef?.getStage()?.x() }} | StageY: {{ stageRef?.getStage()?.y() }}</span>
            </div>
            <div v-for="confValue,confName in selectedConfig" class="p-1 border border-gray-200 py-1">
                <div class="h-12">
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
    <div class="h-8 flex items-center gap-2">
        <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 h-full">
            <button @mouseover.prevent="viewImageGallery">
                <i class="fas fa-images text-2xl"></i>
            </button>
            <div
                v-show="isGalleryVisible"
                class="absolute top-full left-0 bg-white z-20 p-2"
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
        <div class="flex items-center gap-3 text-xs bg-yellow-400 border border-gray-300 rounded px-2 h-full">
            <button @mouseover.prevent="viewBankImageGallery">
                <i class="fas fa-images text-2xl text-black"></i>
            </button>
            <div
                v-show="isBankGalleryVisible"
                class="absolute top-full left-0 transform z-20 w-full h-[80vh]"
                @mouseleave.prevent="hideBankImageGallery"
            >
                <tw-image-bank-gallery
                    @select="addImageToWall"
                    @close="hideBankImageGallery"
                ></tw-image-bank-gallery>
            </div>
        </div>
        <div class="flex items-center gap-3 text-xs bg-white text-black border border-gray-300 rounded px-2 py-1 h-full transition-all">
            <tw-zoom-level></tw-zoom-level>
        </div>
    </div>
    <div class="flex items-center gap-3 text-xs rounded px-2 py-1 h-full">
        <button
            v-show="!isSaving"
            class="btn btn-icon btn-xs btn-icon--flat bg-green-400 w-8 h-8 p-2"
            @click.prevent="saveWallToServer()"
        >
            <i class="fas fa-save text-xl text-black"></i>
        </button>
        <button
            class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2"
            @click.prevent="addTextToWall()"
        >
            <i class="fas fa-plus-circle text-xl text-black"></i>
        </button>
        <div class="flex items-center gap-2">
            <tw-loading :is-visible="widgetStore.isLoading.aiGenerateText"></tw-loading>
            <Dropdown
                v-model="widgetStore.usedEngine"
                :options="engines"
                option-label="name"
                placeholder="Engine"
                class="w-full max-w-xs"
            >
                <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center gap-2">
                        <i :class="['fa', slotProps.value.icon_class]"></i>
                        <div>{{ slotProps.value.name }}</div>
                    </div>
                    <span v-else>
                        {{ slotProps.value.name }}
                    </span>
                </template>
                <template #option="slotProps">
                    <div class="flex items-center gap-4">
                        <i :class="['fa', slotProps.option.icon_class]"></i>
                        <div>{{ slotProps.option.name }}</div>
                    </div>
                </template>
            </Dropdown>
            <Dropdown
                v-model="widgetStore.usedLanguage"
                :options="languages"
                option-label="flag"
                option-value="name"
                placeholder="Language"
                class="w-full max-[120px]"
            ></Dropdown>
            <div class="flex items-center gap-4 w-[150px]">
                <button
                    v-show="!widgetStore.isLoading.aiGenerateText"
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
                    @click.prevent="addAiTextToWall()"
                >
                    <i class="fas fa-robot text-blue-600 text-xl"></i>
                </button>
                <button
                    v-show="!widgetStore.isLoading.aiGenerateText"
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
                    @click.prevent="addAiTextToWall('hot')"
                >
                    <i class="fas fa-robot text-orange-600 text-xl"></i>
                </button>
                <button
                    v-show="!widgetStore.isLoading.aiGenerateText"
                    class="btn btn-icon btn-xs btn-icon--flat bg-gray-50 w-8 h-8 p-2"
                    @click.prevent="aiImageExplain('hot')"
                >
                    <i class="fas fa-camera text-black"></i>
                </button>
            </div>
        </div>
        <!--
        <button
            class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2"
            @click.prevent="addImageToWall()"
        >
            <i class="fas fa-image text-black"></i>
        </button>
        -->

        <div v-show="isTextConfig(selectedConfig)" class="flex items-center gap-2">
            <!-- SETTING: color palette -->
            <div class="flex items-center">
                <button class="btn btn-icon btn-xs btn-icon--flat btn-icon--xs"
                    @mouseover="showPanel('palette')"
                >
                    <i class="fas fa-font"></i>
                </button>
                <tw-menubar-palette-color
                    :palette-color="paletteColor"
                    :is-visible="viewPanel.palette"
                    :handle-change-color="changeColor"
                    :handle-hide-panel="hidePanel"
                ></tw-menubar-palette-color>
            </div>
            <!-- SETTING: text size -->
            <div class="flex items-center gap-3 text-xs border border-gray-300 rounded px-2 py-1">
                <tw-action-text></tw-action-text>
            </div>
        </div>
    </div>
    <tw-context-menu
        :handle-add-image="pickImage"
        :handle-remove-shape="deleteShape"
        :handle-add-text="(e) => addTextToWall()"
        :handle-clone="handleCloneGroup"
        :handle-bring-to-top="bringToTop"
        :handle-bring-to-back="bringToBack"
        :handle-text-ai-generate="(e) => addAiTextToWall()"
        :handle-center-on-element="(e) => canvaStore.centerOnElement()"
    ></tw-context-menu>
    <div class="mindwall-debug flex items-center gap-2 max-w-[100px] overflow-x-auto">
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Editing: {{ editing }}</div>
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Ready: {{ isReady }}</div>
        <div class="text-xs whitespace-nowrap bg-yellow-300 shadow text-black rounded-lg px-2">Draggable: ({{ selectedConfig?.draggable }})</div>
    </div>
    <i :class="['fas', selectedConfig?.draggable ? 'fa-unlock text-green-600' : 'fa-lock text-red-600']"></i>
    <h2 class="text-3xl capitalize font-black ml-auto mr-5">{{ widgetStore.usedEngine?.name }}</h2>
</div>

<div class="bg-white tw-canva relative" v-if="isReady">
    <textarea
        v-show="editing"
        ref="quoteAreaRef"
        class="quote-textarea"
        type="text"
        v-model="editedQuoteText"
        @blur="editQuote($event)"
        @keyup.enter="editQuote($event)"
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
                                @dragend="onDragend"
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
                <v-transformer ref="transformer" :config="transformerConfig" />
            </div>
        </v-layer>
    </v-stage>
</div>
</template>

<style>
.tw-canva {
    width: 100%;
    height: calc(100vh - 48px);
    overflow: hidden;
}

.quote-textarea {
    padding: 15px 10px;
    outline: none;
    margin: 0px;
    overflow: auto;
    background: none;
    border-radius: 12px;
    border: none;
    resize: none;
    top: 0; left: 50%;
    transform: translate(-50%, 0);
    resize: none;       /* Disable manual resizing by the user */
    max-width: 360px;
}

.tw-mindwall-toolbar {
    background:
        linear-gradient(#062FD9 0%, #FD000D 90%),
        linear-gradient(to right, #A7F200 0%, #560CBE 60%),
        url('images/pages/thematics/wall.WebP') 30px,
        url('images/pages/thematics/wall.WebP') 20px;
        background-blend-mode: multiply, difference, lighten;
    color: white;
}
</style>
