'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('clickable'))
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const follow = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.2,
        y: prev.y + (pos.y - prev.y) * 0.2,
      }));
      animationFrameId = requestAnimationFrame(follow);
    };
    animationFrameId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pos]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Blue Aura visible on White */}
      <div
        className="fixed rounded-full transition-transform duration-75 ease-out"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: isPointer ? '44px' : '30px',
          height: isPointer ? '44px' : '30px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0, 175, 202, 0.2) 0%, rgba(0, 175, 202, 0) 70%)',
          border: '1.5px solid rgba(0, 175, 202, 0.5)',
          boxShadow: isPointer ? '0 0 15px rgba(0, 175, 202, 0.4)' : 'none',
        }}
      />
      {/* Inner Sky Blue Dot */}
      <div
        className="fixed rounded-full"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isPointer ? '7px' : '5px',
          height: isPointer ? '7px' : '5px',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#00afca',
          boxShadow: '0 0 8px rgba(0, 175, 202, 0.8)',
        }}
      />
    </div>
  );
}
