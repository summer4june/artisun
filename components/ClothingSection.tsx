'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const line1 = "Just as clothing changes with";
const line2 = "occasions and environments,";

export default function ClothingSection() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const words1Ref = useRef<(HTMLSpanElement | null)[]>([]);
  const words2Ref = useRef<(HTMLSpanElement | null)[]>([]);

  words1Ref.current = [];
  words2Ref.current = [];

  useEffect(() => {
    // Reduce video playback speed by 30%
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.3;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 1.5, // Buttery smooth interpolation
      }
    });

    // Reveal Line 1 and 2
    // words1 — Effect 10: editorial skew entrance
    // Words arrive at 8° skew and scale 0.8, straighten and expand to full size.
    // Fashion-forward arrival suited to the slow atmospheric video environment.
    tl.fromTo(words1Ref.current,
      { opacity: 0, y: 40, scale: 0.8, skewY: 8 },
      { opacity: 1, y: 0, scale: 1, skewY: 0, stagger: 0.05, ease: "power3.out" }
    );

    // words2 — same effect, offset
    tl.fromTo(words2Ref.current,
      { opacity: 0, y: 40, scale: 0.8, skewY: 8 },
      { opacity: 1, y: 0, scale: 1, skewY: 0, stagger: 0.05, ease: "power3.out" },
      "+=0.1"
    );

    // Hold the final frame briefly
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

      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.05]"
        >
          <source src="/6th-vid.mp4" type="video/mp4" />
        </video>
        {/* Darkening overlay just in case the video needs dimming for text readability */}
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
              style={{ willChange: 'transform, opacity', display: 'inline-block' }}
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
              style={{ willChange: 'transform, opacity', display: 'inline-block' }}
            >
              {word}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
