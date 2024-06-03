import { Ref, ref } from 'vue';

export default function useZoom(): {
  scaleBy: number;
  minScale: number;
  maxScale: number;
  zoomLevel: Ref<number>
} {
  const scaleBy = 10;
  const minScale = 0;
  const maxScale = 500;
  const zoomLevel = ref<number>(100);

  return { scaleBy, minScale, maxScale, zoomLevel };
}
