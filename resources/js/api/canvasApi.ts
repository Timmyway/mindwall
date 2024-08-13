import { Api } from "./Api";

export default {
    async saveCanvas(payload: { thematicId: number, wall: string }) {
        try {
            return await Api.post('api/wall/update', payload);
        } catch (error) {
            throw error;
        }
    }
}
