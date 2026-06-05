'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor({ mouseProxy }: { mouseProxy: { current: { px: number; py: number } } }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Initial position
    ringPos.current.x = window.innerWidth / 2;
    ringPos.current.y = window.innerHeight / 2;

    const render = () => {
      const mx = mouseProxy.current.px;
      const my = mouseProxy.current.py;

      // Dot follows exactly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }

      // Ring lerps
      ringPos.current.x += (mx - ringPos.current.x) * 0.12;
      ringPos.current.y += (my - ringPos.current.y) * 0.12;
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }
    };

    gsap.ticker.add(render);

    const handleMouseDown = () => {
      if (ringRef.current) ringRef.current.style.transform += ' scale(0.4)';
    };
    const handleMouseUp = () => {
      if (ringRef.current) ringRef.current.style.transform = ringRef.current.style.transform.replace(' scale(0.4)', '');
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseProxy]);

  // Use a global style to handle hover state for links (scaling ring to 1.6x)
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        ringRef.current?.classList.add('scale-[1.6]');
      } else {
        ringRef.current?.classList.remove('scale-[1.6]');
      }
    };
    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  return (
    <>
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[100] bg-[var(--brand-red)]"
        aria-hidden="true"
      />
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[99] border border-[rgba(232,220,200,0.5)] transition-transform duration-200 ease-out will-change-transform"
        aria-hidden="true"
      />
    </>
  );
}
