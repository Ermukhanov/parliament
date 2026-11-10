import prisma from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import Marquee from '@/components/Marquee';
import StatsSection from '@/components/StatsSection';

export const revalidate = 0;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Home | School President Portal' : 'Басты бет | Мектеп Президентінің Порталы',
    description: isEn
      ? 'AQL Council — Official School President and Student Parliament Portal.'
      : 'AQL Council — Мектеп Президенті мен Парламентінің ресми порталы.',
  };
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const now = new Date();

  const nextEvent = await prisma.event.findFirst({
    where: {
      date: { gte: now },
      archived: false,
    },
    orderBy: { date: 'asc' },
  });

  const stats = await prisma.stat.findMany();

  const sections = [
    {
      href: `/${locale}/team`,
      tag: '01',
      titleKk: 'Парламент Құрамы',
      titleEn: 'Parliament Council',
      descKk: 'Мектеп Президенті, Вице-президент және 7 бейінді фракция министрлері.',
      descEn: 'School President, Vice-President and 7 specialized faction ministers.',
      accent: 'from-[#00afca]/10 to-transparent',
    },
    {
      href: `/${locale}/events`,
      tag: '02',
      titleKk: 'Іс-шаралар Афишасы',
      titleEn: 'Events Board',
      descKk: 'Алдағы форумдар, турнирлер, концерттер және онлайн жазылу.',
      descEn: 'Upcoming forums, tournaments, concerts and online event registration.',
      accent: 'from-amber-500/10 to-transparent',
    },
    {
      href: `/${locale}/plan`,
      tag: '03',
      titleKk: 'Жыл Жоспары',
      titleEn: 'Annual Roadmap',
      descKk: 'Қыркүйектен мамырға дейінгі ай сайынғы негізгі мақсаттар мен күнтізбе.',
      descEn: 'Monthly milestones and roadmap from September to May.',
      accent: 'from-indigo-500/10 to-transparent',
    },
    {
      href: `/${locale}/vote`,
      tag: '04',
      titleKk: 'Ашық Дауыс Беру',
      titleEn: 'Student Voting',
      descKk: 'Мектептегі маңызды бастамалар бойынша дауыс беру және өз ұсынысыңды енгізу.',
      descEn: 'Direct voting on active school questions and submitting initiatives.',
      accent: 'from-emerald-500/10 to-transparent',
    },
    {
      href: `/${locale}/news`,
      tag: '05',
      titleKk: 'Жаңалықтар & Медиа',
      titleEn: 'News & Media',
      descKk: 'Фракциялардың ресми жаңалықтары, есептері мен фотохроникасы.',
      descEn: 'Official announcements, meeting chronicles, and media press service.',
      accent: 'from-sky-500/10 to-transparent',
    },
    {
      href: `/${locale}/appeals`,
      tag: '06',
      titleKk: 'Өтініштер Жолдау',
      titleEn: 'Direct Inquiries',
      descKk: 'Президент пен 7 фракцияға тікелей ұсыныс беру, сұрақ қою немесе командаға қосылу.',
      descEn: 'Direct channel for student petitions, questions, and faction applications.',
      accent: 'from-rose-500/10 to-transparent',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <HeroSection
        locale={locale}
        nextEvent={
          nextEvent
            ? {
                id: nextEvent.id,
                slug: nextEvent.slug,
                titleRu: nextEvent.titleRu,
                titleKk: nextEvent.titleKk,
                date: nextEvent.date.toISOString(),
                location: nextEvent.location,
              }
            : null
        }
      />

      {/* 2. MARQUEE STRIP */}
      <Marquee locale={locale} />

      {/* 3. MULTI-PAGE DIRECTORY PORTAL CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="section-kicker">
              {locale === 'en' ? 'PORTAL DIRECTORY' : 'ПОРТАЛ БӨЛІМДЕРІ'}
            </div>
            <h2 className="section-title">
              {locale === 'en' ? 'Parliament Architecture' : 'Парламенттің Негізгі Бағыттары'}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {locale === 'en' ? 'Navigate to full page →' : 'Толық бетке өту үшін таңдаңыз →'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((sec) => (
            <Link
              key={sec.href}
              href={sec.href}
              prefetch
              className={`aql-card p-6 flex flex-col justify-between group relative overflow-hidden bg-gradient-to-br ${sec.accent}`}
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-[#00afca] transition-colors">
                    /{sec.tag}
                  </span>
                  <span className="text-sm font-bold text-[#00afca] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-2 group-hover:text-[#00afca] transition-colors">
                  {locale === 'en' ? sec.titleEn : sec.titleKk}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {locale === 'en' ? sec.descEn : sec.descKk}
                </p>
              </div>

              <div className="mt-6 pt-3 flex items-center gap-1.5 text-xs font-bold text-[#00afca]">
                <span>{locale === 'en' ? 'Open Page' : 'Бетті ашу'}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatsSection locale={locale} stats={stats} />
      </section>
    </div>
  );
}
