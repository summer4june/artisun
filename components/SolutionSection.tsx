'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import OnScrollTypography from './OnScrollTypography';

export default function SolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
        if (p < 0.33) {
          setActiveIndex(0);
        } else if (p < 0.66) {
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

  const p1 = "This shift does more than change how protection is created.\nIt redefines how it is worn.";
  const p2 = "Just as clothing changes with occasions and environments,\nskin protection should exist in multiple forms\nthat fit seamlessly into daily living.";
  const p3 = "Welcome to climate-smart Skinwear.\nClothing for your skin, built for daily life.";

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-transparent flex items-center justify-center z-20 overflow-hidden">
      <div className="relative w-full max-w-5xl h-full">
        
        {/* Paragraph 1 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none">
          <OnScrollTypography 
            text={p1}
            effect="effect9"
            titleFont={{ fontFamily: "var(--font-editorial)", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400 }}
            textColor="var(--brand-cream)"
            lineGap={12}
            isActive={activeIndex === 0}
          />
        </div>
        
        {/* Paragraph 2 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none">
          <OnScrollTypography 
            text={p2}
            effect="effect19"
            titleFont={{ fontFamily: "var(--font-suisse)", fontSize: "clamp(1rem, 2vw, 1.5rem)", fontWeight: 400, lineHeight: 1.4 }}
            textColor="var(--brand-cream)"
            lineGap={8}
            isActive={activeIndex === 1}
          />
        </div>
        
        {/* Paragraph 3 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none">
          <OnScrollTypography 
            text={p3}
            effect="effect27"
            titleFont={{ fontFamily: "var(--font-editorial)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400 }}
            textColor="var(--brand-cream)"
            lineGap={16}
            isActive={activeIndex === 2}
          />
        </div>
        
      </div>
    </section>
  );
}
