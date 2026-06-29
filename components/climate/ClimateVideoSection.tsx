'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { preloadedAssets } from '../../lib/preloader';

const URLS = [
  '/videos/climate/1.mp4',
  '/videos/climate/2.mp4',
  '/videos/climate/3.mp4',
  '/videos/climate/4.mp4',
  '/videos/climate/5.mp4',
];

const SLIDE_LINES: [string, string][] = [
  ['In Shimla,', 'your skin feels dry, tight and flaky'],
  ['In Jaipur, the very same skin', 'turns oily, sticky and pigmented'],
  ["Bangalore's heat and", 'humidity cling to you all day.'],
  ['While sudden showers in Mumbai', 'make it greasy and unpredictable.'],
  ['And through all these climates,', 'the sun never leaves your side.'],
];


const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

// ── Cubic-bezier(0.22, 1, 0.36, 1) solver — the "premium" ease used everywhere ──
function makeCubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const A = (a1: number, a2: number) => 1.0 - 3.0 * a2 + 3.0 * a1;
  const B = (a1: number, a2: number) => 3.0 * a2 - 6.0 * a1;
  const C = (a1: number) => 3.0 * a1;
  const calc = (t: number, a1: number, a2: number) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const slope = (t: number, a1: number, a2: number) => 3.0 * A(a1, a2) * t * t + 2.0 * B(a1, a2) * t + C(a1);
  const getTForX = (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const xEst = calc(t, p1x, p2x) - x;
      if (Math.abs(xEst) < 1e-6) return t;
      const d = slope(t, p1x, p2x);
      if (Math.abs(d) < 1e-4) break;
      t -= xEst / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 12; i++) {
      const xEst = calc(t, p1x, p2x);
      if (Math.abs(xEst - x) < 1e-6) return t;
      if (x > xEst) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };
  return (x: number) => calc(getTForX(clamp01(x)), p1y, p2y);
}

// cubic-bezier(0.22, 1, 0.36, 1) — the exact glide physics from index2.html
const cinematicEase = makeCubicBezier(0.22, 1, 0.36, 1);

export default function ClimateVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoElRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const bgVideoEls = useRef<(HTMLVideoElement | null)[]>([]);
  const videoDarkenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const edgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const subtitleRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const N = URLS.length;
    if (!containerRef.current) return;

    // ── ENTRY: Overlay dissolve (unchanged entrance feel) ──
    const irisSt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      end: 'top 20%',
      scrub: 1.5,
      animation: gsap.to(irisRef.current, { opacity: 0, ease: 'power2.inOut' }),
    });

    const videoEls = videoElRefs.current;
    videoEls.forEach((vid, idx) => {
      if (!vid) return;
      vid.src = preloadedAssets.videos[URLS[idx]] || URLS[idx];
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.preload = idx < 2 ? 'auto' : 'metadata';

      const bgVid = bgVideoEls.current[idx];
      if (bgVid) {
        bgVid.src = vid.src;
        bgVid.muted = true;
        bgVid.loop = true;
        bgVid.playsInline = true;
        bgVid.preload = idx < 2 ? 'auto' : 'metadata';
      }
    });

    // ── Scroll choreography: hold on each city, then a quick continuous dolly to the next ──
    // Hold segments are long (the city stays put while the user scrolls); transition segments
    // are short and always scrub continuously — never paused mid-transition.
    const HOLD_LEN = 1.4;
    const TRANS_LEN = 0.75;
    type Segment = { type: 'hold' | 'trans'; index: number; len: number; start: number };
    const segments: Segment[] = [];
    {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        segments.push({ type: 'hold', index: i, len: HOLD_LEN, start: acc });
        acc += HOLD_LEN;
        if (i < N - 1) {
          segments.push({ type: 'trans', index: i, len: TRANS_LEN, start: acc });
          acc += TRANS_LEN;
        }
      }
    }
    const totalLen = segments.reduce((s, seg) => s + seg.len, 0);

    const locate = (rawUnits: number) => {
      const u = Math.min(Math.max(rawUnits, 0), totalLen - 1e-6);
      let seg = segments[segments.length - 1];
      for (let i = 0; i < segments.length; i++) {
        const next = segments[i + 1];
        if (!next || u < next.start) { seg = segments[i]; break; }
      }
      const local = clamp01((u - seg.start) / seg.len);
      if (seg.type === 'hold') {
        return { fromIdx: seg.index, toIdx: seg.index, e: 0, isHold: true };
      }
      return { fromIdx: seg.index, toIdx: seg.index + 1, e: cinematicEase(local), isHold: false };
    };

    let activeKey = '';

    // ── Cinematic Depth Slide constants (matching index2.html exactly) ──
    const TX_MAIN = 11;       // max % translate for the video layer
    const BG_MULT = 0.43;     // background drifts slower (depth)
    const FG_MULT = 1.3;      // foreground overlay moves slightly faster
    const TEXT_MULT = 2.4;    // text moves the most
    const VIDEO_BASE = 1.28;  // base scale to hide panning edges
    const LAYER_BASE = 1.18;

    const setRest = (i: number, active: boolean) => {
      gsap.set(panelRefs.current[i], { xPercent: 0, rotationY: 0, autoAlpha: active ? 1 : 0, zIndex: active ? 2 : 0, force3D: true });
      gsap.set(videoWrapRefs.current[i], {
        xPercent: 0, scale: VIDEO_BASE, autoAlpha: 1, force3D: true,
      });
      gsap.set(videoDarkenRefs.current[i], { opacity: 0 });
      gsap.set(bgRefs.current[i], { xPercent: 0, scale: LAYER_BASE, force3D: true });
      gsap.set(fgRefs.current[i], { xPercent: 0, scale: LAYER_BASE, force3D: true });
      gsap.set(textWrapRefs.current[i], { x: 0, xPercent: 0, force3D: true });
      gsap.set(titleRefs.current[i], { autoAlpha: active ? 1 : 0, filter: 'blur(0px)' });
      gsap.set(subtitleRefs.current[i], { autoAlpha: active ? 1 : 0 });
      gsap.set(edgeRefs.current[i], { opacity: 0 });
    };

    const applyOut = (i: number, e: number) => {
      const tx = -TX_MAIN * e;
      
      gsap.set(panelRefs.current[i], { 
        xPercent: 0, 
        rotationY: -2 * e, 
        autoAlpha: 1, 
        zIndex: 1, 
        force3D: true 
      });

      gsap.set(videoWrapRefs.current[i], {
        xPercent: tx,
        scale: VIDEO_BASE * (1 - 0.03 * e),
        autoAlpha: 1 - 0.2 * e,
        force3D: true,
      });
      gsap.set(videoDarkenRefs.current[i], { opacity: 0.25 * e });

      gsap.set(bgRefs.current[i], { xPercent: tx * BG_MULT, scale: LAYER_BASE, force3D: true });
      gsap.set(fgRefs.current[i], { xPercent: tx * FG_MULT, scale: LAYER_BASE, force3D: true });
      gsap.set(textWrapRefs.current[i], { x: 0, xPercent: tx * TEXT_MULT, force3D: true });

      gsap.set(titleRefs.current[i], { autoAlpha: 1 - e });
      gsap.set(subtitleRefs.current[i], { autoAlpha: 1 - e });
      gsap.set(edgeRefs.current[i], { opacity: 0 });
    };

    const applyIn = (i: number, e: number) => {
      const inv = 1 - e;
      const tx = TX_MAIN * inv;

      gsap.set(panelRefs.current[i], { 
        xPercent: 0, 
        rotationY: 2 * inv, 
        autoAlpha: e, 
        zIndex: 2, 
        force3D: true 
      });

      gsap.set(videoWrapRefs.current[i], {
        xPercent: tx,
        scale: VIDEO_BASE * (1.05 - 0.05 * e),
        autoAlpha: e,
        force3D: true,
      });
      gsap.set(videoDarkenRefs.current[i], { opacity: 0.2 * inv });

      gsap.set(bgRefs.current[i], { xPercent: tx * BG_MULT, scale: LAYER_BASE, force3D: true });
      gsap.set(fgRefs.current[i], { xPercent: tx * FG_MULT, scale: LAYER_BASE, force3D: true });
      gsap.set(textWrapRefs.current[i], { 
        x: 40 * inv,
        xPercent: tx * TEXT_MULT * 0.6, 
        force3D: true 
      });

      gsap.set(titleRefs.current[i], { autoAlpha: e, filter: `blur(${8 * inv}px)` });
      gsap.set(subtitleRefs.current[i], { autoAlpha: Math.max(0, e - 0.15) / 0.85 });
      gsap.set(edgeRefs.current[i], { opacity: 0 });
    };

    const update = (progress: number) => {
      const { fromIdx, toIdx, e, isHold } = locate(progress * totalLen);

      // Manage video playback: only the active (and incoming) videos play.
      const key = `${fromIdx}-${toIdx}`;
      if (key !== activeKey) {
        activeKey = key;
        videoEls.forEach((vid, i) => {
          if (!vid) return;
          const bgVid = bgVideoEls.current[i];
          if (i === fromIdx || i === toIdx) {
            if (vid.paused && vid.readyState >= 2) { vid.play().catch(() => {}); }
            if (bgVid && bgVid.paused && bgVid.readyState >= 2) { bgVid.play().catch(() => {}); }
          } else if (!vid.paused) {
            vid.pause();
            if (bgVid) bgVid.pause();
          }
        });
      }

      // Paint cities. During a hold only one city is visible (centred, still); during a
      // transition the outgoing panel dollies left out of frame while the incoming one slides
      // in from the right, both gliding together so the camera appears to move through space.
      for (let i = 0; i < N; i++) {
        if (isHold) {
          setRest(i, i === fromIdx);
        } else if (i === fromIdx) {
          applyOut(i, e);
        } else if (i === toIdx) {
          applyIn(i, e);
        } else {
          setRest(i, false);
        }
        // z-order: incoming sits above outgoing so it glides cleanly over the seam.
        const z = isHold ? (i === fromIdx ? 2 : 0) : i === toIdx ? 3 : i === fromIdx ? 2 : 0;
        gsap.set(panelRefs.current[i], { zIndex: z });
      }

      // ── Soft vignette — 0% → 12% → 0%, peaking mid-transition. ──
      const vig = isHold ? 0 : Math.sin(Math.PI * e) * 0.12;
      gsap.set(vignetteRef.current, { opacity: vig });

      // ── Dots reflect the dominant city. ──
      const dominant = isHold ? fromIdx : e < 0.5 ? fromIdx : toIdx;
      dotsRef.current.forEach((dot, i) => {
        if (!dot) return;
        const active = i === dominant;
        gsap.set(dot, {
          opacity: active ? 1 : 0.3,
          scale: active ? 1.5 : 1,
          boxShadow: active ? '0 0 10px rgba(166,42,44,0.8)' : 'none',
        });
      });
    };

    // ── Entrance Animation — scale-up reveal from rounded thumbnail to fullscreen ──
    const entranceSt = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        const s = 0.5 + 0.5 * p;
        const invS = 1 / s;
        const radius = 60 * (1 - p);

        if (wrapperRef.current) {
          wrapperRef.current.style.transform = `scale(${s})`;
          wrapperRef.current.style.borderRadius = `${radius}px`;
        }
        if (innerRef.current) {
          innerRef.current.style.transform = `scale(${invS})`;
        }

        if (p >= 0.99) {
          videoElRefs.current[0]?.play().catch(() => {});
        } else if (!videoElRefs.current[0]?.paused) {
          videoElRefs.current[0]?.pause();
        }
      },
    });

    // ── Main pinned, scrubbed cinematic dolly through every slide ──
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      pin: true,
      start: 'top top',
      end: `+=${totalLen * 100}%`,
      scrub: 1,
      onUpdate: (self) => update(self.progress),
    });

    // Initialize resting transforms before any scroll input arrives.
    update(st.progress);

    return () => {
      st.kill();
      irisSt.kill();
      entranceSt.kill();
      videoEls.forEach((vid, i) => {
        if (!vid) return;
        vid.pause();
        vid.src = '';
        vid.load();
        const bgVid = bgVideoEls.current[i];
        if (bgVid) {
          bgVid.pause();
          bgVid.src = '';
          bgVid.load();
        }
      });
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-black z-10">
      <div
        ref={wrapperRef}
        className="relative w-full h-screen overflow-hidden z-0 bg-black origin-center"
        style={{ willChange: 'transform, border-radius' }}
      >
        <div ref={innerRef} className="relative w-full h-full origin-center overflow-hidden" style={{ willChange: 'transform' }}>
          {/* ── Cinematic Depth Slide stage — full-screen panels stacked in 3D space.
                Only one city is visible during a hold; during a transition the outgoing and
                incoming cities run the layered depth slide (bg/video/fg/text at different
                speeds) so the camera appears to dolly sideways through space. ── */}
          <div
            ref={trackRef}
            className="absolute inset-0 w-full h-full"
            style={{ perspective: '1600px', willChange: 'transform' }}
          >
            {URLS.map((url, i) => {
              const [title, subtitle] = SLIDE_LINES[i];
              let positionClasses = '';
              let textAlignment = '';
              if (i === 0 || i === 2) {
                positionClasses = 'justify-start items-start pt-[18vh] md:pt-[22vh] pl-[8vw] md:pl-[12vw]';
                textAlignment = 'text-left';
              } else if (i === 1 || i === 3) {
                positionClasses = 'justify-start items-end pt-[18vh] md:pt-[22vh] pr-[8vw] md:pr-[12vw]';
                textAlignment = 'text-right';
              } else {
                positionClasses = 'justify-center items-center';
                textAlignment = 'text-center';
              }

              return (
                <div
                  key={url}
                  ref={(el) => { panelRefs.current[i] = el; }}
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ willChange: 'transform, opacity', backgroundColor: '#050505', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                >
                  {/* ── Background — actual video playing slowly in the background, darkened ── */}
                  <div
                    ref={(el) => { bgRefs.current[i] = el; }}
                    className="absolute -inset-x-[25%] inset-y-0 pointer-events-none"
                    style={{ willChange: 'transform' }}
                  >
                    <video
                      ref={(el) => { bgVideoEls.current[i] = el; }}
                      muted loop playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-[0.7] pointer-events-none" />
                  </div>

                  {/* ── Video — sharp focal layer, over-zoomed so edges never show ── */}
                  <div
                    ref={(el) => { videoWrapRefs.current[i] = el; }}
                    className="absolute inset-0 overflow-hidden"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <video
                      ref={(el) => { videoElRefs.current[i] = el; }}
                      muted loop playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* GPU-accelerated overlay layers (replaces expensive dynamic CSS filters on video) */}
                    <div ref={(el) => { videoDarkenRefs.current[i] = el; }} className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: 0, willChange: 'opacity' }} />
                  </div>

                  {/* ── Foreground overlay — gradient for legibility (-55%) ── */}
                  <div
                    ref={(el) => { fgRefs.current[i] = el; }}
                    className="absolute -inset-x-[25%] inset-y-0 pointer-events-none"
                    style={{
                      willChange: 'transform',
                      background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.25) 100%)',
                    }}
                  />

                  {/* ── Seam shadow — soft depth shadow on the trailing edge during a slide,
                        so the boundary between two scenes reads as depth, not a hard cut. ── */}
                  <div
                    ref={(el) => { edgeRefs.current[i] = el; }}
                    className="absolute inset-y-0 right-0 w-[16%] pointer-events-none z-[5]"
                    style={{
                      opacity: 0,
                      willChange: 'opacity',
                      background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.55))',
                    }}
                  />

                  {/* ── Text — fastest parallax layer (closest to camera) ── */}
                  <div
                    ref={(el) => { textWrapRefs.current[i] = el; }}
                    className={`absolute inset-0 z-10 flex flex-col ${positionClasses} ${textAlignment} pointer-events-none`}
                    style={{ willChange: 'transform' }}
                  >
                    <h2
                      ref={(el) => { titleRefs.current[i] = el; }}
                      className="font-editorial font-normal text-[clamp(16px,4vw,50px)] leading-[1.15] tracking-[-0.01em] text-[#a62a2c] drop-shadow-[0_4px_16px_rgba(255,255,255,0.6)] whitespace-nowrap"
                      style={{ opacity: 0, willChange: 'transform, opacity, filter' }}
                    >
                      {title}
                    </h2>
                    <p
                      ref={(el) => { subtitleRefs.current[i] = el; }}
                      className="font-editorial font-normal text-[clamp(14px,2.6vw,32px)] leading-[1.2] tracking-[-0.01em] text-[#a62a2c]/85 drop-shadow-[0_4px_16px_rgba(255,255,255,0.5)] whitespace-nowrap"
                      style={{ opacity: 0, willChange: 'transform, opacity, filter' }}
                    >
                      {subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Cinematic vignette pulse during transitions — fixed over the viewport ── */}
          <div
            ref={vignetteRef}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              opacity: 0,
              willChange: 'opacity',
              background: 'radial-gradient(circle, transparent 45%, rgba(0,0,0,0.9) 130%)',
            }}
          />

          {/* ── Progress dots — fixed over the viewport ── */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-30">
            {URLS.map((_, i) => (
              <div
                key={i}
                ref={(el) => { dotsRef.current[i] = el; }}
                className="w-2.5 h-2.5 rounded-full bg-[#a62a2c]"
                style={{
                  opacity: i === 0 ? 1 : 0.3,
                  transform: i === 0 ? 'scale(1.5)' : 'scale(1)',
                  boxShadow: i === 0 ? '0 0 10px rgba(166,42,44,0.8)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Entry Dissolve Overlay — fades out with blur to reveal video */}
      <div
        ref={irisRef}
        className="absolute inset-0 pointer-events-none z-[50]"
        style={{
          willChange: 'opacity, filter',
          background: 'linear-gradient(to bottom, rgba(40,8,2,0.95) 0%, #0a0000 50%, #050505 100%)',
        }}
      />
    </section>
  );
}
