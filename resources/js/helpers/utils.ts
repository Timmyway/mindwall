import { WallConfig } from '@/types/konva.config';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

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

function getUuid() {
    return uuidv4();
}

function getNanoid() {
    return nanoid();
}

const imageToBase64 = (image: HTMLImageElement): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };

        if (image.src.startsWith('blob:')) {
            fetch(image.src)
                .then(response => response.blob())
                .then(blob => reader.readAsDataURL(blob))
                .catch(reject);
        } else {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = image.src;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL());
                } else {
                    reject(new Error('Could not get canvas context'));
                }
            };
            img.onerror = reject;
        }
    });
};

const base64ToImage = (base64: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
        img.src = base64;
    });
};

// Helper function to load an image from a URL and return an HTMLImageElement
function loadImageFromURL(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
}

function pickRandomElement<T>(elements: T[]): T {
    const randomIndex = Math.floor(Math.random() * elements.length);
    return elements[randomIndex];
}

function truncateString(str: string, n: number = 50) {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }
    if (typeof n !== 'number' || n < 0) {
        throw new TypeError('Parameter n must be a non-negative number');
    }
    if (str.length <= n) {
        return str;
    }
    return str.slice(0, n) + '...';
}

export { safeJsonParse, getUuid, getNanoid, imageToBase64, base64ToImage, loadImageFromURL, pickRandomElement, nanoid, truncateString }
