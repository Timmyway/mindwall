import { defineStore } from "pinia";
import { ref } from "vue";
import { useFileDialog } from "@vueuse/core";
import { useCanvasOperationsStore } from "./canvasOperationsStore";

export const useImageGalleryStore = defineStore('imageGallery', () => {
    const isGalleryVisible = ref<boolean>(false);
    const isBankGalleryVisible = ref<boolean>(false);
    const canvasOperations = useCanvasOperationsStore();

    const { files, open, reset, onChange } = useFileDialog({
        accept: 'image/*', // Set to accept only image files
        directory: false, // Select directories instead of files if set true
    })

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
        console.log('-----------> View bank image: ', isBankGalleryVisible.value)
    }

    const hideBankImageGallery = () => {
        setTimeout(() => {
            isBankGalleryVisible.value = false;
        }, 200);
    }

    const toggleImageGallery = () => {
        isGalleryVisible.value = !isGalleryVisible.value;
    }

    const pickImage = async () => {
        open();
    }

    onChange((files) => {
        if (files && files.length > 0) {
            const selectedImage = files[0];
            canvasOperations.addImageToWall(selectedImage);
        }
    })

    return { isGalleryVisible, isBankGalleryVisible, viewImageGallery, hideImageGallery,
        viewBankImageGallery, hideBankImageGallery, pickImage
    }
});
