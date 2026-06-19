'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      onUpdate: (self) => {
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${self.progress})`;
        }
      }
    });
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 w-full h-[1px] z-[200] origin-left"
      style={{
        background: 'linear-gradient(90deg, #FF8C22, #C93B1A, #E8DCC8)',
        transform: 'scaleX(0)',
        willChange: 'transform',
      }}
    />
  );
}
