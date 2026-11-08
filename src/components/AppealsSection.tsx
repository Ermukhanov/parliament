'use client';

import { useState } from 'react';

interface AppealsSectionProps {
  locale: string;
}

export default function AppealsSection({ locale }: AppealsSectionProps) {
  const [type, setType] = useState<'proposal' | 'complaint' | 'join'>('proposal');
  const [ministry, setMinistry] = useState<string>('general');
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [text, setText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const types = [
    { key: 'proposal' as const, labelEn: 'Proposal', labelKk: 'Ұсыныс' },
    { key: 'complaint' as const, labelEn: 'Inquiry / Issue', labelKk: 'Мәселе / Сұрақ' },
    { key: 'join' as const, labelEn: 'Join Faction', labelKk: 'Фракцияға қосылу' },
  ];

  const factions = [
    { key: 'general', labelEn: 'Presidium of AQL Council (General)', labelKk: 'AQL Council Төралқасы (Жалпы)' },
    { key: 'it', labelEn: 'IT & Digitalization Faction', labelKk: 'IT және цифрландыру фракциясы' },
    { key: 'culture', labelEn: 'Culture & Arts Faction', labelKk: 'Мәдениет және өнер фракциясы' },
    { key: 'sport', labelEn: 'Sports & Health Faction', labelKk: 'Спорт фракциясы' },
    { key: 'volunteers', labelEn: 'Volunteering & Charity Faction', labelKk: 'Еріктілер және қайырымдылық фракциясы' },
    { key: 'discipline', labelEn: 'Law & Order Faction', labelKk: 'Құқық және тәртіп фракциясы' },
    { key: 'media', labelEn: 'Media Faction', labelKk: 'Медиа фракциясы' },
    { key: 'education', labelEn: 'Education & Science Faction', labelKk: 'Білім фракциясы' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          ministry,
          anonymous,
          name: anonymous ? '' : name,
          grade: anonymous ? '' : grade,
          text,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ ok: false, msg: data.error || (locale === 'en' ? 'Submission error' : 'Жіберу қатесі') });
      } else {
        setStatus({
          ok: true,
          msg:
            locale === 'en'
              ? 'Your appeal has been successfully sent to the faction!'
              : 'Өтінішіңіз таңдалған фракцияға сәтті жіберілді!',
        });
        setText('');
        setName('');
        setGrade('');
      }
    } catch {
      setStatus({
        ok: false,
        msg: locale === 'en' ? 'Network error' : 'Желі қатесі',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="appeals" className="py-20 relative z-10 bg-[#f8fafc]/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="section-kicker">
            {locale === 'en' ? 'Public Inquiries' : 'Кері байланыс'}
          </div>
          <h2 className="section-title">
            {locale === 'en' ? 'Send an Inquiry to a Faction' : 'Фракцияларға өтініш'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 font-normal">
            {locale === 'en'
              ? 'Any student can submit an idea, report an issue, or apply to join a faction team.'
              : 'Кез келген оқушы 7 фракцияның біріне ұсыныс жібере алады немесе оның командасына қосыла алады.'}
          </p>
        </div>

        <div className="aql-card p-6 sm:p-10 bg-white">
          {/* Type Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
            {types.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  type === t.key
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {locale === 'en' ? t.labelEn : t.labelKk}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Target Faction selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                {locale === 'en' ? 'Select Target Faction *' : 'Қай фракцияға бағыттайсыз? *'}
              </label>
              <select
                value={ministry}
                onChange={(e) => setMinistry(e.target.value)}
                className="form-input font-semibold"
              >
                {factions.map((f) => (
                  <option key={f.key} value={f.key}>
                    {locale === 'en' ? f.labelEn : f.labelKk}
                  </option>
                ))}
              </select>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {locale === 'en' ? 'Anonymous Mode' : 'Анонимді режим'}
                </div>
                <div className="text-xs text-slate-500">
                  {locale === 'en'
                    ? 'Send without providing your name or class'
                    : 'Аты-жөніңізді көрсетпей жіберу'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnonymous(!anonymous)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  anonymous ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {anonymous
                  ? locale === 'en'
                    ? 'ON'
                    : 'ҚОСУЛЫ'
                  : locale === 'en'
                  ? 'OFF'
                  : 'ӨШІРУЛІ'}
              </button>
            </div>

            {!anonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                    {locale === 'en' ? 'Your Name *' : 'Аты-жөніңіз *'}
                  </label>
                  <input
                    type="text"
                    required={!anonymous}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={locale === 'en' ? 'Full name' : 'Аты-жөніңіз'}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                    {locale === 'en' ? 'Grade / Class *' : 'Сынып *'}
                  </label>
                  <input
                    type="text"
                    required={!anonymous}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="9A"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                {locale === 'en' ? 'Message Text *' : 'Хат мәтіні *'}
              </label>
              <textarea
                rows={4}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  locale === 'en'
                    ? 'Describe your proposal, issue, or why you want to join...'
                    : 'Өз ұсынысыңызды немесе сұрағыңызды толық жазыңыз...'
                }
                className="form-input resize-none"
              />
            </div>

            {status && (
              <div className="p-4 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-800">
                {status.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-blue py-3.5 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {loading
                ? locale === 'en'
                  ? 'Submitting...'
                  : 'Жіберілуде...'
                : locale === 'en'
                ? 'Submit to Faction'
                : 'Фракцияға жіберу'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
