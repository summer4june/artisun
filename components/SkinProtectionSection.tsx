'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Skin protection should exist in multiple";
const line2 = "forms that fit seamlessly into daily living.";

export default function SkinProtectionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const entryOverlayRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef = useRef<HTMLDivElement>(null);

  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);

  words1Ref.current = [];
  words2Ref.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(bgRef.current, { scale: 1.08 });

    const triggers: ScrollTrigger[] = [];

    // ── ENTRY: Left Wipe — sweeps in from the left edge ──
    gsap.set(containerRef.current, { clipPath: 'inset(0% 100% 0% 0%)' });
    triggers.push(ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 90%',
      end: 'top top',
      scrub: 1.5,
      animation: gsap.to(containerRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'power2.out',
      }),
    }));

    // Dark overlay dissolves during reveal
    triggers.push(ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      end: 'top 20%',
      scrub: 1.5,
      animation: gsap.to(entryOverlayRef.current, { opacity: 0, ease: 'power2.inOut' }),
    }));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=180%",
        pin: true,
        anticipatePin: 1,
        scrub: 1.5,
      }
    });

    tl.to(bgRef.current, {
      filter: "blur(0px)",
      scale: 1.0,
      duration: 1,
      ease: "power2.out"
    }, 0);

    tl.to(words1Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    }, 0);

    tl.to(words2Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    }, 0.2);

    tl.to({}, { duration: 0.5 });

    // ── EXIT: Content dissolves, dark overlay fades in ──
    tl.addLabel('exit');
    tl.to(
      [...words1Ref.current, ...words2Ref.current],
      { opacity: 0, duration: 0.6, ease: 'power2.in' },
      'exit'
    );
    tl.to(bgRef.current, {
      filter: 'blur(8px)',
      scale: 1.04,
      duration: 0.8,
      ease: 'power2.in',
    }, 'exit');
    tl.fromTo(exitOverlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.in' },
      'exit+=0.1'
    );

    triggers.push(tl.scrollTrigger!);

    return () => {
      triggers.forEach(st => st.kill());
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
          className="w-full h-full object-cover blur-[16px]"
          style={{ willChange: 'transform, filter' }}
        />
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
              className="opacity-[0.15]"
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
              className="opacity-[0.15]"
            >
              {word}
            </span>
          ))}
        </div>

      </div>

      {/* Entry Dissolve Overlay */}
      <div
        ref={entryOverlayRef}
        className="absolute inset-0 pointer-events-none z-[25]"
        style={{
          background: '#000000',
          willChange: 'opacity, filter',
        }}
      />

      {/* Exit Dissolve Overlay — bridges into Keyhole's dark red world */}
      <div
        ref={exitOverlayRef}
        className="absolute inset-0 pointer-events-none z-[25] opacity-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, #0a0000 60%, #1a0505 100%)',
          willChange: 'opacity',
        }}
      />
    </section>
  );
}
