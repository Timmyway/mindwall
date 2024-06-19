<template>
    <!-- // Image galery -->
    <div>
        <div class="image-gallery-command">
            <!-- Gallery command bar -->
            <div class="flex-x--center mb-2">
                <h2>Images gallery</h2>
                <button class="btn btn-icon text-primary" @click="fetchImages()">
                    <i class="fa fa-refresh mx-2"></i>
                </button>
                <div class="btn-group">
                    <label for="form-options-displayallusersimages">All</label>
                    <input type="checkbox" id="form-options-displayallusersimages" class="mx-2" v-model="options.displayAllUsersImages">
                </div>
                <div class="btn-group">
                    <label for="form-delete-multiple">Delete multiple</label>
                    <input type="checkbox" id="form-delete-multiple" class="mx-2" v-model="deleteMultiple">
                    <button
                        v-show="selected.length"
                        class="btn btn-sm btn-danger"
                        @click="deleteImages"
                    >Delete</button>
                </div>
            </div>

            <div v-show="upload">
                <TwUploader></TwUploader>
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
        <div class="image-gallery" :style="[scrollable ? 'max-height: 640px; overflow: auto;' : '']">
            <div v-for="image in images" :key="image.id" class="image-container">
                <div class="command-panel text-theme">
                    <button
                        class="btn-copy mr-1"
                        :class="{ 'image--copied': copied.includes(image.id) }"
                        @click="superCopy(image.url, image.id)"
                    >{{ copied.includes(image.id) ? 'copied' : 'copy' }}</button>
                    <div>ID: {{ image.id }}</div>
                    <i
                        v-show="upload"
                        class="fas fa-crop mx-2"
                        @click="cropImage(image.url)"
                    ></i>
                    <!-- Show delete icon only on user's images -->
                    <i
                        v-show="upload && (loggedInUser.id === image.user_id)"
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
                <a
                    v-if="upload"
                    :href="image.url" target="_blank"
                >
                    <img class="image-container__image" :src="image.url_thumbnail" alt="" />
                </a>
                <img
                    v-if="!upload"
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
    auth: User;
}>();

// Default props values
const upload = props.upload ?? true;
const scrollable = props.scrollable ?? false;

// Inject the store
const $store = inject<any>('$store');

// Reactive state
const paginationInfos = ref(null);
const apiDatas = ref(null);
const images = ref<any[]>([]);
const page = ref(1);
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
const loggedInUser = props.auth;
const { superCopy, copied } = useSuperCopy();

// Methods
const copy = (url: string) => {
  // Implement your copy logic here
};

const fetchImages = async (mode: string | null = null) => {
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
    if (response.data.response.data.length) {
      apiDatas.value = response.data;
      images.value = [...apiDatas.value.response.data];
      pageInfo.perPage = apiDatas.value.response.per_page;
      pageInfo.total = apiDatas.value.response.per_page * apiDatas.value.response.last_page;
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

const cropImage = (url: string) => {
  $store.setImageToCropAction(url);
  // Emit an event using a custom event handler
  // You can define a custom event handler to emit this event
  // Example: emit('edit');
};

const onPage = (event: { page: number }) => {
  page.value = event.page + 1;
  fetchImages(page.value);
};

const selectImageFromGallery = (imageURL: string) => {
  // Emit an event using a custom event handler
  // You can define a custom event handler to emit this event
  // Example: emit('update:selection', imageURL);
  // Example: emit('selected');
};

// Fetch images on mount
onMounted(() => {
  fetchImages();
});
</script>

    <style scoped>
    .btn-copy {
        cursor: pointer;
        padding: 3px;
        border: none;
        transition: all .2s;
    }
    .image--copied {
        background: rgb(123, 226, 123);
    }
    </style>
