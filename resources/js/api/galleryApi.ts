import { Api } from "./Api";

export default {
    async fetchImages(page: number | string = 1) {
        try {
            return await Api.get('/api/images' + '/?page=' + page);
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
