'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useGLTF, ContactShadows, Center, shaderMaterial, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const products = [
  {
    id: 'bottle-1',
    title: 'Origin Skinwear',
    subtitle: 'ORIGIN SUNWEAR',
    desc: 'The new Origin is the latest revolution in daily suncare with a bold finish. Clean design, cutting-edge technology, and extreme UV safety.',
    model: '/1.glb',
    color: '#D44026',
  },
  {
    id: 'bottle-2',
    title: 'AURA',
    subtitle: 'ORIGIN DETAILS',
    desc: 'Smooth evenly on face and neck each morning. Protects your skin continuously while keeping a premium matte finish.',
    model: '/2.glb',
    color: '#8A2718',
  },
];

// ─── Premium Glow Radial Shader ───
const GlowMaterial = shaderMaterial(
  { glowColor: new THREE.Color('#ffaa55'), glowOpacity: 0.8 },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `uniform vec3 glowColor; uniform float glowOpacity; varying vec2 vUv;
   void main() {
     float dist = distance(vUv, vec2(0.5));
     // Smooth gradient from center to edge
     float alpha = smoothstep(0.5, 0.0, dist);
     alpha = pow(alpha, 1.5); // soften the falloff
     gl_FragColor = vec4(glowColor, alpha * glowOpacity);
   }`
);

extend({ GlowMaterial });

// ─── Single Bottle ───
function Bottle({
  modelPath,
  scrollProgress,
  isActive,
}: {
  modelPath: string;
  scrollProgress: React.MutableRefObject<number>;
  isActive: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(modelPath);
  const cloned = React.useMemo(() => scene.clone(true), [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    groupRef.current.visible = isActive;
    if (!isActive) return;

    const p = scrollProgress.current;

    // Bottle rotates beautifully driven by scroll
    const scrollRotation = p * Math.PI * 2.0;
    // Plus a tiny bit of idle life
    const idleRotation = clock.elapsedTime * 0.2;
    const idleFloat = Math.sin(clock.elapsedTime * 0.6) * 0.008;

    groupRef.current.position.set(0, idleFloat, 0);
    groupRef.current.rotation.set(0, scrollRotation + idleRotation, 0);
    groupRef.current.scale.setScalar(0.35);
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={cloned} />
      </Center>
    </group>
  );
}

// ─── Scene ───
function Scene({ scrollProgress, activeIndex, proxyOffset }: { scrollProgress: React.MutableRefObject<number>; activeIndex: number, proxyOffset: React.MutableRefObject<number> }) {
  const activeColor = products[activeIndex].color;
  const glowRef = useRef<any>(null);
  const shadowGroupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const p = scrollProgress.current;
    
    // Smooth fade out of glows during the whip pan (which occurs between 0.66 and 0.90)
    let visibility = 1.0;
    if (p >= 0.66 && p <= 0.90) {
      visibility = (Math.abs(p - 0.78) / 0.12); // midpoint is 0.78
    }

    if (glowRef.current) {
      glowRef.current.glowOpacity = visibility * 0.85; // Stronger glow opacity
    }
    if (shadowGroupRef.current) {
      shadowGroupRef.current.visible = true;
      shadowGroupRef.current.scale.setScalar(1.0);
    }
  });

  return (
    <>
      {/* ── Premium Sunshine Backlight Glow ── */}
      <Billboard position={[0, 0.3, -1.5]}>
        <mesh>
          <planeGeometry args={[10, 10]} />
          {/* @ts-ignore */}
          <glowMaterial 
            ref={glowRef}
            glowColor={new THREE.Color('#ffcc66')} // Golden sunshine glow
            glowOpacity={0.85} 
            transparent 
            depthWrite={false} 
            blending={THREE.AdditiveBlending} 
          />
        </mesh>
      </Billboard>
      {/* Pointlight directly behind bottle for sunshine rim-light */}
      <pointLight position={[0, 0.5, -1]} intensity={3.5} color="#ffcc66" distance={5} decay={2} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-4, 3, -5]} intensity={0.4} color="#ffcc88" />
      <spotLight position={[0, 10, 3]} angle={0.3} penumbra={1} intensity={2} castShadow />
      
      <group ref={shadowGroupRef}>
        <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={6} blur={2.5} far={4} color={activeColor} />
      </group>

      <Bottle modelPath="/1.glb" scrollProgress={scrollProgress} isActive={activeIndex === 0} />
      <Bottle modelPath="/2.glb" scrollProgress={scrollProgress} isActive={activeIndex === 1} />
    </>
  );
}

// ─── Main ───
export default function ProductsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textTopRef = useRef<HTMLDivElement>(null);
  const textBottomRef = useRef<HTMLDivElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const uiWrapRef = useRef<HTMLDivElement>(null);
  const bgWrapRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  
  const introWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  introWordsRef.current = [];
  const introString = "Two ways to wear protection";
  
  const scrollProgress = useRef(0);
  const proxyOffset = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ── ENTRY: Top Drop — descends from above ──
      gsap.set(sectionRef.current, { clipPath: 'inset(0% 0% 100% 0%)' });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 90%',
        end: 'top top',
        scrub: 1.5,
        animation: gsap.to(sectionRef.current, {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'power2.out',
        }),
      });

      const entryOverlay = sectionRef.current?.querySelector('.products-entry-overlay') as HTMLElement;
      if (entryOverlay) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'top 20%',
          scrub: 1.5,
          animation: gsap.to(entryOverlay, { opacity: 0, ease: 'power2.inOut' }),
        });
      }

      // Whip-pan Timeline
      const whipTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%', // 3-stage section
          pin: true,
          anticipatePin: 1,
          scrub: 1.0, 
          onUpdate: (self) => {
            const p = self.progress;
            scrollProgress.current = p; // Global scroll progress
            
            // Phase 1: 0% - 33% (Intro Text)
            // Phase 2: 33% - 66% (Product 1)
            // Phase 3: 66% - 100% (Product 2)
            
            // ── Handle Intro Text Dissolve ──
            // Text holds fully visible from 0 to 0.15, then fades out by 0.25
            let introOp = 1.0;
            if (p > 0.15) introOp = Math.max(0, 1 - ((p - 0.15) / 0.10));
            if (introTextRef.current) introTextRef.current.style.opacity = introOp.toString();

            // ── Handle Canvas & UI Fade In ──
            // Canvas waits for text to dissolve completely, then starts fading in at 0.25 (to 0.35)
            let canvasOp = 0.0;
            if (p > 0.25) canvasOp = Math.min(1, (p - 0.25) / 0.10);
            if (canvasWrapRef.current) canvasWrapRef.current.style.opacity = canvasOp.toString();
            if (uiWrapRef.current) uiWrapRef.current.style.opacity = canvasOp.toString();
            if (bgWrapRef.current) bgWrapRef.current.style.opacity = canvasOp.toString();
            if (vignetteRef.current) vignetteRef.current.style.opacity = canvasOp.toString();

            // ── Handle Rotation Offset ──
            const proxyVal = proxy.offset; 
            proxyOffset.current = proxyVal + (p * 0.15); // gentle continuous drift + proxy snap
            
            // Whip pan midpoint is p = 0.78
            const newIdx = p >= 0.78 ? 1 : 0;
            setActiveIndex((prev) => (prev !== newIdx ? newIdx : prev));
            
            // Smooth crossfade for the top/bottom text panels during the whip pan (0.70 - 0.86)
            if (textTopRef.current && textBottomRef.current) {
              let textOp = 1.0;
              if (p >= 0.70 && p <= 0.86) {
                textOp = (Math.abs(p - 0.78) / 0.08);
              }
              textTopRef.current.style.opacity = textOp.toString();
              textBottomRef.current.style.opacity = textOp.toString();
            }
          },
        }
      });

      const proxy = { offset: 0 };
      
      // Reveal the intro words sequentially during the first 10% of the scroll
      whipTl.to(introWordsRef.current, {
        opacity: 1,
        stagger: 0.02,
        duration: 0.10,
        ease: "none"
      }, 0);

      // 0.0 to 0.66: holding on Product 1.
      whipTl.to(proxy, { offset: 0, duration: 0.66 }, 0)
      // 0.66 to 0.90: Whip pan
      .to(proxy, { offset: 0.5, duration: 0.24, ease: "power2.inOut" }, 0.66)
      // 0.90 to 1.0: Hold on Product 2
      .to(proxy, { offset: 0.5, duration: 0.10 }, 0.90);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="products-section" ref={sectionRef} className="relative w-full h-screen overflow-hidden">
      
      {/* ── Dynamic Premium Backgrounds (Fades in with products) ── */}
      <div ref={bgWrapRef} className="absolute inset-0 z-[-1]" style={{ opacity: 0, willChange: 'opacity' }}>
        {/* Product 1: Origin (Warm, subtle molten glow) */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeIndex === 0 ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'radial-gradient(circle at 50% 50%, #4a1308 0%, #170402 50%, #050505 100%)'
          }}
        />
        {/* Product 2: Aura (Deep, luxurious burgundy velvet) */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeIndex === 1 ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'radial-gradient(circle at 50% 50%, #2b0606 0%, #0a0101 50%, #050505 100%)'
          }}
        />
      </div>

      
      {/* ── Phase 1: Intro Text ── */}
      <div 
        ref={introTextRef}
        className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
      >
        <h2 className="text-4xl md:text-7xl lg:text-8xl font-thin text-white tracking-[0.05em] text-center px-4 max-w-5xl leading-tight drop-shadow-2xl font-editorial flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em]">
          {introString.split(" ").map((word, wordIndex) => (
            <span 
              key={`intro-${wordIndex}`} 
              ref={el => { if (el) introWordsRef.current.push(el); }} 
              className="opacity-15 inline-block"
            >
              {word}
            </span>
          ))}
        </h2>
      </div>

      {/* ── Phase 2 & 3: 3D Scene (Starts invisible) ── */}
      <div ref={canvasWrapRef} className="absolute inset-0 z-0" style={{ opacity: 0, willChange: 'opacity' }}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.3, 5], fov: 38 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, alpha: true }}
        >
          <Suspense fallback={null}>
            <Scene scrollProgress={scrollProgress} activeIndex={activeIndex} proxyOffset={proxyOffset} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── UI Layer for Products (Starts invisible) ── */}
      <div ref={uiWrapRef} className="absolute inset-0 z-20 pointer-events-none" style={{ opacity: 0, willChange: 'opacity' }}>
        {/* Top Title */}
        <div ref={textTopRef} className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 text-center w-full">
          {products.map((p, i) => (
            <h1 
              key={p.id}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-max text-5xl md:text-8xl font-thin text-white tracking-[0.1em] transition-opacity duration-300 font-editorial ${activeIndex === i ? 'opacity-100' : 'opacity-0'}`}
            >
              {p.title}
            </h1>
          ))}
        </div>

        {/* Bottom Subtitle & Desc */}
        <div ref={textBottomRef} className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 text-center w-[90%] max-w-lg">
          {products.map((p, i) => (
            <div 
              key={p.id}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full transition-opacity duration-300 flex flex-col items-center ${activeIndex === i ? 'opacity-100' : 'opacity-0'}`}
            >
              <h3 className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/80 mb-4 font-suisse font-semibold">{p.subtitle}</h3>
              <p className="text-sm md:text-base text-white leading-relaxed font-light font-suisse">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Nav Dots ── */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
        {products.map((prod, idx) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={prod.id}
              className="group flex items-center gap-2.5 cursor-pointer pointer-events-auto"
              onClick={() => {
                const st = ScrollTrigger.getAll().find((t: any) => t.trigger === sectionRef.current);
                if (st) {
                  // Target scroll positions based on the new 300% timeline
                  const targetP = idx === 0 ? 0.50 : 0.95;
                  const scrollPos = st.start + (st.end - st.start) * targetP;
                  gsap.to(window, { scrollTo: scrollPos, duration: 1.2, ease: 'power3.inOut' });
                }
              }}
            >
              <span className={`block rounded-full transition-all duration-500 ${
                isActive ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white/20 group-hover:bg-white/40'
              }`} />
              <span className={`text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-500 font-suisse ${
                isActive ? 'text-white opacity-100' : 'opacity-0 group-hover:opacity-50 text-white'
              }`}>
                {prod.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Heavy Vignette to keep focus on product (fades in with canvas) ── */}
      <div ref={vignetteRef} className="absolute inset-0 z-[1] pointer-events-none" style={{
        opacity: 0,
        willChange: 'opacity',
        background: 'radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.9) 100%)',
      }} />

      {/* Entry Dissolve Overlay */}
      <div
        className="products-entry-overlay absolute inset-0 pointer-events-none z-[35]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1a0505 0%, #0a0000 60%, #000 100%)',
          willChange: 'opacity',
        }}
      />
    </div>
  );
}

useGLTF.preload('/1.glb');
useGLTF.preload('/2.glb');
