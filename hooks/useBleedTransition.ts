import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { sections } from '@/data/climateSections';
import { bleedVert } from '@/shaders/bleed.vert';
import { bleedFrag } from '@/shaders/bleed.frag';

export function useBleedTransition(activeIndex: number) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const videosRef = useRef<HTMLVideoElement[]>([]);
  const isExpandedRef = useRef(false);
  const prevIndexRef = useRef(0);

  const updateVideoPlayback = () => {
    if (!materialRef.current) return;
    const texA = materialRef.current.uniforms.textureA.value;
    const texB = materialRef.current.uniforms.textureB.value;
    
    videosRef.current.forEach(video => {
      const isActive = texA?.image === video || texB?.image === video;
      
      if (isExpandedRef.current && isActive) {
        video.playbackRate = 1.0;
        if (video.paused) video.play().catch(e => console.warn("Play error:", e));
      } else {
        // Freeze visually by setting a near-zero playback rate.
        // This prevents Safari/Chrome from dropping the WebGL texture 
        // since the video is technically still "playing".
        // 0.1 is used because strict browsers throw errors for values < 0.0625
        video.playbackRate = 0.1;
        if (video.paused) video.play().catch(() => {});
      }
    });
  };

  const setExpandedState = (expanded: boolean) => {
    isExpandedRef.current = expanded;
    updateVideoPlayback();
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const material = new THREE.ShaderMaterial({
      vertexShader: bleedVert,
      fragmentShader: bleedFrag,
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
        overlayColorA: { value: new THREE.Color('#081526') },
        overlayColorB: { value: new THREE.Color('#081526') },
        // Vivid bleed accent colors — used for the visible ink flood during transition
        bleedAccentA: { value: new THREE.Color('#1a6aaa') }, // Shimla vivid blue
        bleedAccentB: { value: new THREE.Color('#1a6aaa') },
        progress: { value: 0.0 },
        time: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(-1, -1) }
      }
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const manager = new THREE.LoadingManager();
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setLoadingProgress((itemsLoaded / itemsTotal) * 100);
    };

    const imageLoader = new THREE.TextureLoader(manager);
    imageLoader.setCrossOrigin('anonymous');

    const loadMedia = (sec: any) => {
      return new Promise<THREE.Texture>((resolve) => {
        manager.itemStart(sec.mediaUrl);
        let isResolved = false;

        // Failsafe Timeout: NEVER let the loading screen hang forever
        const timeoutId = setTimeout(() => {
          if (!isResolved) {
            console.warn("Failsafe timeout: forcing load for", sec.mediaUrl);
            // CRITICAL FIX: Do NOT create a VideoTexture if the video has no data yet, or WebGL crashes!
            // We create a safe 1x1 transparent dummy CanvasTexture instead.
            const canvas = document.createElement('canvas');
            canvas.width = 1; canvas.height = 1;
            const tex = new THREE.CanvasTexture(canvas);
            
            tex.generateMipmaps = false;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.colorSpace = THREE.SRGBColorSpace;
            
            isResolved = true;
            manager.itemEnd(sec.mediaUrl);
            resolve(tex);
          }
        }, 4000); // 4 seconds max wait per item

        const complete = (texture: THREE.Texture) => {
          if (isResolved) return;
          isResolved = true;
          clearTimeout(timeoutId);
          texture.generateMipmaps = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.colorSpace = THREE.SRGBColorSpace;
          manager.itemEnd(sec.mediaUrl);
          resolve(texture);
        };

        if (sec.mediaType === 'video') {
          const video = document.createElement('video');
          video.src = sec.mediaUrl;
          // REMOVED crossOrigin='anonymous' to prevent Vercel CDN from throwing strict CORS errors
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          videosRef.current.push(video);
          
          video.setAttribute('muted', 'true');
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.setAttribute('autoplay', 'true');
          video.playbackRate = 0.1;
          
          video.oncanplay = () => {
            if (!isResolved) complete(new THREE.VideoTexture(video));
          };

          video.onerror = () => {
            console.error("Failed to load video:", sec.mediaUrl);
            if (!isResolved) complete(new THREE.Texture());
          };
          
          video.load();
          video.play().catch(() => {});
        } else {
          imageLoader.load(
            sec.mediaUrl, 
            (tex) => complete(tex),
            undefined,
            (err) => {
              console.error("Failed to load image:", sec.mediaUrl);
              if (!isResolved) complete(new THREE.Texture());
            }
          );
        }
      });
    };

    Promise.all(sections.map(s => loadMedia(s))).then((loaded) => {
      texturesRef.current = loaded;
      
      const updateAspects = (width: number, height: number) => {
        if (width === 0 || height === 0) return;
        const screenAspect = width / height;
        
        loaded.forEach(tex => {
          let imageAspect = 1;
          if (tex.image instanceof HTMLVideoElement) {
            const vw = tex.image.videoWidth;
            const vh = tex.image.videoHeight;
            if (vw > 0 && vh > 0) imageAspect = vw / vh;
          } else if (tex.image instanceof HTMLImageElement) {
            const iw = tex.image.width;
            const ih = tex.image.height;
            if (iw > 0 && ih > 0) imageAspect = iw / ih;
          }

          if (screenAspect > imageAspect) {
            tex.repeat.set(1, imageAspect / screenAspect);
            tex.offset.set(0, (1 - imageAspect / screenAspect) / 2);
          } else {
            tex.repeat.set(screenAspect / imageAspect, 1);
            tex.offset.set((1 - screenAspect / imageAspect) / 2, 0);
          }
        });
      };
      
      updateAspects(w, h);

      // Cool, calming, vibing gradients for each section
      const sectionColors = [
        new THREE.Color('#081526'), // Shimla: Deep calming midnight blue
        new THREE.Color('#2d1c16'), // Jaipur: Soft dusty warm mahogany
        new THREE.Color('#0a2016'), // Bangalore: Deep moody forest green
        new THREE.Color('#160e22'), // Mumbai: Soft coastal indigo
      ];

      if (materialRef.current) {
        materialRef.current.uniforms.textureA.value = loaded[0];
        materialRef.current.uniforms.textureB.value = loaded[0];
        materialRef.current.uniforms.overlayColorA.value = sectionColors[0];
        materialRef.current.uniforms.overlayColorB.value = sectionColors[0];
      }
    });

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const renderLoop = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.time.value = clock.getElapsedTime();
      }
      
      // Force VideoTexture to update even if paused (fixes WebKit black texture bug on resize)
      texturesRef.current.forEach(tex => {
        if (tex && (tex as any).isVideoTexture) {
          tex.needsUpdate = true;
        }
      });
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      if (newW === 0 || newH === 0) return;
      
      renderer.setSize(newW, newH);
      
      const screenAspect = newW / newH;
      texturesRef.current.forEach(tex => {
        let imageAspect = 1;
        if (tex.image instanceof HTMLVideoElement) {
          const vw = tex.image.videoWidth;
          const vh = tex.image.videoHeight;
          if (vw > 0 && vh > 0) imageAspect = vw / vh;
        } else if (tex.image instanceof HTMLImageElement) {
          const iw = tex.image.width;
          const ih = tex.image.height;
          if (iw > 0 && ih > 0) imageAspect = iw / ih;
        }

        if (screenAspect > imageAspect) {
          tex.repeat.set(1, imageAspect / screenAspect);
          tex.offset.set(0, (1 - imageAspect / screenAspect) / 2);
        } else {
          tex.repeat.set(screenAspect / imageAspect, 1);
          tex.offset.set((1 - screenAspect / imageAspect) / 2, 0);
        }
      });
    });
    
    resizeObserver.observe(mountRef.current);

    // Track Mouse specifically for the Liquid Effect in the shader
    const handleMouseMove = (e: MouseEvent) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uMouse.value.x = e.clientX / window.innerWidth;
        materialRef.current.uniforms.uMouse.value.y = 1.0 - (e.clientY / window.innerHeight);
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (activeIndex === prevIndexRef.current || !materialRef.current || texturesRef.current.length === 0) return;

    const uniforms = materialRef.current.uniforms;
    
    // Cool, calming, vibing gradients for each section
    const sectionColors = [
      new THREE.Color('#081526'), // Shimla
      new THREE.Color('#2d1c16'), // Jaipur
      new THREE.Color('#0a2016'), // Bangalore
      new THREE.Color('#160e22'), // Mumbai
      new THREE.Color('#12100a'), // Constant
    ];

    // VIVID accent colors — used for the actual ink bleed flood (much more saturated)
    const bleedAccentColors = [
      new THREE.Color('#1a6aaa'), // Shimla → vivid ocean blue
      new THREE.Color('#c45a20'), // Jaipur → vivid terracotta orange
      new THREE.Color('#1a6a3a'), // Bangalore → vivid tropical green
      new THREE.Color('#6a20aa'), // Mumbai → vivid coastal purple
      new THREE.Color('#c0a030'), // Constant → vivid golden
    ];
    
    uniforms.textureB.value = texturesRef.current[activeIndex];
    uniforms.overlayColorB.value = sectionColors[activeIndex % sectionColors.length];
    uniforms.bleedAccentB.value = bleedAccentColors[activeIndex % bleedAccentColors.length];
    
    gsap.killTweensOf(uniforms.progress);
    uniforms.progress.value = 0.0;

    gsap.to(uniforms.progress, {
      value: 1.0,
      duration: 2.5, // Faster, explosive wipe
      delay: 0.4,    // Syncs perfectly with text disappearing (0.5s)
      ease: "power2.out", // Instantly starts expanding
      onComplete: () => {
        uniforms.textureA.value = uniforms.textureB.value;
        uniforms.overlayColorA.value = uniforms.overlayColorB.value;
        uniforms.bleedAccentA.value = uniforms.bleedAccentB.value;
        uniforms.progress.value = 0.0;
      }
    });

    prevIndexRef.current = activeIndex;
    updateVideoPlayback();
  }, [activeIndex]);

  return { mountRef, isExpandedRef, texturesRef, setExpandedState, loadingProgress };
}
