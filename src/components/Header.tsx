'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SchoolLogo from './SchoolLogo';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    if (segments[1] === 'kk' || segments[1] === 'en') {
      segments[1] = newLocale;
      router.push(segments.join('/'));
    } else {
      router.push(`/${newLocale}${pathname}`);
    }
  };

  const navLinks = [
    { href: '#team', labelKk: 'Фракциялар', labelEn: 'Factions' },
    { href: '#events', labelKk: 'Іс-шаралар', labelEn: 'Events' },
    { href: '#timeline', labelKk: 'Жыл жоспары', labelEn: 'Annual Plan' },
    { href: '#voting', labelKk: 'Дауыс беру', labelEn: 'Voting' },
    { href: '#appeals', labelKk: 'Өтініштер', labelEn: 'Inquiries' },
    { href: '#news', labelKk: 'Медиа', labelEn: 'Media' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 pt-3 pointer-events-none animate-nav-down">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div className="bg-[#0b0f17]/95 text-white rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/20">
          {/* Brand Logo with Rounded Pill Badge */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:border-[#00afca]/50">
              <SchoolLogo className="w-full h-full object-contain" variant="white-on-blue" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                AQL Council
              </span>
              <span className="text-[9px] tracking-widest text-[#00afca] uppercase font-bold mt-0.5">
                {locale === 'en' ? 'School President' : 'Мектеп Президенті'}
              </span>
            </div>
          </Link>

          {/* Nav links in center */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link-animated text-[13px] font-medium text-slate-300 hover:text-white transition-colors"
              >
                {locale === 'en' ? link.labelEn : link.labelKk}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Minimal Language Switcher: KK / EN */}
            <div className="flex items-center bg-white/10 rounded-full p-0.5 text-[11px] font-semibold text-slate-300">
              <button
                onClick={() => switchLocale('kk')}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  locale === 'kk' ? 'bg-[#00afca] text-white' : 'hover:text-white'
                }`}
              >
                KK
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  locale === 'en' ? 'bg-[#00afca] text-white' : 'hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Public Action Button */}
            <a
              href="#appeals"
              className="text-xs font-bold px-4 py-2 rounded-full bg-[#00afca] text-white hover:bg-[#0099b0] transition-all shadow-[0_0_15px_rgba(0,175,202,0.4)]"
            >
              {locale === 'en' ? 'Submit Inquiry' : 'Өтініш жазу'}
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => switchLocale(locale === 'kk' ? 'en' : 'kk')}
              className="text-xs font-bold text-[#00afca] bg-white/10 rounded-full px-2.5 py-1"
            >
              {locale === 'kk' ? 'EN' : 'KK'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 bg-[#0b0f17] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-2 text-white">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-300 hover:text-white border-b border-white/5"
              >
                {locale === 'en' ? link.labelEn : link.labelKk}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#appeals"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs font-bold py-2.5 rounded-xl bg-[#00afca] text-white"
              >
                {locale === 'en' ? 'Submit Inquiry' : 'Өтініш жазу'}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
