'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Timer } from 'three/src/core/Timer.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import OnScrollTypography from './OnScrollTypography';
import { preloadedAssets } from '../lib/preloader';

// Orientation that turns the textured surface to face India towards the camera
const INDIA_FACING_ROTATION_Y = -0.08;
const INDIA_FACING_ROTATION_X = 0.35;

export default function EarthSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const indiaPulseRef  = useRef<HTMLDivElement>(null);
  const atmosphereRef  = useRef<HTMLDivElement>(null);
  const starCanvasRef  = useRef<HTMLCanvasElement>(null);
  const [titleActive, setTitleActive] = useState(false);
  const [subtitleActive, setSubtitleActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!container || !section) return;

    gsap.registerPlugin(ScrollTrigger);

    // Drop the globe in with authoritative deceleration — no bounce, just mass through air.
    let hangTween: gsap.core.Tween | null = null;
    let sectionExiting = false;
    let starSt: ScrollTrigger | null = null;
    let emergenceSt: ScrollTrigger | null = null;
    let exitSt: ScrollTrigger | null = null;
    gsap.set(container, { xPercent: -50, yPercent: -50 });

    // The drop tween used to have its own ScrollTrigger keyed off the container's
    // pre-pin document position ('top 85%'). That position is reached while the
    // PREVIOUS section (Evolution, higher z-index) is still on screen, so the whole
    // entrance played out hidden behind it — by the time Earth's own pin engaged and
    // became visible, the globe had already silently dropped and settled, reading as
    // a dead "gap" between Evolution and Earth. Triggering it from earthPin's onEnter
    // instead guarantees it plays exactly when Earth becomes the pinned, visible
    // section — paused + no scrollTrigger here, played explicitly below.
    const dropTween = gsap.fromTo(
      container,
      { y: -700, rotation: -8, opacity: 0 },
      {
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 2.2,               // slower fall = more weight
        ease: 'power4.out',          // fast start, dramatic deceleration — no bounce
        paused: true,
        onComplete: () => {
          // Subtle hang — 1.5° max, 4s period. Almost imperceptible but adds life.
          hangTween = gsap.to(container, {
            rotation: 1.5,
            duration: 4.0,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });

          // ── MOUSE INERTIA — starts only after globe has landed ──
          // Globe drifts toward mouse with a lag that feels like mass.
          // Max ±18px horizontal, ±12px vertical. containerRef has
          // xPercent/yPercent: -50 for centering — x/y offsets stack on top cleanly.
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
            gsap.to(container, {
              x: 0,
              y: 0,
              duration: 2.2,
              ease: 'power3.out',
            });
          };

          section.addEventListener('mousemove', handleMouseMove);
          section.addEventListener('mouseleave', handleMouseLeave);

          // Store refs on the section element so cleanup can reach them
          (section as HTMLElement & { _mmove?: EventListener; _mleave?: EventListener })._mmove  = handleMouseMove as EventListener;
          (section as HTMLElement & { _mmove?: EventListener; _mleave?: EventListener })._mleave = handleMouseLeave as EventListener;
        },
      }
    );

    // ── PIN: Hold EarthSection while globe animations play ──
    // Globe drops (2.2s), settles, India locks, text appears, exits.
    // Without pin, section scrolls past before any of this is seen. Playing
    // dropTween here (rather than off its own pre-pin trigger) guarantees the
    // entrance is visible exactly when the section becomes pinned — see note above.
    const earthPin = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=250%',
      pin: true,
      anticipatePin: 1,
      onEnter: () => dropTween.play(),
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight('#ffe9cf', 1.4));
    const sunLight = new THREE.DirectionalLight('#ffae5c', 1.8);
    sunLight.position.set(150, 100, 200);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight('#fff2e0', 0.6);
    fillLight.position.set(-150, -50, 150);
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
      onEnter: () => setTitleActive(true),
      onLeaveBack: () => setTitleActive(false),
    });
    let pulseFired = false;
    const subtitleTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      onEnter: () => {
        setSubtitleActive(true);
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

        // Dual atmosphere glow fades in as globe locks to India
        gsap.to(atmosphereRef.current, {
          opacity: 1,
          duration: 2.5,
          ease: 'power2.out',
        });
      },
      onLeaveBack: () => {
        setSubtitleActive(false);
        disengageLock();
        gsap.to(atmosphereRef.current, {
          opacity: 0,
          duration: 1.2,
          ease: 'power2.in',
        });
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
      // Leave the globe slightly smaller than the full frame (radius 0.82, not 1.0) so the
      // glow has room to fade out to true zero alpha before hitting the canvas edge -- otherwise
      // the camera's visible frustum clips the gradient mid-fade, which reads as a hard square.
      const scale = 0.82 / radius;
      model.scale.setScalar(scale);

      // The original atmosphere shells are too low-poly (~1.7k verts) for a smooth per-vertex
      // rim shader -- it shows faceting. Hide them and use a flat, resolution-independent
      // radial-gradient sprite instead for a soft, natural sunshine glow.
      model.traverse((obj) => {
        if (obj instanceof THREE.Mesh && /atmosfera/i.test(obj.name)) {
          obj.visible = false;
        }
      });

      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 256;
      glowCanvas.height = 256;
      const ctx = glowCanvas.getContext('2d')!;
      // Clip to a circle first -- pixels outside it are never painted, so they stay
      // truly transparent instead of relying on a gradient stop to fade to zero
      // (which left a faint square at the texture's edges).
      ctx.beginPath();
      ctx.arc(128, 128, 128, 0, Math.PI * 2);
      ctx.clip();
      // The sprite is scaled to 2.0 world units (half-width 1.0), and the globe's own radius
      // is 0.82 -- so its silhouette edge falls at texture offset 0.82/1.0 = 0.82. The opaque
      // globe occludes anything inside that radius, so the brightest point of the glow sits
      // AT that offset, then fades fully to zero by offset 1.0 -- comfortably inside the
      // camera's visible frustum (~1.08), so the fade completes before the canvas edge instead
      // of getting clipped mid-fade (which is what read as a hard square before).
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0,    'rgba(255, 200, 140, 0)');     // invisible at center
      gradient.addColorStop(0.70, 'rgba(255, 190, 120, 0)');     // still invisible
      gradient.addColorStop(0.80, 'rgba(255, 178, 102, 0.20)'); // soft peak (was 0.50)
      gradient.addColorStop(0.90, 'rgba(255, 178, 102, 0.06)'); // gentle fade
      gradient.addColorStop(1.0,  'rgba(255, 178, 102, 0)');     // fully transparent
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      const glowSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          transparent: true,
          depthWrite: false,
        })
      );
      glowSprite.scale.set(2.0, 2.0, 1);
      scene.add(glowSprite);

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

    const IDLE_SPIN_SPEED = 0.0028;

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

    // ── ENTRY: Globe Emergence ──
    // opacity NOT set to 0 — Earth must be visible through Evolution’s
    // transparent bg during the exit sequence. Only y and scale are animated.
    // Anchored to the pin's own engagement ('top top'), not the pre-pin approach
    // ('top 90%') — that earlier window overlaps with Evolution (z-10, painted on
    // top), so the lift was completing invisibly before Earth ever became visible.
    gsap.set(sectionRef.current, {
      y: 60,
      scale: 0.97,
      // opacity intentionally omitted — section is always visible
    });

    emergenceSt = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=20%',
      scrub: 1,
      animation: gsap.to(sectionRef.current, {
        y: 0,
        scale: 1,
        ease: 'power3.out',
        // opacity intentionally omitted
      }),
    });

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
        const s = section as HTMLElement & { _mmove?: EventListener; _mleave?: EventListener };
        if (s._mmove)  s.removeEventListener('mousemove',  s._mmove);
        if (s._mleave) s.removeEventListener('mouseleave', s._mleave);
      },
      onLeaveBack: () => {
        sectionExiting = false;
        const s = section as HTMLElement & { _mmove?: EventListener; _mleave?: EventListener };
        if (s._mmove)  s.addEventListener('mousemove',  s._mmove);
        if (s._mleave) s.addEventListener('mouseleave', s._mleave);
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
      dropTween.scrollTrigger?.kill();
      dropTween.kill();
      hangTween?.kill();
      titleTrigger.kill();
      subtitleTrigger.kill();
      earthPin?.kill();
      starSt?.kill();
      emergenceSt?.kill();
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

      // Remove mouse listeners added after drop
      const s = section as HTMLElement & { _mmove?: EventListener; _mleave?: EventListener };
      if (s._mmove)  s.removeEventListener('mousemove',  s._mmove);
      if (s._mleave) s.removeEventListener('mouseleave', s._mleave);
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

        {/* Warm cream background matching the transition */}
        <img
          src="/earth_back.webp"
          alt="Earth Background"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-75 z-[2]"
      />

      {/* Dual Atmosphere Glow — warm India side + cool opposite side */}
      {/* Sized larger than globe container so gradients have room to feather */}
      <div
        ref={atmosphereRef}
        className="absolute pointer-events-none z-[5]"
        style={{
          top: '50%',
          left: '50%',
          width: '114vmin',
          height: '114vmin',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          opacity: 0,
          willChange: 'opacity',
          // mix-blend-mode: screen makes the glow add light against the cream/dark
          // backdrop instead of mixing into a flat muddy-brown ring (multiply-like
          // blending of orange/navy over the cream background was the original issue).
          mixBlendMode: 'screen',
          filter: 'blur(6px)',
          background: `
            radial-gradient(ellipse at 62% 42%, rgba(255,140,60,0.55) 0%, rgba(232,96,26,0.22) 40%, transparent 62%),
            radial-gradient(ellipse at 33% 62%, rgba(70,110,255,0.30) 0%, rgba(30,50,160,0.12) 42%, transparent 66%)
          `,
        }}
      />

      <div
        ref={containerRef}
        className="absolute top-1/2 left-1/2 w-[85vmin] h-[85vmin] z-10 pointer-events-none opacity-0"
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
        <div className="w-full max-w-[700px]" style={{ height: 100 }}>
          <OnScrollTypography
            text="A Climate-smart approach to Suncare"
            effect="effect1"
            isActive={titleActive}
            titleFont={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 400,
              fontSize: 36,
              lineHeight: 1.15,
              letterSpacing: -0.3,
              textAlign: 'center',
            }}
            textColor="#ffffff"
          />
        </div>
        <div className="w-full max-w-[480px]" style={{ height: 50 }}>
          <OnScrollTypography
            text="bringing protection that moves with climate, not just skin type."
            effect="effect9"
            isActive={subtitleActive}
            titleFont={{
              fontFamily: 'var(--font-suisse)',
              fontWeight: 300,
              fontSize: 12,
              lineHeight: 1.5,
              letterSpacing: 1.2,
              textAlign: 'center',
            }}
            textColor="rgba(255,255,255,0.8)"
          />
        </div>
      </div>
    </section>
  );
}
