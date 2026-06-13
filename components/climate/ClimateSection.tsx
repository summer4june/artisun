'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sections } from '@/data/climateSections';

interface ClimateSectionProps {
  onProgress?: (progress: number) => void;
}

export default function ClimateSection({ onProgress }: ClimateSectionProps) {
  const outerRef   = useRef<HTMLDivElement>(null);
  const panelRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs  = useRef<(HTMLVideoElement | null)[]>([]);
  const activeRef  = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!outerRef.current) return;

    const total = sections.length;

    // ── Initial state ──────────────────────────────────────────────────
    // Panel 0 visible, all others invisible
    panelRefs.current.forEach((p, i) => {
      if (!p) return;
      gsap.set(p, { autoAlpha: i === 0 ? 1 : 0 });
    });

    // Play first video immediately
    const v0 = videoRefs.current[0];
    if (v0) v0.play().catch(() => {});

    // ── GSAP Timeline ──────────────────────────────────────────────────
    // Each section-to-section transition = 1 "step" in the timeline.
    // We give each step duration=1 so the total timeline length = (total-1).
    const tl = gsap.timeline({ paused: true });

    for (let i = 0; i < total - 1; i++) {
      const curr = panelRefs.current[i];
      const next = panelRefs.current[i + 1];
      if (!curr || !next) continue;

      // At position i: fade out current, fade in next (overlap = crossfade)
      tl.to(curr, { autoAlpha: 0, duration: 1, ease: 'none' }, i);
      tl.to(next, { autoAlpha: 1, duration: 1, ease: 'none' }, i);
    }

    // ── ScrollTrigger drives the timeline ──────────────────────────────
    // Each panel gets 85vh of scroll distance to transition through.
    const scrollDistance = (total - 1) * window.innerHeight * 0.85;

    const st = ScrollTrigger.create({
      trigger: outerRef.current,
      start: 'top top',
      end: `+=${scrollDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 1.5,          // smooth lag so it never feels jerky
      animation: tl,       // this is the key: scrub drives the timeline
      onUpdate(self) {
        // Sync video playback to currently dominant panel
        const rawIdx = self.progress * (total - 1);
        const dominant = Math.min(total - 1, Math.round(rawIdx));

        if (dominant !== activeRef.current) {
          activeRef.current = dominant;

          videoRefs.current.forEach((vid, i) => {
            if (!vid) return;
            if (i === dominant) {
              vid.playbackRate = 1;
              if (vid.paused) vid.play().catch(() => {});
            } else {
              vid.playbackRate = 0;
            }
          });
        }
      },
    });

    if (onProgress) onProgress(100);

    return () => {
      tl.kill();
      st.kill(); // only kill THIS section's trigger, not all triggers globally
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={outerRef}
      id="bleed-experience-section"
      className="relative w-screen h-screen z-10"
      style={{ overflow: 'hidden' }}
    >
      {sections.map((sec, idx) => (
        <div
          key={sec.id}
          ref={el => { panelRefs.current[idx] = el; }}
          className="absolute inset-0 w-full h-full"
          style={{ willChange: 'opacity' }}
        >
          {/* ── Media ─────────────────────────────────────────────────── */}
          {sec.mediaType === 'video' ? (
            <video
              ref={el => { videoRefs.current[idx] = el; }}
              src={sec.mediaUrl}
              muted
              loop
              playsInline
              preload={idx === 0 ? 'auto' : 'metadata'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sec.mediaUrl}
              alt={sec.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* ── Vignette ──────────────────────────────────────────────── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* ── Content ───────────────────────────────────────────────── */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 text-center z-10">
            <p className="font-suisse font-medium text-[10px] md:text-[11px] tracking-[0.35em] text-white/50 uppercase mb-4">
              {sec.badge}
            </p>

            {sec.title === 'IMAGE_LOGO' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logo.png"
                alt="Artisun"
                className="h-20 md:h-28 object-contain mx-auto mb-5 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]"
              />
            ) : (
              <h2 className="font-editorial font-bold uppercase text-[clamp(3rem,7vw,6rem)] text-white leading-[0.9] tracking-[0.04em] mb-5 drop-shadow-xl">
                {sec.title}
              </h2>
            )}

            <p className="font-suisse font-normal text-base md:text-lg text-white/75 leading-relaxed tracking-wide max-w-xl mx-auto">
              {sec.description}
            </p>
          </div>

          {/* ── Counter ───────────────────────────────────────────────── */}
          <div className="absolute bottom-10 right-10 font-suisse text-[10px] tracking-[0.3em] text-white/35 pointer-events-none">
            0{idx + 1}&nbsp;/&nbsp;0{sections.length}
          </div>
        </div>
      ))}

      {/* ── Scroll hint ────────────────────────────────────────────────── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="font-suisse text-[9px] tracking-[0.25em] text-white/30 uppercase">
          Scroll to explore
        </span>
      </div>
    </div>
  );
}
