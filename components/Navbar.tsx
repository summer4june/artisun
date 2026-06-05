'use client';

import { motion } from 'framer-motion';
import MagneticLink from './MagneticLink';

export default function Navbar({ showIcon }: { showIcon: boolean }) {
  return (
    <>
      {/* Top Left Icon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-6 left-8 z-50 flex items-center justify-center w-12 h-12"
      >
        {showIcon && (
          <img 
            id="nav-icon"
            src="/icon-artisun.png" 
            alt="ARTISUN" 
            className="w-full h-full object-contain filter brightness-0 invert sepia-[0.2] saturate-[0.6] brightness-[0.96]" 
          />
        )}
      </motion.div>

      {/* Center Pill Menu */}
      <motion.nav
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        id="navbar"
        className="fixed top-6 left-1/2 z-50 h-[52px] px-8 flex items-center justify-center rounded-full shadow-[0_4px_32px_rgba(0,0,0,0.38)]"
        style={{
          background: 'rgba(18,14,12,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <ul id="nav-links" className="flex items-center gap-8 list-none m-0 p-0 text-[14px] font-suisse font-medium tracking-[0.16em] text-[rgba(255,255,255,0.88)]">
          <li>
            <MagneticLink href="#" className="px-4 py-2 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors duration-300">
              Home
            </MagneticLink>
          </li>
          <li>
            <MagneticLink href="#" className="px-4 py-2 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors duration-300">
              Products
            </MagneticLink>
          </li>
          <li>
            <MagneticLink href="#" className="px-4 py-2 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors duration-300 flex items-center gap-1">
              About 
              <span className="text-[10px] opacity-70">∨</span>
            </MagneticLink>
          </li>
          <li className="ml-2">
            <MagneticLink 
              href="#" 
              className="border border-[rgba(232,220,200,0.4)] px-[20px] py-[8px] rounded-full text-[var(--brand-cream)] transition-all duration-300 hover:bg-[#1A5C5C] hover:border-[#1A5C5C]"
            >
              Contact us
            </MagneticLink>
          </li>
        </ul>
      </motion.nav>

      {/* Top Right Cart Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-[28px] right-8 z-50 flex items-center justify-center h-[44px] w-[44px] rounded-full shadow-[0_4px_32px_rgba(0,0,0,0.38)] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors duration-300"
        style={{
          background: 'rgba(18,14,12,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Minimalist Cart Icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cream)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      </motion.div>
    </>
  );
}
