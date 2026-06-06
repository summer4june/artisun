'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { sections } from '@/data/climateSections';

interface ContentLayerProps {
  activeIndex: number;
}

export default function ContentLayer({ activeIndex }: ContentLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndexRef = useRef(activeIndex);

  useEffect(() => {
    sectionsRef.current.forEach((sec, idx) => {
      if (!sec) return;
      if (idx === activeIndex) {
        gsap.set(sec, { display: 'flex' });
        const textElements = sec.querySelectorAll('.anim-text');
        gsap.set(textElements, { opacity: 1, y: 0 });
        const chars = sec.querySelectorAll('.anim-char');
        gsap.set(chars, { opacity: 1, y: 0 });
        const typeChars = sec.querySelectorAll('.type-char');
        gsap.set(typeChars, { opacity: 1 });
      } else {
        gsap.set(sec, { display: 'none' });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeIndex === prevIndexRef.current) return;

    const currentSec = sectionsRef.current[prevIndexRef.current];
    const nextSec = sectionsRef.current[activeIndex];
    
    if (!currentSec || !nextSec) return;

    // Outgoing text
    const currentTexts = currentSec.querySelectorAll('.anim-text');
    const currentChars = currentSec.querySelectorAll('.anim-char');
    const currentTypeChars = currentSec.querySelectorAll('.type-char');

    gsap.to([...Array.from(currentTexts), ...Array.from(currentChars), ...Array.from(currentTypeChars)], {
      opacity: 0,
      y: -60,
      duration: 0.5, // Much faster exit!
      ease: "power2.in",
      onComplete: () => {
        gsap.set(currentSec, { display: 'none' });
      }
    });

    // Prepare incoming text
    gsap.set(nextSec, { display: 'flex' });
    const nextTexts = nextSec.querySelectorAll('.anim-text');
    const nextChars = nextSec.querySelectorAll('.anim-char');
    const nextTypeChars = nextSec.querySelectorAll('.type-char');

    gsap.set(nextTexts, { opacity: 0, y: 60 });
    gsap.set(nextChars, { opacity: 0, y: 60 });
    gsap.set(nextTypeChars, { opacity: 0 });

    // Incoming animation
    gsap.to(nextTexts, {
      opacity: 1,
      y: 0,
      delay: 1.2, // Show up earlier since bleed is faster
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.1
    });

    gsap.to(nextChars, {
      opacity: 1,
      y: 0,
      delay: 1.2,
      duration: 1.2,
      stagger: 0.03,
      ease: "power3.out"
    });

    // Start typing effect instantly without waiting for entrance
    setTimeout(() => {
      gsap.to(nextTypeChars, {
        opacity: 1,
        duration: 0.1,
        stagger: 0.05,
        ease: "none"
      });
    }, 0);

    prevIndexRef.current = activeIndex;

    // CLEANUP: If activeIndex changes rapidly or component unmounts, kill all running tweens
    // to prevent overlapping animations and memory leaks.
    return () => {
      if (containerRef.current) {
        const allElements = containerRef.current.querySelectorAll('.anim-text, .anim-char, .type-char');
        gsap.killTweensOf(allElements);
      }
    };
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
      {sections.map((sec, idx) => {
        // Split title into chars, preserving spaces
        const titleChars = sec.title.split('').map((char, cIdx) => (
          <span 
            key={cIdx} 
            className="anim-char inline-block"
            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char}
          </span>
        ));

        // Split description into words, then chars for typewriter effect
        // This ensures the browser wraps entire words instead of breaking words in half!
        const descWords = sec.description.split(' ').map((word, wIdx) => (
          <span key={`w-${wIdx}`} className="inline-block whitespace-nowrap mr-[0.4em]">
            {word.split('').map((char, cIdx) => (
              <span 
                key={`c-${cIdx}`} 
                className="type-char inline-block"
              >
                {char}
              </span>
            ))}
          </span>
        ));

        return (
          <div
            key={sec.id}
            ref={(el) => { sectionsRef.current[idx] = el; }}
            className="absolute inset-0 w-full h-full flex-col items-center justify-center text-center pointer-events-auto hidden"
          >

            
            {sec.title === 'IMAGE_LOGO' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src="/logo.png" 
                alt="Artisun" 
                className="anim-text h-32 md:h-44 object-contain mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
              />
            ) : (
              <h1 className="anim-title font-editorial font-bold uppercase text-[clamp(3rem,8vw,7rem)] text-[#efeeed] leading-[0.9] tracking-[0.05em] mb-4">
                {titleChars}
              </h1>
            )}

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-20">
              <p className="font-suisse font-normal text-[1.1rem] md:text-[1.3rem] text-[#efeeed] leading-relaxed tracking-[0.1em] text-center drop-shadow-xl">
                {descWords}
              </p>
            </div>

            <button className="anim-text mt-8 bg-[#0a0806]/70 border border-[#efeeed]/20 px-10 py-4 uppercase tracking-[0.2em] text-[11px] font-suisse text-[#efeeed] hover:bg-[#efeeed] hover:text-[#0a0806] transition-colors duration-300">
              {sec.ctaText}
            </button>
          </div>
        );
      })}
    </div>
  );
}
