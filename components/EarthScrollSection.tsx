'use client';

import MilitaryMap from './MilitaryMap';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function EarthScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);

  const subtitleOpacity = useTransform(scrollYProgress, [0.5, 0.9], [0, 1]);
  const subtitleY = useTransform(scrollYProgress, [0.5, 0.9], [30, 0]);

  return (
    <section ref={containerRef} className="relative w-full h-[200vh] bg-black z-10">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      {/* Top dissolve — bleeds into previous section */}
      <div className="absolute inset-x-0 top-0 h-[15vh] bg-gradient-to-b from-black to-transparent z-[4] pointer-events-none" />

      {/* Background stars / ambient space overlay */}
      <div className="absolute inset-0 bg-transparent pointer-events-none z-0 opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_80%)]" />

      {/* Cinematic Glowing Sunrise without sharp lines (Pure Gradients) */}
      {/* Moved OUTSIDE the globe container to prevent hardware layer clipping of mix-blend-mode/blur! */}
      <div 
        className="absolute left-1/2 z-[1] pointer-events-none flex items-center justify-center"
        style={{
          width: '1px',
          height: '1px',
          top: 'calc(35vh + 12px)', // Matches the globe's top position + the 12px internal offset
          transform: 'translateX(-50%)',
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Core Bright Hotspot */}
          <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-full blur-[8px] shadow-[0_0_120px_40px_rgba(255,240,200,1)]" />

          {/* Massive Ambient Radial Sunburst Glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[120vw] md:h-[120vw] rounded-full blur-3xl mix-blend-screen opacity-100 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,230,180,0.7) 0%, rgba(255,120,40,0.35) 25%, rgba(80,20,5,0.15) 50%, rgba(0,0,0,0) 75%)',
            }}
          />

          {/* Elliptical Horizon Atmosphere Glow (Hugs the curve of the Earth) */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180vw] h-[50vw] rounded-[100%] blur-3xl mix-blend-screen opacity-90 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,160,60,0.85) 0%, rgba(200,50,10,0.4) 40%, rgba(0,0,0,0) 70%)',
            }}
          />
        </div>
      </div>

      {/* Earth Globe Container - Positioned to create a massive horizon curve */}
      <div 
        className="absolute left-1/2 z-[2] pointer-events-auto flex items-center justify-center"
        style={{
          width: 'clamp(800px, 110vw, 2400px)',
          height: 'clamp(800px, 110vw, 2400px)',
          top: '35vh', // Positions the globe's top curve nicely in the upper half
          transform: 'translateX(-50%)',
        }}
      >
        {/* Military Map Component (Z-index higher so it's in front of the sun) */}
        <div className="relative z-[2] w-full h-full">
          <MilitaryMap 
            markers={[]}
            countries={[
              { code: "IND", name: "India", enabled: true }
            ]}
            interaction={{
              autoRotate: true,
              autoRotateSpeed: 4,
              rotateX: 0,
              rotateY: -15, // Tilted so India comes lower down towards the bottom
              rotateZ: 80,  // Centered exactly on India's longitude
              enableDrag: false,
              dragSensitivity: 0.5,
              glowColor: "#ff9933",
              glowIntensity: 0, // Removed Earth glow so the Sun shines clearly from behind
              showStars: false,
              showLabels: true,
            }}
            mapStyle={{
              oceanColor: "#000000",
              landFill: "rgba(100, 115, 130, 0.85)", // Much lighter countries
              landStroke: "transparent",
              strokeWidth: 0,
              hoverColor: "rgba(100, 115, 130, 0.85)", // Matches landFill
              disabledColor: "rgba(30, 40, 50, 0.5)",
            }}
          />
        </div>
      </div>

      {/* Typography Overlay */}
      <div className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 w-full max-w-[90vw] md:max-w-[700px] lg:max-w-[900px] text-center z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.h2 
          style={{ opacity: titleOpacity, y: titleY }}
          className="font-editorial font-normal text-[32px] md:text-[54px] lg:text-[68px] leading-[1.15] tracking-[-0.01em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
        >
          A Climate-smart approach to Suncare
        </motion.h2>
        <motion.p 
          style={{ opacity: subtitleOpacity, y: subtitleY }}
          className="font-sans font-light text-[11px] md:text-[14px] lg:text-[16px] text-[rgba(255,255,255,0.7)] mt-5 tracking-[0.08em] uppercase max-w-[550px] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        >
          bringing protection that moves with climate, not just skin type.
        </motion.p>
      </div>

      {/* Bottom Vignette Overlay to merge with next section background */}
      <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#1a0a00] to-transparent z-[4] pointer-events-none" />
      </div>
    </section>
  );
}
