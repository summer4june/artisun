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
    title: 'Origin Front',
    subtitle: 'MILK EMULSION SUNWEAR',
    desc: 'SPF 50+, PA++++. Broad Spectrum with Beta-Glucan & Camellia Sinensis Extract.',
  },
  {
    id: 'back',
    title: 'Origin Details',
    subtitle: 'MADE IN INDIA',
    desc: 'Smooth evenly on face and neck each morning. Can be worn alone or under makeup. Reapply in the sun.',
  }
];

export default function ProductsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const bottle1Ref = useRef<HTMLDivElement>(null);
  const bottle2Ref = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !triggerRef.current) return;

    // Build the master timeline for the 3D Carousel Transition
    const tl = gsap.timeline({ paused: true });

    // Transition: Bottle 1 moves back (Z-push effect)
    tl.to(bottle1Ref.current, {
      scale: 0.75,
      x: '15vw',
      opacity: 0.1,
      filter: 'blur(12px)',
      ease: 'power2.inOut',
      duration: 1
    }, 0);

    // Text 1 fades out and moves up
    tl.to(text1Ref.current, {
      y: -40,
      opacity: 0,
      ease: 'power2.inOut',
      duration: 0.8
    }, 0);

    // Transition: Bottle 2 moves forward from the background
    tl.fromTo(bottle2Ref.current, {
      scale: 0.75,
      x: '-15vw',
      opacity: 0.1,
      filter: 'blur(12px)'
    }, {
      scale: 1,
      x: '0vw',
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'power2.inOut',
      duration: 1
    }, 0);

    // Text 2 fades in and moves up
    tl.fromTo(text2Ref.current, {
      y: 40,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      ease: 'power2.inOut',
      duration: 0.8
    }, 0.2);

    // Create the ScrollTrigger to scrub this timeline
    stRef.current = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: "top top",
      end: "+=200%", // 2 screens of scrolling to fully transition
      pin: containerRef.current,
      scrub: 1, // Add slight smoothing (1 second lag)
      animation: tl,
      onUpdate: (self) => {
        // Update active dot based on progress
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

  // Click handler to jump to a specific product
  const handleNavClick = (index: number) => {
    if (!stRef.current) return;
    const st = stRef.current;
    
    // Calculate the exact pixel scroll position needed to reach progress 0 or 1
    const targetProgress = index === 0 ? 0 : 1;
    const scrollPos = st.start + (st.end - st.start) * targetProgress;

    gsap.to(window, {
      scrollTo: scrollPos,
      duration: 1.2,
      ease: "power3.inOut"
    });
  };

  // Drag/Swipe handler to transition
  const dragStartX = useRef(0);
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const deltaX = e.clientX - dragStartX.current;
    if (deltaX < -50 && activeIndex === 0) {
      // Swiped Left -> Go to Product 2
      handleNavClick(1);
    } else if (deltaX > 50 && activeIndex === 1) {
      // Swiped Right -> Go to Product 1
      handleNavClick(0);
    }
  };

  return (
    <div ref={triggerRef} className="relative w-full">
      {/* Pinned Container */}
      <section 
        ref={containerRef} 
        className="w-full h-screen bg-[#0a0806] flex items-center justify-center overflow-hidden touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div className="relative w-full max-w-7xl h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-8 md:px-16">
          
          {/* Text Content Area */}
          <div className="relative w-full md:w-1/3 h-48 md:h-64 flex flex-col justify-center z-30 pointer-events-none mt-20 md:mt-0">
            {/* Text 1 */}
            <div ref={text1Ref} className="absolute inset-0 flex flex-col justify-center">
              <h2 className="font-editorial text-[#efeeed] text-4xl md:text-6xl mb-2">{products[0].title}</h2>
              <p className="font-suisse text-xs tracking-[0.2em] uppercase text-white/60 mb-6">{products[0].subtitle}</p>
              <p className="font-suisse text-sm md:text-base text-white/80 leading-relaxed max-w-sm">{products[0].desc}</p>
            </div>
            
            {/* Text 2 */}
            <div ref={text2Ref} className="absolute inset-0 flex flex-col justify-center opacity-0 translate-y-[40px]">
              <h2 className="font-editorial text-[#efeeed] text-4xl md:text-6xl mb-2">{products[1].title}</h2>
              <p className="font-suisse text-xs tracking-[0.2em] uppercase text-white/60 mb-6">{products[1].subtitle}</p>
              <p className="font-suisse text-sm md:text-base text-white/80 leading-relaxed max-w-sm">{products[1].desc}</p>
            </div>
          </div>

          {/* 3D Carousel Stage */}
          <div className="relative w-full md:w-2/3 h-[60vh] md:h-[80vh] flex items-center justify-center z-20 pointer-events-none perspective-[1000px]">
            
            {/* Bottle 1: Front */}
            <div ref={bottle1Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[480px] md:w-[400px] md:h-[640px] flex items-center justify-center origin-center">
              {/* CSS crop wrapper to show only the left half of the thumbnail */}
              <div className="relative w-[50%] h-[100%] overflow-hidden mix-blend-screen drop-shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/bottle_thumb.png" 
                  alt="Bottle Front" 
                  className="absolute top-0 left-0 h-full w-auto max-w-none object-cover" 
                  style={{ transform: 'translateX(0%)' }} // Show left half
                />
              </div>
            </div>

            {/* Bottle 2: Back */}
            <div ref={bottle2Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[480px] md:w-[400px] md:h-[640px] flex items-center justify-center origin-center opacity-0 blur-[12px] scale-[0.75]">
              {/* CSS crop wrapper to show only the right half of the thumbnail */}
              <div className="relative w-[50%] h-[100%] overflow-hidden mix-blend-screen drop-shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/bottle_thumb.png" 
                  alt="Bottle Back" 
                  className="absolute top-0 right-0 h-full w-auto max-w-none object-cover" 
                  style={{ transform: 'translateX(-50%)' }} // Show right half
                />
              </div>
            </div>

          </div>

          {/* Navigation Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(idx)}
                className="group relative p-4 flex items-center justify-center cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${activeIndex === idx ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/30 group-hover:bg-white/60'}`}></div>
              </button>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
