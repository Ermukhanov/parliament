'use client';

import { useEffect, useState, useCallback } from 'react';
import SchoolLogo from './SchoolLogo';

export default function SplashScreen() {
  const [phase, setPhase] = useState<'assemble' | 'crest' | 'portal' | 'done'>('assemble');
  const [progress, setProgress] = useState(0);

  const triggerPortalExit = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'portal' || prev === 'done') return prev;
      return 'portal';
    });
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPhase('done');
      return;
    }

    document.body.style.overflow = 'hidden';

    const start = performance.now();
    const totalDuration = 3100;
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);
      if (elapsed < totalDuration) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    const tCrest = setTimeout(() => setPhase('crest'), 1150);
    const tPortal = setTimeout(() => setPhase('portal'), 3300);
    const tDone = setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = '';
    }, 4150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(tCrest);
      clearTimeout(tPortal);
      clearTimeout(tDone);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (phase === 'portal') {
      const t = setTimeout(() => {
        setPhase('done');
        document.body.style.overflow = '';
      }, 850);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === 'done') return null;

  const titleTop = 'МЕКТЕП ПРЕЗИДЕНТІ'.split('');
  const titleMain = 'AQL COUNCIL'.split('');

  return (
    <div
      onClick={triggerPortalExit}
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer ${
        phase === 'portal' ? 'splash-portal-open' : ''
      }`}
    >
      {/* Left & Right Portal Gates that split open on exit (Deep Blue & Cyan) */}
      <div className="splash-gate-left absolute inset-y-0 left-0 w-1/2 bg-[#022c43] z-0" />
      <div className="splash-gate-right absolute inset-y-0 right-0 w-1/2 bg-[#022c43] z-0" />

      {/* Atmospheric Blue / Light-Blue / White Radial Background */}
      <div className="splash-bg-layer absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, #00afca 0%, #034c70 48%, #011f33 100%)',
          }}
        />
        {/* Subtle white/cyan grid lines */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.22) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Rising cyan & white ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-[#38bdf8]/35 blur-[110px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-white/25 blur-[80px]" />
      </div>

      {/* Main Zooming Emblem Container (flies through camera on 'portal' phase) */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all ${
          phase === 'portal' ? 'splash-emblem-flythrough' : ''
        }`}
      >
        {/* Central Stage: Rotating Rings + Assembling White/Cyan Eagle + School Logo */}
        <div className="relative w-[320px] h-[300px] sm:w-[460px] sm:h-[400px] flex items-center justify-center">
          {/* Shockwave Ring when Eagle & Crest Lock In */}
          <div
            className={`absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-white/90 pointer-events-none ${
              phase === 'crest' || phase === 'portal' ? 'splash-shockwave' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-[#38bdf8]/80 pointer-events-none ${
              phase === 'crest' || phase === 'portal' ? 'splash-shockwave-delayed' : 'opacity-0'
            }`}
          />

          {/* Outer Rotating Ornamental Ring (Pure White & Light Blue) */}
          <svg
            viewBox="0 0 400 400"
            className="absolute w-[280px] h-[280px] sm:w-[370px] sm:h-[370px] splash-ring-spin pointer-events-none"
          >
            <defs>
              <linearGradient id="ringGradBlueWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#00afca" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <circle
              cx="200"
              cy="200"
              r="182"
              fill="none"
              stroke="url(#ringGradBlueWhite)"
              strokeWidth="1.75"
              strokeDasharray="12 8 4 8"
            />
            <circle
              cx="200"
              cy="200"
              r="164"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              strokeDasharray="60 20"
            />
            {/* 8 compass star points */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 200 200)`}>
                <polygon
                  points="200,10 204,22 196,22"
                  fill={deg % 90 === 0 ? '#ffffff' : '#38bdf8'}
                />
              </g>
            ))}
          </svg>

          {/* SOARING KAZAKH STEPPE EAGLE & 32-RAY SUN (Pure White & Light Cyan) */}
          <svg
            viewBox="240 40 600 420"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className="w-full h-full overflow-visible drop-shadow-[0_0_28px_rgba(255,255,255,0.55)]"
          >
            <defs>
              <linearGradient id="eagleWhiteBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              <linearGradient id="eagleStrokeCyanWhite" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <g id="splashSunRay">
                <path d="M0-152.9c8-.1 11-5.1 11-11.1 0-8-11-46.1-11-46.1S-11-172-11-164c0 6 3 11.1 11 11.1z" />
              </g>
              <g id="splashRay4">
                <use xlinkHref="#splashSunRay" />
                <use xlinkHref="#splashSunRay" transform="rotate(90)" />
                <use xlinkHref="#splashSunRay" transform="scale(-1)" />
                <use xlinkHref="#splashSunRay" transform="rotate(270)" />
              </g>
              <g id="splashRay16">
                <use xlinkHref="#splashRay4" />
                <use xlinkHref="#splashRay4" transform="rotate(22.5)" />
                <use xlinkHref="#splashRay4" transform="rotate(45)" />
                <use xlinkHref="#splashRay4" transform="rotate(67.5)" />
              </g>
              <g id="splashRay32">
                <use xlinkHref="#splashRay16" />
                <use xlinkHref="#splashRay16" transform="rotate(11.25)" />
              </g>
            </defs>

            {/* 32-Ray Sun rising behind the Crest */}
            <g
              className="splash-sun-rise"
              transform="matrix(.52 0 0 .52 540.236 205)"
              fill="url(#eagleWhiteBlueGrad)"
            >
              <circle r="134.55" fillOpacity="0.24" stroke="#ffffff" strokeWidth="4" />
              <use xlinkHref="#splashRay32" />
            </g>

            {/* Soaring Steppe Eagle (Berkut) — Laser Line Draw + White/Cyan Fill Materialization */}
            <g className="splash-eagle-wings" transform="translate(0, 18) scale(.5)">
              {/* Right Wing & Body */}
              <path
                className="splash-eagle-path"
                fill="url(#eagleWhiteBlueGrad)"
                stroke="url(#eagleStrokeCyanWhite)"
                strokeWidth="5"
                d="M1212.2 746.01c-7.245 4.35-12.775-3.362-18.831-5.675-4.325 2.349-4.729 10.208-8.77 13.93-4.835 5.502-10.76-1.537-10.319-6.965-5.782 4.874-8.706 15.922-18.057 14.446-4.43-3.615-7.721-11.201-11.106-2.564-2.76 4.222-10.11 10.23-13.916 3.854-1.178-5.63-4-12.25-7.063-3.308-2.102 6.325-8.85 10.978-15.379 8.209-3.574-2.922 2.865-13.727-1.684-12.958-6.8 4.495-10.753 15.658-20.242 14.764-3.685-4.136 2.236-11.144-1.806-15.735-4.77 6.123-10.063 15.089-18.315 15.735-3.988-3.232.157-12.501-2.39-13.873-8.467 5.078-17.401 14.128-28.05 11.294 4.15-15.873 21.49-21.442 36.073-22.68 25.089-3.084 51.484 2.586 75.624-6.47 3.9-2.373 13.35-5.739 9.985-11.243-2.98-4.347 7.753-2.647 8.785-7.724-.639-6.43 4.927-5.545 10.364-6.108 24.376-1.052 48.455 4.082 72.758 4.954 1.836 11.842-11.3 20.157-21.876 16.5-5.052.819-12.627-11.615-11.142-2.57-1.018 4.748-.305 11.018-4.643 14.189m-207.4-24.248c5.643 5.165 9.6-.973 14.875-3.216 17.692-6.085 33.128-16.719 48.346-27.344 9.22-7.63 17.214-17.525 29.597-20 24.155-7.303 49.832-6.417 74.08-13.157 18.465-25.28 49.826-34.299 76.097-48.83 5.899-1.833 8.178-6.688 10.062-12.048 10.028-15.83 23.689-29.857 39.845-39.439 7.644-4.177 16.764-6.582 25.418-4.672-.62 10.307-6.533 19.442-13.672 26.57 5.842-.128 10.863-3.819 16.767-3.611 2.023 10.578-9.4 16.114-15.478 22.7 3.385.787 16.353 1.768 9.286 5.159-9.005 6.25-19.289 10.541-27.602 17.799 7.67 1.378 8.544 3.008.745 5.782-4.222 2.862-12.341 3.862-13.126 9.437 5.794 3.561-2.669 7.097-5.933 8.255-6.242 1.454-12.798 4.165-4.507 8.907-3.136 4.738-9.865 5.749-15.356 5.28 1.666 5.37 4.078 11.379-2.892 13.748-15.624 11.81-33.96 20.402-53.6 22.367 24.535 1.886 49.806-2.668 70.772-16.011 2.768-3.273 17.282-6.79 9.164-9.542-3.822-1.59-12.016-3.357-12.57-6.271 11.355-7.006 25.664-4.514 37.88-8.676.316-3.955-9.292-2.855-12.874-3.755-8.543-.7-8.042-2.88.195-3.688 10.422-2.76 22.226-3.303 30.993-10.098-7.138-3.307-16.116-.396-23.732-3.096 12.911-5.65 28.142-6.217 39.726-14.704 5.277-5.87-6.76-4.036-10.267-3.893-7.15 1.245-10.456-2.178-2.332-5.149 13.87-10.227 31.433-16.87 41.176-31.697 2.308-3.319 5.433-13.319-1.928-9.722-9.68 3.219-18.198 14.101-29.228 10.735 21.733-16.844 42.413-36.02 57.267-59.33.768-6.723-9.785-7.45-12.532-2.172-13.963 13.454-26.6 29.335-44.477 37.77 17.121-16.525 31.276-36.092 43.626-56.372 2.648-6.032 9.764-13.286 5.902-19.983-6.225-5.153-14.013-.436-17.248 5.73-10.854 14.17-19.096 30.709-33.054 42.25 12.22-23.321 24.871-48.147 25.18-75.046-.038-5.538-1.15-13.694-8.67-12.66-5.962 1.069-4.546 9.992-7.004 14.505-5.411 18.377-7.951 38.279-19.05 54.37 2.497-14.933 6.866-30.5 3.512-45.58-1.567-6.739-12.45-3.84-11.048 2.83-13.002 65.86-57.194 123.46-114.99 156.78-26.464 14.973-56.023 24.626-86.096 29.002-8.09 1.771-16.84.732-24.572 3.49-18.736 14.367-30.08 38.407-53.802 45.935-10.632 5.284-24.496 6.356-32.098 16.233-.658 1.263-.8 2.727-.774 4.128"
              />
              {/* Left Wing */}
              <path
                className="splash-eagle-path"
                fill="url(#eagleWhiteBlueGrad)"
                stroke="url(#eagleStrokeCyanWhite)"
                strokeWidth="5"
                d="M1075.8 654.95c-3.5 6.354-5.56 13.658-10.06 19.347-13.541-12.321-33.171-11.914-50.347-12.734-14.177-.757-29.594-2.065-40.563-12.176-11.539-9.452-20.958-21.724-33.852-29.393-11.769-3.2-23.633-7.204-33.095-15.271-20.22-16.482-31.8-40.937-51.558-57.933-3.767-3.708-8.209-6.581-12.429-9.727-4.01.977-2.195 9.631-7.102 5.22-2.67-1.9-9.348-2.085-9.95.569 6.041 7.96 12.088 17.049 12.925 27.23-4.12.422-11.445-.87-13.487.664 5.471 8.2 12.484 15.473 20.452 21.263-3.822.614-11.353.28-12.818 1.82 7.909 6.446 16.39 13.034 26.747 14.69 2.12 2.794-3.1 8.19 1.29 10.576 2.545 1.04 10.944 2.78 5.159 5.675-3.97 2.675-2.497 8.91 2.58 8.77 3.21 1.64 10.417 2.041 10.981 4.88-2.845 2.895-11.698 6.328-4.163 9.04 7.039 3.904 15.067 6.439 23.105 6.717-4.034 3.394-9.004 5.32-13.156 8.513 18.55 10.877 39.113 18.03 59.433 24.919 8.09 2.703 16.274 5.223 24.66 6.81-24.368-1.407-47.921-8.621-70.115-18.495-11.503-5.045-23.084-9.92-34.873-14.265 5.169-2.69 11.148-3.347 16.509-5.675-11.128-2.23-23.285-2.96-33.067-9.077 1.5-2.676 7.183-2.802 10.326-4.164 5.911-1.416 9.578-3.134 1.243-3.648-8.405-2.281-18.045-1.257-25.452-6.328.477-3.04 8.229-1.98 11.386-3.293 3.976-.683 8.396-1.255 11.573-3.93-12.994-5.387-29.99-1.57-40.168-13.045-2.347-4.372 7.289-.85 10.033-1.579 6.973 0 14.467 2.216 21.107-.595-18.934-8.313-39.215-16.095-53.655-31.471-1.603-2.472-6.407-9.225-2.531-10.06 11.239 1.487 19.374 13.753 31.396 11.844 1.597-2.153-6.984-5.681-9.126-8.758-17.528-15.041-34.54-31.364-46.825-51.066-.845-6.58 9.497-7.565 12.22-2.484 13.405 12.911 25.514 27.977 42.21 36.791 5.924 2.873-3.402-3.4-4.644-5.675-15.427-17.914-30.113-36.834-40.895-57.932-1.93-3.802-5.128-10.686.646-12.71 5.773-2.892 11.501 1.048 14.428 6.007 11.342 14.305 19.688 31.307 33.817 43.225-12.037-23.359-24.889-47.948-25.2-74.828.283-5.21.618-13.092 7.684-12.878 5.933-.9 4.996 6.696 6.94 10.318 5.846 19.747 8.395 41.121 20.122 58.556-2.59-14.649-6.403-29.735-3.87-44.627.584-4.89 6.089-6.37 9.682-3.414 2.905 7.11 3.51 15.89 6.157 23.491 15.06 51.52 48.875 96.832 92.941 127.24 36.292 24.891 79.362 39.75 123.32 42.341 3.97.346 7.956.466 11.932.71"
              />
              {/* Eagle Head */}
              <path
                className="splash-eagle-path"
                fill="url(#eagleWhiteBlueGrad)"
                stroke="#ffffff"
                strokeWidth="3"
                d="M1056.467 711.467c-3.6.2-7.1.666-10.534 1.766-4.7.634-9.2 2.267-13.866 3.034l-1.867.3-3.133.3c.2.866.333 1.733.333 2.6 0 .9-.1 1.766-.333 2.5-.2.7-.834 1.566-1.334 2.1-.666.733-1.366 1.366-2.2 1.766-.8.4-1.7.567-2.6.634-.9.033-1.833 0-2.7-.334-.9-.3-1.733-.866-2.5-1.533a21.57 21.57 0 0 1-2.8.5c-.933.1-1.8.1-2.633 0-.933-.267-1.9-.567-2.8-.933a16.14 16.14 0 0 1-2.6-1.367c-3.4 2-7.2 3.9-9.267 7.4-1.166 1.6-1.4 3.433-1.666 5.333-.167 2.334.433 4.8 1.433 6.967.367.633.667-2.3 1.8-2.7 1.9-1.567 4.267-2.7 6.667-3.333 2.033-1.034 1.766.066.933 1.666-.2.834-1.333 4 .2 2.4 6.767-3 14.267-3.6 21.567-4.166 10.6-1.1 21.233-1.334 31.866-1.467l30 .633c4.767.134 9.567 1.2 14.267.4 1.133-.3 2.9-.366 3.567-1.033-2.134-1.233-4.634-1.267-7-1.567H1080.2c-5.3-.533-10.833-.6-15.833-2.6-1.334-.533-2.567-1.8-3.834-.433-1.9.667-3.933 1.133-5.933 1.267-3.5.266-7-.467-10.233-1.767 2.333-3.233 5.133-6.067 7.7-9.067-2.067-.333-4.067-.766-6.134-1.266 3.634-2.5 7-5.334 10.534-8z"
              />
            </g>
          </svg>

          {/* SCHOOL CREST MEDALLION (Materializes in the Heart of the Eagle & Sun) */}
          <div
            className={`absolute top-[41%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-700 ${
              phase === 'assemble'
                ? 'splash-crest-assembling'
                : 'splash-crest-locked'
            }`}
          >
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#00afca] to-[#025b70] p-3.5 shadow-[0_0_50px_rgba(255,255,255,0.65)] border-2 border-white flex items-center justify-center overflow-hidden">
              {/* Holographic light sweep across the crest */}
              <div className="splash-crest-glare absolute inset-0 pointer-events-none" />
              <SchoolLogo
                className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                variant="white-on-blue"
                priority
              />
            </div>
          </div>
        </div>

        {/* Typography & Progress Bar */}
        <div className="-mt-4 sm:-mt-6 text-center px-4">
          {/* Eyebrow: МЕКТЕП ПРЕЗИДЕНТІ */}
          <div className="flex justify-center flex-wrap text-xs sm:text-sm font-extrabold tracking-[0.32em] text-sky-200 mb-2">
            {titleTop.map((ch, i) => (
              <span
                key={i}
                className="splash-letter"
                style={{ animationDelay: `${0.85 + i * 0.035}s` }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>

          {/* Main Title: AQL COUNCIL */}
          <div className="flex justify-center text-3xl sm:text-5xl font-black text-white tracking-[0.22em] drop-shadow-[0_0_24px_rgba(56,189,248,0.75)]">
            {titleMain.map((ch, i) => (
              <span
                key={i}
                className="splash-letter"
                style={{ animationDelay: `${1.15 + i * 0.045}s` }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>

          {/* Progress Bar + Percentage */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-52 sm:w-64 h-1.5 bg-white/15 rounded-full overflow-hidden border border-white/25 p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-white to-[#00afca] transition-all duration-75 shadow-[0_0_14px_#ffffff]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase text-sky-100/90">
              <span className="tabular-nums text-white">{progress}%</span>
              <span>•</span>
              <span>Портал ашылуда</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Hint at Bottom */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerPortalExit();
        }}
        className="absolute bottom-6 z-20 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-[11px] font-semibold tracking-widest uppercase text-white/85 hover:text-white transition-all"
      >
        Өткізу • Skip →
      </button>
    </div>
  );
}
