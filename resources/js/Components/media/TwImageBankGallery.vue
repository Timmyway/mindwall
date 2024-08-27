<template>
    <!-- // Image galery -->
    <div v-bind="$attrs" class="image-gallery-container">
        <div class="image-gallery-command">
            <!-- Gallery command bar -->
            <div class="mb-2 px-2 max-w-xl mx-auto">
                <div class="flex items-center gap-4">
                    <button class="btn btn-icon--xs btn-icon--flat btn-icon py-1" @click="fetchImages()">
                        <i class="fa fa-sync"></i>
                    </button>
                    <h2 class="py-2 font-bold text-lg text-gray-400">Powered by Freepik</h2>
                    <button class="btn btn-icon--xs btn-icon--flat btn-icon py-1" @click="close()">
                        <i class="fa fa-times text-pink-600"></i>
                    </button>
                </div>
                <div class="flex flex-col gap-2">
                    <div>
                        <input class="px-4 py-2 outline-none rounded-full w-full text-lg" type="text"
                            v-model="form.term" placeholder="Search for image..."
                            @keyup.enter="fetchImages()"
                        />
                    </div>
                </div>
            </div>

            <!-- Pagination : use primevue paginator component -->
            <div v-if="images?.length > 0" class="mb-2">
                <Paginator
                    :rows="pageInfo.perPage"
                    :totalRecords="pageInfo.total"
                    @page="onPage"
                ></Paginator>
            </div>
        </div>

        <!-- Image gallery area -->
        <div v-if="!isLoading" class="image-gallery">
            <div v-for="image in images" :key="image.id" class="image-container" :class="image.orientation">
                <img
                    class="image-container__image"
                    :src="image.url_thumbnail ?? image.url" alt=""
                    @click="selectImageFromGallery(image.url)"
                />
            </div>
        </div>
        <div v-else class="max-w-xl mx-auto flex justify-center py-4">
            <tw-loading :is-visible="isLoading" width="96px" height="96px"></tw-loading>
        </div>
    </div>
    </template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import ImageApi from '../../api/galleryApi';
import { ImageBankMeta, ImageBankResource } from '@/types/imageBank.types';
import TwLoading from '@/Components/ui/TwLoading.vue';
import { pickRandomElement } from '../../helpers/utils';

export interface Props {
    scrollable?: boolean;
}

interface PaginationForm {
    page: number;
    limit: number;
    term?: string;
}

interface PageInfo {
    current_page: number;
    last_page: number;
    total: number;
    perPage: number;
}

// Define props with TypeScript
const props = withDefaults(defineProps<Props>(), {

});

const isLoading = ref<boolean>(false);

// Reactive state
const images = ref<any[]>([]);
const clickedPage = ref<number>(1);
const noResult = ref<boolean>(false);
const message = ref<string>('');
const form = reactive<PaginationForm>({
    page: 1,
    limit: 20,
    term: 'Nature'
});

const keywords = [
    'Nature', 'Technology', 'Urban', 'Travel', 'Health', 'Food', 'Fashion', 'Animals', 'Architecture',
    'Adventure', 'Art', 'Education', 'Sports', 'Lifestyle', 'Music', 'Business', 'Finance', 'Abstract',
    'Culture', 'Science', 'Vintage', 'Beauty', 'Festivals', 'Space', 'Photography', 'Landscape',
    'Minimalism', 'Holiday', 'Wellness', 'Transportation', 'Outdoors', 'Design', 'Creativity', 'Gaming',
    'Social Media', 'Environment', 'Family', 'Digital', 'Retro', 'Modern', 'Luxury', 'Craft', 'Innovation',
    'Tradition', 'Entertainment'
];

form.term = pickRandomElement(keywords);

const pageInfo = reactive<PageInfo>({
    current_page: 1,
    last_page: 1,
    total: 0,
    perPage: 0,
});
const selected = ref<any[]>([]);

const startFetching = () => {
    isLoading.value = true;
    images.value = [];
}
const stopFetching = () => {
    isLoading.value = false;
}
const fetchImages = async (mode: string | number | null = null) => {
    if (mode === 'refresh') {
        clickedPage.value = 1;
    }
    startFetching();

    // let apiURL = `${page.value}`;
    try {
        const { foundImages, meta } = await fetchImageFromBank();

        pageInfo.perPage = meta.per_page;
        pageInfo.total = meta.total;
        pageInfo.last_page = meta.last_page;
        pageInfo.current_page = meta.current_page;

        console.log('Upload images value...')
        images.value = [...foundImages];
        stopFetching();
    } catch (error) {
        stopFetching();
        console.error(error);
        noResult.value = true;
        message.value = 'Error loading data';
    }
};

const setImageSize = (orientation: 'horizontal' | 'vertical' | 'square'): { width: string, height: string } => {
    let size: { width: string, height: string };
    switch (orientation) {
        case 'horizontal':
            size = { width: '261px', height: 'auto' }
            break;
        case 'vertical':
            size = { width: 'auto', height: '320px' }
            break;
        default:
            size = { width: '261px', height: 'auto' }
            break;
    }
    return size;
}

const onPage = (event: { page: number }) => {
    form.page = event.page + 1;
    fetchImages();
};

const emit = defineEmits(['select', 'close']);

const selectImageFromGallery = (imageUrl: string) => {
    // Emit an event using a custom event handler
    // You can define a custom event handler to emit this event
    // Example: emit('update:selection', imageURL);
    // Example: emit('selected');
    emit('select', imageUrl);
};

const close = () => {
    console.log('-- Action --> Close bank image gallery');
    emit('close');
}

const fetchImageFromBank = async (): Promise<{ foundImages: string[], meta: ImageBankMeta }> => {
    const response = await ImageApi.fetchImagesFromBank(form);
    const { resources, meta } = response.data;

    const foundImages = resources.map((image: ImageBankResource) => {
        return {
            url: image.image_source_url,
            title: image.title,
            orientation: image.orientation
        }
    });

    return {
        foundImages,
        meta
    }
}

// Fetch images on mount
onMounted(() => {
    // fetchImages();
});
</script>

<style scoped lang="scss">
.btn-copy {
    cursor: pointer;
    padding: 3px;
    border: none;
    transition: all .2s;
}
.image--copied {
    background: rgb(123, 226, 123);
}

.image-gallery-command {
    color: #333;
}

.image-gallery-container {
    background-color: rgba(247, 247, 168, 0.9);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    padding: 0 5px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
}

.image-gallery {
    // display: flex;
    // flex-wrap: wrap;
    // justify-content: center;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
    max-width: 95%;
    margin: 0 auto;
    padding: 0 1rem;
    &--mobile {
        max-width: 640px;
        max-height: 90%;
        overflow-y: auto;
        padding: 0;
    }
    .image-container {
        position: relative;
        margin: 0.3rem 0.5rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
        &.horizontal {
            grid-column: span 2;
            grid-row: span 1;
        }

        &.vertical {
            grid-column: span 1;
            grid-row: span 2;
        }

        &.square {
            grid-column: span 1;
            grid-row: span 1;
        }
        &.panoramic {
            grid-column: span 3;
            grid-row: span 1;
        }
        &__image {
            width: 100%;
            height: 100%;
            opacity: .9;
            box-shadow: var(--shadow-primary);
            object-fit: cover;
            transition: all .2s;
            &:hover {
                opacity: 1;
                cursor: pointer;
            }
        }
    }
    .command-panel {
        position: absolute;
        right: 5%; top: 3%;
        z-index: 90;
        display: flex;
        justify-content: center; align-items: center;
        background: rgba(0, 0, 0, 0.7);
        padding: 0.3rem 0.3rem;
        border-radius: 4px;
    }
    i {
        font-size: 1.5rem;
        color: white;
        cursor: pointer;
    }
}
</style>
