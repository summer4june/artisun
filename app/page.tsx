'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LoadingScreen from '../components/LoadingScreen';
import HeroSection from '../components/HeroSection';
import CustomCursor from '../components/CustomCursor';
import TextRevealSection from '../components/TextRevealSection';
import ClimateVideoSection from '../components/climate/ClimateVideoSection';
import EvolutionSection from '../components/EvolutionSection';
import EarthScrollSection from '../components/EarthScrollSection';
import SuncareShiftSection from '../components/SuncareShiftSection';
import ClothingSection from '../components/ClothingSection';
import SkinProtectionSection from '../components/SkinProtectionSection';
import KeyholeSection from '../components/KeyholeSection';
import ProductsSection from '../components/ProductsSection';
import Footer from '../components/Footer';
import GlobalHeader from '../components/GlobalHeader';
import ScrollProgressBar from '../components/ScrollProgressBar';

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  
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

  // Fake loading progress since BleedExperience was removed
  useEffect(() => {
    const timer = setInterval(() => {
      setMediaProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 5; // Finish in roughly 2 seconds
      });
    }, 100);
    return () => clearInterval(timer);
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

      // Top Header (Logo, Bottles, Cart) fade in
      tl.to('.hero-header', {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power2.out'
      }, '-=0.8');

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

      // Color temperature shift as narrative progresses
      // Hero -> Climate (warm) -> Globe -> Products (cool/dark) -> Footer (neutral)
      const colorShift = document.getElementById('global-color-shift');
      if (colorShift) {
        ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
          onUpdate: (self) => {
            const p = self.progress;
            let opacity = 0;
            if (p < 0.3) {
              opacity = 0; // warm phase — let the molten core breathe
            } else if (p < 0.6) {
              opacity = ((p - 0.3) / 0.3) * 0.5; // ramp up to 50%
            } else if (p < 0.85) {
              opacity = 0.5; // deep dark phase
            } else {
              opacity = 0.5 * (1 - ((p - 0.85) / 0.15)); // fade back out for footer
            }
            colorShift.style.opacity = String(opacity);
          }
        });
      }
    }
  }, [loadingComplete]);

  return (
    <main ref={mainRef} className="relative w-full min-h-screen overflow-clip">
      <ScrollProgressBar />
      {/* Global Molten Core Background */}
      <div id="global-bg" className="theme-molten-core" />
      {/* Global Color Shift Overlay */}
      <div
        id="global-color-shift"
        className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
        style={{ opacity: 0, background: 'rgba(5, 0, 0, 0.6)' }}
      />

      {!loadingComplete && (
        <LoadingScreen progress={mediaProgress} onComplete={() => setLoadingComplete(true)} />
      )}
      
      <CustomCursor mouseProxy={mouseProxy} />
      
      <GlobalHeader />
      <HeroSection mouseProxy={mouseProxy} />
      
      {/* Spacer to provide breathing room between Hero and Text Reveal */}
      <div className="section-spacer relative w-full h-[15vh] md:h-[20vh] pointer-events-none overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-black/30 to-transparent" />
      </div>
      
      <TextRevealSection />

      <ClimateVideoSection />

      {/* New evolution text section */}
      <EvolutionSection />

      {/* Earth scroll globe rotation section */}
      <EarthScrollSection />

      {/* Unified cinematic crossfade section */}
      <SuncareShiftSection />

      {/* Clothing text reveal section with video background */}
      <ClothingSection />

      {/* Skin protection text reveal with cinematic focus pull */}
      <SkinProtectionSection />

      {/* Cinematic zoom-through Keyhole transition */}
      <KeyholeSection />

      <ProductsSection />

      {/* Main Footer */}
      <Footer />
    </main>
  );
}
