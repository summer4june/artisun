'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Skin protection should exist in multiple";
const line2 = "forms that fit seamlessly into daily living.";

export default function SkinProtectionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  
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
        end: "+=150%", 
        pin: true,
        scrub: 1.5, // Buttery smooth interpolation
      }
    });

    // Creative Background Animation: Focus pull & subtle zoom out
    // It starts very blurred and zoomed in, and resolves to slightly blurred as requested.
    tl.to(bgRef.current, {
      filter: "blur(4px)",
      scale: 1.02,
      duration: 1,
      ease: "power2.out"
    }, 0);

    // Reveal Line 1 and 2 concurrently with the background focus pull
    tl.to(words1Ref.current, { opacity: 1, stagger: 0.05, ease: "none" }, 0);
    tl.to(words2Ref.current, { opacity: 1, stagger: 0.05, ease: "none" }, 0.2);

    // Hold the final frame briefly before unpinning
    tl.to({}, { duration: 0.5 });

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
    <section ref={containerRef} className="relative w-full h-screen bg-transparent z-10 flex flex-col items-center justify-center px-6 md:px-20 lg:px-32 overflow-hidden">
      
      <div className="absolute inset-0 bg-black/50 pointer-events-none z-[-1]" />

      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          ref={bgRef}
          src="/a-new-language-of-suncare-3.png" 
          alt="Skin Protection Multiple Forms" 
          // Starts highly blurred and zoomed in. GSAP will animate this down to blur-4px and scale-1.02
          className="w-full h-full object-cover scale-[1.15] blur-[16px]"
          style={{ willChange: 'transform, filter' }}
        />
        {/* Cinematic darkening overlay to make the bright white text pop perfectly */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Foreground Text */}
      <div className="relative z-10 w-fit mx-auto text-left font-editorial font-normal text-[35px] md:text-[53px] lg:text-[66px] leading-[1.2] tracking-wide text-white">
        
        {/* Line 1 */}
        <div className="mb-[0.2em] flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
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
        <div className="flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
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

      <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-black to-transparent z-[15] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-black to-transparent z-[15] pointer-events-none" />
    </section>
  );
}
