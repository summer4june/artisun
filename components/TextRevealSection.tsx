'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Why has a category we use every day still not caught up with the way we live?";
const line2 = "Especially in a country where climate changes everything.";

export default function TextRevealSection() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  // We'll store refs to each word span here
  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top", // when the top of the container hits the top of the viewport
        end: "+=150%",    // pin for 1.5 screen heights
        pin: true,        // Pin the container so it stays sticky
        scrub: 0.5,       // Faster scrubbing to prevent slow catch-up stutter
      }
    });

    // 1. Line 1 activates word by word (gray -> white)
    tl.to(words1Ref.current, {
      color: "rgba(255, 255, 255, 1)",
      stagger: 0.1,
      ease: "none",
    });

    // 2. Line 2 appears (fade in as unactive gray)
    tl.to(words2Ref.current, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
    });

    // 3. Line 2 activates word by word (gray -> white)
    tl.to(words2Ref.current, {
      color: "rgba(255, 255, 255, 1)",
      stagger: 0.1,
      ease: "none",
    });

    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="text-reveal-trigger relative w-full h-screen bg-transparent z-10 flex flex-col items-center justify-center px-6 md:px-20 lg:px-32">
      <div ref={textRef} className="w-full max-w-[1200px] text-left font-editorial font-normal text-3xl md:text-5xl lg:text-7xl leading-[1.3] md:leading-[1.2] lg:leading-[1.1]">
        
        {/* Line 1 */}
        <p className="mb-6 md:mb-10 flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.1em]">
          {line1.split(" ").map((word, i) => (
            <span 
              key={`l1-${i}`} 
              ref={el => { words1Ref.current[i] = el; }} 
              className="text-[rgba(255,255,255,0.2)] will-change-[color]"
            >
              {word}
            </span>
          ))}
        </p>

        {/* Line 2 */}
        <p className="flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.1em]">
          {line2.split(" ").map((word, i) => (
            <span 
              key={`l2-${i}`} 
              ref={el => { words2Ref.current[i] = el; }} 
              className="text-[rgba(255,255,255,0.2)] opacity-0 will-change-[color,opacity]"
            >
              {word}
            </span>
          ))}
        </p>

      </div>
    </section>
  );
}
