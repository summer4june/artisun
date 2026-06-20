'use client';
import { useEffect, useRef } from 'react';

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? scrollTop / total : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 w-full h-[2px] origin-left pointer-events-none"
      style={{
        zIndex: 9999,
        background: 'linear-gradient(90deg, #FF8C22, #C93B1A, #E8DCC8)',
        transform: 'scaleX(0)',
        willChange: 'transform',
      }}
    />
  );
}
