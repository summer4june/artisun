'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import OnScrollTypography from './OnScrollTypography';

// Orientation that turns the textured surface to face India towards the camera
const INDIA_FACING_ROTATION_Y = -0.08;
const INDIA_FACING_ROTATION_X = 0.35;

export default function EarthSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [titleActive, setTitleActive] = useState(false);
  const [subtitleActive, setSubtitleActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!container || !section) return;

    gsap.registerPlugin(ScrollTrigger);

    // Drop the globe in like it's falling under gravity, let it bounce to a stop,
    // then keep it gently swaying as if it's hanging from a thread.
    let hangTween: gsap.core.Tween | null = null;
    gsap.set(container, { xPercent: -50, yPercent: -50 });
    const dropTween = gsap.fromTo(
      container,
      { y: -600, rotation: -10, opacity: 0 },
      {
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 1.6,
        ease: 'bounce.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        onComplete: () => {
          hangTween = gsap.to(container, {
            rotation: 3.5,
            duration: 2.4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        },
      }
    );

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
    const clock = new THREE.Clock();
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
    const subtitleTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      onEnter: () => {
        setSubtitleActive(true);
        engageLock();
      },
      onLeaveBack: () => {
        setSubtitleActive(false);
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

    const loader = new GLTFLoader();
    loader.load('/planet_earth.glb', (gltf) => {
      if (disposed) return;
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
      gradient.addColorStop(0, 'rgba(255, 200, 140, 0)');
      gradient.addColorStop(0.74, 'rgba(255, 178, 102, 0)');
      gradient.addColorStop(0.82, 'rgba(255, 180, 110, 0.5)');
      gradient.addColorStop(0.92, 'rgba(255, 178, 102, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 178, 102, 0)');
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
    });

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

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (isVisible && isLoaded) renderFrame(clock.getDelta());
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
    // The entire section rises from below with a slight scale-up.
    // The Earth literally emerges into frame — earned, cinematic.
    gsap.set(sectionRef.current, {
      opacity: 0,
      y: 60,
      scale: 0.97,
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%',
      end: 'top 25%',
      scrub: 2,
      animation: gsap.to(sectionRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'power3.out',
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
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-black z-10 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/earth_back.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        ref={containerRef}
        className="absolute top-1/2 left-1/2 w-[50vmin] h-[50vmin] z-10 pointer-events-none opacity-0"
      />

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
            effect="effect1"
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
