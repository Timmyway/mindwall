export default function useZoom() {
    const scaleBy = 1.05;
    const minScaleChange = 0.05; // Minimum scale change threshold
    const minScale = 0.1;
    const maxScale = 2;
    let lastScale = 1;

    return { scaleBy, minScaleChange, minScale, maxScale, lastScale }
}
