'use client';

import { useEffect, useRef, useState } from 'react';

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver for scroll reveal animations across all sections & cards
    const elements = document.querySelectorAll(
      '.aql-card, .section-kicker, .section-title, .scroll-reveal'
    );

    elements.forEach((el, index) => {
      if (!el.classList.contains('scroll-reveal')) {
        el.classList.add('scroll-reveal');
      }
      // Stagger cards within the same parent grid
      const parent = el.parentElement;
      if (parent && (parent.classList.contains('grid') || parent.classList.contains('space-y-8'))) {
        const siblings = Array.from(parent.children);
        const siblingIdx = siblings.indexOf(el as Element);
        if (siblingIdx >= 0) {
          (el as HTMLElement).style.transitionDelay = `${(siblingIdx % 6) * 75}ms`;
        }
      } else {
        (el as HTMLElement).style.transitionDelay = `${(index % 3) * 40}ms`;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      alpha: number;
      color: string;
    }

    const colors = [
      'rgba(0, 175, 202, ',
      'rgba(56, 189, 248, ',
      'rgba(14, 165, 233, ',
    ];

    const particles: Particle[] = [];
    const count = Math.min(Math.floor((width * height) / 24000), 36);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.3 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Top Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#00afca] via-[#38bdf8] to-[#00afca] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(0,175,202,0.6)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Subtle Ambient Orbs & Particle Canvas */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-[-5%] right-[8%] h-[420px] w-[420px] rounded-full animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(0, 175, 202, 0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[12%] left-[-5%] h-[460px] w-[460px] rounded-full animate-float-reverse"
          style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)' }}
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-75" />
      </div>
    </>
  );
}
