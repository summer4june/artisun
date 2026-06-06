'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LoadingScreen from '../components/LoadingScreen';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import CustomCursor from '../components/CustomCursor';
import TextRevealSection from '../components/TextRevealSection';
import BleedExperience from '../components/climate/BleedExperience';

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const instagramRef = useRef<HTMLAnchorElement>(null);
  const pinterestRef = useRef<HTMLAnchorElement>(null);
  
  // Mouse Proxy for performance (no react state re-renders on mousemove)
  const mouseProxy = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseProxy.current.px = e.clientX;
      mouseProxy.current.py = e.clientY;
      mouseProxy.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseProxy.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Entrance animations for Hero elements once loading is done
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (loadingComplete) {
      const tl = gsap.timeline();
      
      // Hero Logo fade in / slight scale
      tl.fromTo('.hero-title', 
        { opacity: 0, scale: 0.96, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      );
      
      // Hero Subtitle float in
      tl.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power2.out'
      }, '-=0.6');

      // Scroll indicator fade in
      tl.to('.scroll-indicator', {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.4');

      // Scroll indicator fades out immediately upon scrolling down
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: "top top",
        end: "+=150", // fades out completely after scrolling 150px
        scrub: true,
        animation: gsap.fromTo('.scroll-indicator', 
          { opacity: 1 }, 
          { opacity: 0, ease: 'none', immediateRender: false }
        )
      });

      // Global background transition on scroll
      ScrollTrigger.create({
        trigger: ".section-spacer",
        start: "top bottom", // Starts when spacer enters from bottom (right as hero starts to scroll up)
        end: "bottom top",   // Ends exactly when the text section reaches the top
        scrub: true,
        animation: gsap.to('#global-gradient', { opacity: 1, ease: 'none' })
      });

      // Animate Pinterest from Right to Left when reaching Climate section
      if (pinterestRef.current && instagramRef.current) {
        ScrollTrigger.create({
          trigger: "#bleed-experience-section",
          start: "top bottom", // Starts when the climate section enters the bottom of the screen
          end: "top center",   // Finishes animating when it hits the center
          scrub: true,
          invalidateOnRefresh: true, // Recalculate on window resize
          animation: gsap.to(pinterestRef.current, {
            x: () => {
              // Calculate distance from right to left dynamically
              const leftPadding = window.innerWidth < 768 ? 32 : 48; // left-8 or left-12
              const rightPadding = window.innerWidth < 768 ? 32 : 48; // right-8 or right-12
              const pinRect = pinterestRef.current!.getBoundingClientRect();
              const distance = window.innerWidth - rightPadding - leftPadding - pinRect.width;
              return -distance;
            },
            y: 32, // Stack it exactly 32px below Instagram
            ease: "power2.inOut"
          })
        });
      }
    }
  }, [loadingComplete]);

  return (
    <main ref={mainRef} className="relative w-full min-h-screen overflow-clip">
      {/* Global Solid Background Layer */}
      <div className="fixed inset-0 z-[-3]" style={{ backgroundColor: '#c02d19' }} />
      {/* Global Sunset Gradient Layer (Fades in on scroll) */}
      <div id="global-gradient" className="fixed inset-0 z-[-2] opacity-0" style={{ background: 'linear-gradient(to bottom, #c02d19 0%, #210502 100%)' }} />

      {!loadingComplete && (
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      )}
      
      <CustomCursor mouseProxy={mouseProxy} />
      
      {/* Navbar fades in after load */}
      <div className={`transition-opacity duration-1000 ${loadingComplete ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar showIcon={loadingComplete} />
      </div>
      
      <HeroSection mouseProxy={mouseProxy} />
      
      {/* Spacer to provide breathing room between Hero and Text Reveal */}
      <div className="section-spacer relative w-full h-[30vh] md:h-[40vh] bg-transparent pointer-events-none" />
      
      <TextRevealSection />

      <div id="bleed-experience-section">
        <BleedExperience />
      </div>

      {/* Temporary Footer Spacer so we can actually scroll past the WebGL section! */}
      <div className="w-full h-screen bg-[#081526] flex items-center justify-center pointer-events-none relative z-10">
        <h2 className="text-[#e8dfc5] font-editorial text-4xl md:text-6xl opacity-50">To be continued...</h2>
      </div>

      {/* Globally Fixed Social Links */}
      <div className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-1000 hidden md:block ${loadingComplete ? 'opacity-100' : 'opacity-0'}`}>
        <a 
          ref={instagramRef}
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute top-[45%] -translate-y-1/2 left-8 md:left-12 pointer-events-auto font-suisse font-medium text-[11px] md:text-[13px] tracking-[0.12em] text-[#e8dfc5] uppercase border-b-[1px] border-[#e8dfc5] pb-[2px] hover:text-white hover:border-white transition-colors duration-300"
        >
          Instagram
        </a>
        <a 
          ref={pinterestRef}
          href="https://pinterest.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute top-[45%] -translate-y-1/2 right-8 md:right-12 pointer-events-auto font-suisse font-medium text-[11px] md:text-[13px] tracking-[0.12em] text-[#e8dfc5] uppercase border-b-[1px] border-[#e8dfc5] pb-[2px] hover:text-white hover:border-white transition-colors duration-300"
        >
          Pinterest
        </a>
      </div>
    </main>
  );
}
