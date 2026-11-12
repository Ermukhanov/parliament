'use client';

import { useState, useEffect } from 'react';

export interface PollOptionData {
  id: string;
  textRu: string;
  textKk: string;
  votesCount: number;
}

export interface PollData {
  id: string;
  questionRu: string;
  questionKk: string;
  options: PollOptionData[];
}

interface VotingSectionProps {
  locale: string;
  poll: PollData | null;
}

export default function VotingSection({ locale, poll }: VotingSectionProps) {
  const [options, setOptions] = useState<PollOptionData[]>(poll?.options || []);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionAuthor, setSuggestionAuthor] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    if (poll) {
      setOptions(poll.options);
      const saved = localStorage.getItem(`voted_poll_${poll.id}`);
      if (saved) setVotedOptionId(saved);
    }
  }, [poll]);

  const totalVotes = options.reduce((acc, o) => acc + o.votesCount, 0);

  const handleVote = async (optionId: string) => {
    if (!poll || votedOptionId || votingLoading) return;
    setVotingLoading(true);
    setVoteError(null);

    // Get or generate persistent unique device ID for voting fairness across school Wi-Fi
    let deviceId = '';
    try {
      deviceId = localStorage.getItem('aql_device_id') || '';
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        localStorage.setItem('aql_device_id', deviceId);
      }
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setVoteError(
            locale === 'en'
              ? 'You have already voted in this poll!'
              : 'Сіз бұл сауалнамада дауыс бергенсіз!'
          );
          setVotedOptionId(optionId);
          localStorage.setItem(`voted_poll_${poll.id}`, optionId);
        } else {
          setVoteError(data.error || (locale === 'en' ? 'Voting error' : 'Дауыс беру қатесі'));
        }
      } else {
        setVotedOptionId(optionId);
        localStorage.setItem(`voted_poll_${poll.id}`, optionId);
        setOptions((prev) =>
          prev.map((opt) =>
            opt.id === optionId ? { ...opt, votesCount: opt.votesCount + 1 } : opt
          )
        );
      }
    } catch {
      setVoteError(locale === 'en' ? 'Network error' : 'Желі қатесі');
    } finally {
      setVotingLoading(false);
    }
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setSuggestionLoading(true);
    setSuggestionError(null);
    setSuggestionSuccess(false);

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: suggestionText,
          author: suggestionAuthor.trim() || (locale === 'en' ? 'Anonymous' : 'Аноним'),
          honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSuggestionError(data.error || (locale === 'en' ? 'Submission error' : 'Жіберу қатесі'));
      } else {
        setSuggestionSuccess(true);
        setSuggestionText('');
        setSuggestionAuthor('');
      }
    } catch {
      setSuggestionError(locale === 'en' ? 'Network error' : 'Желі қатесі');
    } finally {
      setSuggestionLoading(false);
    }
  };

  return (
    <section id="voting" className="py-20 relative z-10 bg-[#ffffff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="section-kicker">
            {locale === 'en' ? 'Open Voting' : 'Ашық дауыс беру'}
          </div>
          <h2 className="section-title">
            {locale === 'en' ? 'What should we hold next?' : 'Келесіде не өткіземіз?'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Poll or Empty Poll Notice */}
          <div className="lg:col-span-7 aql-card p-6 sm:p-8">
            {!poll ? (
              <div className="py-12 px-4 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl">
                  🗳️
                </div>
                <h3 className="font-extrabold text-2xl text-slate-800 mb-2">
                  {locale === 'en'
                    ? 'No active poll right now'
                    : 'Белсенді сауалнама әзірге жоқ'}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {locale === 'en'
                    ? 'New schoolwide polls will be launched soon by the school council. You can suggest your idea on the right!'
                    : 'Жақында жаңа жалпымектептік сауалнама іске қосылады. Оң жақта өз идеяңызды немесе ұсынысыңызды қалдыра аласыз!'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900">
                    {poll.questionKk || poll.questionRu}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-4">
                    {totalVotes} {locale === 'en' ? 'votes' : 'дауыс'}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {options.map((opt) => {
                    const percent =
                      totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                    const isSelected = votedOptionId === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleVote(opt.id)}
                        disabled={Boolean(votedOptionId) || votingLoading}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span className="font-bold text-sm sm:text-base">
                            {opt.textKk || opt.textRu}
                          </span>
                          <span className="font-extrabold text-base">{percent}%</span>
                        </div>

                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-full transition-all duration-500 ${
                              isSelected ? 'bg-[#00afca]' : 'bg-slate-400'
                            }`}
                          />
                        </div>

                        <div className="mt-1.5 text-[11px] font-semibold text-slate-400">
                          {opt.votesCount} {locale === 'en' ? 'votes' : 'дауыс'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {voteError && (
                  <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-600">
                    {voteError}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Suggest Your Idea */}
          <div className="lg:col-span-5 aql-card p-6 sm:p-8">
            <h3 className="font-extrabold text-2xl text-slate-900 mb-2">
              {locale === 'en' ? 'Suggest Your Idea' : 'Өз идеяңызды ұсыныңыз'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              {locale === 'en'
                ? 'The best student proposals are included in upcoming schoolwide votes.'
                : 'Ең үздік ұсыныстар келесі жалпы мектептік дауыс беруге енгізіледі.'}
            </p>

            <form onSubmit={handleSuggest} className="space-y-4">
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
                  {locale === 'en' ? 'Your Idea *' : 'Сіздің идеяңыз *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder={
                    locale === 'en'
                      ? 'Describe your initiative or event idea...'
                      : 'Қандай іс-шара өткізуді ұсынасыз?'
                  }
                  className="form-input resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                  {locale === 'en' ? 'Name and Class' : 'Аты-жөніңіз және сынып'}
                </label>
                <input
                  type="text"
                  value={suggestionAuthor}
                  onChange={(e) => setSuggestionAuthor(e.target.value)}
                  placeholder={locale === 'en' ? 'e.g. 9B student' : 'Мысалы: 9Б сынып оқушысы'}
                  className="form-input"
                />
              </div>

              {suggestionSuccess && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
                  {locale === 'en'
                    ? 'Thank you! Your idea has been sent to the Parliament.'
                    : 'Рақмет! Ұсынысыңыз модерацияға жіберілді.'}
                </div>
              )}

              {suggestionError && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-600">
                  {suggestionError}
                </div>
              )}

              <button
                type="submit"
                disabled={suggestionLoading}
                className="w-full btn-blue py-3 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {suggestionLoading
                  ? locale === 'en'
                    ? 'Submitting...'
                    : 'Жіберілуде...'
                  : locale === 'en'
                  ? 'Submit Idea'
                  : 'Идеяны жіберу'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
