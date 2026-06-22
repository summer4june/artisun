import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const IMAGES = [
  '/keyhole-bg.webp',
  '/a-new-language-of-suncare.png',
  '/a-new-language-of-suncare-2.webp',
  '/a-new-language-of-suncare-3.webp',
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

const MODELS: string[] = ['/planet_earth.glb'];

const FETCH_ASSETS = [
  '/1.glb',
  '/2.glb'
];

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
    const totalAssets = IMAGES.length + VIDEOS.length + MODELS.length + FETCH_ASSETS.length;

    let isResolved = false;

    const forceResolve = () => {
      if (isResolved) return;
      isResolved = true;
      onProgress(100);
      resolve();
    };

    // Fallback timeout: If network is slow or an asset silently hangs, 
    // let the user through after 12 seconds.
    setTimeout(() => {
      forceResolve();
    }, 12000);

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

    // Preload Videos by buffering metadata/cache
    // Use staggered loading so bandwidth isn't saturated simultaneously
    const loadVideoStaggered = (videos: string[], index: number) => {
      if (index >= videos.length) return;
      const src = videos[index];
      const vid = document.createElement('video');
      vid.preload = 'auto';
      vid.muted = true;
      vid.playsInline = true;

      const handleLoaded = () => {
        vid.oncanplay = null;
        vid.onloadedmetadata = null;
        preloadedAssets.videos[src] = src;
        updateProgress();
        // Load next video 150ms after this one starts buffering
        setTimeout(() => loadVideoStaggered(videos, index + 1), 150);
      };

      vid.oncanplay = handleLoaded;
      vid.onloadedmetadata = handleLoaded;
      vid.onerror = () => { updateProgress(); loadVideoStaggered(videos, index + 1); };
      vid.src = src;
      vid.load();
    };

    loadVideoStaggered(VIDEOS, 0);

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

    // Fetch other heavy assets to prime the browser cache
    FETCH_ASSETS.forEach((src) => {
      fetch(src, { cache: 'force-cache' })
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.blob();
        })
        .then(() => updateProgress())
        .catch((err) => {
          console.error("Failed to fetch asset:", src, err);
          updateProgress();
        });
    });
  });
}
