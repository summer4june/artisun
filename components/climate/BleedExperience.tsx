'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sections } from '@/data/climateSections';
import { useBleedTransition } from '@/hooks/useBleedTransition';
import DiamondNav from '@/components/climate/DiamondNav';
import ContentLayer from '@/components/climate/ContentLayer';
import ScrollHint from '@/components/climate/ScrollHint';

export default function BleedExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isExpandedRef = useRef(false);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  
  useEffect(() => {
    const navColors = [
      'rgba(8, 21, 38, 0.82)',    // Shimla
      'rgba(45, 28, 22, 0.82)',   // Jaipur
      'rgba(10, 32, 22, 0.82)',   // Bangalore
      'rgba(22, 14, 34, 0.82)',   // Mumbai
    ];
    
    if (isExpanded) {
      document.documentElement.style.setProperty('--nav-bg-color', navColors[activeIndex] || 'rgba(18,14,12,0.82)');
    } else {
      document.documentElement.style.setProperty('--nav-bg-color', 'rgba(18,14,12,0.82)');
    }
  }, [activeIndex, isExpanded]);
  
  const { mountRef, loadingProgress, setExpandedState } = useBleedTransition(activeIndex);
  const isLoading = loadingProgress < 100;

  useEffect(() => {
    setExpandedState(isExpanded);
  }, [isExpanded, setExpandedState]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!containerRef.current || !cardRef.current) return;
    
    // 1. Entrance Animation: Expands the mask card AS it scrolls into view
    // By animating width/height of the outer mask, but keeping the inner canvas fixed at 100vw/100vh,
    // we prevent WebGL from resizing 60 times a second, ensuring flawless smoothness!
    const entranceAnim = gsap.fromTo(cardRef.current,
      { width: '80%', height: '60vh', borderRadius: '32px' },
      { width: '100%', height: '100vh', borderRadius: '0px', ease: 'none' }
    );

    const entranceTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom", // Starts when top of container hits bottom of screen
      end: "top top",      // Ends when top of container hits top of screen
      scrub: 1,            // 1-second smoothing for buttery scroll
      animation: entranceAnim,
      onUpdate: (self) => {
        const p = self.progress;
        // Toggle UI visibility based on expansion
        if (p < 0.99) {
          if (isExpandedRef.current !== false) {
            isExpandedRef.current = false;
            setIsExpanded(false);
          }
        } else {
          if (isExpandedRef.current !== true) {
            isExpandedRef.current = true;
            setIsExpanded(true);
          }
        }
      }
    });

    // 2. Pinned Scrubbing: Plays the WebGL videos
    const proxy = { progress: 0 };
    const pinAnim = gsap.to(proxy, {
      progress: 1,
      ease: 'none',
      onUpdate: () => {
        const videoProgress = proxy.progress;
        if (videoProgress > 0 && videoProgress < 1) setHasScrolled(true);
        
        const newIndex = Math.min(sections.length - 1, Math.floor(videoProgress * sections.length));
        if (newIndex !== activeIndexRef.current) {
          activeIndexRef.current = newIndex; // Update the ref immediately
          setActiveIndex(newIndex);
        }
      }
    });

    const pinTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      // Reduced from 100% to 50% per section so it requires half the scrolling distance
      end: `+=${sections.length * 50}%`,
      pin: true,
      scrub: 0.5, // Reduced from 1 to 0.5 for a snappier, more instantaneous feel
      animation: pinAnim,
      onToggle: (self) => {
        setIsPinned(self.isActive);
      }
    });

    return () => {
      entranceTrigger.kill();
      pinTrigger.kill();
    };
  }, [isLoading]); 

  const navigateTo = (targetIndex: number) => {
    const triggers = ScrollTrigger.getAll();
    const myTrigger = triggers.find(t => t.vars.trigger === containerRef.current && t.vars.pin === true);
    if (myTrigger) {
      const start = myTrigger.start;
      const end = myTrigger.end;
      const progress = (targetIndex + 0.1) / sections.length;
      const targetScroll = start + (end - start) * progress;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <section ref={containerRef} className="relative w-full h-[100vh] bg-transparent flex items-center justify-center overflow-hidden">
      
      <div 
        ref={cardRef} 
        className="relative overflow-hidden bg-[#060504] flex-none"
        style={{ width: '80%', height: '60vh', borderRadius: '32px' }}
      >
        {/* Inner Fixed Container (Always 100vw x 100vh). Centered so the image doesn't move as the mask expands! */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh]">
          {/* WebGL Canvas */}
          <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

          {/* Fallback Poster Image for the First Frame */}
          <div 
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ease-in-out bg-cover bg-center ${isExpanded ? 'opacity-0' : 'opacity-100'}`}
            style={{ backgroundImage: `url('/climate/shimla-poster.jpg')` }}
          >
            {/* Gradient overlay to perfectly match Shimla's initial WebGL shader cinematic tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#081526]/95 to-[#081526]/50" />
          </div>
        </div>

        {/* HTML Content Overlay */}
        <div className={`absolute inset-0 z-20 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ContentLayer activeIndex={activeIndex} />
        </div>
      </div>

      {/* Navigation & Hints (Only visible when section is fully expanded) */}
      <div className={`transition-opacity duration-700 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <DiamondNav 
          sections={sections} 
          activeIndex={activeIndex} 
          onNavigate={navigateTo} 
        />
        <ScrollHint 
          activeIndex={activeIndex} 
          total={sections.length} 
          hasScrolled={hasScrolled} 
        />
      </div>
    </section>
  );
}
