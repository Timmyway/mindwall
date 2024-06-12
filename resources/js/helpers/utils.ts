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

const resizeImage = (image: HTMLImageElement, maxWidth: number, maxHeight: number): HTMLImageElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Unable to get 2D rendering context");

    const width = image.width;
    const height = image.height;

    let newWidth = width;
    let newHeight = height;

    // Calculate the new dimensions while preserving aspect ratio
    if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
    }
    if (newHeight > maxHeight) {
        newWidth = (newWidth * maxHeight) / newHeight;
        newHeight = maxHeight;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw the image onto the canvas with the new dimensions
    ctx.drawImage(image, 0, 0, newWidth, newHeight);

    // Create a new image element with the resized image
    const resizedImage = new Image();
    resizedImage.src = canvas.toDataURL('image/jpeg'); // Change the MIME type as needed

    return resizedImage;
};


export { safeJsonParse, uuid, imageToBase64, base64ToImage, resizeImage }
