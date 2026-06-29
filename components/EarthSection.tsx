'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Timer } from 'three/src/core/Timer.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { preloadedAssets } from '../lib/preloader';

const earthTitle = "A Climate-smart approach to Suncare";
const earthSubtitle = "bringing protection that moves with climate, not just skin type.";

// Orientation that turns the textured surface to face India towards the camera
const INDIA_FACING_ROTATION_Y = -0.08;
const INDIA_FACING_ROTATION_X = 0.35;

export default function EarthSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const indiaPulseRef  = useRef<HTMLDivElement>(null);
  const atmosphereRef  = useRef<HTMLDivElement>(null);
  const starCanvasRef  = useRef<HTMLCanvasElement>(null);

  const earthTitleWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const earthSubWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  earthTitleWordsRef.current = [];
  earthSubWordsRef.current = [];

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!container || !section) return;

    gsap.registerPlugin(ScrollTrigger);

    // Drop the globe in with authoritative deceleration — no bounce, just mass through air.
    let hangTween: gsap.core.Tween | null = null;
    let sectionExiting = false;
    let starSt: ScrollTrigger | null = null;
    let exitSt: ScrollTrigger | null = null;
    let dropSt: ScrollTrigger | null = null;
    gsap.set(container, { xPercent: -50, yPercent: -50 });

    const handleMouseMove = (e: MouseEvent) => {
      if (sectionExiting) return;
      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
      const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
      gsap.to(container, {
        x: dx * 18,
        y: dy * 12,
        duration: 1.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };
    const handleMouseLeave = () => {
      gsap.to(container, { x: 0, y: 0, duration: 2.2, ease: 'power3.out' });
    };

    // ── MOUSE INERTIA + HANG — only active once the globe has landed ──
    let landed = false;
    const setupLanded = () => {
      if (landed) return;
      landed = true;
      // Subtle hang — 1.5° max, 4s period. Almost imperceptible but adds life.
      hangTween = gsap.to(container, {
        rotation: 1.5,
        duration: 4.0,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      section.addEventListener('mousemove', handleMouseMove);
      section.addEventListener('mouseleave', handleMouseLeave);
    };
    const teardownLanded = () => {
      if (!landed) return;
      landed = false;
      hangTween?.kill();
      hangTween = null;
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
    };

    // ── PIN: Hold EarthSection while globe animations play ──
    // Globe drops, settles, India locks, text appears, exits.
    // Without pin, section scrolls past before any of this is seen.
    const earthPin = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=250%',
      pin: true,
      anticipatePin: 1,
    });

    // ── ENTRY: Globe Drop ──
    // Used to be a one-shot tween triggered once via onEnter (play once, never
    // re-evaluated). That meant any navigation that skipped past the trigger's start
    // in a single jump — clicking a nav link, browser back/forward, a fast scroll-bar
    // drag, even just GSAP's own ScrollTrigger.refresh() recalculating mid-flight —
    // could miss the onEnter callback entirely, leaving the globe permanently stuck
    // at its hidden opacity:0 starting state. Scrubbing it instead means the globe's
    // position/opacity is recomputed directly from the CURRENT scroll position on
    // every frame, so it's always correct no matter how the user arrived here.
    dropSt = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=30%',
      scrub: 1,
      animation: gsap.fromTo(
        container,
        { y: -700, rotation: -8, opacity: 0 },
        { y: 0, rotation: 0, opacity: 1, ease: 'power4.out' }
      ),
      onUpdate: (self) => {
        if (self.progress >= 0.999) setupLanded();
        else teardownLanded();
      },
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance' 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dark, moody ambient light for a darkish overlay effect
    scene.add(new THREE.AmbientLight('#ffffff', 0.25));

    // Realistic pure white sunlight coming from a low angle, reduced intensity
    const sunLight = new THREE.DirectionalLight('#ffffff', 1.2); 
    sunLight.position.set(200, 20, 100); 
    scene.add(sunLight);

    // Subtle blue rim/fill light from the opposite side
    const fillLight = new THREE.DirectionalLight('#aaccff', 0.3); 
    fillLight.position.set(-150, -50, -150);
    scene.add(fillLight);

    let mixer: THREE.AnimationMixer | null = null;
    let globeModel: THREE.Object3D | null = null;
    const timer = new Timer();
    let frameId = 0;
    let isVisible = false;
    let isLoaded = false;
    let disposed = false;

    // Idle: the whole globe spins freely. Once the section is fully in view and the user keeps
    // scrolling, it locks to face India (only the clouds keep moving). `lockTargetY` is captured
    // once, at the moment it engages, as the nearest forward-equivalent angle to the India yaw --
    // so it settles by continuing the spin it was already doing, never snapping backward.
    let locked = false;
    let lockTargetY = 0;

    const engageLock = () => {
      if (!globeModel) return;
      const twoPi = Math.PI * 2;
      const forwardDelta = ((INDIA_FACING_ROTATION_Y - globeModel.rotation.y) % twoPi + twoPi) % twoPi;
      lockTargetY = globeModel.rotation.y + forwardDelta;
      locked = true;
    };
    const disengageLock = () => {
      locked = false;
    };

    // Title appears as the section transitions in from the Evolution section above (globe still
    // spinning freely); the subtitle appears once the section is fully in view, which is also the
    // moment the globe locks onto India.
    const titleTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'top top',
      scrub: 1.5,
      animation: gsap.to(earthTitleWordsRef.current, {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
      }),
    });
    let pulseFired = false;
    const subtitleTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=30%',
      scrub: 1.5,
      animation: gsap.to(earthSubWordsRef.current, {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
      }),
      onEnter: () => {
        engageLock();

        // Fire India pulse exactly once — after 600ms so globe has time to turn to India
        if (!pulseFired) {
          pulseFired = true;
          gsap.delayedCall(0.6, () => {
            if (!indiaPulseRef.current) return;
            gsap.fromTo(
              indiaPulseRef.current,
              { scale: 0, opacity: 0.9 },
              {
                scale: 3.2,
                opacity: 0,
                duration: 1.8,
                ease: 'power2.out',
              }
            );
          });
        }
      },
      onLeaveBack: () => {
        disengageLock();
      },
    });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const loadGlobe = () => {
      if (disposed) return;

      const gltf = preloadedAssets.glb;
      if (!gltf) {
        // GLB not in preloadedAssets yet — load it directly
        // This covers: page refreshes, race conditions, or if preloader removed GLB
        const loader = new GLTFLoader();
        loader.load(
          '/planet_earth.glb',
          (loadedGltf) => {
            preloadedAssets.glb = loadedGltf;
            if (!disposed) loadGlobe(); // retry with the loaded GLB
          },
          undefined,
          (err) => console.error('EarthSection: failed to load GLB', err)
        );
        return;
      }

      const model = gltf.scene;

      // Recenter and normalize scale so the globe fits the viewport consistently
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const radius = Math.max(size.x, size.y, size.z) / 2;

      model.position.sub(center);
      // Scale the globe to cover exactly 50% of the screen in the center
      const scale = 0.50 / radius;
      model.scale.setScalar(scale);

      // Hide low poly atmosphere shells
      model.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh && /atmosfera/i.test(obj.name)) {
          obj.visible = false;
        }
      });

      // Starts mid-spin (idle state); the render loop takes over rotation from here --
      // free-spinning until the user scrolls, then settling to face India.
      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
      }

      scene.add(model);
      globeModel = model;
      isLoaded = true;

      camera.position.set(0, 0, 2.6);
      camera.lookAt(0, 0, 0);
      resize();
    };
    loadGlobe();

    const IDLE_SPIN_SPEED = 0.001;

    const renderFrame = (delta: number) => {
      if (globeModel) {
        if (locked) {
          globeModel.rotation.y = THREE.MathUtils.lerp(globeModel.rotation.y, lockTargetY, 0.045);
          globeModel.rotation.x = THREE.MathUtils.lerp(globeModel.rotation.x, INDIA_FACING_ROTATION_X, 0.045);
        } else {
          globeModel.rotation.y += IDLE_SPIN_SPEED;
          globeModel.rotation.x = THREE.MathUtils.lerp(globeModel.rotation.x, 0, 0.06);
        }
      }
      mixer?.update(delta);
      renderer.render(scene, camera);
    };

    // ── Star Field ──
    const starCanvas = starCanvasRef.current;
    if (starCanvas) {
      const sCtx = starCanvas.getContext('2d');
      if (sCtx) {
        starCanvas.width  = window.innerWidth;
        starCanvas.height = window.innerHeight;

        const stars: { x: number; y: number; r: number; a: number }[] = [];
        const yOffset = window.innerHeight * 0.18;
        const availableHeight = starCanvas.height - yOffset;
        for (let i = 0; i < 75; i++) {
          stars.push({
            x: Math.random() * starCanvas.width,
            y: yOffset + (Math.random() * availableHeight),
            r: Math.random() < 0.12 ? 1.4 : Math.random() * 0.8 + 0.3,  // 12% bright stars
            a: Math.random() * 0.55 + 0.25,
          });
        }

        stars.forEach(({ x, y, r, a }) => {
          sCtx.beginPath();
          sCtx.arc(x, y, r, 0, Math.PI * 2);
          sCtx.fillStyle = `rgba(255, 248, 235, ${a})`; // warm white, not cold white
          sCtx.fill();
        });

        // Scroll parallax — stars drift up at 12% of scroll speed
        starSt = ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          animation: gsap.to(starCanvas, {
            y: -window.innerHeight * 0.12,
            ease: 'none',
          }),
        });
      }
    }

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (isVisible && isLoaded) {
        timer.update();
        renderFrame(timer.getDelta());
      }
    };
    frameId = requestAnimationFrame(tick);

    // Only render while the section is actually on screen
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Removed emergenceSt that was scaling the entire section and causing a visible boundary gap

    // ── EXIT: Globe pulls up and out ──
    // As section scrolls off the top, globe rises and fades.
    // Different from entry (which was y: 60→0). Exit goes y: 0→-70.
    exitSt = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'bottom 65%',    // when section bottom is 65% from viewport top
      end: 'bottom top',      // when section bottom leaves the viewport
      scrub: 2,
      onEnter: () => {
        sectionExiting = true;
        section.removeEventListener('mousemove', handleMouseMove);
        section.removeEventListener('mouseleave', handleMouseLeave);
      },
      onLeaveBack: () => {
        sectionExiting = false;
        if (landed) {
          section.addEventListener('mousemove', handleMouseMove);
          section.addEventListener('mouseleave', handleMouseLeave);
        }
      },
      animation: gsap.to(containerRef.current, {
        y: -90,
        opacity: 0,
        ease: 'none',
      }),
    });

    const handleVisibilityChange = () => {
      if (document.hidden) isVisible = false;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      dropSt?.kill();
      hangTween?.kill();
      titleTrigger.kill();
      subtitleTrigger.kill();
      earthPin?.kill();
      starSt?.kill();
      exitSt?.kill();

      mixer?.stopAllAction();
      if (globeModel) {
        mixer?.uncacheRoot(globeModel);
      }

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
          if (obj instanceof THREE.Mesh) obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((mat) => {
            Object.values(mat).forEach((value) => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            mat.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();

      teardownLanded();
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-black z-[9] overflow-hidden">

      {/* Star Field Canvas — drawn once on mount, parallaxes at 12% scroll speed */}
      <canvas
        ref={starCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ opacity: 0.7 }}
      />

      {/* Deep sunset-to-space blend — seamlessly connects to Evolution's bottom sunset gradient */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `linear-gradient(to bottom,
            rgba(235, 90, 30, 1.0) 0%,      /* Fiery sunset orange (Matches Evolution exactly) */
            rgba(201, 59, 26, 0.9) 30%,     /* Deep orange */
            rgba(0, 0, 0, 0.9) 70%,         /* Space transition */
            rgba(0, 0, 0, 1.0) 100%)`,      /* Pitch black */
        }}
      />

      <div
        ref={containerRef}
        className="absolute top-1/2 left-1/2 w-[100vmin] h-[100vmin] z-10 pointer-events-none opacity-0"
      >
        {/* India Pulse — fires once when globe locks to face India. Positioned as a
            child of the globe container (not the section) so it tracks the globe's
            mouse-parallax drift instead of floating at a fixed point on screen. */}
        <div
          ref={indiaPulseRef}
          className="absolute pointer-events-none z-20"
          style={{
            top: '48%',
            left: '54%',
            width: '12vmin',
            height: '12vmin',
            transform: 'translate(-50%, -50%) scale(0)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,96,26,0.85) 0%, rgba(201,59,26,0.4) 40%, transparent 70%)',
            willChange: 'transform, opacity',
          }}
        />
      </div>

      <div className="absolute bottom-[8%] left-0 w-full px-6 z-20 flex flex-col items-center text-center pointer-events-none">
        <div className="w-full max-w-[700px] flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em] font-editorial font-normal text-[36px] leading-[1.15] tracking-tight text-white">
          {earthTitle.split(" ").map((word, i) => (
            <span
              key={`et-${i}`}
              ref={el => { if (el) earthTitleWordsRef.current.push(el); }}
              className="opacity-[0.15]"
            >
              {word}
            </span>
          ))}
        </div>
        <div className="w-full max-w-[480px] mt-3 flex flex-wrap justify-center gap-x-[0.2em] gap-y-[0.1em] font-suisse font-light text-[12px] leading-[1.5] tracking-[1.2px] text-white/80">
          {earthSubtitle.split(" ").map((word, i) => (
            <span
              key={`es-${i}`}
              ref={el => { if (el) earthSubWordsRef.current.push(el); }}
              className="opacity-[0.15]"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
