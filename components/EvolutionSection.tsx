'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Suncare needed to evolve";
const line2 = "and Artisun begins with this understanding.";

export default function EvolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);

  words1Ref.current = [];
  words2Ref.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 0.5,
      }
    });

    tl.to(words1Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    });

    tl.to(words2Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    }, "+=0.2");

    const timeoutId = setTimeout(() => {
      // Intentionally removed to prevent layout thrashing
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-transparent z-10 flex flex-col items-center justify-center px-6 md:px-20 overflow-hidden">
      
      {/* Dark Red Overlay to suppress the global yellow glow specifically in this section */}
      <div className="absolute inset-0 bg-[#530007] opacity-60 pointer-events-none" />

      {/* Background Embossed Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] md:w-[120vw] lg:w-[1000px] h-[1000px] flex items-center justify-center opacity-[0.35] pointer-events-none mix-blend-multiply z-[1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/logo-artisun.svg" 
          alt="Artisun Monogram" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Foreground Text */}
      <div className="relative z-10 w-full max-w-[90vw] md:max-w-[800px] lg:max-w-[1200px] mx-auto text-center font-editorial font-normal text-[32px] md:text-[54px] lg:text-[72px] leading-[1.1] tracking-[-0.02em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        
        {/* Line 1 */}
        <div className="mb-[0.2em] flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em] w-full">
          {line1.split(" ").map((word, wordIndex) => (
            <span 
              key={`l1-${wordIndex}`} 
              ref={el => { if (el) words1Ref.current.push(el); }} 
              className="opacity-15"
            >
              {word}
            </span>
          ))}
        </div>

        {/* Line 2 */}
        <div className="flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em] w-full">
          {line2.split(" ").map((word, wordIndex) => (
            <span 
              key={`l2-${wordIndex}`} 
              ref={el => { if (el) words2Ref.current.push(el); }} 
              className="opacity-15"
            >
              {word}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
