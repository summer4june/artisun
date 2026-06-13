'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import OnScrollTypography from './OnScrollTypography';

export default function SolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=300%", // 3 screens of scrolling
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        
        // Rotate the sun dynamically based on scroll
        if (sunRef.current) {
          gsap.set(sunRef.current, { rotation: p * 180 }); // 180 degree rotation over full scroll
        }

        if (p < 0.05) {
          setActiveIndex(-1);
        } else if (p < 0.38) {
          setActiveIndex(0);
        } else if (p < 0.71) {
          setActiveIndex(1);
        } else {
          setActiveIndex(2);
        }
      }
    });

    return () => {
      st.kill();
    };
  }, []);

  // Removed explicit newlines so the text can wrap naturally in the narrow containers
  const p1 = "This shift does more than change how protection is created. It redefines how it is worn.";
  const p2 = "Just as clothing changes with occasions and environments, skin protection should exist in multiple forms that fit seamlessly into daily living.";
  const p3 = "Welcome to climate-smart Skinwear. Clothing for your skin, built for daily life.";

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-transparent flex items-center justify-center z-20 overflow-hidden">
      <div className="relative w-full max-w-7xl h-full mx-auto px-6 md:px-12">
        
        {/* Central Revolving Sun */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
          <div ref={sunRef} className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px]">
             {/* Base Glowing Orb */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF8C22] via-[#C1140F] to-[#530007] blur-[4px] opacity-90 shadow-[0_0_80px_rgba(255,140,34,0.4)]"></div>
             {/* Inner Core */}
            <div className="absolute inset-[3px] rounded-full bg-gradient-to-tr from-[#FFF2D8] via-[#FF8C22] to-[#C1140F] opacity-100"></div>
             {/* Decorative Rays/Ring that rotates noticeably */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-70 drop-shadow-xl">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#FF8C22" strokeWidth="0.5" strokeDasharray="2 4" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#FFF2D8" strokeWidth="0.3" strokeDasharray="1 8" />
              <path d="M50 2 L50 98 M2 50 L98 50 M16 16 L84 84 M16 84 L84 16" stroke="#FF8C22" strokeWidth="0.2" className="opacity-50" />
            </svg>
          </div>
        </div>

        {/* Paragraph 1: Top Left (Right-aligned against the sun) */}
        <div className="absolute top-[10%] left-4 md:left-[10%] w-full max-w-[280px] md:max-w-sm pointer-events-none z-20 font-editorial">
          <OnScrollTypography 
            text={p1}
            effect="effect9"
            titleFont={{ fontFamily: "inherit", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 400, textAlign: "right" }}
            textColor="var(--brand-cream)"
            lineGap={8}
            isActive={activeIndex === 0}
          />
        </div>
        
        {/* Paragraph 2: Middle Right (Left-aligned against the sun) */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-[10%] w-full max-w-[280px] md:max-w-[320px] pointer-events-none z-20 font-suisse tracking-wide">
          <OnScrollTypography 
            text={p2}
            effect="effect9"
            titleFont={{ fontFamily: "inherit", fontSize: "clamp(1rem, 1.5vw, 1.25rem)", fontWeight: 400, lineHeight: 1.5, textAlign: "left" }}
            textColor="var(--brand-cream)"
            lineGap={6}
            isActive={activeIndex === 1}
          />
        </div>
        
        {/* Paragraph 3: Bottom Left (Right-aligned against the sun) */}
        <div className="absolute bottom-[10%] left-4 md:left-[15%] w-full max-w-[300px] md:max-w-[400px] pointer-events-none z-20 font-editorial">
          <OnScrollTypography 
            text={p3}
            effect="effect9"
            titleFont={{ fontFamily: "inherit", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, textAlign: "right" }}
            textColor="var(--brand-cream)"
            lineGap={10}
            isActive={activeIndex === 2}
          />
        </div>
        
      </div>
    </section>
  );
}
