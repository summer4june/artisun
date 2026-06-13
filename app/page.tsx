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
import SolutionSection from '../components/SolutionSection';
import ProductsSection from '../components/ProductsSection';

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const instagramRef = useRef<HTMLAnchorElement>(null);
  const pinterestRightRef = useRef<HTMLAnchorElement>(null);
  const pinterestLeftRef = useRef<HTMLAnchorElement>(null);
  
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
      // Refresh ScrollTrigger to recalculate heights after loading screen goes away
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

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

      // Global background transition on scroll
      // Parallax scroll logic: shift the background up to -50vh smoothly based on overall page scroll
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        animation: gsap.to('#global-bg', { y: '-50vh', ease: 'none' })
      });

      // Scroll indicator fades out immediately upon scrolling down
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: "top top",
        end: "+=150", // fades out completely after scrolling 150px
        scrub: true,
        animation: gsap.fromTo('.scroll-indicator', 
          { opacity: 1 }, 
          { opacity: 0, ease: 'none' }
        )
      });

      // Toggle Pinterest Right vs Left
      if (pinterestRightRef.current && pinterestLeftRef.current) {
        gsap.set(pinterestLeftRef.current, { autoAlpha: 0 }); // Ensure it's hidden initially
        
        ScrollTrigger.create({
          trigger: '#bleed-experience-section',
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => {
            gsap.to(pinterestRightRef.current, { autoAlpha: 0, duration: 0.5 });
            gsap.to(pinterestLeftRef.current, { autoAlpha: 1, duration: 0.5 });
          },
          onLeave: () => {
            gsap.to(pinterestRightRef.current, { autoAlpha: 1, duration: 0.5 });
            gsap.to(pinterestLeftRef.current, { autoAlpha: 0, duration: 0.5 });
          },
          onEnterBack: () => {
            gsap.to(pinterestRightRef.current, { autoAlpha: 0, duration: 0.5 });
            gsap.to(pinterestLeftRef.current, { autoAlpha: 1, duration: 0.5 });
          },
          onLeaveBack: () => {
            gsap.to(pinterestRightRef.current, { autoAlpha: 1, duration: 0.5 });
            gsap.to(pinterestLeftRef.current, { autoAlpha: 0, duration: 0.5 });
          },
        });
      }
    }
  }, [loadingComplete]);

  return (
    <main ref={mainRef} className="relative w-full min-h-screen overflow-clip">
      {/* Global Molten Core Background */}
      <div id="global-bg" className="theme-molten-core" />

      {!loadingComplete && (
        <LoadingScreen progress={mediaProgress} onComplete={() => setLoadingComplete(true)} />
      )}
      
      <CustomCursor mouseProxy={mouseProxy} />
      
      {/* Navbar fades in after load */}
      <div className={`transition-opacity duration-1000 ${loadingComplete ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar showIcon={loadingComplete} />
      </div>
      
      <HeroSection mouseProxy={mouseProxy} />
      
      {/* Spacer to provide breathing room between Hero and Text Reveal */}
      <div className="section-spacer relative w-full h-[10vh] md:h-[15vh] bg-transparent pointer-events-none" />
      
      <TextRevealSection />

      <div id="bleed-experience-section">
        <BleedExperience onProgress={setMediaProgress} />
      </div>

      <SolutionSection />
      <ProductsSection />

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
          className="absolute top-[45%] md:top-1/2 -translate-y-1/2 left-8 md:left-12 pointer-events-auto font-suisse font-medium text-[11px] md:text-[13px] tracking-[0.12em] text-[#e8dfc5] uppercase border-b-[1px] border-[#e8dfc5] pb-[2px] hover:text-white hover:border-white transition-colors duration-300"
        >
          Instagram
        </a>
        <a 
          ref={pinterestRightRef}
          href="https://pinterest.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute top-[45%] md:top-1/2 -translate-y-1/2 right-8 md:right-12 pointer-events-auto font-suisse font-medium text-[11px] md:text-[13px] tracking-[0.12em] text-[#e8dfc5] uppercase border-b-[1px] border-[#e8dfc5] pb-[2px] hover:text-white hover:border-white transition-colors duration-300"
        >
          Pinterest
        </a>
        <a 
          ref={pinterestLeftRef}
          href="https://pinterest.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute top-[55%] md:top-[calc(50%+32px)] -translate-y-1/2 left-8 md:left-12 pointer-events-auto font-suisse font-medium text-[11px] md:text-[13px] tracking-[0.12em] text-[#e8dfc5] uppercase border-b-[1px] border-[#e8dfc5] pb-[2px] hover:text-white hover:border-white transition-colors duration-300"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          Pinterest
        </a>
      </div>
    </main>
  );
}
