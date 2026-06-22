import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const IMAGES = [
  '/logo.png',
  '/keyhole-bg.webp',
  '/a-new-language-of-suncare.png',
  '/a-new-language-of-suncare-2.webp',
  '/a-new-language-of-suncare-3.webp',
];

const VIDEOS = [
  '/videos/climate/1.mp4',
  '/videos/climate/2.mp4',
  '/videos/climate/3.mp4',
  '/videos/climate/4.mp4',
  '/videos/climate/5.mp4',
  '/6th-vid.mp4',
];

const MODELS: string[] = ['/planet_earth.glb'];

const FETCH_ASSETS = ['/1.glb', '/2.glb'];

export const preloadedAssets: {
  images: Record<string, HTMLImageElement>;
  videos: Record<string, string>;
  glb: any | null;
} = {
  images: {},
  videos: {},
  glb: null,
};

export function preloadAll(onProgress: (progress: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalAssets = IMAGES.length + VIDEOS.length + MODELS.length + FETCH_ASSETS.length;
    let isResolved = false;
    const abortController = new AbortController();

    const forceResolve = () => {
      if (isResolved) return;
      isResolved = true;
      abortController.abort();
      onProgress(100);
      resolve();
    };

    setTimeout(forceResolve, 12000);

    const updateProgress = () => {
      if (isResolved) return;
      loadedCount++;
      onProgress(Math.floor((loadedCount / totalAssets) * 100));
      if (loadedCount >= totalAssets) forceResolve();
    };

    if (totalAssets === 0) {
      onProgress(100);
      resolve();
      return;
    }

    IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress;
      img.onabort = updateProgress;
      img.src = src;
      preloadedAssets.images[src] = img;
    });

    VIDEOS.forEach((src) => {
      const vid = document.createElement('video');
      vid.preload = 'auto';
      vid.muted = true;
      vid.playsInline = true;
      vid.oncanplaythrough = () => {
        updateProgress();
        vid.oncanplaythrough = null;
      };
      vid.onerror = () => updateProgress();
      vid.src = src;
    });

    MODELS.forEach((src) => {
      const loader = new GLTFLoader();
      loader.load(
        src,
        (gltf) => {
          preloadedAssets.glb = gltf;
          updateProgress();
        },
        undefined,
        () => updateProgress(),
      );
    });

    FETCH_ASSETS.forEach((src) => {
      fetch(src, { cache: 'force-cache', signal: abortController.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.blob();
        })
        .then(() => updateProgress())
        .catch((err) => {
          if (err.name !== 'AbortError') console.error('Failed to fetch asset:', src, err);
          updateProgress();
        });
    });
  });
}
