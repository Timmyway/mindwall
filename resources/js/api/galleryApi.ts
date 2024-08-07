import { ImageBank, ImageBankOptions } from "@/types/imageBank.types";
import { Api, InfinideaApi } from "./Api";

export default {
    async fetchImages(page: number | string = 1) {
        try {
            return await Api.get('/api/images' + '/?page=' + page);
        } catch(error) {
            throw error;
        }
    },
    async fetchImagesFromBank(options: ImageBankOptions = { page: 1, limit: 10, term: '' }) {
        try {
            const { page, limit, term } = options;
            const payload = { page, limit, term }

            return await InfinideaApi.post('/api/image', payload);
        } catch(error) {
            throw error;
        }
    },
    async saveImage(form: object) {
        try {
            return await Api.post('/api/images', form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch(error) {
            throw error;
        }
    },
    async deleteImage(id: number) {
        try {
            return await Api.post('/api/images/delete/' + id);
        } catch(error) {
            throw error;
        }
    }
}
