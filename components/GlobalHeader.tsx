'use client';

export default function GlobalHeader() {
  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-6 md:px-12 md:py-8 z-[100] hero-header opacity-0 -translate-y-4 pointer-events-none bg-gradient-to-b from-black/50 to-transparent">
      
      {/* Left: Monogram Logo */}
      <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center pointer-events-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/icon-artisun.png" 
          alt="Artisun Icon" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Middle: Text + Bottles + Text */}
      <div className="flex items-center gap-4 md:gap-8 pointer-events-auto">
        <span className="font-editorial text-[var(--brand-cream)] text-base md:text-[19px]">Climate-smart</span>
        
        <div className="flex items-end gap-[6px] md:gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/b2.png" 
            alt="Artisun Bottle" 
            className="h-6 md:h-8 w-auto object-contain"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/b1.png" 
            alt="Artisun Jar" 
            className="h-4 md:h-[22px] w-auto object-contain mb-[2px]"
          />
        </div>
        
        <span className="font-editorial text-[var(--brand-cream)] text-base md:text-[19px]">Skinwear™</span>
      </div>

      {/* Right: Cart Icon */}
      <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform pointer-events-auto">
        <svg className="w-5 h-5 md:w-6 md:h-6 text-[var(--brand-cream)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1.5"></circle>
          <circle cx="20" cy="21" r="1.5"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
    </header>
  );
}
