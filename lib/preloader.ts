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

    let isResolved = false;

    const forceResolve = () => {
      if (isResolved) return;
      isResolved = true;
      onProgress(100);
      resolve();
    };

    // Fallback timeout: If network is slow or an asset silently hangs, 
    // let the user through after 8 seconds.
    setTimeout(() => {
      forceResolve();
    }, 8000);

    const updateProgress = () => {
      if (isResolved) return;
      loadedCount++;
      onProgress(Math.floor((loadedCount / totalAssets) * 100));
      if (loadedCount >= totalAssets) {
        forceResolve();
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
      img.onabort = updateProgress;
      img.src = src;
      preloadedAssets.images[src] = img;
    });

    // Preload Videos by buffering metadata/cache, NOT blob()
    // Fetching large MP4 blobs consumes excessive RAM and crashes mobile browsers.
    VIDEOS.forEach((src) => {
      const vid = document.createElement('video');
      vid.preload = 'auto';
      vid.muted = true;
      vid.playsInline = true;
      
      const handleVideoLoaded = () => {
        vid.oncanplay = null;
        vid.onloadedmetadata = null;
        preloadedAssets.videos[src] = src; // Browser has it cached now
        updateProgress();
      };
      
      vid.oncanplay = handleVideoLoaded;
      vid.onloadedmetadata = handleVideoLoaded;
      vid.onerror = handleVideoLoaded; // even if it errors, we must progress
      
      vid.src = src;
      vid.load(); // trigger fetch
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
