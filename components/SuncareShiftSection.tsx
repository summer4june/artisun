'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "This shift does more than change";
const line2 = "how protection is created.";
const line3 = "It redefines how it is worn.";

export default function SuncareShiftSection() {
  const containerRef = useRef<HTMLElement>(null);
  const sharpBgRef = useRef<HTMLDivElement>(null);
  const entryOverlayRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef = useRef<HTMLDivElement>(null);

  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words3Ref = useRef<(HTMLSpanElement | null)[]>([]);

  words1Ref.current = [];
  words2Ref.current = [];
  words3Ref.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];

    // ── ENTRY: Cinematic Iris Open ──
    // Section reveals through a circle that expands from center outward.
    gsap.set(containerRef.current, { clipPath: 'inset(40% round 50%)' });
    triggers.push(ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 90%',
      end: 'top top',
      scrub: 1.5,
      animation: gsap.to(containerRef.current, {
        clipPath: 'inset(0% round 0px)',
        ease: 'power2.out',
      }),
    }));

    // Dark overlay dissolves during iris open
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
        end: "+=250%",
        pin: true,
        scrub: 1.5,
        anticipatePin: 1,
      }
    });

    tl.fromTo(words1Ref.current,
      { opacity: 0, y: 40, filter: "blur(12px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, ease: "power3.out" }
    );

    tl.fromTo(words2Ref.current,
      { opacity: 0, y: 40, filter: "blur(12px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, ease: "power3.out" },
      "+=0.1"
    );

    tl.to({}, { duration: 0.2 });

    tl.to(sharpBgRef.current, { opacity: 1, duration: 1.5, ease: "power1.inOut" }, "transition");
    tl.to([...words1Ref.current, ...words2Ref.current], { opacity: 0.4, duration: 1.5, ease: "power1.inOut" }, "transition");

    tl.to({}, { duration: 0.2 });

    tl.fromTo(words3Ref.current,
      { opacity: 0, y: 30, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, ease: "power3.out" }
    );

    tl.to({}, { duration: 0.8 });

    // ── EXIT: Content dissolves, dark overlay fades in ──
    tl.addLabel('exit');
    tl.to(
      [...words1Ref.current, ...words2Ref.current, ...words3Ref.current],
      { opacity: 0, y: -25, filter: 'blur(6px)', duration: 0.8, ease: 'power2.in' },
      'exit'
    );
    tl.fromTo(exitOverlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.0, ease: 'power2.in' },
      'exit+=0.2'
    );

    triggers.push(tl.scrollTrigger!);

    return () => {
      triggers.forEach(st => st.kill());
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-black z-10 flex flex-col items-center justify-center px-6 md:px-20 lg:px-32 overflow-hidden">

      {/* Background Image Layer 1: Blurred */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/a-new-language-of-suncare.png"
          alt="A New Language of Suncare Blurred"
          className="w-full h-full object-cover scale-[1.05]"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Background Image Layer 2: Sharp (Starts Hidden) */}
      <div ref={sharpBgRef} className="absolute inset-0 z-[1] opacity-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/a-new-language-of-suncare-2.webp"
          alt="A New Language of Suncare Sharp"
          className="w-full h-full object-cover scale-[1.05]"
        />
        <div className="absolute inset-0 bg-black/20"></div>
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
        <div className="mb-[0.2em] flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
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

        {/* Line 3 */}
        <div className="flex flex-wrap justify-start gap-x-[0.25em] gap-y-[0.15em] w-full">
          {line3.split(" ").map((word, wordIndex) => (
            <span
              key={`l3-${wordIndex}`}
              ref={el => { if (el) words3Ref.current.push(el); }}
              className="opacity-0"
              style={{ willChange: 'transform, opacity, filter', display: 'inline-block' }}
            >
              {word}
            </span>
          ))}
        </div>

      </div>

      {/* Entry Dissolve Overlay — matches Earth's dark space, dissolves to reveal this section */}
      <div
        ref={entryOverlayRef}
        className="absolute inset-0 pointer-events-none z-[25]"
        style={{
          background: 'linear-gradient(to bottom, #000000 0%, #050505 40%, #0a0505 100%)',
          willChange: 'opacity, filter',
        }}
      />

      {/* Exit Dissolve Overlay — fades to dark, bridging into Clothing section */}
      <div
        ref={exitOverlayRef}
        className="absolute inset-0 pointer-events-none z-[25] opacity-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, #000000 100%)',
          willChange: 'opacity',
        }}
      />
    </section>
  );
}
