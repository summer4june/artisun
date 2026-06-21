'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { preloadAll } from '../lib/preloader';
import ScrollProgressBar from '../components/ScrollProgressBar';
import LoadingScreen from '../components/LoadingScreen';
import HeroSection from '../components/HeroSection';
import CustomCursor from '../components/CustomCursor';
import TextRevealSection from '../components/TextRevealSection';
import dynamic from 'next/dynamic';

const ClimateVideoSection = dynamic(
  () => import('../components/climate/ClimateVideoSection'),
  { ssr: false }
);

const EarthSection = dynamic(
  () => import('../components/EarthSection'),
  { ssr: false }
);

const ProductsSection = dynamic(
  () => import('../components/ProductsSection'),
  { ssr: false }
);

import EvolutionSection from '../components/EvolutionSection';
import SuncareShiftSection from '../components/SuncareShiftSection';
import ClothingSection from '../components/ClothingSection';
import SkinProtectionSection from '../components/SkinProtectionSection';
import KeyholeSection from '../components/KeyholeSection';
import Footer from '../components/Footer';
import GlobalHeader from '../components/GlobalHeader';

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

  // Real loading progress
  useEffect(() => {
    preloadAll((progress) => setMediaProgress(progress)).catch(console.error);
  }, []);

  // Entrance animations for Hero elements once loading is done
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (loadingComplete) {
      // Refresh ScrollTrigger to recalculate heights after loading screen goes away
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });

      const tl = gsap.timeline();
      
      // Hero Logo fade in / slight scale
      tl.fromTo('.hero-title', 
        { opacity: 0, scale: 0.96, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      );
      
      // Hero Subtitle — word by word entrance (Effect 9 adapted, half-intensity)
      // Each word materialises from a slight atmospheric haze — 6 words, 0.09s apart.
      // Calmer and more effortless than the section word reveals.
      // The blur is 3px (not 12px) — a whisper of haze, not a dramatic reveal.
      tl.fromTo('.hero-subtitle-word',
        { opacity: 0, y: 20, filter: 'blur(3px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.09,
          duration: 1.0,
          ease: 'power4.out',
        },
        '-=0.6'   // keeps the same overlap with the logo animation as before
      );

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
      // ── Hero EXIT: Gravity Pull ──
      // As user scrolls past the hero, content drifts up and fades.
      // The logo and subtitle float away — camera falls into the story.
      ScrollTrigger.create({
        trigger: '.hero-content-inner',
        start: 'top top',
        end: '+=220',
        scrub: 1.5,
        animation: gsap.to('.hero-content-inner', {
          y: -50,
          opacity: 0,
          ease: 'none',
        }),
      });
    }
  }, [loadingComplete]);

  return (
    <main ref={mainRef} className="relative w-full min-h-screen overflow-clip">
      <ScrollProgressBar />

      {/* Global Molten Core Background */}
      <div id="global-bg" className="theme-molten-core" />

      {!loadingComplete && (
        <LoadingScreen progress={mediaProgress} onComplete={() => setLoadingComplete(true)} />
      )}
      
      <CustomCursor mouseProxy={mouseProxy} />
      
      <GlobalHeader />
      <HeroSection mouseProxy={mouseProxy} />
      
      {/* Spacer to provide breathing room between Hero and Text Reveal */}
      <div className="section-spacer relative w-full h-[10vh] md:h-[15vh] bg-transparent pointer-events-none" />
      
      <TextRevealSection />

      {/* Wrapper added to fix Next.js / GSAP DOM mismatch on dynamic components */}
      <div className="relative w-full">
        <ClimateVideoSection />
      </div>

      {/* New evolution text section */}
      <EvolutionSection />

      {/* Wrapper added to fix Next.js / GSAP DOM mismatch on dynamic components */}
      <div className="relative w-full">
        <EarthSection />
      </div>

      {/* Unified cinematic crossfade section */}
      <SuncareShiftSection />

      {/* Clothing text reveal section with video background */}
      <ClothingSection />

      {/* Skin protection text reveal with cinematic focus pull */}
      <SkinProtectionSection />

      {/* Cinematic zoom-through Keyhole transition */}
      <KeyholeSection />

      {/* Wrapper added to fix Next.js / GSAP DOM mismatch on dynamic components */}
      <div className="relative w-full">
        <ProductsSection />
      </div>

      {/* Main Footer */}
      <Footer />
    </main>
  );
}
