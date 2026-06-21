'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function KeyholeSection() {
  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const imageLayerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // ── ENTRY: Horizontal Tear ──
    // Section appears as a 4% horizontal slit at center of screen.
    // Expands outward — top half rises, bottom half drops — a tear.
    // The most dramatic entry on the site. Earns the keyhole reveal.
    gsap.set(containerRef.current, {
      clipPath: 'inset(48% 0% 48% 0%)',
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 90%',
      end: 'top top',
      scrub: 2,
      animation: gsap.to(containerRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'power3.inOut',
      }),
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%", // Drastically shortened scroll length so it happens very quickly
        pin: true,
        scrub: 1.5,
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

    // 3. Fade in the Welcome Text incredibly early in the sequence!
    tl.to(contentRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out"
    }, 1.0); // Starts at time 1.0 (barely after the zoom begins)

    // 4. Hold the final frame
    tl.to({}, { duration: 1.0 });

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
    <section ref={containerRef} className="relative w-full h-screen bg-transparent z-10 flex flex-col items-center justify-center overflow-hidden">

      {/* 
        The landscape image layer. 
        It sits above the section's red background. 
      */}
      <div ref={imageLayerRef} className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/keyhole-bg.jpg"
          alt="Keyhole View"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* The new text content. Appears after the image fades out. */}
      <div
        ref={contentRef}
        className="relative z-10 opacity-0 flex flex-col items-center justify-center text-center px-6 w-full"
      >
        <h2 className="font-editorial font-normal text-[40px] md:text-[64px] lg:text-[80px] text-white leading-tight tracking-wide">
          Welcome to Climate-smart Skinwear™
        </h2>
        <p className="font-editorial font-normal text-white/80 mt-4 text-[20px] md:text-[28px] tracking-wide">
          Clothing for your skin, built for daily life.
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

    </section>
  );
}
