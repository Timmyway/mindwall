<template>
    <div class="container-xxl">
        <DropZone
            id="dropzone"
            :url="$apiUrl + 'api/images'"
            :uploadOnDrop="true"
            :multipleUpload="true"
            :maxFiles="10"
            :headers="{'Content-Type': 'multipart/form-data'}"
            paramName="image_to_upload"
            :acceptedFiles="acceptedFiles"
            :maxFileSize="Number(50000000)"
            @sending="onSending"
            @errorUpload="onErrorUpload"
        />
    </div>
</template>

<script setup lang="ts">
import 'dropzone-vue/dist/dropzone-vue.common.css';
import ImageApi from '../../api/galleryApi'
import { inject } from 'vue';

// Define props
const props = defineProps<{
  acceptedFiles: (string[] | string) | undefined
}>();

// Inject the $apiBaseURI
const $apiUrl = inject<string>('$apiBaseURI');

// Provide a default value for acceptedFiles if not passed
const acceptedFiles = props.acceptedFiles ?? ['webp', 'image/jpeg', 'image/png', 'image/tiff', 'image/gif', 'image/bmp', 'image/x-icon'];

const onSending = async (files: File[], xhr: XMLHttpRequest) => {
    const imageUploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('name', file.name);
        formData.append('image_to_upload', file);

        try {
        await ImageApi.saveImage(formData);
        console.log(`${file.name} has been uploaded`);
        } catch (error: any) {
        console.error(`${file.name} hasn't been uploaded due to the following error: ${error}`);
        throw error;
        }
    });

    try {
        await Promise.all(imageUploadPromises);
        console.log('All files have been uploaded');
    } catch (error: any) {
        console.error('Errors encountered during the process', error);
    }
};

const onErrorUpload = (error: any) => {
  console.error(error);
};

</script>

<style scoped>
.dropzone__message .dropzone__message--style {
    display: none;
}
</style>
