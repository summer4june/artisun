'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Skin protection should exist in multiple";
const line2 = "forms that fit seamlessly into daily living.";

export default function SkinProtectionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  
  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);

  words1Ref.current = [];
  words2Ref.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(bgRef.current, { scale: 1.08 });

    // ── ENTRY: Iris Reveal ──
    // Clothing's video cuts hard into this section otherwise. An expanding circular
    // iris (echoes the blade/slash entries used by SuncareShiftSection and
    // ClothingSection) opens over the same 90vh pre-pin window, so the cut feels
    // like a deliberate transition rather than a jump cut.
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 90%',
      end: 'top top',
      scrub: 2,
      animation: gsap.fromTo(
        containerRef.current,
        {
          clipPath: 'circle(0% at 50% 50%)',
          immediateRender: false,
        },
        {
          clipPath: 'circle(75% at 50% 50%)',
          ease: 'power2.inOut',
        }
      ),
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=150%", 
        pin: true,
        anticipatePin: 1,
        scrub: 1.5, // Buttery smooth interpolation
      }
    });

    // Fix: image resolves to fully sharp (blur 0px, not 4px)
    // The whole section is about "skin protection in multiple forms" — it should be CLEAR
    tl.to(bgRef.current, {
      filter: "blur(0px)",
      scale: 1.0,
      duration: 1,
      ease: "power2.out"
    }, 0);

    // words1 — Effect 9: blur dissolve from below
    // Image sharpens, words sharpen — unified visual language
    tl.fromTo(words1Ref.current,
      { opacity: 0, y: 40, filter: "blur(12px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, ease: "power3.out" },
      0
    );

    // words2 — same effect, slight offset
    tl.fromTo(words2Ref.current,
      { opacity: 0, y: 40, filter: "blur(12px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, ease: "power3.out" },
      0.2
    );

    // Hold the final frame briefly before unpinning
    tl.to({}, { duration: 0.5 });

    const timeoutId = setTimeout(() => {
      // Intentionally removed to prevent layout thrashing
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-black z-10 flex flex-col items-center justify-center px-6 md:px-20 lg:px-32 overflow-hidden">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          ref={bgRef}
          src="/a-new-language-of-suncare-3.webp" 
          alt="Model side profile" 
          // Starts highly blurred and zoomed in. GSAP will animate this down to blur-0px and scale-1.0
          className="w-full h-full object-cover blur-[16px]"
          style={{ willChange: 'transform, filter' }}
        />
        {/* Cinematic darkening overlay to make the bright white text pop perfectly */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Foreground Text */}
      <div className="relative z-10 w-fit mx-auto text-left font-editorial font-normal text-[35px] md:text-[53px] lg:text-[66px] leading-[1.2] tracking-wide text-white">
        
        {/* Line 1 */}
        <div className="mb-[0.2em] flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
          {line1.split(" ").map((word, wordIndex) => (
            <span
              key={`l1-${wordIndex}`}
              ref={el => { if (el) words1Ref.current.push(el); }}
              className="opacity-0"
              style={{ willChange: 'transform, opacity, filter', display: 'inline-block' }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Line 2 */}
        <div className="flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
          {line2.split(" ").map((word, wordIndex) => (
            <span
              key={`l2-${wordIndex}`}
              ref={el => { if (el) words2Ref.current.push(el); }}
              className="opacity-0"
              style={{ willChange: 'transform, opacity, filter', display: 'inline-block' }}
            >
              {word}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
