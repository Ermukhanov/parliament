'use client';

import React from 'react';
import Link from 'next/link';

interface TimelineItemData {
  id: string;
  titleRu: string;
  titleKk: string;
  descRu: string;
  descKk: string;
  month: number;
  year: number;
  icon: string;
}

interface TimelineSectionProps {
  locale: string;
  items: TimelineItemData[];
}

const monthNamesEn: Record<number, string> = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

const monthNamesKk: Record<number, string> = {
  1: 'Қаңтар',
  2: 'Ақпан',
  3: 'Наурыз',
  4: 'Сәуір',
  5: 'Мамыр',
  6: 'Маусым',
  7: 'Шілде',
  8: 'Тамыз',
  9: 'Қыркүйек',
  10: 'Қазан',
  11: 'Қараша',
  12: 'Желтоқсан',
};

export default function TimelineSection({ locale, items }: TimelineSectionProps) {
  const isEn = locale === 'en';

  return (
    <section id="timeline" className="py-12 sm:py-20 relative z-10 bg-[#ffffff] overflow-hidden">
      {/* 1. LEFT SIDE KAZAKH ORNAMENT COLUMN (RUNS SEAMLESSLY FROM TOP TO BOTTOM ON DESKTOP) */}
      <div
        className="hidden lg:block absolute left-2 xl:left-8 2xl:left-14 top-6 bottom-6 w-10 xl:w-14 2xl:w-16 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <div
          className="w-full h-full opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_4px_16px_rgba(234,179,8,0.28)]"
          style={{
            backgroundImage: "url('/images/kazakh-ornament.png')",
            backgroundRepeat: 'repeat-y',
            backgroundPosition: 'center top',
            backgroundSize: '100% auto',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
          }}
        />
      </div>

      {/* 2. RIGHT SIDE KAZAKH ORNAMENT COLUMN (RUNS SEAMLESSLY FROM TOP TO BOTTOM ON DESKTOP, SYMMETRICALLY MIRRORED) */}
      <div
        className="hidden lg:block absolute right-2 xl:right-8 2xl:right-14 top-6 bottom-6 w-10 xl:w-14 2xl:w-16 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <div
          className="w-full h-full opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_4px_16px_rgba(234,179,8,0.28)] scale-x-[-1]"
          style={{
            backgroundImage: "url('/images/kazakh-ornament.png')",
            backgroundRepeat: 'repeat-y',
            backgroundPosition: 'center top',
            backgroundSize: '100% auto',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
          }}
        />
      </div>

      <div className="max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="section-kicker">
            {isEn ? 'Academic Year Calendar' : 'Оқу жылының күнтізбесі'}
          </div>
          <h1 className="section-title">
            {isEn ? 'Annual Roadmap 2026–2027' : 'Жылдық жоспар 2026–2027'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-normal">
            {isEn
              ? 'Strategic milestones, monthly themes, and flagship events of the AQL Council School Parliament.'
              : 'Қыркүйектен мамырға дейінгі ай сайынғы негізгі мақсаттар, іс-шаралар мен фракциялардың жылдық бағыты.'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 aql-card p-8 max-w-2xl mx-auto">
            <p className="font-extrabold text-xl text-slate-800 mb-2">
              {isEn ? 'Annual roadmap is being prepared' : 'Жылдық жоспар толтырылуда'}
            </p>
            <p className="text-sm text-slate-500">
              {isEn
                ? 'Monthly milestones and faction events for the academic year will be published soon.'
                : 'Оқу жылына арналған ай сайынғы іс-шаралар жоспары жақында жарияланады.'}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="timeline-line" />
            <div className="space-y-8">
              {items.map((item, idx) => {
                const isLeft = idx % 2 === 0;
                const monthLabel =
                  isEn ? monthNamesEn[item.month] : monthNamesKk[item.month];
                const isActive = item.month === 11;

                return (
                  <div
                    key={item.id}
                    id={`month-card-${item.month}`}
                    className={`relative flex flex-col md:flex-row items-start scroll-mt-32 ${
                      isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Month Circle Badge */}
                    <div
                      className={`absolute left-[24px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 text-xs font-black shadow-md border-2 ${
                        isActive
                          ? 'bg-[#00afca] text-white border-white ring-4 ring-[#00afca]/20'
                          : 'bg-slate-900 text-white border-white'
                      }`}
                    >
                      {String(item.month).padStart(2, '0')}
                    </div>

                    {/* Timeline Card */}
                    <div
                      className={`w-full md:w-[calc(50%-2.5rem)] pl-16 md:pl-0 ${
                        isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'
                      }`}
                    >
                      <div
                        className={`aql-card p-6 bg-white transition-all hover:shadow-xl ${
                          isActive
                            ? 'border-2 border-[#00afca] shadow-md ring-2 ring-[#00afca]/10'
                            : 'border border-slate-200'
                        }`}
                      >
                        <div
                          className={`text-[11px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 ${
                            isLeft ? 'md:justify-end' : 'md:justify-start'
                          } text-[#00afca]`}
                        >
                          <span>
                            {monthLabel} {item.year}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#00afca] text-white shadow-sm">
                              {isEn ? 'Active Month' : 'Белсенді айлық'}
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2 leading-snug">
                          {item.titleKk || item.titleRu}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {item.descKk || item.descRu}
                        </p>

                        {isActive && (
                          <div
                            className={`mt-4 pt-3 border-t border-slate-100 flex items-center justify-between ${
                              isLeft ? 'md:flex-row-reverse' : ''
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-500">
                              {isEn ? '21+ events in schedule' : '21+ іс-шара жоспарланған'}
                            </span>
                            <Link
                              href={`/${locale}/events`}
                              prefetch
                              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00afca] hover:text-[#009bb3] hover:underline"
                            >
                              <span>{isEn ? 'View Schedule' : 'Кестені қарау'}</span>
                              <span>→</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
