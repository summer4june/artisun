'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import LoadingScreen from '../components/LoadingScreen';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import Particles from '../components/Particles';
import CustomCursor from '../components/CustomCursor';

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);
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

  // Entrance animations for Hero elements once loading is done
  useEffect(() => {
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
    }
  }, [loadingComplete]);

  return (
    <main ref={mainRef} className="relative w-full h-[100vh] overflow-hidden">
      {!loadingComplete && (
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      )}
      
      <CustomCursor mouseProxy={mouseProxy} />
      
      {/* Navbar fades in after load */}
      <div className={`transition-opacity duration-1000 ${loadingComplete ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar showIcon={loadingComplete} />
      </div>
      
      <HeroSection mouseProxy={mouseProxy} />
      
      <Particles mouseProxy={mouseProxy} />
    </main>
  );
}
