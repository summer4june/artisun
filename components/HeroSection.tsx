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
    <section className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden z-[1]">
      
      {/* Header moved to GlobalHeader component */}

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
          className="relative z-10 font-editorial font-normal text-xl md:text-[30px] text-[var(--brand-cream)] mt-2 md:mt-4 flex flex-wrap justify-center"
          style={{ gap: '0 0.3em' }}
        >
          {["A", "new", "language", "of", "Suncare"].map((word, i) => (
            <span
              key={i}
              className="hero-subtitle-word inline-block opacity-0"
              style={{ willChange: 'transform, opacity, filter' }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
      
    </section>
  );
}
