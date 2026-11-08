'use client';

import { useEffect, useState } from 'react';
import SchoolLogo from './SchoolLogo';

const SESSION_KEY = 'aql_splash_seen';

export default function SplashScreen() {
  const [phase, setPhase] = useState<'show' | 'leave' | 'done'>('show');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem(SESSION_KEY) === '1';

    if (seen) {
      setPhase('done');
      return;
    }

    document.body.style.overflow = 'hidden';
    const leaveAt = reduced ? 400 : 2300;
    const t1 = setTimeout(() => setPhase('leave'), leaveAt);
    const t2 = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(SESSION_KEY, '1');
      document.body.style.overflow = '';
    }, leaveAt + 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'done') return null;

  const letters = 'AQL COUNCIL'.split('');

  return (
    <div
      aria-hidden="true"
      className={`splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#00afca] ${
        phase === 'leave' ? 'splash-leave' : ''
      }`}
    >
      <div className="splash-logo">
        <SchoolLogo className="w-28 h-28 sm:w-36 sm:h-36" variant="white-on-blue" priority />
      </div>

      <div className="mt-8 flex font-serif text-3xl sm:text-5xl font-bold text-[#ffffff] tracking-[0.25em]">
        {letters.map((ch, i) => (
          <span
            key={i}
            className="splash-letter"
            style={{ animationDelay: `${0.55 + i * 0.05}s` }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </div>

      <div className="splash-sub mt-3 text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#ffffff] font-semibold">
        Мектеп Президенті • School President
      </div>

      <div className="mt-10 h-[2px] w-40 sm:w-56 bg-[#ffffff]/30 overflow-hidden rounded-full">
        <div className="splash-bar h-full bg-[#ffffff]" />
      </div>
    </div>
  );
}
