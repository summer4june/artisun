'use client';

import { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MagneticLink({ children, href, className = '' }: { children: React.ReactNode, href: string, className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Magnetic pull is 25% of distance to center
    x.set((e.clientX - centerX) * 0.25);
    y.set((e.clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={`relative inline-block ${className}`}
    >
      {children}
    </motion.a>
  );
}
