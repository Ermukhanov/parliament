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
      ? 'aspect-[3/4]'
      : aspect === 'square'
      ? 'aspect-square'
      : 'aspect-[16/9]';

  return (
    <div
      className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden bg-gradient-to-b from-[#0b1f3f] via-[#092247] to-[#041122] border border-[#00afca]/30 shadow-md group select-none ${className}`}
    >
      {/* 1. LAYER: SUBTLE RADIAL GLOW BEHIND LOGO */}
      <div className="absolute inset-0 bg-radial from-[#00afca]/25 via-transparent to-transparent pointer-events-none" />

      {/* 2. LAYER: SCHOOL CREST / LOGO IN THE BACKGROUND */}
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
        <img
          src={photo!}
          alt={name}
          className="relative z-10 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
        />
      ) : (
        /* ELEGANT STUDENT LEADER SILHOUETTE IN FRONT OF LOGO */
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pointer-events-none pb-0">
          <svg
            viewBox="0 0 200 240"
            className="w-4/5 h-4/5 text-slate-200/90 drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
            fill="currentColor"
          >
            {/* Head */}
            <circle cx="100" cy="65" r="38" fill="url(#avatar-grad)" />
            {/* Neck */}
            <path d="M88 100 L112 100 L115 125 L85 125 Z" fill="url(#avatar-grad)" />
            {/* Shirt Collar / Tie Accent */}
            <polygon points="100,125 90,140 100,165 110,140" fill="#00afca" />
            <polygon points="95,125 100,135 105,125" fill="#ffffff" opacity="0.9" />
            {/* Shoulders and Suit */}
            <path
              d="M25 240 C25 170, 55 130, 85 125 L100 145 L115 125 C145 130, 175 170, 175 240 Z"
              fill="url(#avatar-grad)"
            />
            {/* Suit Lapel Highlights */}
            <path
              d="M85 125 L100 175 L80 240 M115 125 L100 175 L120 240"
              stroke="#00afca"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="avatar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 4. LAYER: SUBTLE BOTTOM VIGNETTE */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none z-20" />
    </div>
  );
}
