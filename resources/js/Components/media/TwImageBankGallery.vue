<template>
    <!-- // Image galery -->
    <div v-bind="$attrs" class="image-gallery-container">
        <div class="image-gallery-command">
            <!-- Gallery command bar -->
            <div class="mb-2 px-2">
                <div class="flex item-center gap-4">
                    <button class="btn btn-icon btn-xs btn-icon--flat btn-icon--xs text-primary" @click="fetchImages()">
                        <i class="fa fa-sync"></i>
                    </button>
                    <h2 class="py-2 font-bold">Powered by Freepik</h2>
                </div>
                <div class="flex flex-col gap-2">
                    <div>
                        <InputText type="text" v-model="form.term" placeholder="Search for image..." @keyDown.enter="fetchImages" />
                    </button>
                    </div>
                </div>
            </div>

            <!-- Pagination : use primevue paginator component -->
            <div class="mb-2">
                <Paginator
                    :rows="pageInfo.perPage"
                    :totalRecords="pageInfo.total"
                    @page="onPage"
                ></Paginator>
            </div>
        </div>

        <!-- Image gallery area -->
        <div class="image-gallery" :style="[scrollable ? `max-height: ${maxHeight}px; overflow: auto;` : '']">
            <div v-for="image in images" :key="image.id" class="image-container">
                <img
                    class="image-container__image"
                    :src="image.url_thumbnail ?? image.url" alt=""
                    @click="selectImageFromGallery(image.url)"
                />
            </div>
        </div>
    </div>
    </template>

<script setup lang="ts">
import { ref, reactive, inject, onMounted } from 'vue';
import ImageApi from '../../api/galleryApi';
import { ImageBankMeta, ImageBankResource } from '@/types/imageBank.types';
import InputText from 'primevue/inputtext';

// Define props with TypeScript
const props = defineProps<{
    scrollable: boolean;
    maxHeight: number;
}>();

// Default props values
const scrollable = props.scrollable ?? false;

// Reactive state
const paginationInfos = ref(null);
const apiDatas = ref(null);
const images = ref<any[]>([]);
const clickedPage = ref<number>(1);
const noResult = ref(false);
const message = ref('');
const form = reactive({
    page: 1,
    limit: 5,
    term: 'Nature'
});
const options = reactive({
    page: 1,
    limit: 5,
    term: ''
});
const pageInfo = reactive({
    current_page: 1,
    last_page: 1,
    total: 0,
    perPage: 0,
});
const selected = ref<any[]>([]);

const fetchImages = async (mode: string | number | null = null) => {
    if (mode === 'refresh') {
        clickedPage.value = 1;
    }
    images.value = [];

    // let apiURL = `${page.value}`;
    try {
        const { foundImages, meta } = await fetchImageFromBank();

        pageInfo.perPage = meta.per_page;
        pageInfo.total = meta.total;
        pageInfo.last_page = meta.last_page;
        pageInfo.current_page = meta.current_page;

        console.log('Upload images value...')
        images.value = [...foundImages];
    } catch (error) {
        console.error(error);
        noResult.value = true;
        message.value = 'Error loading data';
    }
};

const onPage = (event: { page: number }) => {
    form.page = event.page + 1;
    fetchImages();
};

const emit = defineEmits(['select']);
const selectImageFromGallery = (imageUrl: string) => {
    // Emit an event using a custom event handler
    // You can define a custom event handler to emit this event
    // Example: emit('update:selection', imageURL);
    // Example: emit('selected');
    emit('select', imageUrl);
};

const fetchImageFromBank = async (): Promise<{ foundImages: string[], meta: ImageBankMeta }> => {
    const response = await ImageApi.fetchImagesFromBank(form);
    const { resources, meta } = response.data;

    console.log('====> R', resources)

    const foundImages = resources.map((image: ImageBankResource) => {
        return {
            url: image.image_url,
            title: image.title,
        }
    });

    return {
        foundImages,
        meta
    }
}

// Fetch images on mount
onMounted(() => {
    fetchImages();
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
    background-color: white;
    color: #333;
}

.image-gallery-container {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    padding: 0 5px;
    width: 100%;
}

.image-gallery {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1rem;
    background-color: white;
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
        background-color: white;
        &__image {
            opacity: .9;
            box-shadow: var(--shadow-primary);
            width: 180px; height: 120px;
            object-fit: contain;
            transition: all .2s;
            &:hover {
                opacity: 1;
                transform: scale(1.05);
                cursor: pointer;
            }
        }
    }
    .command-panel {
        position: absolute;
        right: 5%; top: 3%;
        z-index: 99;
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
    i.delete-button {
        color: #C42847;
    }
}
</style>
