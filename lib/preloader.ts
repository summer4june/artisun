import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const IMAGES = [
  '/earth_back.png',
  '/keyhole-bg.jpg',
  '/a-new-language-of-suncare.png',
  '/a-new-language-of-suncare-2.png',
  '/a-new-language-of-suncare-3.png',
  '/logo.png'
];

const VIDEOS = [
  '/videos/climate/1.mp4',
  '/videos/climate/2.mp4',
  '/videos/climate/3.mp4',
  '/videos/climate/4.mp4',
  '/videos/climate/5.mp4',
  '/6th-vid.mp4'
];

const MODELS = ['/planet_earth.glb'];

export const preloadedAssets: {
  images: Record<string, HTMLImageElement>;
  videos: Record<string, string>; // Blob URLs
  glb: any | null;
} = {
  images: {},
  videos: {},
  glb: null
};

export function preloadAll(onProgress: (progress: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalAssets = IMAGES.length + VIDEOS.length + MODELS.length;

    const updateProgress = () => {
      loadedCount++;
      onProgress(Math.floor((loadedCount / totalAssets) * 100));
      if (loadedCount === totalAssets) {
        resolve();
      }
    };

    if (totalAssets === 0) {
      onProgress(100);
      resolve();
      return;
    }

    // Preload Images
    IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress;
      img.src = src;
      preloadedAssets.images[src] = img;
    });

    // Preload Videos as Blob URLs
    VIDEOS.forEach((src) => {
      fetch(src)
        .then(response => response.blob())
        .then(blob => {
          preloadedAssets.videos[src] = URL.createObjectURL(blob);
          updateProgress();
        })
        .catch(err => {
          console.error("Failed to preload video:", src, err);
          preloadedAssets.videos[src] = src; // fallback to original src
          updateProgress();
        });
    });

    // Preload Models
    MODELS.forEach((src) => {
      const loader = new GLTFLoader();
      loader.load(
        src,
        (gltf) => {
          preloadedAssets.glb = gltf;
          updateProgress();
        },
        undefined,
        (error) => {
          console.error("Failed to preload model:", src, error);
          updateProgress();
        }
      );
    });
  });
}
