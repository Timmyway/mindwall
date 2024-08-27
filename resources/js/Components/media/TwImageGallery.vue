<template>
    <!-- // Image galery -->
    <div v-bind="$attrs" class="image-gallery-container">
        <div class="image-gallery-command">
            <!-- Gallery command bar -->
            <div class="mb-2 px-2">
                <h2 class="py-2 font-bold">Gallery</h2>
                <div class="flex items-center flex-wrap gap-2">
                    <button class="btn btn-icon btn-xs btn-icon--flat btn-icon--xs text-primary" @click="fetchImages()">
                        <i class="fa fa-sync mx-2"></i>
                    </button>
                    <div class="flex items-center border border-gray-200 py-1 px-2">
                        <label for="form-options-displayallusersimages">All</label>
                        <input type="checkbox" id="form-options-displayallusersimages" class="mx-2" v-model="options.displayAllUsersImages">
                    </div>
                    <div class="flex items-center border border-gray-200 py-1 px-2">
                        <label for="form-delete-multiple">Delete multiple</label>
                        <input type="checkbox" id="form-delete-multiple" class="mx-2" v-model="deleteMultiple">
                        <button
                            v-show="selected.length"
                            class="btn btn-icon btn-icon--flat btn-icon--xs bg-red-600 text-xs"
                            @click="deleteImages"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div v-show="upload">
                <tw-uploader accept="image/*" auto :handle-refresh="fetchImages"></tw-uploader>
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
                <div class="command-panel text-theme">
                    <button
                        class="btn-copy mr-1"
                        :class="{ 'image--copied': copied.includes(image.id) }"
                        @click="superCopy(image.url, image.id)"
                    >{{ copied.includes(image.id) ? 'copied' : 'copy' }}</button>
                    <div>ID: {{ image.id }}</div>
                    <!-- Show delete icon only on user's images -->
                    <i
                        v-show="upload && (loggedInUser?.id === image.user_id)"
                        class="fas fa-times delete-button"
                        @click="deleteImage(image.id)"
                    ></i>
                    <input
                        v-if="deleteMultiple"
                        type="checkbox"
                        :value="image.id"
                        v-model="selected"
                    >
                </div>
                <img
                    class="image-container__image"
                    :src="image.url_thumbnail" alt=""
                    @click="selectImageFromGallery(image.url)"
                />
            </div>
        </div>
    </div>
    </template>

<script setup lang="ts">
import { ref, reactive, inject, onMounted } from 'vue';
import ImageApi from '../../api/galleryApi';
import TwUploader from './TwUploader.vue';
import useSuperCopy from '../../composable/useSuperCopy';
import { User } from '../../types/auth.types';

// Define props with TypeScript
const props = defineProps<{
    upload: boolean;
    scrollable: boolean;
    user: User | null;
    maxHeight: number;
}>();

// Default props values
const upload = props.upload ?? true;
const scrollable = props.scrollable ?? false;

// Reactive state
const paginationInfos = ref(null);
const apiDatas = ref(null);
const images = ref<any[]>([]);
const page = ref<number>(1);
const noResult = ref(false);
const message = ref('');
const options = reactive({
  displayAllUsersImages: true,
});
const pageInfo = reactive({
  total: 0,
  perPage: 0,
});
const selected = ref<any[]>([]);
const deleteMultiple = ref(false);

// Setup
const loggedInUser: User | null = props.user;
const { superCopy, copied } = useSuperCopy();

// Methods
const copy = (url: string) => {
  // Implement your copy logic here
};

const fetchImages = async (mode: string | number | null = null) => {
    if (mode === 'refresh') {
        page.value = 1;
    }
    images.value = [];

    let apiURL = `${page.value}`;
    if (options.displayAllUsersImages) {
        apiURL += '&user=all';
    }

    try {
        const response = await ImageApi.fetchImages(apiURL);
        const responseData = response.data.response;

        if (responseData && responseData.data.length) {
            apiDatas.value = response.data;
            images.value = [...responseData.data];
            pageInfo.perPage = responseData.per_page;
            pageInfo.total = responseData.per_page * responseData.last_page;
        } else {
            noResult.value = true;
            message.value = 'No image found.';
        }
    } catch (error) {
        console.error(error);
        noResult.value = true;
        message.value = 'Error loading data';
    }
};

const deleteImage = async (imageID: number) => {
  const ok = confirm('Click OK to delete this image');
  if (ok) {
    try {
      await ImageApi.deleteImage(imageID);
      fetchImages();
    } catch (error) {
      console.error(error);
    }
  }
};

const deleteImages = async () => {
  const ok = confirm('Click OK to delete these images');
  if (ok) {
    const deleteImagePromises = selected.value.map((imageID) =>
      ImageApi.deleteImage(imageID)
        .then(() => {
          console.log(`Image with ID: ${imageID} has been deleted`);
          selected.value = selected.value.filter(id => id !== imageID);
        })
        .catch(() => {
          console.error('Error while deleting image with ID:', imageID);
        })
    );

    await Promise.allSettled(deleteImagePromises);
    console.log('All images have been deleted');
    fetchImages();
  }
};

const onPage = (event: { page: number }) => {
    page.value = event.page + 1;
    fetchImages(page.value);
};

const emit = defineEmits(['select']);
const selectImageFromGallery = (imageUrl: string) => {
  // Emit an event using a custom event handler
  // You can define a custom event handler to emit this event
  // Example: emit('update:selection', imageURL);
  // Example: emit('selected');
  emit('select', imageUrl);
};

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
    i.delete-button {
        color: #C42847;
    }
}
</style>
