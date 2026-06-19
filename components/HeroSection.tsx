'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroSection({ mouseProxy }: { mouseProxy: { current: { x: number; y: number, px: number, py: number } } }) {
  const textRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    // Empty effect to maintain consistent hook count if necessary
  }, [mouseProxy]);

  return (
    <section className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-visible z-[1]">
      
      {/* Header moved to GlobalHeader component */}

      {/* Ambient breathing sun — lives behind the logo */}
      <div
        className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          width: 'clamp(400px, 80vw, 900px)',
          height: 'clamp(400px, 80vw, 900px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,140,34,0.18) 0%, rgba(201,59,26,0.10) 35%, rgba(83,0,7,0.05) 60%, transparent 75%)',
          animation: 'heroPulse 6s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
      />

      {/* Hero Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full mt-8 md:mt-12">
        <div ref={textRef} className="relative w-full max-w-[85vw] md:max-w-[750px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="ARTISUN" 
            className="w-full aspect-[4.5/1] object-cover object-center drop-shadow-2xl hero-title relative z-10"
          />
        </div>
        
        <p 
          ref={subtitleRef}
          className="relative z-10 font-editorial font-normal text-xl md:text-[30px] text-[var(--brand-cream)] hero-subtitle opacity-0 translate-y-4 mt-2 md:mt-4"
        >
          A new language of Suncare
        </p>
      </div>
      {/* Bottom dissolve — fades hero into the section below */}
      <div
        className="absolute inset-x-0 bottom-0 h-[25vh] pointer-events-none z-[5]"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
        }}
      />
    </section>
  );
}
