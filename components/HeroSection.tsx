'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroSection({ mouseProxy }: { mouseProxy: { current: { x: number; y: number, px: number, py: number } } }) {
  const bgRef = useRef<HTMLImageElement>(null);
  const bgRevealRef = useRef<HTMLImageElement>(null);
  const revealWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Parallax background
    const render = () => {
      if (bgRef.current && bgRevealRef.current && revealWrapperRef.current) {
        // x and y are -1 to 1 normalized
        const xOffset = mouseProxy.current.x * 2; // px
        const yOffset = mouseProxy.current.y * 2;
        
        const transformStyle = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(1.03)`;
        bgRef.current.style.transform = transformStyle;
        bgRevealRef.current.style.transform = transformStyle;

        // Apply interactive spotlight mask
        const px = mouseProxy.current.px;
        const py = mouseProxy.current.py;
        const maskStyle = `radial-gradient(circle 50px at ${px}px ${py}px, black 0%, transparent 100%)`;
        revealWrapperRef.current.style.maskImage = maskStyle;
        revealWrapperRef.current.style.webkitMaskImage = maskStyle;
      }
    };
    gsap.ticker.add(render);
    return () => gsap.ticker.remove(render);
  }, [mouseProxy]);

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden z-[1]">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ 
          backgroundColor: 'transparent',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)'
        }}
      >
        {/* Base faint image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          ref={bgRef}
          src="/bg-hero.jpg"
          alt="Desert Dunes"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.04] will-change-transform"
        />
        
        {/* Spotlight reveal image */}
        <div ref={revealWrapperRef} className="absolute inset-0 w-full h-full" style={{ WebkitMaskImage: 'radial-gradient(circle 50px at 50% 50%, black 0%, transparent 100%)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            ref={bgRevealRef}
            src="/bg-hero.jpg"
            alt="Desert Dunes Spotlight"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.34] will-change-transform"
          />
        </div>

        {/* Dark Focus Gradient (Moved inside masked container to avoid hard bottom edge) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] max-w-[1200px] max-h-[1200px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(40, 8, 5, 0.8) 0%, rgba(40, 8, 5, 0) 65%)' }} />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
        <div ref={textRef} className="relative w-full max-w-[90vw] md:max-w-[680px]">
          {/* Using aspect ratio and object-cover to crop out the invisible transparent padding around the logo text */}
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
