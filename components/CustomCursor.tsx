'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor({ mouseProxy }: { mouseProxy: { current: { px: number; py: number } } }) {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
      const mx = mouseProxy.current.px;
      const my = mouseProxy.current.py;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    };

    gsap.ticker.add(render);

    const handleMouseDown = () => {
      if (dotRef.current) dotRef.current.style.transform += ' scale(0.8)';
    };
    const handleMouseUp = () => {
      if (dotRef.current) dotRef.current.style.transform = dotRef.current.style.transform.replace(' scale(0.8)', '');
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseProxy]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        dotRef.current?.classList.add('scale-[1.8]');
      } else {
        dotRef.current?.classList.remove('scale-[1.8]');
      }
    };
    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  return (
    <div 
      ref={dotRef}
      className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[100] bg-[var(--brand-cream)] shadow-[0_0_12px_2px_rgba(232,220,200,0.8),0_0_24px_5px_rgba(201,59,26,0.6)] transition-transform duration-200"
      aria-hidden="true"
    />
  );
}
