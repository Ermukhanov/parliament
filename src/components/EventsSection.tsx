'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconCheck, IconClose } from './Icons';

export interface EventItem {
  id: string;
  slug: string;
  titleRu: string;
  titleKk: string;
  descRu: string;
  descKk: string;
  category: string;
  ministry?: string;
  date: string;
  location: string;
  image: string;
  maxSeats: number;
  archived: boolean;
  registrationsCount: number;
}

interface EventsSectionProps {
  locale: string;
  events: EventItem[];
}

export default function EventsSection({ locale, events }: EventsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('ALL');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [modalEvent, setModalEvent] = useState<EventItem | null>(null);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});

  const categories = [
    { key: 'ALL', labelEn: 'All Types', labelKk: 'Барлық бағыттар' },
    { key: 'Учёба', labelEn: 'Education', labelKk: 'Оқу' },
    { key: 'Культура', labelEn: 'Culture', labelKk: 'Мәдениет' },
    { key: 'Спорт', labelEn: 'Sports', labelKk: 'Спорт' },
    { key: 'Благотворительность', labelEn: 'Charity', labelKk: 'Қайырымдылық' },
  ];

  const factions = [
    { key: 'ALL', labelEn: 'All Factions', labelKk: 'Барлық фракциялар' },
    { key: 'education', labelEn: 'Bilim (Education)', labelKk: 'Білім (Bilim)' },
    { key: 'it', labelEn: 'IT & Digital', labelKk: 'IT фракциясы' },
    { key: 'sport', labelEn: 'Sports', labelKk: 'Спорт' },
    { key: 'culture', labelEn: 'Culture & Arts', labelKk: 'Өнер (Culture)' },
    { key: 'volunteers', labelEn: 'Volunteering', labelKk: 'Еріктілер' },
    { key: 'discipline', labelEn: 'Law & Order', labelKk: 'Құқық және тәртіп' },
    { key: 'media', labelEn: 'Media', labelKk: 'Медиа' },
  ];

  const factionLabels: Record<string, { kk: string; en: string }> = {
    education: { kk: 'Білім фракциясы', en: 'Education Faction' },
    it: { kk: 'IT фракциясы', en: 'IT Faction' },
    sport: { kk: 'Спорт фракциясы', en: 'Sports Faction' },
    culture: { kk: 'Өнер фракциясы', en: 'Culture Faction' },
    volunteers: { kk: 'Еріктілер фракциясы', en: 'Volunteers Faction' },
    discipline: { kk: 'Құқық және тәртіп', en: 'Law & Order' },
    media: { kk: 'Медиа фракциясы', en: 'Media Faction' },
    general: { kk: 'AQL Council', en: 'AQL Council' },
  };

  const upcomingCount = events.filter((ev) => !ev.archived).length;
  const archivedCount = events.filter((ev) => ev.archived).length;

  const filteredEvents = events.filter((ev) => {
    if (ev.archived !== showArchived) return false;
    if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) return false;
    if (selectedMinistry !== 'ALL' && ev.ministry !== selectedMinistry) return false;
    return true;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEvent) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/events/${modalEvent.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: modalEvent.id,
          name,
          grade,
          phone,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorText = data.error || (locale === 'en' ? 'Registration failed' : 'Тіркелу қатесі');
        if (res.status === 409) {
          errorText = locale === 'en' ? 'You are already registered for this event!' : 'Сіз бұл іс-шараға тіркелгенсіз!';
        } else if (res.status === 400 && data.error?.includes('seats')) {
          errorText = locale === 'en' ? 'No seats remaining' : 'Бос орындар қалмады';
        }
        setStatusMsg({ type: 'error', text: errorText });
      } else {
        setStatusMsg({
          type: 'success',
          text: locale === 'en' ? 'You have registered successfully!' : 'Сіз сәтті тіркелдіңіз!',
        });
        setLocalCounts((prev) => ({
          ...prev,
          [modalEvent.id]: (prev[modalEvent.id] ?? modalEvent.registrationsCount) + 1,
        }));
        setName('');
        setGrade('');
        setPhone('');
      }
    } catch {
      setStatusMsg({
        type: 'error',
        text: locale === 'en' ? 'Network error' : 'Желі қатесі',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="events" className="py-20 relative z-10 bg-[#f8fafc]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="section-kicker">
            {locale === 'en' ? 'School Life' : 'Мектеп өмірі'}
          </div>
          <h2 className="section-title">
            {locale === 'en' ? 'Event Calendar' : 'Іс-шаралар афишасы'}
          </h2>
        </div>

        {/* Controls: Faction Filter, Category Filter & Archive Toggle */}
        <div className="space-y-4 mb-10">
          {/* Faction Filter Pill Bar */}
          <div className="flex sm:flex-wrap items-center sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {factions.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedMinistry(f.key)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                  selectedMinistry === f.key
                    ? 'bg-[#00afca] text-white border-[#00afca] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {locale === 'en' ? f.labelEn : f.labelKk}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Type / Category + Upcoming / Past Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {locale === 'en' ? cat.labelEn : cat.labelKk}
                </button>
              ))}
            </div>

            {/* Upcoming vs Passed Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                onClick={() => setShowArchived(false)}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  !showArchived ? 'bg-white text-[#00afca] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {locale === 'en' ? 'Upcoming' : 'Алдағы'} ({upcomingCount})
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  showArchived ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {locale === 'en' ? 'Passed' : 'Өтті'} ({archivedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-14 aql-card p-8 bg-white">
            <p className="font-extrabold text-xl text-slate-800 mb-2">
              {locale === 'en'
                ? 'No events published yet'
                : 'Әзірге іс-шаралар жарияланбаған'}
            </p>
            <p className="text-sm text-slate-500">
              {locale === 'en'
                ? 'Stay tuned for upcoming school events and initiatives.'
                : 'Жақында жаңа мектеп іс-шаралары мен бастамалары жарияланады.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const currentReg = localCounts[ev.id] ?? ev.registrationsCount;
              const seatsLeft = Math.max(0, ev.maxSeats - currentReg);
              const isFull = seatsLeft <= 0;
              const eventDate = new Date(ev.date).toLocaleDateString(
                locale === 'en' ? 'en-US' : 'kk-KZ',
                { day: 'numeric', month: 'long', year: 'numeric' }
              );

              const categoryBadge = locale === 'en' ? (
                ev.category === 'Учёба' ? 'Education' :
                ev.category === 'Культура' ? 'Culture' :
                ev.category === 'Спорт' ? 'Sports' :
                ev.category === 'Благотворительность' ? 'Charity' : ev.category
              ) : (
                ev.category === 'Учёба' ? 'Оқу' :
                ev.category === 'Культура' ? 'Мәдениет' :
                ev.category === 'Спорт' ? 'Спорт' :
                ev.category === 'Благотворительность' ? 'Қайырымдылық' : ev.category
              );

              return (
                <div
                  key={ev.id}
                  className="aql-card p-6 flex flex-col justify-between bg-white group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ev.ministry && factionLabels[ev.ministry] && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#00afca] border border-sky-100">
                            {locale === 'en' ? factionLabels[ev.ministry].en : factionLabels[ev.ministry].kk}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {categoryBadge}
                        </span>
                      </div>
                      <span className="text-xs font-semibold">
                        {ev.archived ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <IconCheck className="w-3 h-3" />
                            <span>{locale === 'en' ? 'Passed' : 'Өтті'}</span>
                          </span>
                        ) : isFull ? (
                          <span className="text-rose-500 font-bold">{locale === 'en' ? 'Full' : 'Орын жоқ'}</span>
                        ) : (
                          <span className="text-slate-500">{locale === 'en' ? 'Seats:' : 'Орын:'} {seatsLeft} / {ev.maxSeats}</span>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-2 font-medium">
                      {eventDate} • {ev.location}
                    </div>

                    <Link href={`/${locale}/events/${ev.slug}`}>
                      <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-[#00afca] transition-colors mb-2.5">
                        {ev.titleKk || ev.titleRu}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-[13px] text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                      {ev.descKk || ev.descRu}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    {!ev.archived && (
                      <button
                        disabled={isFull}
                        onClick={() => {
                          setModalEvent(ev);
                          setStatusMsg(null);
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'btn-blue'
                        }`}
                      >
                        {isFull
                          ? locale === 'en'
                            ? 'Full'
                            : 'Орын жоқ'
                          : locale === 'en'
                          ? 'Register'
                          : 'Тіркелу'}
                      </button>
                    )}

                    <Link
                      href={`/${locale}/events/${ev.slug}`}
                      className="py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-center"
                    >
                      {locale === 'en' ? 'Details' : 'Толығырақ'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {modalEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={() => setModalEvent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 max-w-md w-full relative border border-slate-200 shadow-2xl"
          >
            <button
              onClick={() => setModalEvent(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 font-bold"
              aria-label="Close"
            >
              <IconClose className="w-4 h-4" />
            </button>

            <div className="text-[11px] uppercase tracking-widest text-[#00afca] mb-1 font-bold">
              {locale === 'en' ? 'Event Registration' : 'Іс-шараға тіркелу'}
            </div>
            <h3 className="font-extrabold text-2xl text-slate-900 mb-6">
              {modalEvent.titleKk || modalEvent.titleRu}
            </h3>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                name="honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                  {locale === 'en' ? 'Full Name *' : 'Аты-жөніңіз *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={locale === 'en' ? 'e.g. Alikhan Bokeikhan' : 'Мысалы: Әлихан Бөкейхан'}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                  {locale === 'en' ? 'Grade / Class *' : 'Сынып *'}
                </label>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="10A"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                  {locale === 'en' ? 'Phone (optional)' : 'Телефон (міндетті емес)'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (700) 000-00-00"
                  className="form-input"
                />
              </div>

              {statusMsg && (
                <div className="p-3 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-800">
                  {statusMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-blue py-3 text-sm uppercase tracking-wider mt-2 disabled:opacity-50"
              >
                {loading
                  ? locale === 'en'
                    ? 'Submitting...'
                    : 'Жіберілуде...'
                  : locale === 'en'
                  ? 'Confirm Registration'
                  : 'Тіркелуді растау'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
