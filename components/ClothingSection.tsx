'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const line1 = "Just as clothing changes with";
const line2 = "occasions and environments,";

export default function ClothingSection() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const entryOverlayRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef = useRef<HTMLDivElement>(null);

  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);

  words1Ref.current = [];
  words2Ref.current = [];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6;
    }

    const videoEl = videoRef.current;
    if (videoEl) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            videoEl.preload = 'auto';
            videoEl.load();
            observer.disconnect();
          }
        },
        { rootMargin: '50% 0px' }
      );
      observer.observe(videoEl);
    }

    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];

    // ── ENTRY: Cinema Card — rounded card opens with depth ──
    gsap.set(containerRef.current, { clipPath: 'inset(12% round 32px)' });
    triggers.push(ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 90%',
      end: 'top top',
      scrub: 1.5,
      animation: gsap.to(containerRef.current, {
        clipPath: 'inset(0% round 0px)',
        ease: 'power3.out',
      }),
    }));

    // Dark overlay dissolves as the card opens
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
        end: "+=140%",
        pin: true,
        anticipatePin: 1,
        scrub: 1.5,
      }
    });

    tl.to(words1Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    });

    tl.to(words2Ref.current, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    }, "+=0.1");

    tl.to({}, { duration: 0.5 });

    // ── EXIT: Content dissolves, dark overlay fades in ──
    tl.addLabel('exit');
    tl.to(
      [...words1Ref.current, ...words2Ref.current],
      { opacity: 0, duration: 0.6, ease: 'power2.in' },
      'exit'
    );
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

      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover scale-[1.05]"
        >
          <source src="/6th-vid.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
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

      {/* Exit Dissolve Overlay */}
      <div
        ref={exitOverlayRef}
        className="absolute inset-0 pointer-events-none z-[25] opacity-0"
        style={{
          background: '#000000',
          willChange: 'opacity',
        }}
      />
    </section>
  );
}
