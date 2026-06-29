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
  const curtainRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);
  words1Ref.current = [];
  words2Ref.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // ── ENTRY: Curtain Reveal from behind ClimateSection ──
    // EvolutionSection starts physically shifted up behind ClimateVideoSection (-100%).
    // As Climate scrolls up naturally, we animate Evolution's Y offset to 0.
    // This cancels out the native scroll, making Evolution appear completely
    // stationary while Climate slides off it vertically like a curtain lifting.
    const entrySt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      animation: gsap.fromTo(innerRef.current, 
        { yPercent: -100 },
        { yPercent: 0, ease: 'none' }
      ),
    });

    // Curtain overlay dissolves as the card opens
    const curtainSt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      end: 'top 20%',
      scrub: 1.5,
      animation: gsap.to(curtainRef.current, { opacity: 0, ease: 'power2.inOut' }),
    });

    // ── Pinned + scroll-scrubbed reveal ──
    // The whole beat sequence is tied to scroll progress through the pin (scrub),
    // not real-world time. Previously this ran on toggleActions: 'play' — a fixed
    // wall-clock animation that could finish revealing/exiting well before or after
    // the user actually scrolled through the pinned region, leaving a blank
    // crimson or cream screen for the rest of the scroll. Scrubbing keeps every
    // beat locked to exactly where the user is in the pin.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
      start: 'top top',
      end: '+=100%',
      pin: true,
      anticipatePin: 1,
      scrub: 1,
    },
      defaults: { ease: 'power4.out' }
    });

    // Beat 0 — Overlay breathes in (opacity 0 → 0.5)
    // The dark crimson atmosphere fades in as Evolution is revealed,
    // rather than being static behind the curtain from the start.
    tl.fromTo(overlayRef.current,
      { opacity: 0.35 },
      { opacity: 0.5, duration: 1.2 },
      0
    );

    // Beat 1 — Removed monogram animation, it stays static now.

    // Beat 2 — Line 1 words highlight one by one
    tl.to(words1Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    }, 0.4);

    // Beat 3 — Line 2 words highlight one by one
    tl.to(words2Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    }, 0.95);

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

    tl.to(
      [...words1Ref.current, ...words2Ref.current],
      { opacity: 0, duration: 1.0, ease: 'power3.in' },
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
      entrySt.kill();
      curtainSt.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-transparent z-10"
    >
      <div ref={innerRef} className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-20 w-full h-full overflow-hidden">
      {/* Dark Crimson Atmosphere — starts invisible, fades in as curtain rises */}
      {/* Radial gradient: brighter at center, deeper at edges — depth not flatness */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.35,
          background: 'radial-gradient(ellipse at 50% 50%, #6B0A0E 0%, #530007 45%, #2A0003 100%)',
        }}
      />

      <div
        ref={monogramRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] sm:w-[50vw] sm:h-[50vw] md:w-[40vw] md:h-[40vw] lg:w-[800px] lg:h-[800px] flex items-center justify-center pointer-events-none z-[1]"
        style={{ opacity: 0.14, willChange: 'opacity' }}
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

        {/* Line 1 */}
        <div
          ref={line1Ref}
          className="mb-[0.2em] flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em] w-full"
        >
          {line1.split(" ").map((word, i) => (
            <span
              key={`l1-${i}`}
              ref={el => { if (el) words1Ref.current.push(el); }}
              className="opacity-[0.15]"
            >
              {word}
            </span>
          ))}
        </div>

        {/* Line 2 */}
        <div
          ref={line2Ref}
          className="flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em] w-full"
        >
          {line2.split(" ").map((word, i) => (
            <span
              key={`l2-${i}`}
              ref={el => { if (el) words2Ref.current.push(el); }}
              className="opacity-[0.15]"
            >
              {word}
            </span>
          ))}
        </div>

      </div>

      {/* Warm Breath — Earth's warmth bleeding up from below as crimson dissolves.
          Goes fully opaque at the bottom edge, matching EarthSection's own top
          gradient color exactly (rgba(243,225,191,...)) — so once this reaches
          opacity:1, the bottom of Evolution and the top of Earth are the literal
          same color and the section boundary becomes invisible while scrolling.
          Previously this peaked at only 22% opacity, so the section's transparent
          background let the dark global "molten-core" backdrop show through as a
          visible reddish band before Earth's much more opaque gradient cut in hard. */}
      <div
        ref={warmBreathRef}
        className="absolute inset-x-0 bottom-0 pointer-events-none z-[2]"
        style={{
          height: '85%',
          opacity: 0,
          background: 'linear-gradient(to top, rgba(235, 90, 30, 1.0) 0%, rgba(235, 90, 30, 0.85) 18%, rgba(235, 90, 30, 0.35) 45%, transparent 80%)',
          willChange: 'opacity',
        }}
      />

      {/* Entry Dissolve — dark overlay dissolves with blur to reveal Evolution */}
      <div
        ref={curtainRef}
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: 'linear-gradient(to bottom, #2a0f02 0%, #170303 60%, #0a0000 100%)',
          willChange: 'opacity, filter',
        }}
      />
      </div>
    </section>
  );
}
