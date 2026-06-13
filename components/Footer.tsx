'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="relative w-full min-h-screen flex flex-col items-center justify-center px-8 overflow-hidden bg-transparent z-10">
      {/* Seamless shadow blend from the dark ProductsSection above (pure black removes the dim light muddy effect) */}
      <div className="absolute top-0 left-0 w-full h-[20vh] bg-gradient-to-b from-black to-transparent pointer-events-none" />

      {/* Decorative Top Line */}
      <div className="w-12 h-[1px] bg-[#e8dfc5]/20 mb-10" />

      {/* Eyebrow */}
      <h3 className="font-suisse text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#e8dfc5]/50 mb-8 font-medium">
        The Future
      </h3>

      {/* Main Heading */}
      <h1 className="font-editorial text-[#e8dfc5] text-5xl md:text-6xl lg:text-[80px] leading-[1.1] text-center max-w-4xl mb-10 tracking-tight drop-shadow-lg">
        The future of<br />
        Climate-smart Skinwear starts here.
      </h1>

      {/* Italic Sub-description */}
      <p className="font-editorial italic text-[#e8dfc5]/60 text-xl md:text-2xl lg:text-[28px] text-center max-w-2xl mb-16 font-light">
        A new standard in sun protection. For every climate. For<br className="hidden md:block"/> every day.
      </p>

      {/* Call to Action Button */}
      <button className="group relative px-10 py-5 border-[0.5px] border-[#e8dfc5]/20 rounded-full flex items-center justify-center gap-4 hover:bg-[#e8dfc5]/5 transition-all duration-700 overflow-hidden cursor-pointer backdrop-blur-sm">
        <span className="font-suisse text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#e8dfc5]/80 group-hover:text-white transition-colors duration-500 z-10">
          Enter the world of Artisun
        </span>
        <span className="text-[#e8dfc5]/60 group-hover:text-white transition-colors duration-500 transform group-hover:translate-x-1 z-10 text-sm">
          →
        </span>
      </button>

      {/* Copyright */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full text-center">
        <p className="font-suisse text-[9px] md:text-[10px] tracking-widest text-[#e8dfc5]/30 uppercase">
          © 2026 Artisun. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
