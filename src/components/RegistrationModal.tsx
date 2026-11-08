'use client';

import { useState } from 'react';

interface RegistrationModalProps {
  locale: string;
  event: {
    id: string;
    titleRu: string;
    titleKk: string;
    date: string;
    location: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrationModal({
  locale,
  event,
  onClose,
  onSuccess,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    phone: '',
    honeypot: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.honeypot) {
      setIsSuccess(true);
      return;
    }

    if (!formData.name.trim() || !formData.grade.trim()) {
      setError(
        locale === 'en'
          ? 'Please enter your full name and class'
          : 'Барлық міндетті өрістерді толтырыңыз'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          name: formData.name.trim(),
          grade: formData.grade.trim(),
          phone: formData.phone.trim(),
          honeypot: formData.honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            (locale === 'en' ? 'Registration failed' : 'Тіркелу кезінде қате кетті')
        );
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (locale === 'en' ? 'Error' : 'Қате'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="relative w-full max-w-md rounded-2xl bg-[#ffffff] border-2 border-[#00afca] p-6 sm:p-8 space-y-6 text-[#00afca]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-[#00afca] text-[#00afca] hover:bg-[#00afca] hover:text-[#ffffff] font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <div>
          <div className="text-xs uppercase tracking-widest text-[#00afca] font-bold">
            {locale === 'en' ? 'Event Registration' : 'Іс-шараға жазылу'}
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#00afca] mt-1">
            {event.titleKk || event.titleRu}
          </h3>
          <p className="text-xs text-[#00afca] mt-1 font-semibold">
            {event.location} •{' '}
            {new Date(event.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'kk-KZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="font-serif text-xl font-bold text-[#00afca]">
              {locale === 'en' ? 'Registration Successful!' : 'Сіз сәтті тіркелдіңіз!'}
            </div>
            <p className="text-xs text-[#00afca]">
              {locale === 'en'
                ? 'Your participation has been recorded.'
                : 'Деректер сақталды.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
            />

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#00afca] mb-1.5 font-bold">
                {locale === 'en' ? 'Full Name *' : 'Аты-жөніңіз *'}
              </label>
              <input
                type="text"
                required
                placeholder={locale === 'en' ? 'Your full name' : 'Аты-жөніңіз'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#00afca] mb-1.5 font-bold">
                {locale === 'en' ? 'Grade / Class *' : 'Сыныбыңыз *'}
              </label>
              <input
                type="text"
                required
                placeholder="10А"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="form-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#00afca] mb-1.5 font-bold">
                {locale === 'en' ? 'Phone (optional)' : 'Телефон (міндетті емес)'}
              </label>
              <input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input text-sm"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg border-2 border-[#00afca] text-[#00afca] text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-blue text-xs uppercase tracking-wider font-bold py-3 mt-2 disabled:opacity-50"
            >
              {loading
                ? locale === 'en'
                  ? 'Registering...'
                  : 'Тіркелуде...'
                : locale === 'en'
                ? 'Confirm Registration'
                : 'Растау және жазылу'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
