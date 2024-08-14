export default function useImageUtility() {
    const calcOptimizedImageDimension = (
        im: HTMLImageElement,
        maxWidth = 480,
        maxHeight = 320
    ): { w:number, h:number } => {
        // Get the real size of the image
        const realWidth = im.naturalWidth;
        const realHeight = im.naturalHeight;

        // Calculate the aspect ratio
        let width = realWidth;
        let height = realHeight;

        // If the image exceeds the maximum dimensions, resize it while maintaining the aspect ratio
        if (realWidth > maxWidth || realHeight > maxHeight) {
            const widthRatio = maxWidth / realWidth;
            const heightRatio = maxHeight / realHeight;
            const minRatio = Math.min(widthRatio, heightRatio);
            width = Math.round(realWidth * minRatio);
            height = Math.round(realHeight * minRatio);
        }

        console.log('===> Width|Height: ', width, height);
        return { w: width, h: height };
    }

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

    return { calcOptimizedImageDimension, resizeImage }
}
