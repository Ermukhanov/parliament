'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NextEvent {
  id: string;
  slug: string;
  titleRu: string;
  titleKk: string;
  date: string;
  location: string;
}

interface HeroSectionProps {
  locale: string;
  nextEvent: NextEvent | null;
  eventSummary?: { past: number; upcoming: number };
}

export default function HeroSection({ locale, nextEvent, eventSummary }: HeroSectionProps) {
  const [emailOrName, setEmailOrName] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!nextEvent) return;

    const targetDate = new Date(nextEvent.date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrName.trim()) return;
    setSubscribed(true);
  };

  const timeBlocks = [
    { value: timeLeft.days, labelKk: 'Күн', labelEn: 'Days' },
    { value: timeLeft.hours, labelKk: 'Сағат', labelEn: 'Hours' },
    { value: timeLeft.minutes, labelKk: 'Минут', labelEn: 'Min' },
    { value: timeLeft.seconds, labelKk: 'Секунд', labelEn: 'Sec' },
  ];

  const filterTags = [
    { labelKk: 'Барлық 7 фракция', labelEn: 'All 7 Factions', href: `/${locale}/team` },
    { labelKk: 'IT & Цифрландыру', labelEn: 'IT & Digital', href: `/${locale}/team` },
    { labelKk: 'Мәдениет & Өнер', labelEn: 'Culture & Arts', href: `/${locale}/team` },
    { labelKk: 'Спорт', labelEn: 'Sports', href: `/${locale}/team` },
    { labelKk: 'Еріктілер & Қайырымдылық', labelEn: 'Volunteering', href: `/${locale}/team` },
    { labelKk: 'Құқық & Тәртіп', labelEn: 'Law & Order', href: `/${locale}/team` },
    { labelKk: 'Медиа', labelEn: 'Media', href: `/${locale}/team` },
    { labelKk: 'Білім', labelEn: 'Education', href: `/${locale}/team` },
  ];

  return (
    <section className="relative pt-24 sm:pt-28 pb-16 bg-[#ffffff] overflow-hidden">
      {/* Floating Decorative Badges on Large Screens */}
      <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-lg absolute top-36 left-[6%] xl:left-[10%] animate-float-slow pointer-events-none z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#00afca] animate-pulse-ring" />
        <span className="text-xs font-extrabold text-slate-800 tracking-tight">
          {locale === 'en' ? '7 Active Factions' : '7 Белсенді Фракция'}
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white shadow-xl absolute top-56 right-[6%] xl:right-[10%] animate-float-reverse pointer-events-none z-10">
        <span className="text-[#00afca] text-sm">👑</span>
        <span className="text-xs font-bold tracking-tight">
          AQL Council • 2025–2026
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Handwritten script eyebrow with burst marks */}
        <div className="inline-flex items-center gap-2 mb-2 animate-entrance relative">
          <span className="hand-accent text-2xl sm:text-3xl text-[#00afca]">
            {locale === 'en' ? 'School President Portal' : 'Мектеп Президентінің ресми порталы'}
          </span>
          <svg className="w-6 h-6 text-[#00afca] -mt-3 hidden sm:block animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="19" y1="5" x2="16" y2="8" />
            <line x1="22" y1="12" x2="18" y2="12" />
          </svg>
        </div>

        {/* Big Bold Headline */}
        <div className="relative mb-6">
          <h1 className="font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-[-0.035em] text-[#0f172a] leading-[1.08] animate-entrance-delay-1">
            {locale === 'en' ? (
              <>
                School President <br />
                <span className="relative inline-block mt-1">
                  AQL Council
                  <svg className="absolute -bottom-3 left-0 w-full h-4 text-[#00afca] overflow-visible" viewBox="0 0 300 20" fill="none">
                    <path className="animate-draw-stroke" d="M5 14 Q 150 4, 295 12" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            ) : (
              <>
                Мектеп Президенті <br />
                <span className="relative inline-block mt-1">
                  AQL Council
                  <svg className="absolute -bottom-3 left-0 w-full h-4 text-[#00afca] overflow-visible" viewBox="0 0 300 20" fill="none">
                    <path className="animate-draw-stroke" d="M5 14 Q 150 4, 295 12" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            )}
          </h1>
        </div>

        {/* Clean Subtitle text */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 mb-8 font-normal leading-relaxed animate-entrance-delay-2">
          {locale === 'en'
            ? 'President, Vice President and 7 specialized factions: the open platform where students lead, innovate, and shape school community together.'
            : 'Президент, вице-президент және 7 негізгі фракция: мектеп өмірін бірлесе дамытып, оқушылардың идеяларын жүзеге асыратын цифрлық кеңістік.'}
        </p>

        {/* Action Buttons to Dedicated Pages */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10 animate-entrance-delay-2">
          <Link
            href={`/${locale}/events`}
            prefetch
            className="px-6 py-3 rounded-full bg-[#00afca] text-white font-bold text-sm hover:bg-[#0099b0] transition-all shadow-[0_4px_20px_rgba(0,175,202,0.35)] hover:-translate-y-0.5 active:scale-95"
          >
            {locale === 'en' ? 'Upcoming Events →' : 'Іс-шаралар афишасы →'}
          </Link>
          <Link
            href={`/${locale}/vote`}
            prefetch
            className="px-6 py-3 rounded-full bg-[#0f172a] text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            {locale === 'en' ? 'Student Voting' : 'Ашық дауыс беру'}
          </Link>
          <Link
            href={`/${locale}/appeals`}
            prefetch
            className="px-6 py-3 rounded-full bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            {locale === 'en' ? 'Submit Inquiry' : 'Өтініш жолдау'}
          </Link>
        </div>

        {/* Search / Subscribe Input Bar Pill */}
        <div className="max-w-xl mx-auto mb-10 animate-entrance-delay-2">
          {subscribed ? (
            <div className="p-3.5 rounded-full bg-slate-100 text-slate-800 text-sm font-semibold border border-slate-200 animate-entrance">
              {locale === 'en' ? 'Thank you! You are subscribed to parliament news.' : 'Рақмет! Сіз фракциялар жаңалықтарына қосылдыңыз.'}
            </div>
          ) : (
            <form onSubmit={handleQuickJoin} className="flex flex-col sm:flex-row items-center gap-2 p-1.5 sm:p-2 bg-white rounded-2xl sm:rounded-full border border-slate-200 shadow-sm hover:border-[#00afca]/50 hover:shadow-md transition-all duration-300">
              <input
                type="text"
                value={emailOrName}
                onChange={(e) => setEmailOrName(e.target.value)}
                placeholder={locale === 'en' ? 'Your name or class...' : 'Аты-жөніңіз немесе сыныбыңыз...'}
                className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0b0f17] text-white text-xs sm:text-sm font-bold tracking-tight hover:bg-[#00afca] hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap shadow-sm"
              >
                {locale === 'en' ? 'Join In' : 'Қосылу'}
              </button>
            </form>
          )}
        </div>

        {/* Horizontal Category Pill Filter Bar Linking to Team */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 animate-entrance-delay-3">
          {filterTags.map((tag, i) => (
            <Link
              key={i}
              href={tag.href}
              prefetch
              style={{ animationDelay: `${300 + i * 55}ms` }}
              className="animate-entrance px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold bg-[#f1f5f9] text-slate-600 hover:bg-[#00afca] hover:text-white hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              {locale === 'en' ? tag.labelEn : tag.labelKk}
            </Link>
          ))}
        </div>

        {/* Upcoming Event Timer Card */}
        {nextEvent && (
          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-[#ffffff] border border-slate-200 shadow-sm animate-entrance-delay-3">
            {eventSummary && (
              <div className="flex items-center justify-center gap-2.5 mb-4 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {locale === 'en' ? `✅ ${eventSummary.past} Passed` : `✅ Өткені: ${eventSummary.past}`}
                </span>
                <span className="px-3 py-1 rounded-full bg-sky-50 text-[#00afca] border border-sky-200">
                  {locale === 'en' ? `📅 ${eventSummary.upcoming} Upcoming` : `📅 Алдағы: ${eventSummary.upcoming}`}
                </span>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00afca] animate-pulse" />
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                {locale === 'en' ? 'Upcoming event in:' : 'Келесі іс-шараға дейін:'}
              </span>
            </div>
            <Link
              href={`/${locale}/events/${nextEvent.slug}`}
              prefetch
              className="inline-block font-extrabold text-xl text-[#0f172a] hover:text-[#00afca] transition-colors mb-4"
            >
              {nextEvent.titleKk || nextEvent.titleRu}
            </Link>

            <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
              {timeBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center"
                >
                  <span className="font-extrabold text-xl sm:text-2xl text-[#0f172a] tabular-nums">
                    {String(block.value).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5 font-bold">
                    {locale === 'en' ? block.labelEn : block.labelKk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
