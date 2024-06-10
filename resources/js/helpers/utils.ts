import { WallConfig } from '@/types/konva.config';
import { v4 as uuidv4 } from 'uuid';

function safeJsonParse(jsonString: string | WallConfig): any {
    if (typeof jsonString === 'string') {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            return {};
        }
    }
    return null;
}

function uuid() {
    return uuidv4();
}

export { safeJsonParse, uuid }
