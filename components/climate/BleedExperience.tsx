'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sections } from '@/data/climateSections';
import { useBleedTransition } from '@/hooks/useBleedTransition';
import DiamondNav from '@/components/climate/DiamondNav';
import ContentLayer from '@/components/climate/ContentLayer';
import ScrollHint from '@/components/climate/ScrollHint';

interface BleedExperienceProps {
  onProgress?: (progress: number) => void;
}

export default function BleedExperience({ onProgress }: BleedExperienceProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isExpandedRef = useRef(false);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);
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
  
  useEffect(() => {
    if (onProgress) onProgress(loadingProgress);
  }, [loadingProgress, onProgress]);
  const isLoading = loadingProgress < 100;

  useEffect(() => {
    setExpandedState(isExpanded);
  }, [isExpanded, setExpandedState]);


  useEffect(() => {
    if (isLoading) return;

    if (!containerRef.current || !cardRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const entranceAnim = gsap.timeline({ paused: true });
    entranceAnim.to(cardRef.current, {
      width: '100vw',
      height: '100vh',
      borderRadius: '0px',
      ease: "power2.inOut",
      duration: 1
    });

    const entranceTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom", 
      end: "top top",
      scrub: true, // changed from '1' to 'true' to instantly match scroll without lag
      animation: entranceAnim,
      onUpdate: (self) => {
        if (self.progress < 0.99) {
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

    // --- NEW TECHNIQUE: NATIVE SCROLL TRAP ---
    // We do NOT use GSAP pins. We natively freeze the window when the section is perfectly framed.
    let isTrapped = false;
    let isAnimating = false;
    let touchStartY = 0;

    // Detect when the section is perfectly framed
    const trapTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom top", // meaningless span, we just care about crossing 'top top'
      onEnter: () => {
        if (activeIndexRef.current < sections.length - 1) {
          isTrapped = true;
          window.scrollTo(0, containerRef.current!.offsetTop);
          // Force expansion just in case scrub lagged
          gsap.set(cardRef.current, { width: '100vw', height: '100vh', borderRadius: '0px' });
          isExpandedRef.current = true;
          setIsExpanded(true);
        }
      },
      onEnterBack: () => {
        if (activeIndexRef.current > 0) {
          isTrapped = true;
          window.scrollTo(0, containerRef.current!.offsetTop);
          // Force expansion
          gsap.set(cardRef.current, { width: '100vw', height: '100vh', borderRadius: '0px' });
          isExpandedRef.current = true;
          setIsExpanded(true);
        }
      }
    });

    // Core Logic for handling Intent (Wheel or Touch)
    const processIntent = (deltaY: number) => {
      if (!isTrapped || isAnimating) return;

      if (deltaY > 30) {
        // Deliberate Swipe DOWN
        if (activeIndexRef.current < sections.length - 1) {
          isAnimating = true;
          setHasScrolled(true);
          const nextIdx = activeIndexRef.current + 1;
          activeIndexRef.current = nextIdx;
          setActiveIndex(nextIdx);
          setTimeout(() => { isAnimating = false; }, 1200); // 1.2s strict cooldown
        } else {
          // Reached the end! Release the trap DOWN
          isTrapped = false;
          window.scrollBy({ top: 15, behavior: 'auto' }); // Nudge past the trigger
        }
      } else if (deltaY < -30) {
        // Deliberate Swipe UP
        if (activeIndexRef.current > 0) {
          isAnimating = true;
          setHasScrolled(true);
          const prevIdx = activeIndexRef.current - 1;
          activeIndexRef.current = prevIdx;
          setActiveIndex(prevIdx);
          setTimeout(() => { isAnimating = false; }, 1200); // 1.2s strict cooldown
        } else {
          // Reached the beginning! Release the trap UP
          isTrapped = false;
          window.scrollBy({ top: -15, behavior: 'auto' }); // Nudge past the trigger
        }
      }
    };

    // Native Wheel Interceptor
    const handleWheel = (e: WheelEvent) => {
      if (isTrapped) {
        e.preventDefault(); // Natively freeze the page
        processIntent(e.deltaY);
      }
    };

    // Native Touch Interceptor
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isTrapped) {
        e.preventDefault(); // Natively freeze the page
        const deltaY = touchStartY - e.touches[0].clientY;
        processIntent(deltaY);
      }
    };

    // Attach passive: false so preventDefault actually works
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      entranceTrigger.kill();
      trapTrigger.kill();
    };
  }, [isLoading]); 

  const navigateTo = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < sections.length) {
      activeIndexRef.current = targetIndex;
      setActiveIndex(targetIndex);
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
