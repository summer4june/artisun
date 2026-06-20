'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Suncare needed to evolve";
const line2 = "and Artisun begins with this understanding.";

export default function EvolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Text Reveal (Effect 27 from OnScrollTypography)
    // We delay the trigger by 100vh ("bottom top" for a 100vh container) 
    // so it starts exactly when the Climate section finishes sliding up.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "bottom top", 
        toggleActions: "play none none reverse"
      }
    });

    tl.fromTo(line1Ref.current, {
      opacity: 0,
      scale: 0.7,
      y: 50
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.95,
      ease: "back.out(1.5)",
      delay: 0.1 
    });

    tl.fromTo(line2Ref.current, {
      opacity: 0,
      scale: 0.7,
      y: 50
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.95,
      ease: "back.out(1.5)",
    }, "-=0.83");

    // 2. Pin the container so it stays perfectly glued to the screen
    // while the previous section natively scrolls up like a curtain!
    const pinSt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=150%", // 100vh curtain slide + 50vh reading time
      pin: true,
    });

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      if (pinSt) pinSt.kill();
      tl.kill();
    };
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen bg-transparent z-10 -mt-[100vh] flex flex-col items-center justify-center px-6 md:px-20 overflow-hidden"
    >
      
      {/* Dark Red Overlay */}
      <div className="absolute inset-0 bg-[#530007] opacity-60 pointer-events-none" />

      {/* Background Embossed Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[120vw] md:h-[120vw] lg:w-[1000px] lg:h-[1000px] flex items-center justify-center opacity-[0.1] pointer-events-none z-[1]">
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
        <div ref={line1Ref} className="mb-[0.2em] w-full" style={{ willChange: "transform, opacity" }}>
          {line1}
        </div>

        {/* Line 2 */}
        <div ref={line2Ref} className="w-full" style={{ willChange: "transform, opacity" }}>
          {line2}
        </div>

      </div>
    </section>
  );
}
