'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroSection({ mouseProxy }: { mouseProxy: { current: { x: number; y: number } } }) {
  const bgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Parallax background
    const render = () => {
      if (bgRef.current) {
        // x and y are -1 to 1 normalized
        const xOffset = mouseProxy.current.x * 2; // px
        const yOffset = mouseProxy.current.y * 2;
        bgRef.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(1.03)`;
      }
    };
    gsap.ticker.add(render);
    return () => gsap.ticker.remove(render);
  }, [mouseProxy]);

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden z-[1]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: '#c02d19' }}>
        <img 
          ref={bgRef}
          src="/bg-hero.jpg"
          alt="Desert Dunes"
          className="w-full h-full object-cover opacity-[0.04] will-change-transform"
        />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
        {/* Dark Focus Gradient (Deepens the center behind the logo) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] max-w-[1200px] max-h-[1200px] pointer-events-none z-[-1]"
             style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(40, 8, 5, 0.8) 0%, rgba(40, 8, 5, 0) 65%)' }} />

        <div ref={textRef} className="relative w-full max-w-[90vw] md:max-w-[680px]">
          {/* Using aspect ratio and object-cover to crop out the invisible transparent padding around the logo text */}
          <img 
            src="/logo.png" 
            alt="ARTISUN" 
            className="w-full aspect-[2.8/1] object-cover object-center drop-shadow-2xl hero-title relative z-10"
          />
        </div>
        
        <p 
          ref={subtitleRef}
          className="relative z-10 font-editorial font-normal text-sm md:text-base lg:text-lg text-[var(--brand-cream-dk)] tracking-[0.28em] hero-subtitle opacity-0 translate-y-4 mt-[2px]"
        >
          A New Language of Suncare
        </p>
      </div>
    </section>
  );
}
