'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const products = [
  {
    id: 'front',
    title: 'Electric Ace', // Mimicking Veloretti's style for the title
    subtitle: 'ORIGIN SUNWEAR',
    desc: 'The new Origin is the latest revolution in daily suncare with a bold finish. It combines a clean design, cutting-edge technology, and extreme UV safety features.',
    img: '/bottle_front.png',
    color: '#D44026'
  },
  {
    id: 'back',
    title: 'Electric Ivy',
    subtitle: 'ORIGIN DETAILS',
    desc: 'Smooth evenly on face and neck each morning. Can be worn alone or under makeup. Protects your skin continuously while keeping a matte finish.',
    img: '/bottle_back.png',
    color: '#8A2718'
  }
];

export default function ProductsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const bottle1Ref = useRef<HTMLDivElement>(null);
  const bottle2Ref = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !triggerRef.current) return;

    // Reset positions initially
    gsap.set(bottle2Ref.current, { scale: 0.6, x: '25vw', z: -500, opacity: 0, filter: 'blur(8px)' });
    gsap.set(bottle1Ref.current, { scale: 1, x: '0vw', z: 0, opacity: 1, filter: 'blur(0px)' });

    const tl = gsap.timeline({ paused: true });

    // The Veloretti 3D Carousel Push Transition
    // Bottle 1 moves back, blurs, shifts right into the background, and fades OUT completely
    tl.to(bottle1Ref.current, {
      scale: 0.6,
      x: '25vw',
      z: -500,
      opacity: 0,
      filter: 'blur(8px)',
      ease: 'power2.inOut',
      duration: 1
    }, 0);

    // Bottle 2 moves forward from the right background into the center focus, and fades IN completely
    tl.to(bottle2Ref.current, {
      scale: 1,
      x: '0vw',
      z: 0,
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'power2.inOut',
      duration: 1
    }, 0);

    // Fade out text 1, fade in text 2
    tl.to('.text-panel-0', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 0);
    tl.fromTo('.text-panel-1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.6);

    // Create the ScrollTrigger
    stRef.current = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: "top top",
      end: "+=200%", // 2 screens to transition
      pin: containerRef.current,
      scrub: 1, // Smooth scrubbing
      animation: tl,
      onUpdate: (self) => {
        if (self.progress > 0.5 && activeIndex !== 1) {
          setActiveIndex(1);
        } else if (self.progress <= 0.5 && activeIndex !== 0) {
          setActiveIndex(0);
        }
      }
    });

    return () => {
      stRef.current?.kill();
    };
  }, [activeIndex]);

  const handleNavClick = (index: number) => {
    if (!stRef.current) return;
    const st = stRef.current;
    const targetProgress = index === 0 ? 0 : 1;
    const scrollPos = st.start + (st.end - st.start) * targetProgress;

    gsap.to(window, {
      scrollTo: scrollPos,
      duration: 1.2,
      ease: "power3.inOut"
    });
  };

  // SVG curved path coordinates for the navigation dots on the right
  const navDots = [
    { x: 70, y: 15 },
    { x: 90, y: 85 }
  ];

  return (
    <div ref={triggerRef} className="relative w-full">
      {/* Pinned Container */}
      <section 
        ref={containerRef} 
        className="w-full h-screen bg-[#0d0c0b] flex items-center justify-center overflow-hidden touch-none relative"
      >
        {/* Dynamic Studio Spotlight */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] transition-colors duration-1000 ease-in-out z-0 pointer-events-none"
          style={{ backgroundColor: activeIndex === 0 ? 'rgba(212, 64, 38, 0.15)' : 'rgba(138, 39, 24, 0.15)' }}
        />

        <div className="relative w-full max-w-[1400px] h-full flex items-center justify-between px-8 md:px-16 pt-20 z-10">
          
          {/* Left Text Panel */}
          <div ref={textContainerRef} className="relative w-1/3 h-full flex flex-col justify-center pointer-events-none">
            {products.map((prod, idx) => (
              <div 
                key={prod.id} 
                className={`absolute left-0 text-panel-${idx}`}
                style={{ opacity: idx === 0 ? 1 : 0, transform: idx === 0 ? 'translateY(0)' : 'translateY(20px)' }}
              >
                <h2 className="font-editorial text-[#efeeed] text-[64px] md:text-[80px] leading-none mb-6 tracking-tight drop-shadow-sm">{prod.title}</h2>
                <p className="font-suisse text-[13px] md:text-[15px] text-[#efeeed]/50 leading-relaxed max-w-sm font-light">
                  {prod.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Center 3D Carousel Stage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
            
            {/* Bottle 2 (Background initially) */}
            <div ref={bottle2Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[640px] flex items-center justify-center origin-center will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={products[1].img} 
                alt={products[1].title} 
                className="w-auto h-full max-w-none object-contain drop-shadow-2xl" 
              />
            </div>

            {/* Bottle 1 (Foreground initially) */}
            <div ref={bottle1Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[640px] flex items-center justify-center origin-center will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={products[0].img} 
                alt={products[0].title} 
                className="w-auto h-full max-w-none object-contain drop-shadow-2xl" 
              />
            </div>

          </div>

          {/* Right Curved Navigation (Veloretti Style) */}
          <div className="relative w-32 h-[300px] flex items-center justify-center z-40">
            {/* The Curved Line */}
            <svg width="100" height="200" viewBox="0 0 100 200" className="absolute right-4 top-1/2 -translate-y-1/2 overflow-visible">
              <path 
                d="M 50 0 A 150 150 0 0 1 50 200" 
                fill="transparent" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="1" 
              />
              
              {/* The Navigation Dots along the curve */}
              {products.map((prod, idx) => {
                const pos = navDots[idx];
                const isActive = activeIndex === idx;
                return (
                  <g 
                    key={prod.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => handleNavClick(idx)}
                    className="cursor-pointer group"
                  >
                    {/* Outer Ring */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={isActive ? "14" : "12"} 
                      fill="transparent" 
                      stroke={isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"} 
                      strokeWidth="2"
                      className="transition-all duration-300 group-hover:stroke-white"
                    />
                    {/* Inner Color Swatch */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={isActive ? "10" : "8"} 
                      fill={prod.color} 
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

        </div>
      </section>
    </div>
  );
}

