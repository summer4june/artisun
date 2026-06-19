'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Why has a category we use every day still not caught up with the way we live?";
const line2 = "Especially in a country where climate changes everything.";

export default function TextRevealSection() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const line2ContainerRef = useRef<HTMLDivElement>(null);
  
  // We'll store refs to each word span here
  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);

  // Clear refs on every render so they don't accumulate infinitely
  words1Ref.current = [];
  words2Ref.current = [];

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

    // 1. Line 1 activates word by word
    tl.to(words1Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    });

    // 2. Line 2 container fades in completely
    tl.to(line2ContainerRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
    });

    // 3. Line 2 activates word by word
    tl.to(words2Ref.current, {
      opacity: 1,
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
      {/* Keep bg-transparent, just add a darkening vignette so text pops */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-[1]" />

      <div ref={textRef} className="relative z-[2] w-full max-w-[90vw] md:max-w-[800px] lg:max-w-[1050px] mx-auto text-left font-editorial font-normal text-[26px] md:text-[38px] lg:text-[50px] leading-[1.3] tracking-wide text-[#e8dfc5]">
        
        {/* Line 1 Block */}
        <div className="mb-[0.6em] flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
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

        {/* Line 2 Block */}
        <div ref={line2ContainerRef} className="flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full opacity-0">
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

      <div className="absolute inset-x-0 top-0 h-[80px] bg-gradient-to-b from-black/40 to-transparent z-[2] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-black/60 to-transparent z-[2] pointer-events-none" />
    </section>
  );
}
