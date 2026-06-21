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

    // ── Pin the section (curtain reveal mechanism — do not change) ──
    const pinSt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=200%',   // Extended — gives room for exit beats to fully play
      pin: true,
    });

    // ── Choreographed reveal — fires when curtain has fully risen ──
    // 'top top' on a pinned -mt-[100vh] element means Evolution is fully
    // visible (the curtain of Climate has completely scrolled away).
    // We use a small scroll offset to ensure Climate is fully gone.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top+=1',      // fires the instant Evolution pins (curtain up)
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power4.out' }
    });

    // Beat 0 — Overlay breathes in (opacity 0 → 0.5)
    // The dark crimson atmosphere fades in as Evolution is revealed,
    // rather than being static behind the curtain from the start.
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 0.5, duration: 1.2 },
      0
    );

    // Beat 1 — Monogram materializes (opacity 0 → 0.18)
    // The brand mark emerges from the dark atmosphere. Silence, then the mark.
    tl.fromTo(monogramRef.current,
      { opacity: 0 },
      { opacity: 0.18, duration: 1.0 },
      0.1    // starts 0.1s after overlay
    );

    // Beat 2 — Line 1 rises into place (y: 50 → 0, opacity: 0 → 1)
    // No scale. Pure Y movement. Decelerates to a stop — nothing bounces.
    tl.fromTo(line1Ref.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.0 },
      0.4    // starts 0.4s after overlay — after monogram has appeared
    );

    // Beat 3 — Line 2 follows after Line 1 has landed
    // 0.55s after Line 1 starts means it begins while Line 1 is still moving,
    // but Line 1 will have decelerated to near-stillness by then (power4.out).
    // The user reads Line 1 before Line 2 arrives.
    tl.fromTo(line2Ref.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.0 },
      0.95   // starts 0.95s after overlay — clearly after Line 1
    );

    // ── EXIT SEQUENCE ──
    // The crimson world dissolves. Earth’s warm cream bleeds up from below.
    // Evolution is bg-transparent — when overlay hits 0, EarthSection shows through.

    // Hold — user reads both lines
    tl.to({}, { duration: 0.6 }, '+=0.3');

    // Warm breath rises at bottom — the Earth’s warmth seeping in
    tl.to(warmBreathRef.current, {
      opacity: 1,
      duration: 1.4,
      ease: 'power2.out',
    }, 'exit');

    // Text and monogram exit upward — they float away as the world dissolves
    tl.to(
      [line1Ref.current, line2Ref.current],
      { opacity: 0, y: -30, duration: 1.0, ease: 'power3.in' },
      'exit+=0.2'
    );
    tl.to(monogramRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in',
    }, 'exit+=0.3');

    // Crimson overlay dissolves — Earth shows through
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 1.8,
      ease: 'power2.inOut',
    }, 'exit+=0.4');

    // Hold fully dissolved — screen is warm cream (Earth showing through)
    tl.to({}, { duration: 0.8 });

    return () => {
      if (pinSt) pinSt.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-transparent z-10 -mt-[100vh] flex flex-col items-center justify-center px-6 md:px-20 overflow-hidden"
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
      {/* Color matches earth_back.png cream top. Pointer-events-none, z below text. */}
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
