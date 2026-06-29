'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const footerHeadline = "The future of Climate-smart Skinwear starts here.";
const footerSubline = "A new standard in sun protection. For every climate. For every day.";

export default function Footer() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const sublineWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  headlineWordsRef.current = [];
  sublineWordsRef.current = [];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ── ENTRY: Diagonal Wipe ──
      gsap.set(containerRef.current, {
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
      });
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 90%',
        end: 'top 20%',
        scrub: 1.5,
        animation: gsap.to(containerRef.current, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          ease: 'power2.out',
        }),
      });

      // Line grows from center
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 1.4, ease: 'power3.out',
            scrollTrigger: { trigger: containerRef.current, start: 'top 55%' } }
        );
      }

      // Word-by-word headline with blur
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 50%',
        end: 'top 10%',
        scrub: 1.5,
        animation: gsap.to(headlineWordsRef.current, {
          opacity: 1, filter: 'blur(0px)', y: 0,
          stagger: 0.08, ease: 'none',
        }),
      });

      // Subline reveal
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 35%',
        end: 'top 5%',
        scrub: 1.5,
        animation: gsap.to(sublineWordsRef.current, {
          opacity: 1, filter: 'blur(0px)',
          stagger: 0.08, ease: 'none',
        }),
      });

      // Button
      if (buttonRef.current) {
        gsap.fromTo(buttonRef.current,
          { y: 30, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)',
            duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: containerRef.current, start: 'top 25%' } }
        );
      }

      // Bottom grid
      gsap.fromTo('.footer-grid-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.footer-bottom', start: 'top 95%' } }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={containerRef} className="relative w-full overflow-hidden bg-transparent z-10">
      {/* Frosted overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black via-black/70 to-black/40 backdrop-blur-xl pointer-events-none z-0" />
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(212,64,38,0.06) 0%, transparent 70%)',
      }} />

      {/* ═══ TOP: Hero CTA ═══ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-8 md:px-16">
        <div
          ref={lineRef}
          className="w-16 h-[1px] mb-10 origin-center"
          style={{ background: 'linear-gradient(90deg, transparent, #e8dfc5, transparent)', willChange: 'transform, opacity' }}
        />

        <h3 className="font-suisse text-[9px] md:text-[10px] tracking-[0.5em] uppercase text-[#e8dfc5]/40 mb-12 font-medium">
          The Future
        </h3>

        <h1 className="font-editorial text-[#e8dfc5] text-5xl md:text-6xl lg:text-[80px] leading-[1.1] text-center max-w-4xl mb-10 tracking-tight flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.1em]">
          {footerHeadline.split(" ").map((word, i) => (
            <span key={`fh-${i}`} ref={el => { if (el) headlineWordsRef.current.push(el); }}
              className="opacity-[0.1]"
              style={{ filter: 'blur(6px)', transform: 'translateY(8px)', willChange: 'opacity, filter, transform' }}>
              {word}
            </span>
          ))}
        </h1>

        <p className="font-editorial italic text-[#e8dfc5]/60 text-xl md:text-2xl text-center max-w-xl mb-20 font-light flex flex-wrap justify-center gap-x-[0.2em] gap-y-[0.1em]">
          {footerSubline.split(" ").map((word, i) => (
            <span key={`fs-${i}`} ref={el => { if (el) sublineWordsRef.current.push(el); }}
              className="opacity-[0.1]"
              style={{ filter: 'blur(4px)', willChange: 'opacity, filter' }}>
              {word}
            </span>
          ))}
        </p>

        <div ref={buttonRef} style={{ willChange: 'transform, opacity, filter' }}>
          <button className="group relative px-12 py-5 rounded-full flex items-center gap-4 cursor-pointer overflow-hidden transition-all duration-700 border border-[#e8dfc5]/15 hover:border-[#e8dfc5]/40 backdrop-blur-md">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{
              background: 'linear-gradient(105deg, transparent 20%, rgba(232,223,197,0.08) 45%, rgba(232,223,197,0.15) 50%, rgba(232,223,197,0.08) 55%, transparent 80%)',
            }} />
            <span className="font-suisse text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#e8dfc5]/80 group-hover:text-[#e8dfc5] transition-colors duration-500 z-10">
              Enter the world of Artisun
            </span>
            <span className="text-[#e8dfc5]/50 group-hover:text-[#e8dfc5] transition-all duration-500 transform group-hover:translate-x-1.5 z-10 text-sm">→</span>
          </button>
        </div>
      </div>

      {/* ═══ BOTTOM: Brand + Links ═══ */}
      <div className="footer-bottom relative z-10 px-8 md:px-16 lg:px-24 pb-8">

        {/* Full-width gradient divider */}
        <div className="w-full h-[1px] mb-16" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(232,223,197,0.12) 20%, rgba(232,223,197,0.12) 80%, transparent 100%)',
        }} />

        {/* Main grid: 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-16 md:gap-8 lg:gap-16 mb-20 footer-grid-item">

          {/* Col 1: Brand */}
          <div className="flex flex-col gap-6">
            <h2 className="font-editorial text-4xl md:text-5xl text-[#e8dfc5] leading-none">Artisun.</h2>
            <p className="font-suisse text-[10px] tracking-[0.2em] text-[#e8dfc5]/25 uppercase leading-[1.8] max-w-[260px]">
              Climate-Smart Skinwear™<br />
              Designed for daily life.<br />
              Made for every climate.
            </p>
          </div>

          {/* Col 2: Nav links */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-0">
            <div className="flex flex-col gap-4">
              <h4 className="font-suisse text-[9px] tracking-[0.4em] text-[#e8dfc5]/20 uppercase mb-2">Explore</h4>
              {['Our Story', 'Products', 'Science', 'Journal'].map(link => (
                <a key={link} href="#" className="font-suisse text-[11px] tracking-[0.15em] text-[#e8dfc5]/45 hover:text-[#e8dfc5] uppercase transition-all duration-500 hover:tracking-[0.25em] w-fit">{link}</a>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-suisse text-[9px] tracking-[0.4em] text-[#e8dfc5]/20 uppercase mb-2">Connect</h4>
              {[
                { label: 'Instagram', href: 'https://instagram.com' },
                { label: 'Pinterest', href: 'https://pinterest.com' },
                { label: 'LinkedIn', href: 'https://linkedin.com' },
                { label: 'Contact', href: '#' },
              ].map(link => (
                <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="font-suisse text-[11px] tracking-[0.15em] text-[#e8dfc5]/45 hover:text-[#e8dfc5] uppercase transition-all duration-500 hover:tracking-[0.25em] w-fit">{link.label}</a>
              ))}
            </div>
          </div>

          {/* Col 3: Newsletter */}
          <div className="flex flex-col gap-5">
            <h4 className="font-suisse text-[9px] tracking-[0.4em] text-[#e8dfc5]/20 uppercase mb-2">Stay Informed</h4>
            <p className="font-suisse text-[10px] tracking-[0.1em] text-[#e8dfc5]/30 leading-[1.7] max-w-[240px]">
              Early access to launches, climate science insights, and the Artisun perspective.
            </p>
            <div className="flex items-center mt-2 border-b border-[#e8dfc5]/10 pb-3 group">
              <input
                type="email"
                placeholder="Your email"
                className="bg-transparent font-suisse text-[11px] tracking-[0.1em] text-[#e8dfc5]/70 placeholder:text-[#e8dfc5]/20 outline-none flex-1 w-full"
              />
              <button className="font-suisse text-[9px] tracking-[0.2em] text-[#e8dfc5]/30 hover:text-[#e8dfc5]/70 uppercase transition-colors duration-500 ml-4 whitespace-nowrap">
                Subscribe →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="w-full h-[1px] mb-6" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(232,223,197,0.06) 20%, rgba(232,223,197,0.06) 80%, transparent 100%)',
        }} />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 footer-grid-item">
          <p className="font-suisse text-[9px] tracking-[0.2em] text-[#e8dfc5]/15 uppercase">
            © 2026 Artisun. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="font-suisse text-[9px] tracking-[0.15em] text-[#e8dfc5]/15 hover:text-[#e8dfc5]/50 uppercase transition-colors duration-500">Privacy</a>
            <a href="#" className="font-suisse text-[9px] tracking-[0.15em] text-[#e8dfc5]/15 hover:text-[#e8dfc5]/50 uppercase transition-colors duration-500">Terms</a>
            <a href="#" className="font-suisse text-[9px] tracking-[0.15em] text-[#e8dfc5]/15 hover:text-[#e8dfc5]/50 uppercase transition-colors duration-500">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
