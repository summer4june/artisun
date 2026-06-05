'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export default function Particles({ mouseProxy }: { mouseProxy: { current: { px: number; py: number } } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const colors = ['#E8DCC8', '#C93B1A', '#FF8C42'];
    const particles: Particle[] = [];
    const COUNT = 90;

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Create trails by fading previous frame to transparent
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      const mx = mouseProxy.current.px;
      const my = mouseProxy.current.py;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse proximity
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          const force = ((120 - dist) / 120) * 0.3;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Dampen
        p.vx *= 0.97;
        p.vy *= 0.97;
        
        // Base drift if stationary
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.05;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    };

    gsap.ticker.add(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(render);
    };
  }, [mouseProxy]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[3] pointer-events-none"
      aria-hidden="true"
    />
  );
}
