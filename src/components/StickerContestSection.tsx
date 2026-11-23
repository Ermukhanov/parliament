'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface StickerItem {
  id: string;
  title: string;
  authorName: string;
  authorGrade: string;
  imageUrl: string;
  createdAt: string;
  votesCount: number;
  isMyVote?: boolean;
}

interface StickerContestProps {
  locale: string;
}

export default function StickerContestSection({ locale }: StickerContestProps) {
  const isEn = locale === 'en';

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedStickerId, setUserVotedStickerId] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState(true);
  const [loading, setLoading] = useState(true);

  // Sorting
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorGrade, setAuthorGrade] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Voting state
  const [votingId, setVotingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStickers = async () => {
    try {
      const res = await fetch('/api/stickers', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStickers(data.stickers || []);
        setTotalVotes(data.totalVotes || 0);
        setHasVoted(data.hasVoted || false);
        setUserVotedStickerId(data.userVotedStickerId || null);
        setCanUpload(data.canUpload !== false);
      }
    } catch (err) {
      console.error('Fetch stickers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStickers();
    const interval = setInterval(fetchStickers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 6 * 1024 * 1024) {
        setUploadError(
          isEn ? 'File size must be under 6MB' : 'Файл көлемі 6MB-тан аспауы керек'
        );
        return;
      }
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError(isEn ? 'Please choose an image file' : 'Стикер суретін таңдаңыз');
      return;
    }
    if (!authorName.trim()) {
      setUploadError(isEn ? 'Please enter your name' : 'Аты-жөніңізді енгізіңіз');
      return;
    }
    if (!authorGrade.trim()) {
      setUploadError(isEn ? 'Please enter your grade' : 'Сыныбыңызды көрсетіңіз');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    let deviceId = '';
    try {
      deviceId = localStorage.getItem('aql_device_id') || '';
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        localStorage.setItem('aql_device_id', deviceId);
      }
    } catch {}

    const formData = new FormData();
    formData.append('file', file);
    formData.append('authorName', authorName.trim());
    formData.append('authorGrade', authorGrade.trim());
    formData.append('title', title.trim() || (isEn ? 'School Sticker' : 'Мектеп стикері'));
    formData.append('deviceId', deviceId);

    try {
      const res = await fetch('/api/stickers/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(
          data.error ||
            (isEn ? 'Upload failed. You may have already uploaded.' : 'Жүктеу мүмкін болмады.')
        );
      } else {
        setUploadSuccess(true);
        setCanUpload(false);
        fetchStickers();
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess(false);
          setFile(null);
          setFilePreview(null);
          setAuthorName('');
          setAuthorGrade('');
          setTitle('');
        }, 1800);
      }
    } catch {
      setUploadError(isEn ? 'Network error occurred' : 'Желілік қате орын алды');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleVote = async (stickerId: string) => {
    if (hasVoted || votingId) return;
    setVotingId(stickerId);

    let deviceId = '';
    try {
      deviceId = localStorage.getItem('aql_device_id') || '';
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        localStorage.setItem('aql_device_id', deviceId);
      }
    } catch {}

    try {
      const res = await fetch(`/api/stickers/${stickerId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMessage(
          data.error ||
            (isEn
              ? 'You have already voted in this contest!'
              : 'Сіз стикерпак таңдауында дауыс беріп қойғансыз!')
        );
        setHasVoted(true);
        setUserVotedStickerId(stickerId);
      } else {
        setHasVoted(true);
        setUserVotedStickerId(stickerId);
        setStickers((prev) =>
          prev.map((s) => (s.id === stickerId ? { ...s, votesCount: data.votesCount } : s))
        );
        setTotalVotes((v) => v + 1);
        setToastMessage(
          isEn ? 'Your vote was recorded successfully!' : 'Дауысыңыз сәтті қабылданды!'
        );
      }
    } catch {
      setToastMessage(isEn ? 'Network error during voting' : 'Дауыс беру кезінде қате кетті');
    } finally {
      setVotingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const sortedStickers = [...stickers].sort((a, b) => {
    if (sortBy === 'top') {
      return b.votesCount - a.votesCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <section id="stickers" className="py-16 sm:py-20 relative z-10 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#0b0f17] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#00afca]/40 text-xs sm:text-sm font-bold animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00afca]/10 border border-[#00afca]/25 text-[#00afca] text-xs font-bold uppercase tracking-wider mb-3">
            <span>✨</span>
            <span>{isEn ? 'School Sticker Pack Contest' : 'Мектептік Стикерпак Байқауы'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {isEn
              ? 'Add your sticker to the school sticker pack!'
              : 'Мектептің стикерлер топтамасына өз стикеріңді қос!'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {isEn
              ? 'Upload your creative sticker idea (each student can submit only once) and vote for the best artwork! Top voted stickers will be included in the official school Telegram & WhatsApp pack.'
              : 'Өз авторлық стикеріңді жүктеп (әр оқушы тек бір стикер ұсына алады), үздік жұмысқа дауыс бер! Ең көп дауыс жинаған стикерлер мектептің ресми Telegram және WhatsApp топтамасына енеді.'}
          </p>

          {/* Action Bar & Stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {canUpload ? (
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#00afca] to-sky-600 hover:from-[#0099b0] hover:to-sky-700 text-white font-bold text-sm shadow-lg shadow-[#00afca]/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isEn ? 'Submit Your Sticker' : 'Өз стикеріңді жүктеу'}</span>
              </button>
            ) : (
              <div className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{isEn ? 'Your sticker is submitted ✓' : 'Стикеріңіз байқауға қабылданды ✓'}</span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs sm:text-sm font-semibold text-slate-700">
              <span>🖼️ {stickers.length} {isEn ? 'stickers' : 'стикер'}</span>
              <span className="text-slate-300">•</span>
              <span>❤️ {totalVotes} {isEn ? 'votes' : 'дауыс'}</span>
            </div>

            {/* Filter Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setSortBy('top')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sortBy === 'top' ? 'bg-[#00afca] text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                {isEn ? 'Top Voted' : 'Үздіктер'}
              </button>
              <button
                type="button"
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sortBy === 'newest' ? 'bg-[#00afca] text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                {isEn ? 'Newest' : 'Жаңалары'}
              </button>
            </div>
          </div>
        </div>

        {/* Sticker Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">
            {isEn ? 'Loading stickers...' : 'Стикерлер жүктелуде...'}
          </div>
        ) : sortedStickers.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-50 text-[#00afca] flex items-center justify-center text-3xl">
              🎨
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">
              {isEn ? 'No stickers uploaded yet' : 'Әзірге стикерлер қосылмаған'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              {isEn
                ? 'Be the very first student to submit an original sticker and get votes from the whole school!'
                : 'Мектеп бойынша алғашқы болып өз стикеріңді жүктеп, барлық оқушылардың дауысын жина!'}
            </p>
            {canUpload && (
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white font-bold text-xs shadow-md shadow-[#00afca]/25 transition-all"
              >
                {isEn ? 'Upload First Sticker' : 'Алғашқы стикерді жүктеу'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedStickers.map((sticker, idx) => {
              const isVotedForThis = userVotedStickerId === sticker.id;
              const isTop = idx === 0 && sticker.votesCount > 0;

              return (
                <div
                  key={sticker.id}
                  className="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top Badge for Leader */}
                  {isTop && (
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      <span>👑</span>
                      <span>{isEn ? 'Top 1' : 'Көшбасшы'}</span>
                    </div>
                  )}

                  {/* Sticker Die-Cut Canvas */}
                  <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/60 p-4 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                    {/* Subtle grid pattern background */}
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, #64748b 1px, transparent 1px)',
                        backgroundSize: '12px 12px',
                      }}
                    />

                    {/* Sticker Image with White Die-Cut Border & Shadow */}
                    <div className="relative w-full h-full flex items-center justify-center p-2">
                      <img
                        src={sticker.imageUrl}
                        alt={sticker.title}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Sticker Info */}
                  <div className="space-y-2 mb-4">
                    <h4 className="font-extrabold text-base text-slate-900 line-clamp-1">
                      {sticker.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <span className="text-[#00afca]">🎨</span>
                        <span className="line-clamp-1">{sticker.authorName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-600 text-[11px]">
                        {sticker.authorGrade}
                      </span>
                    </div>
                  </div>

                  {/* Vote Section */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-sm font-extrabold text-slate-900">
                      <span className="text-rose-500">❤️</span>
                      <span>{sticker.votesCount}</span>
                      <span className="text-xs font-normal text-slate-500">
                        {isEn ? 'votes' : 'дауыс'}
                      </span>
                    </div>

                    {isVotedForThis ? (
                      <div className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                        <span>✓</span>
                        <span>{isEn ? 'Voted' : 'Дауысыңыз'}</span>
                      </div>
                    ) : hasVoted ? (
                      <button
                        type="button"
                        disabled
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed"
                      >
                        {isEn ? 'Voted' : 'Дауыс берілді'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleVote(sticker.id)}
                        disabled={votingId === sticker.id}
                        className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white font-bold text-xs shadow-sm shadow-[#00afca]/25 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                      >
                        {votingId === sticker.id
                          ? (isEn ? 'Voting...' : 'Жіберілуде...')
                          : (isEn ? 'Vote' : 'Дауыс беру')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-800 space-y-5 max-h-[92dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                    {isEn ? 'Submit Your Sticker Idea' : 'Өз стикеріңді байқауға қос'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {uploadSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold animate-bounce">
                    ✓
                  </div>
                  <h4 className="font-extrabold text-lg text-slate-900">
                    {isEn ? 'Sticker Submitted Successfully!' : 'Стикер сәтті жүктелді!'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {isEn
                      ? 'Your sticker is now part of the school contest. Good luck in the voting!'
                      : 'Сіздің стикеріңіз байқау тізіміне енді. Оқушылар арасындағы дауыс беруде сәттілік!'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {uploadError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {uploadError}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
                    <span className="font-bold">⚠️ {isEn ? 'Attention:' : 'Ескерту:'}</span>{' '}
                    {isEn
                      ? 'Each student can upload only ONE sticker. Please provide your real name and grade.'
                      : 'Әр оқушы тек БІР стикер ұсына алады. Өз аты-жөніңіз бен сыныбыңызды нақты көрсетіңіз.'}
                  </div>

                  {/* Author Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isEn ? 'Your Full Name (First and Last Name)' : 'Аты-жөніңіз (Аты және Тегі)'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? 'e.g. Arman Seitkali' : 'мысалы: Арман Сейітқали'}
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm font-medium"
                    />
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isEn ? 'Your Class / Grade' : 'Сыныбыңыз'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? 'e.g. 10A or 9B' : 'мысалы: 10А немесе 9В'}
                      value={authorGrade}
                      onChange={(e) => setAuthorGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm font-medium"
                    />
                  </div>

                  {/* Sticker Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isEn ? 'Sticker Title / Meaning' : 'Стикер атауы / Мағынасы'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? 'e.g. Preparing for Exams' : 'мысалы: ҰБТ-ға дайындық / Үзіліс'}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm font-medium"
                    />
                  </div>

                  {/* File Upload & Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isEn ? 'Sticker Image (PNG, JPG, WEBP, SVG)' : 'Стикер суреті (PNG, JPG, WEBP)'} *
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {filePreview ? (
                      <div className="relative p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-[#00afca] flex flex-col items-center justify-center gap-3">
                        <div className="relative w-36 h-36 flex items-center justify-center p-2 rounded-2xl bg-white shadow-md border border-slate-100">
                          <img
                            src={filePreview}
                            alt="Sticker preview"
                            className="max-w-full max-h-full object-contain filter drop-shadow-md"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                          >
                            {isEn ? 'Change Image' : 'Суретті ауыстыру'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setFilePreview(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                          >
                            {isEn ? 'Remove' : 'Өшіру'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer p-6 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border-2 border-dashed border-slate-200 hover:border-[#00afca] text-center transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#00afca] flex items-center justify-center text-xl">
                          📁
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          {isEn ? 'Click to select sticker image' : 'Стикер суретін таңдау үшін басыңыз'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {isEn
                            ? 'PNG with transparent background recommended, up to 6MB'
                            : 'Мөлдір фонды PNG немесе JPG сурет, 6MB-қа дейін'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      disabled={uploadLoading}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                    >
                      {isEn ? 'Cancel' : 'Болдырмау'}
                    </button>
                    <button
                      type="submit"
                      disabled={uploadLoading || !file}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-md shadow-[#00afca]/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploadLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isEn ? 'Uploading...' : 'Жүктелуде...'}</span>
                        </>
                      ) : (
                        <span>{isEn ? 'Submit Sticker' : 'Байқауға қосу'}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
