'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sections } from '@/data/climateSections';

// City-specific accent tints for overlay gradient
const sectionTints = [
  'rgba(8,21,38,0.55)',     // Shimla  – cool navy
  'rgba(48,26,10,0.55)',    // Jaipur  – burnt amber
  'rgba(8,30,16,0.55)',     // Bangalore – forest green
  'rgba(20,10,36,0.55)',    // Mumbai  – coastal indigo
  'rgba(12,8,4,0.5)',       // Constant – near black
];

interface ClimateSectionProps {
  onProgress?: (progress: number) => void;
}

export default function ClimateSection({ onProgress }: ClimateSectionProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!outerRef.current || !trackRef.current) return;

    const totalPanels = sections.length;

    // PIN the outer container, then scrub the track horizontally
    const ctx = gsap.context(() => {
      const tween = gsap.to(trackRef.current, {
        x: () => -(trackRef.current!.scrollWidth - window.innerWidth),
        ease: 'none',
      });

      ScrollTrigger.create({
        trigger: outerRef.current,
        start: 'top top',
        end: () => `+=${trackRef.current!.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: 1.2,
        animation: tween,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const rawIndex = self.progress * (totalPanels - 1);
          const activeIndex = Math.min(totalPanels - 1, Math.round(rawIndex));

          // Fade/scale each panel based on proximity to active
          panelRefs.current.forEach((panel, idx) => {
            if (!panel) return;
            const dist = Math.abs(idx - rawIndex);
            const opacity = dist < 0.5 ? 1 : Math.max(0.35, 1 - (dist - 0.5) * 1.4);
            const scale = dist < 0.5 ? 1 : Math.max(0.92, 1 - (dist - 0.5) * 0.1);
            gsap.set(panel, { opacity, scale });
          });

          // Play only the active video, freeze others (saves CPU)
          videoRefs.current.forEach((vid, idx) => {
            if (!vid) return;
            if (idx === activeIndex) {
              vid.playbackRate = 1;
              if (vid.paused) vid.play().catch(() => {});
            } else {
              vid.playbackRate = 0;
            }
          });
        },
      });
    }, outerRef);

    // Report 100% immediately since there's no heavy pre-loading
    if (onProgress) onProgress(100);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /* Outer – becomes the pin spacer */
    <div ref={outerRef} id="bleed-experience-section" className="relative w-full h-screen overflow-hidden">
      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="flex h-full will-change-transform"
        style={{ width: `${sections.length * 100}vw` }}
      >
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            ref={(el) => { panelRefs.current[idx] = el; }}
            className="relative flex-none w-screen h-full overflow-hidden"
            style={{ opacity: idx === 0 ? 1 : 0.35, scale: idx === 0 ? 1 : 0.94 }}
          >
            {/* Media */}
            {sec.mediaType === 'video' ? (
              <video
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={sec.mediaUrl}
                muted
                loop
                playsInline
                preload="metadata"
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

            {/* City tint overlay */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${sectionTints[idx]} 0%, transparent 60%)` }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 text-center z-10">
              <p className="font-suisse font-medium text-[10px] md:text-[11px] tracking-[0.3em] text-white/50 uppercase mb-3">
                {sec.badge}
              </p>

              {sec.title === 'IMAGE_LOGO' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/logo.png"
                  alt="Artisun"
                  className="h-20 md:h-28 object-contain mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                />
              ) : (
                <h2 className="font-editorial font-bold uppercase text-[clamp(3rem,7vw,6rem)] text-white leading-[0.9] tracking-[0.05em] mb-5 drop-shadow-xl">
                  {sec.title}
                </h2>
              )}

              <p className="font-suisse font-normal text-base md:text-lg text-white/80 leading-relaxed tracking-wide max-w-xl mx-auto">
                {sec.description}
              </p>
            </div>

            {/* Section counter */}
            <div className="absolute bottom-10 right-10 font-suisse text-[10px] tracking-[0.3em] text-white/30">
              0{idx + 1}&nbsp;/&nbsp;0{sections.length}
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal scroll hint – fades out after first panel passed */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-suisse text-[9px] tracking-[0.25em] text-white/30 uppercase">Scroll to explore</span>
        <div className="w-8 h-[1px] bg-white/20" />
      </div>
    </div>
  );
}
