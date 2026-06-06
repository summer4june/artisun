'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ScrollHintProps {
  activeIndex: number;
  total: number;
  hasScrolled: boolean;
}

export default function ScrollHint({ activeIndex, total, hasScrolled }: ScrollHintProps) {
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!numRef.current) return;
    
    gsap.fromTo(numRef.current, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [activeIndex]);

  return (
    <>
      <div className="fixed bottom-10 right-12 z-50 font-suisse font-normal text-[11px] tracking-[0.3em] text-[#efeeed]/40 pointer-events-none flex overflow-hidden">
        <div ref={numRef}>0{activeIndex + 1}</div>
        <div className="ml-2">/ 0{total}</div>
      </div>

      <div 
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 font-suisse font-medium text-[9px] tracking-[0.25em] text-white/30 pointer-events-none transition-opacity duration-700 ${hasScrolled ? 'opacity-0' : 'opacity-100'}`}
      >
        SCROLL TO EXPLORE
      </div>
    </>
  );
}
