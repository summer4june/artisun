'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Suncare needed to evolve";
const line2 = "and Artisun begins with this understanding.";

export default function EvolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const monogramRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const warmBreathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {

      // ── SCRUB TIMELINE — every beat tied to scroll position ──
      // User scrolls through 200vh of pinned space.
      // Each beat occupies a portion of that scroll range.
      // Total timeline = 10 arbitrary units = 200vh of scroll.

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

      // Beat 0 (0-20% of scroll): Crimson atmosphere breathes in
      tl.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 0.5, duration: 2 },
        0
      );

      // Beat 1 (10-30%): Brand monogram materializes from darkness
      tl.fromTo(monogramRef.current,
        { opacity: 0 },
        { opacity: 0.18, duration: 2 },
        1
      );

      // Beat 2 (25-55%): Line 1 rises into place
      tl.fromTo(line1Ref.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 3 },
        2.5
      );

      // Beat 3 (45-75%): Line 2 follows
      tl.fromTo(line2Ref.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 3 },
        4.5
      );

      // Hold at 75-85%: both lines fully legible (no beats, scroll pauses here)

      // Beat 4 (85-92%): Warm breath rises — Earth's warmth seeping up from below
      tl.to(warmBreathRef.current,
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        8.5
      );

      // Beat 5 (88-95%): Lines float up and exit
      tl.to([line1Ref.current, line2Ref.current],
        { opacity: 0, y: -40, duration: 0.8, ease: 'power3.in' },
        8.8
      );

      // Beat 6 (90-95%): Monogram fades
      tl.to(monogramRef.current,
        { opacity: 0, duration: 0.7, ease: 'power2.in' },
        9.0
      );

      // Beat 7 (92-100%): Crimson overlay dissolves — Earth shows through below
      tl.to(overlayRef.current,
        { opacity: 0, duration: 0.8, ease: 'power2.inOut' },
        9.2
      );

      // ── SCROLLTRIGGER: pin + scrub in one ──
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        anticipatePin: 1,
        scrub: 1.5,         // 1.5s smoothing on scrub — premium, not choppy
        animation: tl,
      });

    });

    return () => ctx.revert(); // gsap.context auto-cleans all ScrollTriggers and tweens

  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-transparent z-10 flex flex-col items-center justify-center px-6 md:px-20 overflow-hidden"
    >

      {/* Dark Crimson Atmosphere — starts invisible, fades in as curtain rises */}
      {/* Radial gradient: brighter at center, deeper at edges — depth not flatness */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background: 'radial-gradient(ellipse at 50% 50%, #6B0A0E 0%, #530007 45%, #2A0003 100%)',
        }}
      />

      {/* Monogram — starts invisible, materializes as first beat */}
      <div
        ref={monogramRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[120vw] md:h-[120vw] lg:w-[1000px] lg:h-[1000px] flex items-center justify-center pointer-events-none z-[1]"
        style={{ opacity: 0, willChange: 'opacity' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-artisun.svg"
          alt="Artisun Monogram"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Foreground Text */}
      <div className="relative z-10 w-full max-w-[90vw] md:max-w-[800px] lg:max-w-[1200px] mx-auto text-center font-editorial font-normal text-[32px] md:text-[54px] lg:text-[72px] leading-[1.1] tracking-[-0.02em] text-white">

        {/* Line 1 — starts invisible, rises into place */}
        <div
          ref={line1Ref}
          className="mb-[0.2em] w-full"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          {line1}
        </div>

        {/* Line 2 — follows after Line 1 has landed */}
        <div
          ref={line2Ref}
          className="w-full"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          {line2}
        </div>

      </div>

      {/* Warm Breath — Earth’s warmth bleeding up from below as crimson dissolves */}
      {/* Color matches earth_back.webp cream top. Pointer-events-none, z below text. */}
      <div
        ref={warmBreathRef}
        className="absolute inset-x-0 bottom-0 pointer-events-none z-[2]"
        style={{
          height: '45%',
          opacity: 0,
          background: 'linear-gradient(to top, rgba(218,175,100,0.22) 0%, rgba(200,140,60,0.10) 45%, transparent 100%)',
          willChange: 'opacity',
        }}
      />

    </section>
  );
}
