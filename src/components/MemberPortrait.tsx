'use client';

import React from 'react';
import Image from 'next/image';

interface MemberPortraitProps {
  photo?: string | null;
  name: string;
  className?: string;
  aspect?: 'portrait' | 'square' | 'banner';
  priority?: boolean;
}

export default function MemberPortrait({
  photo,
  name,
  className = '',
  aspect = 'portrait',
  priority = false,
}: MemberPortraitProps) {
  const hasPhoto = Boolean(photo && photo.trim().length > 0);

  const aspectClass =
    aspect === 'portrait'
      ? 'aspect-[4/5]'
      : aspect === 'square'
      ? 'aspect-square'
      : 'aspect-[16/9]';

  return (
    <div
      className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden bg-gradient-to-b from-[#0b1f3f] via-[#092247] to-[#041122] border border-[#00afca]/30 shadow-md group select-none ${className}`}
    >
      {/* 1. LAYER: SUBTLE RADIAL GLOW BEHIND LOGO */}
      <div className="absolute inset-0 bg-radial from-[#00afca]/25 via-transparent to-transparent pointer-events-none" />

      {/* 2. LAYER: SCHOOL CREST / LOGO IN THE BACKGROUND (VISIBLE BEHIND SILHOUETTES OR TRANSPARENCIES) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-4">
        <div className="relative w-4/5 h-4/5 opacity-25 group-hover:opacity-35 transition-opacity duration-300">
          <Image
            src="/logo-white.png"
            alt="AQL Crest Background"
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 3. LAYER: FOREGROUND - PERSON */}
      {hasPhoto ? (
        <Image
          src={photo!}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="relative z-10 w-full h-full object-cover object-[center_top] transition-transform duration-300 group-hover:scale-105"
          priority={priority}
          unoptimized
        />
      ) : (
        /* ELEGANT STUDENT LEADER SILHOUETTE IN FRONT OF LOGO */
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-4 transition-transform duration-300 group-hover:scale-105 pointer-events-none">
          {/* Ambient rim light */}
          <div className="absolute inset-x-8 bottom-6 h-28 bg-[#00afca]/20 blur-2xl rounded-full" />

          {/* Minimalist stylized student torso/blazer silhouette */}
          <svg
            viewBox="0 0 200 240"
            className="w-4/5 h-4/5 text-[#00afca]/60 drop-shadow-[0_8px_24px_rgba(0,175,202,0.35)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <circle
              cx="100"
              cy="65"
              r="34"
              fill="currentColor"
              fillOpacity="0.85"
            />
            {/* Neck */}
            <path
              d="M90 95 L110 95 L112 110 L88 110 Z"
              fill="currentColor"
              fillOpacity="0.9"
            />
            {/* Shirt Collar / Tie V-shape */}
            <path
              d="M85 110 L100 135 L115 110 Z"
              fill="#ffffff"
              fillOpacity="0.95"
            />
            <path
              d="M97 122 L103 122 L105 160 L100 170 L95 160 Z"
              fill="#00afca"
            />
            {/* Suit Shoulders & Lapels */}
            <path
              d="M35 240 C35 170, 60 115, 88 110 L100 145 L112 110 C140 115, 165 170, 165 240 Z"
              fill="currentColor"
              fillOpacity="0.95"
            />
            {/* Lapel highlights */}
            <path
              d="M88 110 L75 180 L100 195 L125 180 L112 110"
              stroke="#ffffff"
              strokeWidth="2"
              strokeOpacity="0.3"
            />
          </svg>

          {/* Badge indicator */}
          <div className="mt-1 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-[#00afca]/40 text-[10px] uppercase font-bold tracking-wider text-sky-200">
            AQL Мүшесі
          </div>
        </div>
      )}

      {/* 4. LAYER: BOTTOM GRADIENT OVERLAY FOR TEXT READABILITY & POLISHED LOOK */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none z-20" />
    </div>
  );
}
