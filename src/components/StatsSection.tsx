'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItem {
  id?: string;
  key: string;
  value: number;
  labelRu?: string;
  labelKk: string;
  labelEn?: string;
}

interface StatsSectionProps {
  locale: string;
  stats: StatItem[];
}

function AnimatedNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frameId: number;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1200;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.round(target * eased));
            if (progress < 1) {
              frameId = requestAnimationFrame(tick);
            }
          };

          frameId = requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [target]);

  return <div ref={ref}>{count}</div>;
}

export default function StatsSection({ locale, stats }: StatsSectionProps) {
  const statLabelsEn: Record<string, string> = {
    events: 'Events Hosted',
    members: 'Factions',
    students: 'Active Students',
    initiatives: 'Initiatives Realized',
  };

  const defaultStats: StatItem[] = [
    { key: 'events', value: 12, labelEn: 'Events Hosted', labelKk: 'Өткізілген іс-шаралар' },
    { key: 'members', value: 7, labelEn: 'Factions', labelKk: 'Фракциялар' },
    { key: 'students', value: 30, labelEn: 'Parliament Members', labelKk: 'Парламент мүшелері' },
    { key: 'initiatives', value: 18, labelEn: 'Initiatives Realized', labelKk: 'Іске асырылған бастамалар' },
  ];

  const items = stats.length > 0 ? stats : defaultStats;

  return (
    <section className="py-12 relative z-10 bg-[#ffffff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const label = locale === 'en'
              ? (item.labelEn || statLabelsEn[item.key] || item.labelKk)
              : item.labelKk;

            return (
              <div
                key={item.key}
                className="aql-card p-6 text-center rounded-2xl bg-white group"
              >
                <div className="font-extrabold text-3xl sm:text-5xl text-[#0f172a] group-hover:text-[#00afca] transition-colors duration-300 mb-2 tabular-nums tracking-tight">
                  <AnimatedNumber target={item.value} />
                </div>
                <div className="text-xs text-slate-500 font-semibold tracking-wide">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
