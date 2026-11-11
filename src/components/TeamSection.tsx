'use client';

import { useState } from 'react';
import MemberPortrait from './MemberPortrait';

export interface AssistantItem {
  name: string;
  grade: string;
  role?: string;
}

export interface MemberItem {
  id: string;
  login?: string;
  ministry?: string;
  ministryNameRu?: string;
  ministryNameKk?: string;
  nameRu: string;
  nameKk: string;
  grade?: string;
  roleRu: string;
  roleKk: string;
  quoteRu: string;
  quoteKk: string;
  bioRu: string;
  bioKk: string;
  assistants?: string; // JSON string
  photo: string;
}

interface TeamSectionProps {
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
  law: {
    ministry: 'Law & Order Faction',
    role: 'Minister of Law & Order Faction',
    bio: 'School charter compliance, student rights protection, dispute mediation, and safety culture.',
    quote: 'Discipline and mutual respect form the foundation of our community.',
  },
};

export default function TeamSection({ locale, members }: TeamSectionProps) {
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

  return (
    <section id="team" className="py-20 relative z-10 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="section-kicker">
            {locale === 'en' ? 'Parliament Members' : 'Парламент құрамы'}
          </div>
          <h2 className="section-title">
            {locale === 'en' ? 'President, Vice-President and 7 Factions' : 'Президент, Вице-президент және 7 фракция'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-normal">
            {locale === 'en'
              ? 'AQL Council leadership, faction ministers, and assistant teams.'
              : 'AQL Council басшылығы, министрлері және фракция көмекшілері.'}
          </p>
        </div>

        {/* Grid of factions and leadership */}
        {members.length === 0 ? (
          <div className="text-center py-12 aql-card p-8">
            <p className="text-slate-700 font-bold text-lg">
              {locale === 'en' ? 'Roster is empty' : 'Тізім бос'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => {
              const factionTitle = getLocalizedFaction(member);
              const roleTitle = getLocalizedRole(member);
              const leaderName = member.nameKk;
              const hasAssignedLeader = Boolean(leaderName && leaderName.trim().length > 0);
              const isPresident = member.login === 'president';
              const isVice = member.login === 'vice';
              const isLeadership = isPresident || isVice;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`aql-card p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all ${
                    isLeadership ? 'border-slate-300 shadow-md bg-gradient-to-b from-slate-50/70 to-white' : ''
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    {isPresident ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1 shadow-sm">
                        <span>👑</span> {locale === 'en' ? 'President' : 'Президент'}
                      </span>
                    ) : isVice ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00afca] text-white flex items-center gap-1 shadow-sm">
                        <span>★</span> {locale === 'en' ? 'Vice-President' : 'Вице-президент'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {locale === 'en' ? 'Faction' : 'Фракция'}
                      </span>
                    )}
                  </div>

                  <div>
                    {/* Portrait Frame: School Logo in Background, Person in Front */}
                    <div className="mb-4">
                      <MemberPortrait
                        photo={member.photo}
                        name={leaderName || roleTitle}
                        aspect="portrait"
                        className="rounded-2xl border border-slate-200/80 shadow-sm"
                      />
                    </div>

                    {/* Faction & Role Titles */}
                    <div className="mb-3">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-[#00afca]">
                        {factionTitle}
                      </div>
                      <div className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                        {roleTitle}
                      </div>
                    </div>

                    {/* Minister / President Name */}
                    <div className="mb-4">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                        {isLeadership
                          ? locale === 'en' ? 'Leader:' : 'Тұлға:'
                          : locale === 'en' ? 'Minister (Head):' : 'Министр (Жетекшісі):'}
                      </div>
                      {hasAssignedLeader ? (
                        <div className="font-extrabold text-lg text-slate-900 flex items-center flex-wrap gap-2">
                          <span>{leaderName}</span>
                          {member.grade ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#00afca]/10 text-[#00afca] border border-[#00afca]/20">
                              {member.grade}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-slate-400">
                          {locale === 'en' ? 'Unassigned' : 'Тағайындалмаған'}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
                      {getLocalizedBio(member)}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00afca]">
                    <span className="group-hover:underline">{locale === 'en' ? 'More Details' : 'Толығырақ'}</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={() => setSelectedMember(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-content-pop bg-[#ffffff] rounded-2xl p-6 sm:p-8 max-w-lg w-full relative border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:rotate-90 transition-all duration-200 font-bold"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="w-24 sm:w-28 shrink-0 shadow-md">
                <MemberPortrait
                  photo={selectedMember.photo}
                  name={selectedMember.nameKk}
                  aspect="portrait"
                  className="rounded-2xl border border-slate-200"
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="text-xs uppercase tracking-widest text-[#00afca] font-bold mb-1">
                  {getLocalizedFaction(selectedMember)}
                </div>
                <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900">
                  {getLocalizedRole(selectedMember)}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              {/* Minister Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  {selectedMember.login === 'president' || selectedMember.login === 'vice'
                    ? locale === 'en' ? 'Full Name:' : 'Аты-жөні:'
                    : locale === 'en' ? 'Minister (Head):' : 'Министр (Жетекшісі):'}
                </div>
                <div className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>{selectedMember.nameKk || '—'}</span>
                  {selectedMember.grade ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#00afca] text-white">
                      {selectedMember.grade}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Assistants List in Modal */}
              {parseAssistants(selectedMember.assistants).length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-2">
                    <span>👥</span>
                    <span>{locale === 'en' ? 'Faction Assistants:' : 'Фракция көмекшілері:'}</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {parseAssistants(selectedMember.assistants).map((ast, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs text-slate-800 font-medium hover:translate-x-1 transition-transform"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00afca]" />
                          <span>{ast.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold text-[11px]">
                          {ast.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {getLocalizedQuote(selectedMember) && (
                <blockquote className="p-4 rounded-xl bg-slate-50 border-l-4 border-[#00afca] italic font-medium text-slate-700">
                  «{getLocalizedQuote(selectedMember)}»
                </blockquote>
              )}

              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  {locale === 'en' ? 'Goals & Directions:' : 'Міндеттері мен бағыты:'}
                </div>
                <p className="leading-relaxed text-slate-600 text-xs sm:text-sm">
                  {getLocalizedBio(selectedMember)}
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <a
                  href="#appeals"
                  onClick={() => setSelectedMember(null)}
                  className="px-6 py-2.5 rounded-full bg-[#00afca] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0099b0] transition-colors"
                >
                  {locale === 'en' ? 'Submit Inquiry' : 'Өтініш жазу'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
