'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor({ mouseProxy }: { mouseProxy: { current: { px: number; py: number } } }) {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial setup to ensure it is centered on the mouse
    gsap.set(dotRef.current, { xPercent: -50, yPercent: -50 });

    const render = () => {
      const mx = mouseProxy.current.px;
      const my = mouseProxy.current.py;
      // Fast, GPU-accelerated set bypassing CSS strings
      gsap.set(dotRef.current, { x: mx, y: my });
    };

    gsap.ticker.add(render);

    const handleMouseDown = () => {
      gsap.to(dotRef.current, { scale: 0.8, duration: 0.15, ease: 'power2.out' });
    };
    const handleMouseUp = () => {
      gsap.to(dotRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' });
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
        gsap.to(dotRef.current, { scale: 2.5, duration: 0.2, ease: 'power2.out' });
      } else {
        gsap.to(dotRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
      }
    };
    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  return (
    <div
      ref={dotRef}
      className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[9999] bg-[var(--brand-cream)] shadow-[0_0_14px_3px_rgba(232,220,200,0.85),0_0_28px_6px_rgba(201,59,26,0.65)]"
      style={{ mixBlendMode: 'exclusion' }}
      aria-hidden="true"
    />
  );
}
