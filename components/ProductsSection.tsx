'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend, useLoader } from '@react-three/fiber';
import { useGLTF, ContactShadows, Center, shaderMaterial, Billboard } from '@react-three/drei';
import { EXRLoader, RGBELoader } from 'three-stdlib';
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

// ─── Custom Shader Material to Stitch 2 EXRs ───
const DualHdriMaterial = shaderMaterial(
  { tex1: null, tex2: null, scrollOffset: 0.0, transitionFade: 0.0 },
  // vertex shader
  `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment shader
  `
  uniform sampler2D tex1;
  uniform sampler2D tex2;
  uniform float scrollOffset;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    
    // Calculate Equirectangular UVs
    float u = atan(dir.z, dir.x) / (2.0 * 3.14159265359) + 0.5;
    float v = asin(clamp(dir.y, -1.0, 1.0)) / 3.14159265359 + 0.5;
    
    // Add scroll offset to pan horizontally
    float combinedU = fract(u + scrollOffset);
    
    vec4 color;
    if (combinedU < 0.5) {
      color = texture2D(tex1, vec2(combinedU * 2.0, clamp(v - 0.3, 0.0, 1.0)));
    } else {
      color = texture2D(tex2, vec2((combinedU - 0.5) * 2.0, v));
    }
    
    // --- 2. Darkish sunset overlay ---
    vec3 sunsetTint = vec3(0.85, 0.75, 0.65); // Warm moody sunset
    color.rgb = color.rgb * sunsetTint * 0.45; // Significantly darkened to be moody
    
    gl_FragColor = color;
    
    // Let Three.js handle the ACES Filmic tonemapping
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    
    // --- 1. Blackish blur strictly at the seams ---
    float distToSeam1 = abs(combinedU - 0.5); // The middle seam
    float distToSeam2 = min(combinedU, 1.0 - combinedU); // The outer seam (wrapping)
    float distToAnySeam = min(distToSeam1, distToSeam2);
    
    // Creates a tight black gradient that only covers the exact transition point
    // This perfectly hides the seam without ruining the rest of the image
    float seamShadow = smoothstep(0.0, 0.08, distToAnySeam);
    
    gl_FragColor.rgb = mix(vec3(0.0, 0.0, 0.0), gl_FragColor.rgb, seamShadow);
  }
  `
);

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

extend({ DualHdriMaterial, GlowMaterial });

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

    // Bottle rotates beautifully driven by scroll (reduced speed by 50%)
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

// ─── Dual HDRI Manager ───
function DualPanoramaBackground({ scrollProgress, backgroundOffset, activeIndex }: { scrollProgress: React.MutableRefObject<number>; backgroundOffset: React.MutableRefObject<number>; activeIndex: number }) {
  const { scene } = useThree();
  const materialRef = useRef<any>(null);
  
  const tex1 = useLoader(RGBELoader, '/hdri/new1.hdr');
  const tex2 = useLoader(EXRLoader, '/hdri/studio.exr');
  const loadedTextures = [tex1, tex2];

  React.useLayoutEffect(() => {
    loadedTextures[0].mapping = THREE.EquirectangularReflectionMapping;
    loadedTextures[1].mapping = THREE.EquirectangularReflectionMapping;
    loadedTextures[0].colorSpace = THREE.LinearSRGBColorSpace;
    loadedTextures[1].colorSpace = THREE.LinearSRGBColorSpace;
  }, [loadedTextures]);

  React.useLayoutEffect(() => {
    scene.environment = activeIndex === 0 ? loadedTextures[0] : loadedTextures[1];
  }, [activeIndex, loadedTextures, scene]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.scrollOffset = backgroundOffset.current;
    }
    if (scene.environmentRotation) {
      scene.environmentRotation.y = backgroundOffset.current * Math.PI * 2.0;
    }
  });

  return (
    <mesh>
      {/* Huge sphere to act as our skybox */}
      <sphereGeometry args={[100, 64, 64]} />
      {/* @ts-ignore - custom material from extend */}
      <dualHdriMaterial 
        ref={materialRef} 
        side={THREE.BackSide} 
        tex1={loadedTextures[0]} 
        tex2={loadedTextures[1]} 
        scrollOffset={0} 
        toneMapped={true}
      />
    </mesh>
  );
}

// ─── Scene ───
function Scene({ scrollProgress, backgroundOffset, activeIndex }: { scrollProgress: React.MutableRefObject<number>; backgroundOffset: React.MutableRefObject<number>; activeIndex: number }) {
  const activeColor = products[activeIndex].color;
  const glowRef = useRef<any>(null);
  const shadowGroupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const p = scrollProgress.current;
    
    // Smooth fade out of glows during the whip pan
    let visibility = 1.0;
    if (p >= 0.15 && p <= 0.55) {
      visibility = (Math.abs(p - 0.35) / 0.2);
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
      <DualPanoramaBackground scrollProgress={scrollProgress} backgroundOffset={backgroundOffset} activeIndex={activeIndex} />

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
  const scrollProgress = useRef(0);
  const backgroundOffset = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Cinematic Iris Open — circle expands from center outward
      gsap.set(sectionRef.current, { clipPath: 'inset(40% round 50%)' });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 90%',
        end: 'top top',
        scrub: 1.5,
        animation: gsap.to(sectionRef.current, {
          clipPath: 'inset(0% round 0px)',
          ease: 'power2.out',
        }),
      });

      // Overlay dissolves during iris open
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
          end: '+=200%', // Reduced from 400% for much faster scrolling
          pin: true,
          anticipatePin: 1,
          scrub: 1.0, // Reduced smoothing slightly for snappier response
          onUpdate: (self) => {
            const p = self.progress;
            scrollProgress.current = p; // Global scroll progress
            
            const proxyVal = proxy.offset; // Capture the animated GSAP proxy value
            // Rotate the background slightly continuously as the user scrolls
            backgroundOffset.current = proxyVal + (p * 0.25);
            
            // Whip pan midpoint is now 0.35
            const newIdx = p >= 0.35 ? 1 : 0;
            setActiveIndex((prev) => (prev !== newIdx ? newIdx : prev));
            
            // Smooth crossfade for the text panels
            if (textTopRef.current && textBottomRef.current) {
              let textOp = 1.0;
              if (p >= 0.15 && p <= 0.55) {
                textOp = (Math.abs(p - 0.35) / 0.2);
              }
              
              textTopRef.current.style.opacity = textOp.toString();
              textBottomRef.current.style.opacity = textOp.toString();
            }
          },
        }
      });

      const proxy = { offset: 0 };
      // 0% - 15%: Hold on Wall 1
      whipTl.to(proxy, { offset: 0, duration: 0.15 })
      // 15% - 55%: Slower Whip pan 180 degrees (duration doubled to reduce speed by 50%)
      .to(proxy, { 
        offset: 0.5, 
        duration: 0.40, 
        ease: "power2.inOut"
      })
      // 55% - 100%: Hold on Wall 2
      .to(proxy, { offset: 0.5, duration: 0.45 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="products-section" ref={sectionRef} className="relative w-full h-screen overflow-hidden">

      {/* R3F Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.3, 5], fov: 38 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        >
          <Suspense fallback={null}>
            <Scene scrollProgress={scrollProgress} backgroundOffset={backgroundOffset} activeIndex={activeIndex} />
          </Suspense>
        </Canvas>
      </div>
      {/* ── Top Title ── */}
      <div 
        ref={textTopRef}
        className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center"
      >
        {products.map((p, i) => (
          <h1 
            key={p.id}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-max text-5xl md:text-8xl font-thin text-white tracking-[0.1em] transition-opacity duration-300 ${activeIndex === i ? 'opacity-100' : 'opacity-0'}`}
          >
            {p.title}
          </h1>
        ))}
      </div>

      {/* ── Bottom Subtitle & Desc ── */}
      <div 
        ref={textBottomRef}
        className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center w-[90%] max-w-lg"
      >
        {products.map((p, i) => (
          <div 
            key={p.id}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full transition-opacity duration-300 flex flex-col items-center ${activeIndex === i ? 'opacity-100' : 'opacity-0'}`}
          >
            <h3 className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/80 mb-4">{p.subtitle}</h3>
            <p className="text-sm md:text-base text-white leading-relaxed font-light">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Nav Dots ── */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
        {products.map((prod, idx) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={prod.id}
              className="group flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                const st = ScrollTrigger.getAll().find((t: any) => t.trigger === sectionRef.current);
                if (st) {
                  const scrollPos = st.start + (st.end - st.start) * (idx === 0 ? 0.25 : 0.75);
                  gsap.to(window, { scrollTo: scrollPos, duration: 1.2, ease: 'power3.inOut' });
                }
              }}
            >
              <span className={`block rounded-full transition-all duration-500 ${
                isActive ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white/20 group-hover:bg-white/40'
              }`} />
              <span className={`text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-500 ${
                isActive ? 'text-white opacity-100' : 'opacity-0 group-hover:opacity-50 text-white'
              }`}>
                {prod.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Heavy Vignette to keep focus on product ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.9) 100%)',
      }} />

      {/* Entry Dissolve Overlay */}
      <div
        className="products-entry-overlay absolute inset-0 pointer-events-none z-[35]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #3a0d0d 0%, #0a0000 100%)',
          willChange: 'opacity, filter',
        }}
      />
    </div>
  );
}

useGLTF.preload('/1.glb');
useGLTF.preload('/2.glb');
