'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sections } from '@/data/climateSections';

interface ClimateSectionProps {
  onProgress?: (progress: number) => void;
}

export default function ClimateSection({ onProgress }: ClimateSectionProps) {
  const outerRef    = useRef<HTMLDivElement>(null);
  const panelRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs   = useRef<(HTMLVideoElement | null)[]>([]);
  const counterRef  = useRef<HTMLDivElement>(null);
  const activeRef   = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!outerRef.current) return;

    const total = sections.length;

    // ── Initial state: panel 0 fully opaque, rest invisible ──────────────────
    panelRefs.current.forEach((p, i) => {
      if (!p) return;
      gsap.set(p, { autoAlpha: i === 0 ? 1 : 0 });
    });

    // Start first video playing
    const firstVid = videoRefs.current[0];
    if (firstVid) {
      firstVid.play().catch(() => {});
    }

    // ── One ScrollTrigger pins the section and drives the reveal ─────────────
    // Each section gets 100vh of scroll distance to transition through.
    // Total scroll = (total - 1) × 100vh  (no scroll needed for last panel to hold)
    const scrollDistance = (total - 1) * window.innerHeight;

    ScrollTrigger.create({
      trigger: outerRef.current,
      start: 'top top',
      end: `+=${scrollDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate(self) {
        // Raw floating index: 0.0 → (total-1).0
        const rawIdx  = self.progress * (total - 1);
        const current = Math.min(total - 1, Math.floor(rawIdx));
        const next    = Math.min(total - 1, current + 1);
        // t = 0→1 within each segment
        const t       = rawIdx - current;

        // Fade current out, next in — pure opacity, no movement
        panelRefs.current.forEach((p, i) => {
          if (!p) return;
          let alpha = 0;
          if (i === current) alpha = 1 - t;
          if (i === next)    alpha = t;
          // clamp
          alpha = Math.max(0, Math.min(1, alpha));
          gsap.set(p, { autoAlpha: alpha });
        });

        // Update counter text
        const visibleIdx = t > 0.5 ? next : current;
        if (visibleIdx !== activeRef.current) {
          activeRef.current = visibleIdx;
          if (counterRef.current) {
            counterRef.current.textContent =
              `0${visibleIdx + 1} / 0${total}`;
          }
          // Video management: play active, pause others
          videoRefs.current.forEach((vid, i) => {
            if (!vid) return;
            if (i === visibleIdx) {
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
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /*
      outerRef becomes the scroll pin spacer.
      overflow-hidden is intentional — no child should ever bleed out.
      z-10 pushes it above the fixed background.
    */
    <div
      ref={outerRef}
      id="bleed-experience-section"
      className="relative w-screen h-screen overflow-hidden z-10"
    >
      {sections.map((sec, idx) => (
        /*
          Every panel is absolute-positioned to cover the full parent.
          They are stacked on top of each other — only opacity changes,
          nothing ever moves.
        */
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

          {/* ── Bottom vignette so text stays readable ───────────────── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

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
        </div>
      ))}

      {/* ── Counter (bottom-right, always on top) ─────────────────────── */}
      <div
        ref={counterRef}
        className="absolute bottom-10 right-10 z-20 font-suisse text-[10px] tracking-[0.3em] text-white/35 pointer-events-none"
      >
        01 / 0{sections.length}
      </div>

      {/* ── Scroll hint (bottom-center) ────────────────────────────────── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-suisse text-[9px] tracking-[0.25em] text-white/30 uppercase">
          Scroll to explore
        </span>
      </div>
    </div>
  );
}
