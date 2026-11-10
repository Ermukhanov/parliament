'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MemberItem, AssistantItem } from '@/components/TeamSection';
import SchoolLogo from '@/components/SchoolLogo';
import MemberPortrait from '@/components/MemberPortrait';

interface TeamPageClientProps {
  locale: string;
  members: MemberItem[];
}

const englishFactionData: Record<string, { ministry: string; role: string; bio: string; quote?: string }> = {
  president: {
    ministry: 'Presidium of AQL Council',
    role: 'President of School Parliament',
    bio: 'General leadership of the school parliament, representing student interests, and coordinating all 7 specialized factions.',
    quote: 'We are stronger together. The student voice is the future of our school.',
  },
  vice: {
    ministry: 'Office of the Vice-President',
    role: 'Vice-President of School Parliament',
    bio: 'Coordinating cross-faction projects, monitoring implementation, and engaging with the student community.',
    quote: 'Every student initiative matters.',
  },
  media: {
    ministry: 'Media Faction',
    role: 'Minister of Media Faction',
    bio: 'Covering school events, media projects, photo and video reports, social networks, and parliament press center.',
    quote: 'Truth, quality content, and fast information.',
  },
  volunteers: {
    ministry: 'Volunteering & Charity Faction',
    role: 'Minister of Volunteering Faction',
    bio: 'Organizing charitable initiatives, developing volunteer culture, and supporting students in need.',
    quote: 'Doing good is in everyone’s hands.',
  },
  culture: {
    ministry: 'Culture & Arts Faction',
    role: 'Minister of Culture & Arts Faction',
    bio: 'Concerts, theatrical performances, school festivals, creative workshops, and national holidays.',
    quote: 'Art inspires, culture unites.',
  },
  sport: {
    ministry: 'Sports & Health Faction',
    role: 'Minister of Sports Faction',
    bio: 'School sports championships, chess tournaments, morning exercises, and healthy living advocacy.',
    quote: 'Healthy mind, strong spirit, and victorious team.',
  },
  education: {
    ministry: 'Education & Science Faction',
    role: 'Minister of Education Faction',
    bio: 'Debate championships, intellectual tournaments, Olympiad support, and peer-to-peer tutoring.',
    quote: 'Knowledge is power and the key to bright horizons.',
  },
  it: {
    ministry: 'IT & Digitalization Faction',
    role: 'Minister of IT & Digitalization',
    bio: 'Development of the school web portal, digital tools, coding workshops, and school hackathons.',
    quote: 'Forward to the future through technology and innovation.',
  },
  discipline: {
    ministry: 'Law & Order Faction',
    role: 'Minister of Law & Order Faction',
    bio: 'School charter compliance, student rights protection, dispute mediation, and safety culture.',
    quote: 'Discipline and mutual respect form the foundation of our community.',
  },
};

export default function TeamPageClient({ locale, members }: TeamPageClientProps) {
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);

  const parseAssistants = (jsonStr?: string): AssistantItem[] => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const getLocalizedFaction = (member: MemberItem) => {
    if (locale === 'en' && member.ministry && englishFactionData[member.ministry]) {
      return englishFactionData[member.ministry].ministry;
    }
    return member.ministryNameKk || member.roleKk;
  };

  const getLocalizedRole = (member: MemberItem) => {
    if (locale === 'en' && member.ministry && englishFactionData[member.ministry]) {
      return englishFactionData[member.ministry].role;
    }
    return member.roleKk;
  };

  const getLocalizedBio = (member: MemberItem) => {
    if (locale === 'en' && member.ministry && englishFactionData[member.ministry]) {
      return englishFactionData[member.ministry].bio;
    }
    return member.bioKk;
  };

  const getLocalizedQuote = (member: MemberItem) => {
    if (locale === 'en' && member.ministry && englishFactionData[member.ministry]?.quote) {
      return englishFactionData[member.ministry].quote;
    }
    return member.quoteKk;
  };

  const president = members.find((m) => m.login === 'president') || members[0];
  const vice = members.find((m) => m.login === 'vice');
  const factionMembers = members.filter(
    (m) => m.id !== president?.id && m.id !== vice?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* 1. PAGE HEADER BANNER */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="section-kicker">
          {locale === 'en' ? 'LEADERSHIP & FACTIONS' : 'ПАРЛАМЕНТ ҚҰРАМЫ'}
        </div>
        <h1 className="section-title">
          {locale === 'en'
            ? 'President, Vice-President and 7 Factions'
            : 'Мектеп Президенті, Вице-президент және 7 фракция'}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
          {locale === 'en'
            ? 'Elected school leaders, faction ministers, and assistant teams working together to represent student voices.'
            : 'Мектептің сайланған көшбасшылары, фракция министрлері және оқушылар мүддесін қорғайтын көмекшілер тобы.'}
        </p>
      </div>

      {/* 2. DECORATIVE PRESIDIUM SECTION (PRESIDENT & VICE-PRESIDENT ON TOP) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 justify-center mb-2">
          <span className="w-10 h-0.5 bg-[#00afca]/40" />
          <span className="text-xs uppercase tracking-widest font-extrabold text-[#00afca]">
            {locale === 'en' ? 'PRESIDIUM OF AQL COUNCIL' : 'AQL COUNCIL ТӨРАЛҚАСЫ'}
          </span>
          <span className="w-10 h-0.5 bg-[#00afca]/40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Presidential Grand Honor Card */}
          {president && (
            <div
              className={`aql-card p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-[#0b1728] to-[#041624] text-white border border-[#00afca]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between ${
                vice ? 'lg:col-span-8' : 'lg:col-span-12'
              }`}
            >
              {/* Subtle background crest accent */}
              <div className="absolute right-[-30px] bottom-[-30px] w-64 h-64 opacity-5 pointer-events-none">
                <SchoolLogo className="w-full h-full object-contain" />
              </div>

              <div>
                {/* Honor Tag */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00afca] text-white text-xs font-black uppercase tracking-wider shadow-lg">
                    <span>👑</span>
                    <span>{locale === 'en' ? 'President of School Parliament' : 'Мектеп Президенті'}</span>
                  </div>
                  {president.grade && (
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-slate-300 border border-white/15">
                      {president.grade}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                  {/* President Portrait: Logo Background & Person in Front */}
                  <div className="w-36 sm:w-44 shrink-0 shadow-2xl">
                    <MemberPortrait
                      photo={president.photo}
                      name={president.nameKk}
                      aspect="portrait"
                      priority
                      className="rounded-2xl border-2 border-[#00afca]/50 shadow-2xl"
                    />
                  </div>

                  {/* President Bio & Quote */}
                  <div className="space-y-4 text-center sm:text-left flex-1">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {president.nameKk}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#38bdf8] font-bold mt-1">
                        {getLocalizedRole(president)}
                      </p>
                    </div>

                    {getLocalizedQuote(president) && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                        &ldquo;{getLocalizedQuote(president)}&rdquo;
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {getLocalizedBio(president)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-semibold">
                  {locale === 'en' ? 'Direct communication channel open' : 'Тікелей қабылдау ашық'}
                </span>
                <Link
                  href={`/${locale}/appeals`}
                  prefetch
                  className="px-5 py-2.5 rounded-full bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  {locale === 'en' ? 'Write to President →' : 'Президентке өтініш жолдау →'}
                </Link>
              </div>
            </div>
          )}

          {/* Vice-President Card */}
          {vice && (
            <div className="aql-card p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white border border-slate-200 lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00afca] text-white flex items-center gap-1 shadow-sm">
                    <span>★</span>
                    <span>{locale === 'en' ? 'Vice-President' : 'Вице-президент'}</span>
                  </span>
                  {vice.grade && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                      {vice.grade}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-32 sm:w-36 shadow-md">
                    <MemberPortrait
                      photo={vice.photo}
                      name={vice.nameKk}
                      aspect="portrait"
                      className="rounded-2xl border border-[#00afca]/40 shadow-md"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{vice.nameKk}</h3>
                    <p className="text-xs text-[#00afca] font-bold mt-0.5">
                      {getLocalizedRole(vice)}
                    </p>
                  </div>

                  {getLocalizedQuote(vice) && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      &ldquo;{getLocalizedQuote(vice)}&rdquo;
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {getLocalizedBio(vice)}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMember(vice)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center"
                >
                  {locale === 'en' ? 'Full Profile' : 'Толық ақпарат'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. 7 SPECIALIZED FACTIONS GRID */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="section-kicker">
              {locale === 'en' ? 'SPECIALIZED MINISTRIES' : 'БЕЙІНДІ МИНИСТРЛІКТЕР'}
            </div>
            <h2 className="section-title">
              {locale === 'en' ? '7 Specialized Factions' : '7 Бейінді Фракция'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {locale === 'en'
              ? 'Click any faction to view team and assistants'
              : 'Көмекшілер құрамын көру үшін фракцияны басыңыз'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {factionMembers.map((member) => {
            const factionTitle = getLocalizedFaction(member);
            const roleTitle = getLocalizedRole(member);
            const leaderName = member.nameKk;
            const assistants = parseAssistants(member.assistants);

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="aql-card p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all hover:border-[#00afca]/50 hover:shadow-lg"
              >
                <div>
                  {/* Top Faction Pill */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00afca]/10 text-[#00afca]">
                      {locale === 'en' ? 'Faction' : 'Фракция'}
                    </span>
                    {member.grade && (
                      <span className="text-[11px] font-bold text-slate-400">
                        {member.grade}
                      </span>
                    )}
                  </div>

                  {/* Portrait Frame: School Logo in Background, Person in Front */}
                  <div className="mb-4">
                    <MemberPortrait
                      photo={member.photo}
                      name={leaderName || factionTitle}
                      aspect="portrait"
                      className="rounded-2xl border border-slate-200/80 shadow-sm"
                    />
                  </div>

                  {/* Faction & Role Title */}
                  <div className="mb-3">
                    <h3 className="font-extrabold text-lg text-slate-900 leading-tight group-hover:text-[#00afca] transition-colors">
                      {factionTitle}
                    </h3>
                    <p className="text-xs text-[#00afca] font-bold mt-0.5">
                      {roleTitle}
                    </p>
                  </div>

                  {/* Leader Name */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      {locale === 'en' ? 'Minister / Head' : 'Министр'}
                    </div>
                    <div className="font-black text-sm text-slate-900 mt-0.5">
                      {leaderName || (locale === 'en' ? 'To be appointed' : 'Тағайындалуда')}
                    </div>
                  </div>

                  {/* Short Bio preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {getLocalizedBio(member)}
                  </p>

                  {/* Assistants preview badges */}
                  {assistants.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        {locale === 'en' ? 'Assistants Team:' : 'Көмекшілер тобы:'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {assistants.slice(0, 3).map((ast, i) => (
                          <span
                            key={i}
                            className="inline-block text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-700"
                          >
                            {ast.name} ({ast.grade})
                          </span>
                        ))}
                        {assistants.length > 3 && (
                          <span className="text-[10px] font-bold text-[#00afca] px-1 py-0.5">
                            +{assistants.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00afca]">
                  <span>{locale === 'en' ? 'View Details' : 'Толығырақ көру'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BIO & ASSISTANTS MODAL */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
              <div className="w-28 sm:w-32 shrink-0 shadow-lg">
                <MemberPortrait
                  photo={selectedMember.photo}
                  name={selectedMember.nameKk}
                  aspect="portrait"
                  className="rounded-2xl border border-slate-200"
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <span className="inline-block text-[10px] uppercase tracking-widest text-[#00afca] font-black px-2.5 py-0.5 rounded-full bg-[#00afca]/10 mb-1.5">
                  {getLocalizedFaction(selectedMember)}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedMember.nameKk}
                </h3>
                <p className="text-xs sm:text-sm text-[#00afca] font-bold mt-0.5">
                  {getLocalizedRole(selectedMember)}
                </p>
                {selectedMember.grade && (
                  <p className="text-xs text-slate-500 font-semibold mt-1.5">
                    {locale === 'en' ? 'Grade: ' : 'Сыныбы: '}
                    <span className="font-bold text-slate-800">{selectedMember.grade}</span>
                  </p>
                )}
              </div>
            </div>

            {getLocalizedQuote(selectedMember) && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-xs sm:text-sm text-slate-700">
                &ldquo;{getLocalizedQuote(selectedMember)}&rdquo;
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {locale === 'en' ? 'Responsibilities' : 'Негізгі бағыты'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {getLocalizedBio(selectedMember)}
                </p>
              </div>

              {parseAssistants(selectedMember.assistants).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {locale === 'en' ? 'Faction Assistants' : 'Фракция көмекшілері'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parseAssistants(selectedMember.assistants).map((ast, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800">{ast.name}</span>
                        <span className="text-slate-400 font-semibold">{ast.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/${locale}/appeals`}
                onClick={() => setSelectedMember(null)}
                className="w-full py-2.5 rounded-xl bg-[#00afca] text-white text-xs font-bold text-center hover:bg-[#0099b0] transition-colors"
              >
                {locale === 'en' ? 'Submit Petition to Faction →' : 'Осы фракцияға өтініш жолдау →'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
