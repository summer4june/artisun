'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const keyholeTitle = "Welcome to Climate-smart Skinwear™";
const keyholeSubtitle = "Clothing for your skin, built for daily life.";

export default function KeyholeSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const imageLayerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const titleWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const subWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  titleWordsRef.current = [];
  subWordsRef.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // ── ENTRY: Rising Portal — rises from bottom with rounded top ──
    gsap.set(containerRef.current, { clipPath: 'inset(100% 0% 0% 0% round 20px)' });
    const scaleEntrySt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 90%',
      end: 'top top',
      scrub: 1.5,
      animation: gsap.to(containerRef.current, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'power3.out',
      }),
    });

    // Dark overlay dissolves as the card opens
    const entryOverlay = containerRef.current?.querySelector('.keyhole-entry-overlay') as HTMLElement;
    const entrySt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      end: 'top 20%',
      scrub: 1.5,
      animation: gsap.to(entryOverlay, { opacity: 0, ease: 'power2.inOut' }),
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: "+=200%", // Drastically shortened scroll length so it happens very quickly
        pin: true,
        scrub: 1.5,
        anticipatePin: 1,
      }
    });

    // 1. Zoom the keyhole massively so the viewer "enters" it
    tl.to(svgRef.current, {
      scale: 40, // Scale it up until the transparent hole covers the entire screen
      duration: 3,
      ease: "power2.inOut",
    }, 0); // Start at absolute time 0

    // 2. Fade out the landscape image FAST at the start of the zoom
    tl.to(imageLayerRef.current, {
      opacity: 0,
      duration: 1.5, 
      ease: "power2.out"
    }, 0);

    // 3. Fade in the content container
    tl.to(contentRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    }, 1.0);

    // 3b. Word-by-word highlight for title
    tl.to(titleWordsRef.current, {
      opacity: 1,
      stagger: 0.08,
      ease: "none",
    }, 1.2);

    // 3c. Word-by-word highlight for subtitle
    tl.to(subWordsRef.current, {
      opacity: 1,
      stagger: 0.08,
      ease: "none",
    }, 1.8);

    // 4. Hold the final frame
    tl.to({}, { duration: 1.0 });

    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
      scaleEntrySt.kill();
      entrySt.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <section ref={containerRef} className="relative w-full h-screen bg-transparent z-10 flex flex-col items-center justify-center overflow-hidden">

      {/* 
        The landscape image layer. 
        It sits above the section's red background. 
      */}
      <div ref={imageLayerRef} className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/keyhole-bg.webp"
          alt="Keyhole Background"
          className="w-full h-[120vh] object-cover scale-110"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* The new text content. Appears after the image fades out. */}
      <div
        ref={contentRef}
        className="relative z-10 opacity-0 flex flex-col items-center justify-center text-center px-6 w-full"
      >
        <h2 className="font-editorial font-normal text-[40px] md:text-[64px] lg:text-[80px] text-white leading-tight tracking-wide flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em]">
          {keyholeTitle.split(" ").map((word, i) => (
            <span
              key={`kt-${i}`}
              ref={el => { if (el) titleWordsRef.current.push(el); }}
              className="opacity-[0.15]"
            >
              {word}
            </span>
          ))}
        </h2>
        <p className="font-editorial font-normal text-white/80 mt-4 text-[20px] md:text-[28px] tracking-wide flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.15em]">
          {keyholeSubtitle.split(" ").map((word, i) => (
            <span
              key={`ks-${i}`}
              ref={el => { if (el) subWordsRef.current.push(el); }}
              className="opacity-[0.15]"
            >
              {word}
            </span>
          ))}
        </p>
      </div>

      {/* 
        The SVG Keyhole Mask Overlay 
        This sits on top of everything and scales outwards from the center.
      */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full origin-center"
          style={{ willChange: 'transform' }}
        >
          <defs>
            <mask id="keyholeMask">
              {/* White = opaque background */}
              <rect width="100%" height="100%" fill="white" />
              {/* Black = transparent cutout (The Keyhole) */}
              <circle cx="960" cy="540" r="220" fill="black" />
              <polygon points="870,650 650,1500 1270,1500 1050,650" fill="black" />
            </mask>
            <radialGradient id="keyholeGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#3a0d0d" />
              <stop offset="100%" stopColor="#0a0000" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#keyholeGrad)" mask="url(#keyholeMask)" />
        </svg>
      </div>

      {/* Entry Dissolve Overlay */}
      <div
        className="keyhole-entry-overlay absolute inset-0 pointer-events-none z-[30]"
        style={{
          background: 'linear-gradient(to bottom, #0a0000 0%, #1a0505 50%, #0a0000 100%)',
          willChange: 'opacity, filter',
        }}
      />

      </section>
    </div>
  );
}
