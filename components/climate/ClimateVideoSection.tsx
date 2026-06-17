'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const URLS = [
  '/videos/climate/1.mp4',
  '/videos/climate/2.mp4',
  '/videos/climate/3.mp4',
  '/videos/climate/4.mp4',
  '/videos/climate/5.mp4',
];

const TRANS_TYPES = [0, 2, 1, 0, 2];

const SLIDE_TEXTS = [
  "In Shimla, your skin feels dry, tight and flaky",
  "In Jaipur, the very same skin turns oily, sticky and pigmented",
  "Bangalore's heat and humidity cling to you all day.",
  "While sudden showers in Mumbai make it greasy and unpredictable.",
  "And through all these climates, the sun never leaves your side."
];

export default function ClimateVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for direct GSAP DOM manipulation (bypassing React state for 60fps scrubbing)
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const N = URLS.length;
    if (!canvasRef.current || !containerRef.current) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    let mat: THREE.ShaderMaterial;

    const updateSize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (mat) mat.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    };
    window.addEventListener('resize', updateSize);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const vertSrc = `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragSrc = `
      precision highp float;
      varying vec2 vUv;

      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float     uProgress;
      uniform float     uAspect;
      uniform int       uTransType;

      float rand(vec2 co){
        return fract(sin(dot(co,vec2(12.9898,78.233)))*43758.5453);
      }

      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f*f*(3.0-2.0*f);
        float a=rand(i);
        float b=rand(i+vec2(1,0));
        float c=rand(i+vec2(0,1));
        float d=rand(i+vec2(1,1));
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }

      float fbm(vec2 p){
        float v=0.0, a=0.5;
        for(int i=0;i<5;i++){
          v+=a*noise(p);
          p*=2.1;
          a*=0.5;
        }
        return v;
      }

      vec2 coverUV(vec2 uv, float imgAspect){
        float vAspect = uAspect;
        vec2 scale = vec2(1.0);
        if(vAspect > imgAspect){
          scale.y = imgAspect / vAspect;
        } else {
          scale.x = vAspect / imgAspect;
        }
        return (uv - 0.5) / scale + 0.5;
      }

      void main(){
        float p  = clamp(uProgress, 0.0, 1.0);
        vec2  uv = vUv;

        // Video aspect ratio
        float imgAspect = 16.0/9.0;
        vec2 uvA = coverUV(uv, imgAspect);
        vec2 uvB = coverUV(uv, imgAspect);

        vec4 colA = texture2D(uTexA, clamp(uvA,0.0,1.0));
        vec4 colB = texture2D(uTexB, clamp(uvB,0.0,1.0));

        vec2 vig = (uv - 0.5) * 2.0;
        float vigF = 1.0 - dot(vig*0.5, vig*0.5);
        vigF = pow(max(vigF,0.0), 0.4); // Made vignette slightly softer than the dark original

        // Lighter bottom gradient so videos pop more
        float grad = 1.0 - smoothstep(0.4, 1.0, uv.y);
        float darken = 1.0 - grad * 0.4;

        vec4 finalCol;

        if(uTransType == 0){
          float n  = fbm(uv * 3.5 + p * 0.8);
          float n2 = fbm(uv * 6.0 - p * 1.2 + 42.0);
          float noise_val = (n * 0.7 + n2 * 0.3);

          float edge     = p;
          float softness = 0.28;
          float mask     = smoothstep(edge - softness, edge + softness, noise_val);

          float scaleA = 1.0 + p * 0.08;
          float scaleB = 1.0 + (1.0-p) * 0.06;
          vec2 uvA2 = (uvA - 0.5) / scaleA + 0.5;
          vec2 uvB2 = (uvB - 0.5) / scaleB + 0.5;
          vec4 cA = texture2D(uTexA, clamp(uvA2,0.0,1.0));
          vec4 cB = texture2D(uTexB, clamp(uvB2,0.0,1.0));

          float edgeDark = smoothstep(0.0,0.15, abs(mask - 0.5));
          float burnMix  = (1.0 - edgeDark) * 0.7 * sin(p*3.14159);

          finalCol = mix(cA, cB, mask);
          finalCol.rgb *= (1.0 - burnMix * 0.85);
          finalCol.rgb *= darken;

        } else if(uTransType == 1){
          float burn = sin(p * 3.14159);
          vec4 cross = mix(colA, colB, smoothstep(0.0,1.0,p));
          cross.rgb += burn * 0.35;
          float sc = 1.0 + p * 0.1;
          vec2 uvAz = (uvA - 0.5)/sc + 0.5;
          vec4 cAz = texture2D(uTexA, clamp(uvAz,0.0,1.0));
          finalCol = mix(cAz, colB, smoothstep(0.2,0.8,p));
          finalCol.rgb += burn * 0.2;
          finalCol.rgb *= darken;

        } else {
          float diag = uv.x * 0.5 + (1.0-uv.y) * 0.5;
          float n = fbm(uv * 4.0) * 0.15;
          float mask = smoothstep(p - 0.25, p + 0.25, diag + n);
          float edgeDark = 1.0 - smoothstep(0.0, 0.1, abs((diag+n) - p));
          finalCol = mix(colA, colB, 1.0-mask);
          finalCol.rgb *= (1.0 - edgeDark * 0.7 * sin(p*3.14159));
          finalCol.rgb *= darken;
        }

        finalCol.rgb *= vigF * 1.08;
        gl_FragColor = vec4(finalCol.rgb, 1.0);
      }
    `;

    mat = new THREE.ShaderMaterial({
      vertexShader: vertSrc,
      fragmentShader: fragSrc,
      uniforms: {
        uTexA: { value: null },
        uTexB: { value: null },
        uProgress: { value: 0.0 },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uTransType: { value: 0 },
      }
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geo, mat);
    scene.add(quad);
    updateSize();

    // ── Setup Video Textures ──
    const videoElements: HTMLVideoElement[] = [];
    const textures: THREE.VideoTexture[] = [];
    
    // Fallback images incase video fails or while loading
    const loader = new THREE.TextureLoader();
    const fallbackTex = loader.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

    URLS.forEach((url) => {
      const vid = document.createElement('video');
      vid.src = url;
      vid.muted = true;
      vid.loop = true;
      vid.crossOrigin = "anonymous";
      vid.playsInline = true;
      // We explicitly DO NOT autoplay them here to save heavy background CPU
      videoElements.push(vid);
      
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      textures.push(tex);
    });

    // Initialize first textures
    mat.uniforms.uTexA.value = textures[0];
    mat.uniforms.uTexB.value = textures[1];

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // ── ScrollTrigger Logic ──
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      pin: true,
      start: "top top",
      end: "+=800%", // Provides 800vh of scroll distance
      scrub: true,
      snap: {
        snapTo: (value) => {
          const parts = N * 2 - 1; // 9
          const rawPart = value * parts;
          const phase = Math.floor(rawPart);
          
          if (value >= 1) return 1;
          if (value <= 0) return 0;

          if (phase % 2 === 0) {
            return value;
          } else {
            return Math.round(rawPart) / parts;
          }
        },
        duration: { min: 0.3, max: 0.8 },
        delay: 0.15,
        ease: "power2.inOut"
      },
      onUpdate: (self) => {
        const t = self.progress;
        
        // 9 mathematical scroll phases
        const parts = N * 2 - 1;
        const rawPart = t * parts;
        let phase = Math.floor(rawPart);
        const phaseFrac = rawPart - phase;

        if (phase >= parts) phase = parts - 1;

        let fromIdx = 0, toIdx = 0, frac = 0;

        if (phase % 2 === 0) {
          const idx = phase / 2;
          fromIdx = idx; toIdx = idx; frac = 0;
        } else {
          const idx = (phase - 1) / 2;
          fromIdx = idx; toIdx = idx + 1; frac = phaseFrac;
        }
        
        if (fromIdx >= N) fromIdx = N - 1;
        if (toIdx >= N) toIdx = N - 1;

        // Sync WebGL
        mat.uniforms.uTexA.value = textures[fromIdx];
        mat.uniforms.uTexB.value = textures[toIdx];
        mat.uniforms.uProgress.value = (fromIdx === toIdx) ? 0.0 : frac;
        mat.uniforms.uTransType.value = TRANS_TYPES[fromIdx] || 0;

        // Sync Videos
        videoElements.forEach((vid, i) => {
          if (i === fromIdx || i === toIdx) {
            if (vid.paused && vid.readyState >= 2) vid.play().catch(() => {});
          } else {
            if (!vid.paused) vid.pause();
          }
        });

        // ── Direct DOM Sync for Typography & UI (Tied 100% to Scroll Pixel) ──
        
        textRefs.current.forEach((el, i) => {
          if (!el) return;
          const chars = el.querySelectorAll('.char-span');
          const totalChars = chars.length;
          const holdPhase = i * 2;
          
          if (phase === holdPhase) {
            // Active slide holding steady
            el.style.opacity = "1";
            el.style.transform = "translateY(0px)";
            chars.forEach((c) => ((c as HTMLElement).style.opacity = "1"));
          } else if (phase === holdPhase - 1) {
            // Typing IN during the second half of the previous video's transition
            if (frac > 0.5) {
              const localFrac = (frac - 0.5) * 2; // 0 to 1
              el.style.opacity = "1";
              el.style.transform = `translateY(${30 * (1 - localFrac)}px)`;
              
              chars.forEach((c, idx) => {
                 const start = idx / totalChars;
                 const end = (idx + 1) / totalChars;
                 let charOp = (localFrac - start) / (end - start);
                 if (charOp < 0) charOp = 0;
                 if (charOp > 1) charOp = 1;
                 (c as HTMLElement).style.opacity = charOp.toString();
              });
            } else {
              el.style.opacity = "0";
            }
          } else if (phase === holdPhase + 1) {
            // Fading OUT entirely during the first half of the current video's transition
            if (frac < 0.5) {
              const localFrac = frac * 2; // 0 to 1
              const blockOp = 1 - localFrac;
              el.style.opacity = blockOp.toString();
              el.style.transform = `translateY(${-30 * localFrac}px)`;
              chars.forEach((c) => ((c as HTMLElement).style.opacity = "1"));
            } else {
              el.style.opacity = "0";
            }
          } else {
            el.style.opacity = "0";
          }
        });

        dotsRef.current.forEach((dot, i) => {
           if (!dot) return;
           const holdPhase = i * 2;
           let dotOp = 0.3;
           let dotScale = 1;
           
           if (phase === holdPhase) {
             dotOp = 1;
             dotScale = 1.5;
           } else if (phase === holdPhase - 1) {
             dotOp = 0.3 + (0.7 * frac);
             dotScale = 1 + (0.5 * frac);
           } else if (phase === holdPhase + 1) {
             dotOp = 1 - (0.7 * frac);
             dotScale = 1.5 - (0.5 * frac);
           }
           
           dot.style.opacity = dotOp.toString();
           dot.style.transform = `scale(${dotScale})`;
           if (dotOp > 0.8) {
             dot.style.boxShadow = '0 0 10px rgba(166,42,44,0.8)';
           } else {
             dot.style.boxShadow = 'none';
           }
        });
      }
    });

    videoElements[0].play().catch(() => {});

    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeoutId);
      cancelAnimationFrame(reqId);
      if (st) st.kill();
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      textures.forEach(t => t.dispose());
      videoElements.forEach(vid => {
        vid.pause();
        vid.src = "";
        vid.load();
        vid.remove();
      });
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-black z-10">
      <div className="relative w-full h-screen overflow-hidden z-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.5)] via-transparent to-[rgba(0,0,0,0.2)] pointer-events-none" />

        <div className="absolute inset-0 z-10 pointer-events-none">
          {SLIDE_TEXTS.map((text, i) => {
            let lines = [text];
            if (i === 0) lines = ["In Shimla,", "your skin feels dry, tight and flaky"];
            else if (i === 1) lines = ["In Jaipur, the very same skin", "turns oily, sticky and pigmented"];
            else if (i === 2) lines = ["Bangalore’s heat and", "humidity cling to you all day."];
            else if (i === 3) lines = ["While sudden showers in Mumbai", "make it greasy and unpredictable."];
            else if (i === 4) lines = ["And through all these climates,", "the sun never leaves your side."];

            let positionClasses = "";
            let textAlignment = "";
            
            if (i === 0 || i === 2) { 
              positionClasses = "justify-start items-start pt-[18vh] md:pt-[22vh] pl-[8vw] md:pl-[12vw]";
              textAlignment = "text-left";
            } else if (i === 1 || i === 3) { 
              positionClasses = "justify-start items-end pt-[18vh] md:pt-[22vh] pr-[8vw] md:pr-[12vw]";
              textAlignment = "text-right";
            } else { 
              positionClasses = "justify-center items-center";
              textAlignment = "text-center";
            }

            return (
              <div 
                key={i}
                ref={el => { textRefs.current[i] = el; }}
                className={`absolute inset-0 flex flex-col ${positionClasses} ${textAlignment}`}
                style={{ opacity: i === 0 ? 1 : 0, transform: i === 0 ? 'translateY(0)' : 'translateY(30px)' }}
              >
                <h2 className="font-editorial font-normal text-[clamp(16px,4vw,50px)] leading-[1.15] tracking-[-0.01em] text-[#a62a2c]">
                  {(() => {
                    let cumulativeCharCount = 0;
                    return lines.map((line, idx) => {
                      const lineStartDelay = cumulativeCharCount;
                      cumulativeCharCount += line.length;
                      
                      return (
                        <span key={idx} className="block whitespace-nowrap drop-shadow-[0_4px_16px_rgba(255,255,255,0.6)]">
                          {line.split('').map((char, charIdx) => {
                            return (
                              <span
                                key={charIdx}
                                className="char-span inline-block"
                                style={{ opacity: i === 0 ? 1 : 0 }}
                              >
                                {char === ' ' ? '\u00A0' : char}
                              </span>
                            );
                          })}
                        </span>
                      );
                    });
                  })()}
                </h2>
              </div>
            );
          })}
        </div>

        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10">
          {URLS.map((_, i) => (
            <div 
              key={i}
              ref={el => { dotsRef.current[i] = el; }}
              className="w-2.5 h-2.5 rounded-full bg-[#a62a2c]"
              style={{
                opacity: i === 0 ? 1 : 0.3,
                transform: i === 0 ? 'scale(1.5)' : 'scale(1)',
                boxShadow: i === 0 ? '0 0 10px rgba(166,42,44,0.8)' : 'none'
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
