'use client';

import { useState } from 'react';
import Link from 'next/link';
import RegistrationModal from '@/components/RegistrationModal';

interface EventDetailClientProps {
  locale: string;
  event: {
    id: string;
    slug: string;
    titleRu: string;
    titleKk: string;
    descRu: string;
    descKk: string;
    category: string;
    date: string;
    location: string;
    maxSeats: number;
    programRu: string;
    programKk: string;
    gallery: string;
    archived: boolean;
    registrationsCount: number;
  };
}

export default function EventDetailClient({
  locale,
  event: initialEvent,
}: EventDetailClientProps) {
  const [event, setEvent] = useState(initialEvent);
  const [showModal, setShowModal] = useState(false);

  const seatsLeft = Math.max(0, event.maxSeats - event.registrationsCount);
  const isFull = seatsLeft <= 0;
  const program = locale === 'kk' ? event.programKk : event.programRu;
  const programLines = program ? program.split('\n').filter(Boolean) : [];

  const handleSuccess = () => {
    setEvent((prev) => ({
      ...prev,
      registrationsCount: prev.registrationsCount + 1,
    }));
    setShowModal(false);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 bg-[#ffffff] text-[#00afca]">
      <div>
        <Link
          href={`/${locale}#events`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#00afca] hover:underline"
        >
          <span>←</span>
          <span>{locale === 'en' ? 'Back to all events' : 'Барлық іс-шараларға қайту'}</span>
        </Link>
      </div>

      <div className="rounded-2xl p-6 sm:p-10 space-y-6 bg-[#ffffff] border-2 border-[#00afca]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00afca] text-[#ffffff]">
            {event.category}
          </span>

          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border-2 border-[#00afca] text-[#00afca]">
            {event.archived
              ? locale === 'en'
                ? 'Past Event'
                : 'Өткізілген оқиға'
              : isFull
              ? locale === 'en'
                ? 'Fully Booked'
                : 'Орын жоқ'
              : locale === 'en'
              ? `${seatsLeft} seats left`
              : `${seatsLeft} бос орын бар`}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#00afca]">
          {event.titleKk || event.titleRu}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-[#00afca] text-xs sm:text-sm text-[#00afca]">
          <div>
            <div className="text-[10px] uppercase font-bold">
              {locale === 'en' ? 'Date & Time' : 'Күні мен уақыты'}
            </div>
            <div className="font-bold">
              {new Date(event.date).toLocaleString(locale === 'en' ? 'en-US' : 'kk-KZ')}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold">
              {locale === 'en' ? 'Location' : 'Өтетін орны'}
            </div>
            <div className="font-bold">{event.location}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold">
              {locale === 'en' ? 'Capacity' : 'Сыйымдылық'}
            </div>
            <div className="font-bold">
              {event.registrationsCount} / {event.maxSeats}
            </div>
          </div>
        </div>

        {!event.archived && (
          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              disabled={isFull}
              className={`w-full sm:w-auto px-8 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold rounded-full border-2 border-[#00afca] transition-colors ${
                isFull
                  ? 'bg-[#ffffff] text-[#00afca] opacity-50 cursor-not-allowed'
                  : 'bg-[#00afca] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#00afca]'
              }`}
            >
              {isFull
                ? locale === 'en'
                  ? 'No seats remaining'
                  : 'Орын қалмады'
                : locale === 'en'
                ? 'Register for Event'
                : 'Іс-шараға жазылу'}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6 sm:p-8 space-y-4 bg-[#ffffff] border-2 border-[#00afca]">
        <h2 className="font-serif text-2xl font-bold text-[#00afca]">
          {locale === 'en' ? 'Event Overview' : 'Іс-шара сипаттамасы'}
        </h2>
        <p className="text-sm sm:text-base text-[#00afca] leading-relaxed whitespace-pre-line">
          {event.descKk || event.descRu}
        </p>

        {programLines.length > 0 && (
          <div className="pt-6 border-t-2 border-[#00afca] space-y-3">
            <h3 className="font-serif text-xl font-bold text-[#00afca]">
              {locale === 'en' ? 'Event Schedule' : 'Бағдарлама кестесі'}
            </h3>
            <div className="space-y-2">
              {programLines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#ffffff] border border-[#00afca] text-xs sm:text-sm text-[#00afca] font-medium"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <RegistrationModal
          locale={locale}
          event={event}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
