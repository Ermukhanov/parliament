import prisma from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import Marquee from '@/components/Marquee';
import StatsSection from '@/components/StatsSection';
import InstagramFeed from '@/components/InstagramFeed';

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
  let nextEvent: {
    id: string;
    slug: string;
    titleRu: string;
    titleKk: string;
    category: string;
    date: Date;
    location: string;
  } | null = null;

  let pastEventsCount = 12;
  let upcomingEventsCount = 5;
  let totalTeamCount = 31;

  try {
    const now = new Date();
    nextEvent = await prisma.event.findFirst({
      where: {
        date: { gte: now },
        archived: false,
      },
      orderBy: { date: 'asc' },
    });

    pastEventsCount = await prisma.event.count({
      where: { archived: true },
    });

    upcomingEventsCount = await prisma.event.count({
      where: { archived: false },
    });

    const members = await prisma.member.findMany();
    if (members && members.length > 0) {
      totalTeamCount = members.length;
      for (const m of members) {
        try {
          const ast = JSON.parse(m.assistants || '[]');
          totalTeamCount += ast.length;
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.error('HomePage DB query error (using fallback stats):', err);
  }

  const liveStats = [
    {
      key: 'past_events',
      value: pastEventsCount,
      labelKk: 'Өткен іс-шаралар',
      labelEn: 'Past Events Hosted',
      subKk: 'Сәтті өткізілді',
      subEn: 'Successfully hosted',
    },
    {
      key: 'upcoming_events',
      value: upcomingEventsCount,
      labelKk: 'Алдағы іс-шаралар',
      labelEn: 'Upcoming Events Planned',
      subKk: 'Қараша — Желтоқсан',
      subEn: 'November — December',
    },
    {
      key: 'members',
      value: 7,
      labelKk: 'Белсенді фракциялар',
      labelEn: 'Active Factions',
      subKk: 'Барлық бағыттар',
      subEn: 'All core directions',
    },
    {
      key: 'students',
      value: totalTeamCount,
      labelKk: 'Парламент және көмекшілер',
      labelEn: 'Parliament & Assistants',
      subKk: 'Лицей көшбасшылары',
      subEn: 'Student leaders',
    },
  ];

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
      href: `/${locale}/appeals`,
      tag: '05',
      titleKk: 'Өтініштер & Ұсыныстар',
      titleEn: 'Appeals & Suggestions',
      descKk: 'Мектеп Президентіне тікелей анонимді немесе ашық түрде хат жолдау.',
      descEn: 'Direct anonymous or signed feedback to the President.',
      accent: 'from-rose-500/10 to-transparent',
    },
    {
      href: `/${locale}/news`,
      tag: '06',
      titleKk: 'Жаңалықтар & Медиа',
      titleEn: 'News & Media',
      descKk: 'Парламент жиналыстарының күнделігі және ресми фото-видео есептер.',
      descEn: 'Official council updates, meeting minutes, and media press service.',
      accent: 'from-purple-500/10 to-transparent',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <HeroSection locale={locale} nextEvent={nextEvent} />

      {/* 2. DYNAMIC TICKER */}
      <Marquee locale={locale} />

      {/* 3. DYNAMIC STATS COUNTER */}
      <StatsSection stats={liveStats} locale={locale} />

      {/* 4. INSTAGRAM FEED & REELS */}
      <InstagramFeed locale={locale} />

      {/* 5. 6 MAIN SECTIONS OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="section-kicker">
            {locale === 'en' ? 'Core Portals' : 'Негізгі бөлімдер'}
          </div>
          <h2 className="section-title">
            {locale === 'en' ? 'AQL Council Architecture' : 'Порталдың негізгі бағыттары'}
          </h2>
          <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-2xl mx-auto font-normal">
            {locale === 'en'
              ? 'Complete transparency and engagement in every sphere of school student government.'
              : 'Оқушылар өзін-өзі басқару ұйымының барлық салаларындағы ашықтық пен қолжетімділік.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              prefetch
              className="group aql-card p-6 sm:p-8 flex flex-col justify-between hover:border-[#00afca] hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-white"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.accent} rounded-bl-full pointer-events-none transition-transform group-hover:scale-125 duration-500`}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-black text-[#00afca] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    {s.tag}
                  </span>
                  <span className="text-slate-300 group-hover:text-[#00afca] group-hover:translate-x-1 transition-all duration-200 text-base">
                    →
                  </span>
                </div>
                <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-[#00afca] transition-colors mb-2">
                  {locale === 'en' ? s.titleEn : s.titleKk}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {locale === 'en' ? s.descEn : s.descKk}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#00afca]">
                <span>{locale === 'en' ? 'Open Portal' : 'Толығырақ өту'}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. PRESIDENT'S CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0b1f3f] via-[#092247] to-[#041122] text-white relative overflow-hidden border border-[#00afca]/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00afca]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00afca] px-3 py-1 rounded-full bg-white/10 border border-white/20 inline-block mb-4">
              {locale === 'en' ? 'Direct Line with President' : 'Президентпен тікелей байланыс'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">
              {locale === 'en'
                ? 'Your voice shapes our school lyceum!'
                : 'Сенің идеяң — біздің мектептің болашағы!'}
            </h2>
            <p className="text-sm sm:text-base text-slate-200 mb-6 leading-relaxed font-normal">
              {locale === 'en'
                ? 'Every initiative submitted through our portal is personally reviewed by the President and faction ministers.'
                : 'Өтініш немесе идея қалдырыңыз. Әрбір ұсыныс Президент пен фракция министрлерінің апталық жиналысында талқыланады.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/appeals`}
                prefetch
                className="px-6 py-3 rounded-xl bg-[#00afca] hover:bg-[#009bb3] text-white font-extrabold text-sm shadow-lg shadow-[#00afca]/30 transition-all hover:scale-105 active:scale-95"
              >
                {locale === 'en' ? 'Submit Appeal' : 'Өтініш жолдау'}
              </Link>
              <Link
                href={`/${locale}/team`}
                prefetch
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                {locale === 'en' ? 'Meet the Council' : 'Парламент құрамы'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
