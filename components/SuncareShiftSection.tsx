'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "This shift does more than change";
const line2 = "how protection is created.";
const line3 = "It redefines how it is worn.";

export default function SuncareShiftSection() {
  const containerRef = useRef<HTMLElement>(null);
  const sharpBgRef = useRef<HTMLDivElement>(null);
  
  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words3Ref = useRef<(HTMLSpanElement | null)[]>([]);

  words1Ref.current = [];
  words2Ref.current = [];
  words3Ref.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=250%", // Slightly longer to give the scrub room to breathe
        pin: true,
        scrub: 1.5, // Buttery smooth interpolation (1.5 seconds to "catch up" to the scroll wheel)
      }
    });

    // 1. Reveal Line 1 and 2
    tl.to(words1Ref.current, { opacity: 1, stagger: 0.05, ease: "none" });
    tl.to(words2Ref.current, { opacity: 1, stagger: 0.05, ease: "none" }, "+=0.1");

    // 2. Tiny pause
    tl.to({}, { duration: 0.2 });

    // 3. Crossfade Image AND dim first two lines
    tl.to(sharpBgRef.current, { opacity: 1, duration: 1.5, ease: "power1.inOut" }, "transition");
    tl.to([...words1Ref.current, ...words2Ref.current], { opacity: 0.4, duration: 1.5, ease: "power1.inOut" }, "transition");

    // 4. Tiny pause after transition
    tl.to({}, { duration: 0.2 });

    // 5. Reveal Line 3
    tl.to(words3Ref.current, { opacity: 1, stagger: 0.05, ease: "none" });

    // 6. Hold the final frame so it feels stuck for a moment before scrolling away
    tl.to({}, { duration: 1.5 });

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
    <section ref={containerRef} className="relative w-full h-screen bg-black z-10 flex flex-col items-center justify-center px-6 md:px-20 lg:px-32 overflow-hidden">
      
      <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-black to-transparent z-[15] pointer-events-none" />

      {/* Background Image Layer 1: Blurred */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/a-new-language-of-suncare.png" 
          alt="A New Language of Suncare Blurred" 
          className="w-full h-full object-cover scale-[1.05]"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Background Image Layer 2: Sharp (Starts Hidden) */}
      <div ref={sharpBgRef} className="absolute inset-0 z-[1] opacity-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/a-new-language-of-suncare-2.png" 
          alt="A New Language of Suncare Sharp" 
          className="w-full h-full object-cover scale-[1.05]"
        />
        <div className="absolute inset-0 bg-black/10"></div>
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
        <div className="mb-[0.2em] flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
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

        {/* Line 3 */}
        <div className="flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
          {line3.split(" ").map((word, wordIndex) => (
            <span 
              key={`l3-${wordIndex}`} 
              ref={el => { if (el) words3Ref.current.push(el); }} 
              className="opacity-15"
            >
              {word}
            </span>
          ))}
        </div>

      </div>

      {/* Bottom dissolve — melts SuncareShift into ClothingSection */}
      <div className="absolute inset-x-0 bottom-0 h-[160px] bg-gradient-to-t from-black to-transparent z-[15] pointer-events-none" />
    </section>
  );
}
