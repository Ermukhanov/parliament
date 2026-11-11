'use client';

import React, { useEffect, useState } from 'react';
import SchoolLogo from './SchoolLogo';

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<'flying' | 'revealed' | 'fading'>('flying');

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
    }

    setVisible(true);

    // Timeline:
    // 0ms - 800ms: Eagle flies in from distance
    // 800ms: Crest bursts open beneath eagle, text emerges
    const revealTimer = setTimeout(() => {
      setStage('revealed');
    }, 850);

    // 2100ms: Begin smooth fade out & zoom open
    const fadeTimer = setTimeout(() => {
      setStage('fading');
    }, 2100);

    // 2700ms: Unmount
    const doneTimer = setTimeout(() => {
      setVisible(false);
    }, 2750);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const handleSkip = () => {
    setStage('fading');
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  const isFading = stage === 'fading';
  const isRevealed = stage === 'revealed' || stage === 'fading';

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#020b17] via-[#081e3a] to-[#041122] text-white transition-all duration-700 cursor-pointer select-none overflow-hidden ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="AQL Council Splash Screen"
      role="banner"
    >
      {/* Background Style Animations */}
      <style jsx>{`
        @keyframes eagleFlight {
          0% {
            transform: translate3d(0, -180px, 0) scale(0.18);
            opacity: 0;
            filter: blur(8px);
          }
          35% {
            transform: translate3d(0, -60px, 0) scale(0.7);
            opacity: 0.95;
            filter: blur(2px);
          }
          75% {
            transform: translate3d(0, 4px, 0) scale(1.08);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes wingFlapLeft {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-7deg) translateY(-2px);
          }
        }

        @keyframes wingFlapRight {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(7deg) translateY(-2px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }

        @keyframes crestBurst {
          0% {
            transform: scale(0.3);
            opacity: 0;
            filter: brightness(2.5);
          }
          60% {
            transform: scale(1.12);
            opacity: 1;
            filter: brightness(1.3);
          }
          100% {
            transform: scale(1);
            opacity: 1;
            filter: brightness(1);
          }
        }

        @keyframes rayRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-eagle-flight {
          animation: eagleFlight 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-wing-left {
          transform-origin: 140px 50px;
          animation: wingFlapLeft 0.7s ease-in-out infinite;
        }

        .animate-wing-right {
          transform-origin: 180px 50px;
          animation: wingFlapRight 0.7s ease-in-out infinite;
        }

        .animate-crest-burst {
          animation: crestBurst 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .animate-pulse-glow {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }

        .animate-ray-rotate {
          animation: rayRotate 24s linear infinite;
        }
      `}</style>

      {/* 1. AMBIENT BACKGROUND GLOWS (SITE COLORS: CYAN #00afca & GOLD #f59e0b) */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#00afca]/20 blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute w-[340px] h-[340px] rounded-full bg-amber-500/15 blur-[90px] pointer-events-none translate-y-8" />

      {/* Subtle Rotating Sunburst Rays */}
      <div className="absolute w-[600px] h-[600px] opacity-10 pointer-events-none animate-ray-rotate">
        <svg viewBox="0 0 200 200" className="w-full h-full text-amber-300">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md w-full">
        {/* 2. THE SOARING EAGLE (ҚЫРАН / БҮРКІТ) */}
        <div className="relative w-64 h-32 sm:w-80 sm:h-36 mb-2 flex items-center justify-center animate-eagle-flight drop-shadow-[0_10px_30px_rgba(245,158,11,0.35)]">
          <svg
            viewBox="0 0 320 160"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Steppe Gold Gradient */}
              <linearGradient id="eagleGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Cyan Accent Gradient */}
              <linearGradient id="eagleCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#00afca" />
              </linearGradient>

              {/* Feather Glow */}
              <filter id="goldenAura" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* AURA GLOW BEHIND EAGLE */}
            <ellipse cx="160" cy="70" rx="90" ry="35" fill="url(#eagleCyanGrad)" opacity="0.25" filter="blur(14px)" />

            {/* LEFT WING WITH FEATHERS */}
            <g className="animate-wing-left" filter="url(#goldenAura)">
              {/* Primary Outer Wing Curve */}
              <path
                d="M 150 65 C 120 45, 80 15, 18 20 C 30 28, 48 38, 62 48 C 42 46, 26 50, 36 60 C 50 68, 70 72, 88 74 C 70 78, 56 86, 70 92 C 90 95, 118 85, 142 75 Z"
                fill="url(#eagleGoldGrad)"
                stroke="#00afca"
                strokeWidth="1.2"
              />
              {/* Primary Feather Highlights */}
              <path d="M 28 24 L 75 52" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
              <path d="M 45 42 L 95 64" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.5" />
              <path d="M 65 62 L 115 72" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />
            </g>

            {/* RIGHT WING WITH FEATHERS */}
            <g className="animate-wing-right" filter="url(#goldenAura)">
              {/* Primary Outer Wing Curve (Symmetric) */}
              <path
                d="M 170 65 C 200 45, 240 15, 302 20 C 290 28, 272 38, 258 48 C 278 46, 294 50, 284 60 C 270 68, 250 72, 232 74 C 250 78, 264 86, 250 92 C 230 95, 202 85, 178 75 Z"
                fill="url(#eagleGoldGrad)"
                stroke="#00afca"
                strokeWidth="1.2"
              />
              {/* Primary Feather Highlights */}
              <path d="M 292 24 L 245 52" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
              <path d="M 275 42 L 225 64" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.5" />
              <path d="M 255 62 L 205 72" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />
            </g>

            {/* FAN TAIL */}
            <path
              d="M 148 85 L 138 122 L 152 118 L 160 126 L 168 118 L 182 122 L 172 85 Z"
              fill="url(#eagleGoldGrad)"
              stroke="#00afca"
              strokeWidth="1.2"
            />
            <path d="M 160 88 L 160 122" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />

            {/* CENTRAL TORSO & PROUD HEAD */}
            <g filter="url(#goldenAura)">
              {/* Muscular Chest */}
              <path
                d="M 148 55 C 145 70, 150 88, 160 92 C 170 88, 175 70, 172 55 Z"
                fill="url(#eagleGoldGrad)"
                stroke="#00afca"
                strokeWidth="1.5"
              />
              {/* Noble Head with Crown/Feathers */}
              <path
                d="M 155 52 C 153 42, 156 34, 163 32 C 168 31, 173 35, 171 40 L 176 43 L 169 46 L 168 53 Z"
                fill="#ffffff"
                stroke="#d97706"
                strokeWidth="1.2"
              />
              {/* Golden Sharp Beak */}
              <path
                d="M 172 38 L 180 43 L 171 45 Z"
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth="0.8"
              />
              {/* Fierce Eye */}
              <circle cx="166" cy="38" r="1.5" fill="#0b1f3f" />
            </g>
          </svg>
        </div>

        {/* 3. LYCEUM CREST LOGO BADGE (REVEALS RIGHT BENEATH THE EAGLE) */}
        <div
          className={`relative transition-all duration-500 ${
            isRevealed ? 'animate-crest-burst opacity-100' : 'opacity-0 scale-50'
          }`}
        >
          {/* Luminous Outer Energy Rings */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#00afca] via-amber-400 to-[#00afca] opacity-40 blur-md animate-pulse" />

          {/* School Crest Container */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 p-3.5 border-2 border-white/30 shadow-[0_12px_40px_rgba(0,175,202,0.4)] backdrop-blur-xl flex items-center justify-center">
            {/* Pulsing inner cyan ring */}
            <div className="absolute inset-0 rounded-3xl border border-[#00afca] opacity-60" />
            <SchoolLogo
              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              variant="white-on-blue"
              priority
            />
          </div>
        </div>

        {/* 4. TITLE & SUBTITLE */}
        <div
          className={`mt-5 transition-all duration-700 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00afca]/15 border border-[#00afca]/40 text-[#38bdf8] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-2 shadow-sm">
            <span>AQTOBE BILIM-INNOVATION LYCEUM</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            AQL Council
          </h1>

          <p className="text-xs sm:text-sm font-bold text-[#38bdf8] tracking-widest uppercase mt-1">
            Мектеп Президентінің Порталы
          </p>
        </div>

        {/* 5. MINIMAL PROGRESS LINE */}
        <div
          className={`w-44 h-1 bg-white/15 rounded-full overflow-hidden mt-6 transition-all duration-700 ${
            isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="h-full bg-gradient-to-r from-[#00afca] via-amber-400 to-white rounded-full animate-progress" />
        </div>

        {/* Skip hint */}
        <span className="mt-4 text-[10px] text-slate-400/80 tracking-wider uppercase font-medium">
          Өту үшін басыңыз (Skip)
        </span>
      </div>
    </div>
  );
}
