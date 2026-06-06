'use client';

import React from 'react';
import { SectionData } from '@/data/climateSections';

interface DiamondNavProps {
  sections: SectionData[];
  activeIndex: number;
  onNavigate: (index: number) => void;
}

const customLabels = ['DRY', 'OILY', 'HUMIDITY', 'GREASY'];

const stepThemes = [
  { // Shimla - Cool Blue
    activeClass: 'bg-blue-500/40 border-blue-200/70 text-white shadow-[0_0_20px_rgba(96,165,250,0.3)] scale-105',
    inactiveClass: 'bg-blue-950/40 border-blue-200/20 text-white/70 hover:bg-blue-800/50 hover:text-white hover:border-blue-300/50'
  },
  { // Jaipur - Dusty Warm Amber
    activeClass: 'bg-amber-600/40 border-amber-200/70 text-white shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105',
    inactiveClass: 'bg-amber-950/40 border-amber-200/20 text-white/70 hover:bg-amber-900/60 hover:text-white hover:border-amber-300/50'
  },
  { // Bangalore - Moody Forest Emerald
    activeClass: 'bg-emerald-600/40 border-emerald-200/70 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-105',
    inactiveClass: 'bg-emerald-950/40 border-emerald-200/20 text-white/70 hover:bg-emerald-900/60 hover:text-white hover:border-emerald-300/50'
  },
  { // Mumbai - Coastal Indigo/Purple
    activeClass: 'bg-indigo-500/40 border-indigo-200/70 text-white shadow-[0_0_20px_rgba(129,140,248,0.3)] scale-105',
    inactiveClass: 'bg-indigo-950/40 border-indigo-200/20 text-white/70 hover:bg-indigo-900/60 hover:text-white hover:border-indigo-300/50'
  }
];

export default function DiamondNav({ sections, activeIndex, onNavigate }: DiamondNavProps) {
  // Only map the first 4 sections (the cities)
  const navSections = sections.slice(0, 4);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {navSections.map((section, idx) => {
        const isActive = idx === activeIndex;
        const label = customLabels[idx];
        const theme = stepThemes[activeIndex] || stepThemes[0];
        
        return (
          <button
            key={section.id}
            onClick={() => onNavigate(idx)}
            className={`pointer-events-auto w-[135px] py-2.5 text-center rounded-full border backdrop-blur-md transition-all duration-700 font-suisse uppercase text-[11px] tracking-[0.15em]
              ${isActive ? theme.activeClass : theme.inactiveClass}
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
