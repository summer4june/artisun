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
    title: 'Electric Ace',
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
  const shadow1Ref = useRef<HTMLDivElement>(null);
  const shadow2Ref = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current || !triggerRef.current) return;

    const ctx = gsap.context(() => {
      // Reset positions initially for a dynamic 3D Isometric Camera Angle
      // Removed filter: blur() because animating blurs causes massive GPU lag/stutter on scroll
      gsap.set(bottle2Ref.current, { scale: 0.5, x: '25vw', y: '-5vh', z: -1200, rotationY: -35, opacity: 0 });
      gsap.set(bottle1Ref.current, { scale: 1, x: '10vw', y: '0vh', z: 0, rotationY: -5, opacity: 1 });

      const tl = gsap.timeline({ paused: true });

      // The Veloretti True 3D Carousel Push (Optimized)
      tl.to(bottle1Ref.current, {
        scale: 0.5,
        x: '-5vw',
        y: '-5vh',
        z: -1200,
        rotationY: 25,
        opacity: 0,
        ease: 'power2.inOut',
        duration: 1.5
      }, 0);

      // Bottle 2 pulls forward
      tl.to(bottle2Ref.current, {
        scale: 1,
        x: '10vw',
        y: '0vh',
        z: 0,
        rotationY: -5,
        opacity: 1,
        ease: 'power2.inOut',
        duration: 1.5
      }, 0);

      // Fade out text 1, fade in text 2
      tl.to('.text-panel-0', { opacity: 0, y: -30, duration: 0.6, ease: 'power2.inOut' }, 0);
      tl.fromTo('.text-panel-1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.inOut' }, 0.9);

      // Create the ScrollTrigger
      stRef.current = ScrollTrigger.create({
        trigger: triggerRef.current,
        start: "top top",
        end: "+=200%", // Reduced scroll distance slightly for tighter control
        pin: containerRef.current,
        scrub: 0.5, // Reduced scrub lag from 1.5 to 0.5 to make it feel much more responsive and less rubber-bandy
        animation: tl,
        onUpdate: (self) => {
          if (self.progress > 0.5 && activeIndexRef.current !== 1) {
            activeIndexRef.current = 1;
            setActiveIndex(1);
          } else if (self.progress <= 0.5 && activeIndexRef.current !== 0) {
            activeIndexRef.current = 0;
            setActiveIndex(0);
          }
        }
      });
    }, containerRef); // Scope to container for safety

    return () => {
      ctx.revert(); // Proper React cleanup
      stRef.current?.kill();
    };
  }, []);

  const handleNavClick = (index: number) => {
    if (!stRef.current) return;
    const st = stRef.current;
    const targetProgress = index === 0 ? 0 : 1;
    const scrollPos = st.start + (st.end - st.start) * targetProgress;

    gsap.to(window, {
      scrollTo: scrollPos,
      duration: 1.0,
      ease: "power3.inOut"
    });
  };

  const navDots = [
    { x: 70, y: 15 },
    { x: 90, y: 85 }
  ];

  return (
    <div ref={triggerRef} className="relative w-full">
      {/* Pinned Container */}
      <section 
        ref={containerRef} 
        className="w-full h-screen bg-[#111111] flex items-center justify-center overflow-hidden touch-none relative z-10"
      >
        {/* Cinematic Lighting: Hardware-accelerated opacity fades instead of background-color transitions */}
        <div 
          className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[120px] pointer-events-none z-0 bg-[#D44026] transition-opacity duration-1000 ease-in-out"
          style={{ opacity: activeIndex === 0 ? 0.12 : 0 }}
        />
        <div 
          className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[120px] pointer-events-none z-0 bg-[#8A2718] transition-opacity duration-1000 ease-in-out"
          style={{ opacity: activeIndex === 1 ? 0.12 : 0 }}
        />
        
        {/* Floor Gradient to ground the 3D scene */}
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none" />

        {/* Top entry dissolve matching keyhole exit */}
        <div className="absolute inset-x-0 top-0 h-[80px] bg-gradient-to-b from-black to-transparent z-[5] pointer-events-none" />

        <div className="relative w-full max-w-[1400px] h-full flex items-center justify-between px-8 md:px-16 pt-20 z-10 perspective-[1500px]">
          
          {/* Left Text Panel - Exactly aligned with Veloretti */}
          <div ref={textContainerRef} className="relative w-1/3 h-full flex flex-col justify-center pointer-events-none z-30">
            {products.map((prod, idx) => (
              <div 
                key={prod.id} 
                className={`absolute left-0 text-panel-${idx} w-[120%]`}
                style={{ opacity: idx === 0 ? 1 : 0, transform: idx === 0 ? 'translateY(0)' : 'translateY(30px)' }}
              >
                <p className="font-suisse text-xs tracking-[0.25em] uppercase text-white/40 mb-4">{prod.subtitle}</p>
                <h2 className="font-editorial text-[#ffffff] text-[72px] md:text-[96px] leading-[0.9] mb-8 tracking-tighter drop-shadow-lg">{prod.title}</h2>
                <div className="w-12 h-[1px] bg-white/20 mb-8" /> {/* Subtle separator line */}
                <p className="font-suisse text-[14px] md:text-[16px] text-[#efeeed]/60 leading-relaxed max-w-sm font-light">
                  {prod.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Center 3D Carousel Stage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Bottle 2 (Background) */}
            <div ref={bottle2Ref} className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[640px] flex flex-col items-center justify-center origin-bottom will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={products[1].img} 
                alt={products[1].title} 
                className="w-auto h-full max-w-none object-contain drop-shadow-2xl" 
              />
              {/* Floor Shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[250px] h-[30px] bg-black/60 rounded-[100%] blur-[15px]" />
            </div>

            {/* Bottle 1 (Foreground) */}
            <div ref={bottle1Ref} className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[640px] flex flex-col items-center justify-center origin-bottom will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={products[0].img} 
                alt={products[0].title} 
                className="w-auto h-full max-w-none object-contain drop-shadow-2xl" 
              />
              {/* Floor Shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[250px] h-[30px] bg-black/60 rounded-[100%] blur-[15px]" />
            </div>

          </div>

          {/* Right Curved Navigation */}
          <div className="relative w-32 h-[300px] flex items-center justify-center z-40">
            <svg width="100" height="200" viewBox="0 0 100 200" className="absolute right-4 top-1/2 -translate-y-1/2 overflow-visible">
              <path 
                d="M 50 0 A 150 150 0 0 1 50 200" 
                fill="transparent" 
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="1.5" 
              />
              
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
                    <circle 
                      cx="0" cy="0" 
                      r={isActive ? "14" : "10"} 
                      fill="transparent" 
                      stroke={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)"} 
                      strokeWidth="2"
                      className="transition-all duration-500 group-hover:stroke-white"
                    />
                    <circle 
                      cx="0" cy="0" 
                      r={isActive ? "10" : "6"} 
                      fill={isActive ? prod.color : "rgba(255,255,255,0.1)"} 
                      className="transition-all duration-500 group-hover:fill-white/40"
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

