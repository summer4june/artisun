'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
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
        <div className="hero-content-inner relative z-10 flex flex-col items-center justify-center gap-4 md:gap-6">
          <div ref={textRef} className="relative w-full max-w-[85vw] md:max-w-[750px]">
            <Image
              src="/logo.png"
              alt="ARTISUN"
              width={750}
              height={167}
              priority
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
      </div>

      {/* Scroll Indicator */}
      {/* GSAP in page.tsx handles: fade-in after hero loads, fade-out on first scroll */}
      {/* This element is always opacity-0 on mount — GSAP controls all opacity */}
      <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none opacity-0 z-10">

        {/* Falling light line */}
        <div
          className="w-[1px] h-8 origin-top"
          style={{
            background: 'linear-gradient(to bottom, rgba(232,220,200,0.9) 0%, rgba(232,220,200,0) 100%)',
            animation: 'scrollLinePulse 2s ease-in-out infinite',
          }}
        />

        {/* Falling dot — drops along the line */}
        <div
          className="w-[3px] h-[3px] rounded-full mt-[-2px]"
          style={{
            background: 'rgba(232,220,200,0.85)',
            animation: 'scrollDotDrop 2s ease-in infinite',
          }}
        />

      </div>

    </section>
  );
}
