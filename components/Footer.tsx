'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Footer() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Gentle fade up for the main content
      gsap.fromTo('.footer-reveal', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          stagger: 0.15, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );

      // Separate fade for the bottom grid
      gsap.fromTo('.footer-grid-item', 
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.0, 
          stagger: 0.1, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.footer-grid',
            start: "top 95%",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={containerRef} className="relative w-full min-h-screen flex flex-col justify-between px-8 md:px-16 pb-10 overflow-hidden bg-transparent z-10">
      {/* Add this FIRST, before the existing backdrop-blur div: */}
      <div className="absolute inset-0 bg-black pointer-events-none z-[-1]" />
      {/* 
        Dark Frosted Glass Overlay:
        Starts at pure black to seamlessly blend with the Product Section.
        Fades to black/40 with a backdrop blur, dimming the bright red background 
        so the text becomes perfectly legible while creating a glowing 'smoked glass' effect.
      */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black via-black/70 to-black/40 backdrop-blur-xl pointer-events-none z-0" />

      {/* Top Half: The Call to Action */}
      <div className="flex flex-col items-center justify-center flex-grow z-10 mt-[10vh]">
        {/* Subtle Horizontal Decorative Line */}
        <div className="w-12 h-[1px] bg-[#e8dfc5]/30 mb-8 footer-reveal" />
        
        <h3 className="font-suisse text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-[#e8dfc5]/50 mb-10 font-medium footer-reveal">
          The Future
        </h3>
        
        <h1 className="font-editorial text-[#e8dfc5] text-5xl md:text-6xl lg:text-[80px] leading-[1.1] text-center max-w-4xl mb-8 tracking-tight drop-shadow-lg footer-reveal">
          The future of<br />
          Climate-smart Skinwear starts here.
        </h1>
        
        <p className="font-editorial italic text-[#e8dfc5]/60 text-xl md:text-2xl text-center max-w-xl mb-16 font-light footer-reveal">
          A new standard in sun protection. For every climate. For every day.
        </p>
        
        <div className="footer-reveal">
          <button className="group relative px-10 py-5 border border-[#e8dfc5]/20 rounded-full flex items-center justify-center gap-4 hover:bg-[#e8dfc5] hover:border-[#e8dfc5] transition-all duration-700 overflow-hidden cursor-pointer backdrop-blur-sm">
            <span className="font-suisse text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#e8dfc5]/90 group-hover:text-[#8A2718] transition-colors duration-500 z-10">
              Enter the world of Artisun
            </span>
            <span className="text-[#e8dfc5]/70 group-hover:text-[#8A2718] transition-colors duration-500 transform group-hover:translate-x-1 z-10 text-sm">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Half: The Brand Grid */}
      <div className="relative z-10 w-full border-t border-[#e8dfc5]/10 pt-10 mt-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-12 footer-grid">
        
        {/* Brand Tag */}
        <div className="flex flex-col gap-4 footer-grid-item">
          <h2 className="font-editorial text-3xl md:text-4xl text-[#e8dfc5]">Artisun.</h2>
          <p className="font-suisse text-[10px] tracking-widest text-[#e8dfc5]/40 uppercase max-w-[220px] leading-relaxed">
            Climate-Smart Skinwear<br />Designed for daily life.
          </p>
        </div>

        {/* Links Grid */}
        <div className="flex flex-wrap md:flex-nowrap gap-16 md:gap-24 footer-grid-item">
          <div className="flex flex-col gap-5">
            <h4 className="font-suisse text-[9px] tracking-[0.3em] text-[#e8dfc5]/30 uppercase mb-1">Explore</h4>
            <a href="#" className="font-suisse text-[11px] tracking-widest text-[#e8dfc5]/70 hover:text-white uppercase transition-colors">Our Story</a>
            <a href="#" className="font-suisse text-[11px] tracking-widest text-[#e8dfc5]/70 hover:text-white uppercase transition-colors">Products</a>
            <a href="#" className="font-suisse text-[11px] tracking-widest text-[#e8dfc5]/70 hover:text-white uppercase transition-colors">Journal</a>
          </div>
          <div className="flex flex-col gap-5">
            <h4 className="font-suisse text-[9px] tracking-[0.3em] text-[#e8dfc5]/30 uppercase mb-1">Connect</h4>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-suisse text-[11px] tracking-widest text-[#e8dfc5]/70 hover:text-white uppercase transition-colors">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="font-suisse text-[11px] tracking-widest text-[#e8dfc5]/70 hover:text-white uppercase transition-colors">Pinterest</a>
            <a href="#" className="font-suisse text-[11px] tracking-widest text-[#e8dfc5]/70 hover:text-white uppercase transition-colors">Contact</a>
          </div>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-5 text-left md:text-right footer-grid-item mt-4 md:mt-0">
          <p className="font-suisse text-[10px] tracking-widest text-[#e8dfc5]/30 uppercase">
            © 2026 Artisun.
          </p>
          <div className="flex gap-6 md:justify-end">
            <a href="#" className="font-suisse text-[9px] tracking-[0.1em] text-[#e8dfc5]/30 hover:text-[#e8dfc5]/70 uppercase transition-colors">Privacy Policy</a>
            <a href="#" className="font-suisse text-[9px] tracking-[0.1em] text-[#e8dfc5]/30 hover:text-[#e8dfc5]/70 uppercase transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
