import { useEffect, useRef, useState, useCallback } from 'react';

export function useScrollControl(totalSections: number, lockDuration = 3750) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimating = useRef(false);
  const currentIndex = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const navigateTo = useCallback((targetIndex: number) => {
    if (isAnimating.current) return;
    if (targetIndex < 0 || targetIndex >= totalSections || targetIndex === currentIndex.current) return;

    isAnimating.current = true;
    setHasScrolled(true);

    currentIndex.current = targetIndex;
    setActiveIndex(targetIndex);

    setTimeout(() => {
      isAnimating.current = false;
    }, lockDuration);
  }, [totalSections, lockDuration]);

  useEffect(() => {
    let lastScrollTime = 0;
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime < 150) return;

      if (e.deltaY > 40) {
        navigateTo(currentIndex.current + 1);
        lastScrollTime = now;
      } else if (e.deltaY < -40) {
        navigateTo(currentIndex.current - 1);
        lastScrollTime = now;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isAnimating.current) return;

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (deltaY > 60) {
        navigateTo(currentIndex.current + 1);
      } else if (deltaY < -60) {
        navigateTo(currentIndex.current - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        navigateTo(currentIndex.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        navigateTo(currentIndex.current - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateTo]);

  return { activeIndex, navigateTo, hasScrolled };
}
