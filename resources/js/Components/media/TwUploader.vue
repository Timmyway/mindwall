<template>
    <div>
        <FileUpload
            ref="uploadRef"
            name="images[]"
            :url="$apiUrl + 'api/images'"
            :multiple="true"
            :accept="accept"
            :maxFileSize="1000000"
            customUpload
            @uploader="onSending($event)"
            @upload="onUploadFinished"
            :auto="auto"
            :showUploadButton="false"
            :showCancelButton="false"
        >
            <template #empty>
                <span>Or drag and drop images.</span>
            </template>
        </FileUpload>
        <!--
        <DropZone
            id="dropzone"
            :url="$apiUrl + 'api/images'"
            :uploadOnDrop="true"
            :multipleUpload="true"
            :maxFiles="10"
            :headers="{'Content-Type': 'multipart/form-data'}"
            paramName="image"
            :acceptedFiles="acceptedFiles"
            :maxFileSize="Number(50000000)"
            @sending="onSending"
            @errorUpload="onErrorUpload"
        />
        -->
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageApi from '../../api/galleryApi'
import { inject } from 'vue';
import { FileUploadUploadEvent, FileUploadUploaderEvent } from 'primevue/fileupload';
import FileUpload from 'primevue/fileupload';

export interface Props {
    accept: string;
    auto: boolean;
}

// Define props
const props = withDefaults(defineProps<Props>(), {
    accept: 'image/*',
    auto: true
});

const uploadRef = ref();

// Inject the $apiBaseURI
const $apiUrl = inject<string>('$apiUrl');

const onSending = async (e: FileUploadUploaderEvent) => {
    const formData = new FormData();
    e.files.forEach((file) => {
        formData.append('images[]', file);
    });
    try {
        await ImageApi.saveImage(formData);
        console.log(`Images have been uploaded`);
    } catch (error: any) {
        console.error(`Images haven't been uploaded due to the following error: ${error}`);
        throw error;
    }
};

const onUploadFinished = (e: FileUploadUploadEvent) => {
    // Handle successful upload
    if (e.xhr.status === 200) {
        console.log('File uploaded successfully');
        uploadRef.value.clear();
    } else {
        // Handle upload failure
        console.error('File upload failed');
    }
}

const onErrorUpload = (error: any) => {
  console.error(error);
};

</script>

<style scoped>
.dropzone__message .dropzone__message--style {
    display: none;
}
</style>
