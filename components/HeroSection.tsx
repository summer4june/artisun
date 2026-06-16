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
      
      {/* Top Header Layer (replaces Navbar) */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-6 md:px-12 md:py-8 z-50 hero-header opacity-0 -translate-y-4">
        
        {/* Left: Monogram Logo */}
        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/icon-artisun.png" 
            alt="Artisun Icon" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Middle: Text + Bottles + Text */}
        <div className="flex items-center gap-4 md:gap-8">
          <span className="font-editorial text-[var(--brand-cream)] text-base md:text-[19px]">Climate-smart</span>
          
          <div className="flex items-end gap-2 mb-1">
            {/* Tall bottle silhouette */}
            <div className="flex flex-col items-center justify-end h-6 md:h-8">
              <div className="w-[8px] h-[8px] md:w-[10px] md:h-[10px] bg-[#c7341e] rounded-full mb-[2px]" />
              <div className="w-[12px] h-[16px] md:w-[14px] md:h-[20px] bg-[#c7341e] rounded-t-md" />
            </div>
            {/* Wide jar silhouette */}
            <div className="flex flex-col items-center justify-end h-6 md:h-8">
              <div className="w-[14px] h-[5px] md:w-[18px] md:h-[6px] bg-[#c7341e] rounded-t-xl mb-[1px]" />
              <div className="w-[20px] h-[10px] md:w-[24px] md:h-[14px] bg-[#c7341e] rounded-t-sm" />
            </div>
          </div>
          
          <span className="font-editorial text-[var(--brand-cream)] text-base md:text-[19px]">Skinwear™</span>
        </div>

        {/* Right: Cart Icon */}
        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-[var(--brand-cream)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1.5"></circle>
            <circle cx="20" cy="21" r="1.5"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
      </div>

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
      
    </section>
  );
}
