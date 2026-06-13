'use client';

import React from 'react';
import OnScrollTypography from './OnScrollTypography';

export default function SolutionSection() {
  const p1 = "This shift does more than change how protection is created.\nIt redefines how it is worn.";
  const p2 = "Just as clothing changes with occasions and environments,\nskin protection should exist in multiple forms\nthat fit seamlessly into daily living.";
  const p3 = "Welcome to climate-smart Skinwear.\nClothing for your skin, built for daily life.";

  return (
    <section className="relative w-full bg-transparent flex flex-col items-center justify-center py-48 px-4 md:px-12 z-20 min-h-screen">
      <div className="w-full max-w-5xl flex flex-col items-center gap-48">
        
        <OnScrollTypography 
          text={p1}
          effect="effect9"
          titleFont={{ fontFamily: "var(--font-editorial)", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400 }}
          textColor="var(--brand-cream)"
          lineGap={12}
          viewportAmount={0.4}
        />
        
        <OnScrollTypography 
          text={p2}
          effect="effect19"
          titleFont={{ fontFamily: "var(--font-suisse)", fontSize: "clamp(1rem, 2vw, 1.5rem)", fontWeight: 400, lineHeight: 1.4 }}
          textColor="var(--brand-cream)"
          lineGap={8}
          viewportAmount={0.4}
        />
        
        <OnScrollTypography 
          text={p3}
          effect="effect27"
          titleFont={{ fontFamily: "var(--font-editorial)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400 }}
          textColor="var(--brand-cream)"
          lineGap={16}
          viewportAmount={0.4}
        />
        
      </div>
    </section>
  );
}
