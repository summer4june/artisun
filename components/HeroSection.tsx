'use client';

import { useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HeroSection({ mouseProxy }: { mouseProxy: { current: { x: number; y: number; px: number; py: number } } }) {
  const textRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden z-[1]">
      {/* Hero Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
        <div ref={textRef} className="relative w-full max-w-[90vw] md:max-w-[680px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 scroll-indicator opacity-0">
          <span className="font-suisse font-medium text-[10px] tracking-[0.18em] text-[rgba(232,220,200,0.5)] uppercase whitespace-nowrap">
            Scroll to discover
          </span>
          <div className="relative w-[1px] h-12 bg-[rgba(232,220,200,0.1)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--brand-cream)] animate-scrollIndicator origin-top" />
          </div>
        </div>
      </div>
    </section>
  );
}
