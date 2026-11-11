'use client';

import React from 'react';
import Link from 'next/link';
import SchoolLogo from './SchoolLogo';

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

  const scrollToMonth = (monthNumber: number) => {
    const el = document.getElementById(`month-card-${monthNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="timeline" className="py-12 sm:py-20 relative z-10 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
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
          /* 3-COLUMN DESKTOP LAYOUT (PC ONLY SIDES, MOBILE SINGLE-COLUMN) */
          <div className="xl:grid xl:grid-cols-12 xl:gap-8 items-start">
            {/* ============================================================== */}
            {/* LEFT FLANK (DESKTOP / PC ONLY - HIDDEN ON MOBILE)              */}
            {/* ============================================================== */}
            <aside className="hidden xl:block xl:col-span-3 sticky top-28 space-y-6 select-none">
              {/* Card 1: Academic Progress & Quarters */}
              <div className="aql-card p-5 bg-gradient-to-br from-slate-900 to-[#0b1c33] text-white border border-[#00afca]/30 shadow-lg relative overflow-hidden">
                <div className="absolute right-[-20px] bottom-[-20px] w-28 h-28 opacity-10 pointer-events-none">
                  <SchoolLogo className="w-full h-full object-contain" />
                </div>

                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#38bdf8]">
                    {isEn ? 'ACADEMIC TIMELINE' : 'ОҚУ ЖЫЛЫ ХРОНОЛОГИЯСЫ'}
                  </span>
                  <span className="text-xs font-bold text-amber-400">2026–2027</span>
                </div>

                <h3 className="font-black text-base text-white mb-2">
                  {isEn ? 'School Milestones' : 'Тоқсандық кезеңдер'}
                </h3>

                <div className="space-y-2.5 text-xs">
                  {/* I Quarter */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">I тоқсан</div>
                      <div className="text-[10px] text-slate-400">Қыркүйек – Қазан</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Аяқталды
                    </span>
                  </div>

                  {/* II Quarter (Active) */}
                  <div className="p-2.5 rounded-xl bg-[#00afca]/15 border border-[#00afca]/40 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-extrabold text-[#38bdf8]">II тоқсан</div>
                      <div className="text-[10px] text-slate-300">Қараша – Желтоқсан</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00afca] text-white shadow-sm animate-pulse">
                      🔥 Қазір өтуде
                    </span>
                  </div>

                  {/* III Quarter */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between opacity-80">
                    <div>
                      <div className="font-bold text-slate-200">III тоқсан</div>
                      <div className="text-[10px] text-slate-400">Қаңтар – Наурыз</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-400">
                      Алда
                    </span>
                  </div>

                  {/* IV Quarter */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between opacity-80">
                    <div>
                      <div className="font-bold text-slate-200">IV тоқсан</div>
                      <div className="text-[10px] text-slate-400">Сәуір – Мамыр</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-400">
                      Қорытынды
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Month Fast-Jumper */}
              <div className="aql-card p-5 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {isEn ? 'QUICK NAVIGATOR' : 'АЙЛАРҒА ЖЫЛДАМ ӨТУ'}
                  </span>
                  <span className="text-[10px] font-bold text-[#00afca]">
                    {items.length} {isEn ? 'months' : 'ай'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-3 font-normal">
                  {isEn
                    ? 'Click any month to scroll directly to its roadmap card:'
                    : 'Керекті айды таңдап, кестедегі орнына бірден өтіңіз:'}
                </p>

                <div className="grid grid-cols-3 gap-1.5">
                  {items.map((it) => {
                    const isActive = it.month === 11;
                    const mName = isEn ? monthNamesEn[it.month] : monthNamesKk[it.month];
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => scrollToMonth(it.month)}
                        className={`p-2 rounded-xl text-center text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-[#00afca] text-white border-[#00afca] shadow-md hover:bg-[#009bb3] scale-105'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                        title={`${mName} ${it.year}`}
                      >
                        <div className="text-[10px] opacity-70 leading-none">
                          {String(it.month).padStart(2, '0')}
                        </div>
                        <div className="truncate mt-0.5">{mName.slice(0, 4)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ============================================================== */}
            {/* CENTER: TIMELINE ROADMAP (VISIBLE ON ALL SCREENS)               */}
            {/* ============================================================== */}
            <div className="col-span-12 xl:col-span-6 w-full max-w-3xl mx-auto xl:max-w-none">
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
                              ? 'bg-[#00afca] text-white border-white ring-4 ring-[#00afca]/20 animate-pulse'
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
            </div>

            {/* ============================================================== */}
            {/* RIGHT FLANK (DESKTOP / PC ONLY - HIDDEN ON MOBILE)             */}
            {/* ============================================================== */}
            <aside className="hidden xl:block xl:col-span-3 sticky top-28 space-y-6 select-none">
              {/* Card 1: Flagship School Traditions */}
              <div className="aql-card p-5 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00afca]">
                    {isEn ? 'FLAGSHIP HIGHLIGHTS' : 'БАСТЫ САЛТ-ДӘСТҮРЛЕР'}
                  </span>
                  <span className="text-xs">🏆</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <span>🏆</span>
                      <span>Президент кубогы</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Желтоқсан айындағы волейбол мен футболдан лицейшілер арасындағы ашық турнир.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <span>💡</span>
                      <span>AQL Hackathon 2027</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Наурыздағы IT және цифрландыру фракциясының мектептік бағдарламалау сайысы.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <span>🎭</span>
                      <span>«Жұлдызды сәт» фестивалі</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Сәуір айындағы домбыра, вокал және биден жыл сайынғы шығармашылық өнер мерекесі.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Propose to Roadmap CTA */}
              <div className="aql-card p-5 bg-gradient-to-br from-[#00afca] to-[#0284c7] text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-2.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    {isEn ? 'STUDENT VOICE' : 'ОҚУШЫ ЫҚПАЛЫ'}
                  </span>
                  <h4 className="font-black text-base text-white leading-snug">
                    {isEn ? 'Add Your Event to Roadmap' : 'Жоспарға өз іс-шараңды қос!'}
                  </h4>
                  <p className="text-xs text-white/90 leading-relaxed font-light">
                    {isEn
                      ? 'Have an idea for a debate, tournament, or charity fair? Submit it to the Parliament.'
                      : 'Мектепте қандай турнир немесе конкурс жетіспейді? Фракцияға өз ұсынысыңды жібер!'}
                  </p>
                  <Link
                    href={`/${locale}/appeals`}
                    prefetch
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                  >
                    <span>{isEn ? 'Submit Initiative' : 'Бастама жолдау'}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Card 3: Parliament Guarantee Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-sm">
                  <SchoolLogo className="w-full h-full object-contain" />
                </div>
                <div className="text-xs font-black text-slate-800">AQL Council 2026–2027</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  7 фракция • 23+ іс-шара • 100% ашықтық
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
