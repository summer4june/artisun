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
  uniform float     uAspectA;
  uniform float     uAspectB;

  vec2 coverUV(vec2 uv, float imgAspect){
    float vAspect = uAspect;
    vec2 scale = vec2(1.0);
    if(vAspect > imgAspect){
      scale.y = imgAspect / vAspect;
    } else {
      scale.x = vAspect / imgAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main(){
    float p  = clamp(uProgress, 0.0, 1.0);
    vec2  uv = vUv;

    vec2 uvA = coverUV(uv, uAspectA);
    vec2 uvB = coverUV(uv, uAspectB);

    vec4 cA = texture2D(uTexA, clamp(uvA,0.0,1.0));
    vec4 cB = texture2D(uTexB, clamp(uvB,0.0,1.0));

    // Pure, simple crossfade
    vec4 finalCol = mix(cA, cB, p);
    
    // Darken slightly for text readability
    finalCol.rgb *= 0.85;

    gl_FragColor = finalCol;
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
        uAspectA: { value: 16.0 / 9.0 },
        uAspectB: { value: 16.0 / 9.0 },
      },
      depthWrite: false,
      depthTest: false
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geo, mat);
    scene.add(quad);
    updateSize();

    let activeIdx = 0;
    let isAnimating = false;
    let st: any = null;

    // ── Setup Video Textures ──
    const videoElements: HTMLVideoElement[] = [];
    const textures: THREE.VideoTexture[] = [];
    const aspectRatios = new Array(N).fill(16.0 / 9.0);

    URLS.forEach((url, idx) => {
      const vid = document.createElement('video');
      vid.src = url;
      vid.muted = true;
      vid.loop = true;
      vid.crossOrigin = "anonymous";
      vid.playsInline = true;
      vid.preload = "auto";
      
      vid.addEventListener('loadedmetadata', () => {
        aspectRatios[idx] = vid.videoWidth / vid.videoHeight || 16.0 / 9.0;
        if (idx === activeIdx && mat) {
          mat.uniforms.uAspectA.value = aspectRatios[idx];
        }
        if (idx === Math.min(activeIdx + 1, N - 1) && mat) {
          mat.uniforms.uAspectB.value = aspectRatios[idx];
        }
      });

      videoElements.push(vid);
      
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
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

    const triggerTransition = (fromIdx: number, toIdx: number) => {
      if (!st) return;
      isAnimating = true;

      // Hide old text instantly
      const oldEl = textRefs.current[fromIdx];
      if (oldEl) {
        oldEl.style.opacity = "0";
        oldEl.style.transform = "translateY(30px)";
        const chars = oldEl.querySelectorAll('.char-span');
        gsap.killTweensOf(chars);
        chars.forEach(c => ((c as HTMLElement).style.opacity = "0"));
        oldEl.dataset.typing = "false";
      }

      // Sync WebGL
      mat.uniforms.uTexA.value = textures[fromIdx];
      mat.uniforms.uAspectA.value = aspectRatios[fromIdx];
      mat.uniforms.uTexB.value = textures[toIdx];
      mat.uniforms.uAspectB.value = aspectRatios[toIdx];
      mat.uniforms.uProgress.value = 0.0;

      // Sync Videos
      videoElements.forEach((vid, i) => {
        if (i === fromIdx || i === toIdx) {
          if (vid.paused && vid.readyState >= 2) vid.play().catch(()=>{});
        } else {
          if (!vid.paused) vid.pause();
        }
      });

      // Quick visual swap (fade of 0.05s to look sleek but feel instant)
      gsap.to(mat.uniforms.uProgress, {
        value: 1.0,
        duration: 0.05,
        ease: "none"
      });

      // Animate the scroll position to target slide scroll position
      const targetScroll = st.start + (toIdx / (N - 1)) * (st.end - st.start);
      const scrollObj = { y: st.scroll() };

      gsap.to(scrollObj, {
        y: targetScroll,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          st.scroll(scrollObj.y);
        },
        onComplete: () => {
          activeIdx = toIdx;

          // Trigger new text
          const newEl = textRefs.current[toIdx];
          if (newEl) {
            newEl.style.opacity = "1";
            newEl.style.transform = "translateY(0px)";
            const chars = newEl.querySelectorAll('.char-span');
            gsap.killTweensOf(chars);
            gsap.fromTo(chars, 
              { opacity: 0, x: -5 }, 
              { opacity: 1, x: 0, duration: 0.15, stagger: 0.015, ease: "power2.out", overwrite: true }
            );
            newEl.dataset.typing = "true";
          }

          // Update dots
          dotsRef.current.forEach((dot, i) => {
             if (!dot) return;
             if (i === toIdx) {
               dot.style.opacity = "1";
               dot.style.transform = "scale(1.5)";
               dot.style.boxShadow = '0 0 10px rgba(166,42,44,0.8)';
             } else {
               dot.style.opacity = "0.3";
               dot.style.transform = "scale(1)";
               dot.style.boxShadow = 'none';
             }
          });

          // Cooldown to absorb residual trackpad/mouse scroll momentum
          setTimeout(() => {
            isAnimating = false;
          }, 150);
        }
      });
    };

    // ── ScrollTrigger Logic ──
    st = ScrollTrigger.create({
      trigger: containerRef.current,
      pin: true,
      start: "top top",
      end: "+=500%", 
      scrub: false, // CRITICAL: Disable scrub. We animate everything independently now!
      onUpdate: (self: any) => {
        const t = self.progress;
        const total = N - 1;
        const raw = t * total;

        if (isAnimating) return;

        // A tiny 5% scroll instantly triggers a full premium transition
        if (raw > activeIdx + 0.05 && activeIdx < N - 1) {
          triggerTransition(activeIdx, activeIdx + 1);
        } else if (raw < activeIdx - 0.05 && activeIdx > 0) {
          triggerTransition(activeIdx, activeIdx - 1);
        }
      },
      onScrollEnd: (self: any) => {
        if (isAnimating) return;

        // Snap back to the current activeIdx scroll position to prevent sticking
        const targetScroll = st.start + (activeIdx / (N - 1)) * (st.end - st.start);
        const scrollObj = { y: st.scroll() };
        if (Math.abs(scrollObj.y - targetScroll) > 2) {
          isAnimating = true;
          gsap.to(scrollObj, {
            y: targetScroll,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
            onUpdate: () => {
              st.scroll(scrollObj.y);
            },
            onComplete: () => {
              isAnimating = false;
            }
          });
        }
      }
    } as any);

    // Set initial activeIdx based on starting scroll position
    activeIdx = Math.min(N - 1, Math.max(0, Math.round(st.progress * (N - 1))));

    // Initialize first textures and aspects
    mat.uniforms.uTexA.value = textures[activeIdx];
    mat.uniforms.uAspectA.value = aspectRatios[activeIdx];
    mat.uniforms.uTexB.value = textures[Math.min(activeIdx + 1, N - 1)];
    mat.uniforms.uAspectB.value = aspectRatios[Math.min(activeIdx + 1, N - 1)];

    // Initialize text and dot based on starting activeIdx
    setTimeout(() => {
      // Hide all other text elements first to make sure there is no overlay
      textRefs.current.forEach((el, idx) => {
        if (el) {
          if (idx === activeIdx) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0px)";
            const chars = el.querySelectorAll('.char-span');
            gsap.to(chars, { opacity: 1, x: 0, duration: 0.15, stagger: 0.015 });
            el.dataset.typing = "true";
          } else {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            const chars = el.querySelectorAll('.char-span');
            chars.forEach(c => ((c as HTMLElement).style.opacity = "0"));
            el.dataset.typing = "false";
          }
        }
      });

      dotsRef.current.forEach((dot, i) => {
         if (!dot) return;
         if (i === activeIdx) {
           dot.style.opacity = "1";
           dot.style.transform = "scale(1.5)";
           dot.style.boxShadow = '0 0 10px rgba(166,42,44,0.8)';
         } else {
           dot.style.opacity = "0.3";
           dot.style.transform = "scale(1)";
           dot.style.boxShadow = 'none';
         }
      });
    }, 100);

    videoElements[0].play().catch(() => {});

    const timeoutId = setTimeout(() => {
      // Intentionally removed to prevent layout thrashing
    }, 0);

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
