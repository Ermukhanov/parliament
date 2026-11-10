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
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'kk' || segments[0] === 'en') {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const currentHash = typeof window !== 'undefined' ? window.location.hash : '';
    router.push(`/${segments.join('/')}${currentHash}`);
  };

  const navLinks = [
    { href: `/${locale}`, labelKk: 'Басты бет', labelEn: 'Home', exact: true },
    { href: `/${locale}/team`, labelKk: 'Парламент', labelEn: 'Parliament' },
    { href: `/${locale}/events`, labelKk: 'Іс-шаралар', labelEn: 'Events' },
    { href: `/${locale}/plan`, labelKk: 'Жыл жоспары', labelEn: 'Plan' },
    { href: `/${locale}/vote`, labelKk: 'Дауыс беру', labelEn: 'Voting' },
    { href: `/${locale}/news`, labelKk: 'Жаңалықтар', labelEn: 'News' },
    { href: `/${locale}/appeals`, labelKk: 'Өтініштер', labelEn: 'Inquiries' },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href || pathname === `/${locale}`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 pt-3 pointer-events-none animate-nav-down">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div className="bg-[#0b0f17]/95 text-white rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/20">
          {/* Brand Logo with Rounded Pill Badge */}
          <Link href={`/${locale}`} prefetch className="flex items-center gap-3 group">
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

          {/* Desktop Nav links with Active Route Indicator */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  className={`text-[13px] font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-[#00afca] text-white shadow-[0_0_12px_rgba(0,175,202,0.5)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {locale === 'en' ? link.labelEn : link.labelKk}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Minimal Language Switcher: KK / EN */}
            <div className="flex items-center bg-white/10 rounded-full p-0.5 text-[11px] font-semibold text-slate-300 border border-white/10">
              <button
                type="button"
                onClick={() => switchLocale('kk')}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  locale === 'kk' ? 'bg-[#00afca] text-white' : 'hover:text-white'
                }`}
              >
                KK
              </button>
              <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  locale === 'en' ? 'bg-[#00afca] text-white' : 'hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Direct Inquiry Route */}
            <Link
              href={`/${locale}/appeals`}
              prefetch
              className="text-xs font-bold px-4 py-2 rounded-full bg-[#00afca] text-white hover:bg-[#0099b0] transition-all shadow-[0_0_15px_rgba(0,175,202,0.4)] active:scale-95"
            >
              {locale === 'en' ? 'Submit Inquiry' : 'Өтініш жазу'}
            </Link>
          </div>

          {/* Mobile menu controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => switchLocale(locale === 'kk' ? 'en' : 'kk')}
              className="text-xs font-bold text-[#00afca] bg-white/10 rounded-full px-2.5 py-1"
            >
              {locale === 'kk' ? 'EN' : 'KK'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="lg:hidden mt-2 bg-[#0b0f17]/98 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-1 text-white backdrop-blur-xl">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#00afca] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {locale === 'en' ? link.labelEn : link.labelKk}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10 mt-2 flex flex-col gap-2">
              <Link
                href={`/${locale}/appeals`}
                prefetch
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs font-bold py-2.5 rounded-xl bg-[#00afca] text-white"
              >
                {locale === 'en' ? 'Submit Inquiry' : 'Өтініш жазу'}
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs font-semibold py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {locale === 'en' ? 'Admin Portal' : 'Басқару панелі'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
