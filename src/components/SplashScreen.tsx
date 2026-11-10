'use client';

import { useEffect, useState } from 'react';
import SchoolLogo from './SchoolLogo';

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    try {
      const shown = sessionStorage.getItem('aql_splash_shown');
      if (shown) {
        return;
      }
    } catch {
      // ignore storage access errors
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      return;
    }

    setVisible(true);

    const timerFade = setTimeout(() => {
      setFading(true);
    }, 1200);

    const timerDone = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('aql_splash_shown', 'true');
      } catch {
        // ignore
      }
    }, 1650);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerDone);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={() => {
        setFading(true);
        setTimeout(() => setVisible(false), 200);
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0f17] via-[#081b29] to-[#04111d] text-white transition-opacity duration-500 cursor-pointer select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Subtle ambient cyan glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#00afca]/25 blur-[90px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Crest Logo with soft glow ring */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 p-4 border border-white/20 shadow-2xl backdrop-blur-md mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl border border-[#00afca]/60 animate-ping opacity-30" />
          <SchoolLogo className="w-full h-full object-contain" variant="white-on-blue" priority />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5 drop-shadow-md">
          AQL Council
        </h1>

        <p className="text-xs sm:text-sm font-semibold text-[#38bdf8] tracking-widest uppercase mb-6">
          Мектеп Президентінің Порталы
        </p>

        {/* Minimal Progress Line */}
        <div className="w-36 h-1 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00afca] via-[#38bdf8] to-white rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
}
