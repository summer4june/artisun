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
      className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[9999] bg-[var(--brand-cream)] shadow-[0_0_16px_4px_rgba(232,220,200,0.95),0_0_34px_8px_rgba(201,59,26,0.75)]"
      // NOTE: previously `mix-blend-mode: exclusion`. That blend forced the browser to
      // re-composite the entire page (canvases, gradients, every section) against the
      // cursor on every frame — the single dominant cause of scroll jank (measured: it
      // alone dropped the page from 60fps/18ms frames to ~53fps/383ms stalls). Promoting
      // the cursor to its own GPU layer instead keeps the glow + animations buttery.
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      aria-hidden="true"
    />
  );
}
