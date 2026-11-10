'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import KazakhEagleWatermark from './KazakhEagleWatermark';
import SchoolLogo from './SchoolLogo';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const lower = searchQuery.toLowerCase();
    let target = 'events';
    if (lower.includes('событ') || lower.includes('іс-шара') || lower.includes('меропр') || lower.includes('афиш')) {
      target = 'events';
    } else if (lower.includes('голос') || lower.includes('дауыс') || lower.includes('опрос')) {
      target = 'vote';
    } else if (lower.includes('обращ') || lower.includes('өтініш') || lower.includes('жалоб')) {
      target = 'appeals';
    } else if (lower.includes('фракц') || lower.includes('команд') || lower.includes('презид')) {
      target = 'team';
    } else if (lower.includes('план') || lower.includes('жоспар')) {
      target = 'plan';
    } else if (lower.includes('новост') || lower.includes('жаңалық') || lower.includes('медиа')) {
      target = 'news';
    }

    router.push(`/${locale}/${target}`);
  };

  return (
    <footer className="relative overflow-hidden bg-[#181a1f] text-white pt-16 pb-12 font-sans select-none border-t border-[#2a2d36]">
      {/* Authentic Kazakh Steppe Eagle & Sun Watermark */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden flex items-center justify-end animate-float-slow">
        <KazakhEagleWatermark className="w-[880px] h-auto text-white opacity-[0.08] translate-x-[12%] -translate-y-[6%]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Header with Crest & Search Pill matching reference bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-14 pb-8 border-b border-white/10">
          <Link href={`/${locale}`} prefetch className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <SchoolLogo className="w-full h-full object-contain" variant="white-on-blue" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-white leading-none">
                AQL Council
              </div>
              <div className="text-[10px] tracking-widest text-[#00afca] uppercase font-bold mt-1">
                {locale === 'en' ? 'School President' : 'Мектеп Президенті'}
              </div>
            </div>
          </Link>

          {/* Search Pill */}
          <form
            onSubmit={handleSearch}
            className="w-full md:w-auto md:min-w-[420px] bg-white rounded-full flex items-center p-1 pl-5 shadow-lg focus-within:ring-2 focus-within:ring-[#00afca]"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === 'en'
                  ? 'Search factions, events, voting and news...'
                  : 'Фракциялар, іс-шаралар мен дауыс беруді іздеу...'
              }
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-xs sm:text-sm font-normal outline-none"
            />
            <button
              type="submit"
              className="bg-[#00afca] hover:bg-[#009bb3] active:scale-95 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all tracking-wide"
            >
              {locale === 'en' ? 'Search' : 'Табу'}
            </button>
          </form>
        </div>

        {/* 3-Column Directory Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
          {/* Column 1: Info & Links */}
          <div className="md:col-span-4 space-y-7">
            <div>
              <h3 className="text-white text-base font-semibold tracking-wide mb-3">
                {locale === 'en' ? 'AQL School Parliament' : 'AQL Мектеп Парламенті'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {locale === 'en'
                  ? 'Official self-government body representing student voices, school development projects, and organizing student life.'
                  : 'Оқушылар бастамасын, мектеп дамуын және белсенді өмірін қолдайтын оқушылар өзін-өзі басқару ұйымы.'}
              </p>
            </div>

            <div>
              <h3 className="text-white text-base font-semibold tracking-wide mb-3">
                {locale === 'en' ? 'Student Inquiries & Reception' : 'Кері байланыс және қабылдау'}
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link href={`/${locale}/appeals`} prefetch className="hover:text-white transition-colors">
                    {locale === 'en' ? 'Submit an Idea or Question' : 'Ұсыныс немесе сауал жіберу'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/appeals`} prefetch className="hover:text-white transition-colors">
                    {locale === 'en' ? 'Join a Faction Team' : 'Фракция командасына қосылу'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/appeals`} prefetch className="hover:text-white transition-colors">
                    {locale === 'en' ? 'Anonymous Petition' : 'Анонимді өтініш беру'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: 7 Factions Directory */}
          <div className="md:col-span-5 space-y-7">
            <div>
              <h3 className="text-white text-base font-semibold tracking-wide mb-3 flex items-center gap-2">
                <span>{locale === 'en' ? '7 School Factions' : '7 Мектеп Фракциясы'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300">
                <Link href={`/${locale}/team`} prefetch className="hover:text-white transition-colors">
                  {locale === 'en' ? 'IT & Digital' : 'IT және цифрландыру'}
                </Link>
                <Link href={`/${locale}/team`} prefetch className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Culture & Arts' : 'Мәдениет және өнер'}
                </Link>
                <Link href={`/${locale}/team`} prefetch className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Sports Faction' : 'Спорт фракциясы'}
                </Link>
                <Link href={`/${locale}/team`} prefetch className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Volunteering & Charity' : 'Еріктілер & қайырымдылық'}
                </Link>
                <Link href={`/${locale}/team`} prefetch className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Law & Order' : 'Құқық және тәртіп'}
                </Link>
                <Link href={`/${locale}/team`} prefetch className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Media Faction' : 'Медиа фракциясы'}
                </Link>
                <Link href={`/${locale}/team`} prefetch className="hover:text-white transition-colors sm:col-span-2">
                  {locale === 'en' ? 'Education Faction' : 'Білім фракциясы'}
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-white text-base font-semibold tracking-wide mb-3">
                {locale === 'en' ? 'Projects & Voting' : 'Бастамалар мен дауыс беру'}
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link href={`/${locale}/vote`} prefetch className="hover:text-white transition-colors">
                    {locale === 'en' ? 'School-wide Voting' : 'Ашық мектептік дауыс беру'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/vote`} prefetch className="hover:text-white transition-colors">
                    {locale === 'en' ? 'Propose an Event' : 'Өз идеяңды ұсыну'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/news`} prefetch className="hover:text-white transition-colors">
                    {locale === 'en' ? 'Parliament Press Service' : 'Парламент баспасөз қызметі'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-white text-base font-semibold tracking-wide mb-3">
              {locale === 'en' ? 'Sections' : 'Бөлімдер'}
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <Link href={`/${locale}/events`} prefetch className="hover:text-[#00afca] transition-colors block">
                  {locale === 'en' ? 'Events Board' : 'Іс-шаралар афишасы'}
                </Link>
              </div>
              <div>
                <Link href={`/${locale}/team`} prefetch className="hover:text-[#00afca] transition-colors block">
                  {locale === 'en' ? 'Faction Leadership' : 'Фракциялар құрамы'}
                </Link>
              </div>
              <div>
                <Link href={`/${locale}/plan`} prefetch className="hover:text-[#00afca] transition-colors block">
                  {locale === 'en' ? 'Academic Calendar' : 'Оқу жылының күнтізбесі'}
                </Link>
              </div>
              <div>
                <Link href={`/${locale}/news`} prefetch className="hover:text-[#00afca] transition-colors block">
                  {locale === 'en' ? 'School Media' : 'Мектеп жаңалықтары'}
                </Link>
              </div>
              <div>
                <Link href={`/${locale}/appeals`} prefetch className="hover:text-[#00afca] transition-colors block">
                  {locale === 'en' ? 'Submit Inquiry' : 'Өтініш беру'}
                </Link>
              </div>
              <div>
                <Link href={`/${locale}/vote`} prefetch className="hover:text-[#00afca] transition-colors block">
                  {locale === 'en' ? 'Open Voting' : 'Ашық дауыс беру'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Bottom Border Line */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            <Link href="/admin" className="cursor-default text-slate-400 hover:text-slate-300 transition-colors" aria-label="Copyright">
              ©
            </Link>{' '}
            {new Date().getFullYear()} AQL Council •{' '}
            {locale === 'en' ? 'School President' : 'Мектеп Президенті'}
          </div>
          <div className="text-[11px] text-slate-400 tracking-wider">
            {locale === 'en'
              ? 'Official Student Self-Government Portal'
              : 'Оқушылардың өзін-өзі басқару ресми порталы'}
          </div>
        </div>
      </div>
    </footer>
  );
}
