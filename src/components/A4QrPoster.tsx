'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

interface A4QrPosterProps {
  initialLocale: string;
}

export default function A4QrPoster({ initialLocale }: A4QrPosterProps) {
  const [locale, setLocale] = useState(initialLocale === 'en' ? 'en' : 'kk');
  const isEn = locale === 'en';

  const [siteUrl, setSiteUrl] = useState('https://parliament-ten-bay.vercel.app');
  const [svgQr, setSvgQr] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      // If running on local or deployed origin
      const currentOrigin = window.location.origin;
      if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
        setSiteUrl(currentOrigin);
      }
    }
  }, []);

  useEffect(() => {
    QRCode.toString(siteUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#0b0f17',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((svg) => {
        setSvgQr(svg);
      })
      .catch((err) => {
        console.error('QR generation error:', err);
      });
  }, [siteUrl]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const displayDomain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="min-h-screen bg-slate-900/90 py-6 sm:py-10 print:py-0 print:bg-white text-slate-800">
      {/* Print styles injected */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            color: #0b0f17 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, footer, .screen-only {
            display: none !important;
          }
          .a4-sheet {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 14mm 16mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* Screen-Only Control Bar */}
      <div className="screen-only max-w-4xl mx-auto px-4 mb-6 print:hidden">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href={`/${locale}`}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>←</span>
              <span>{isEn ? 'Back to site' : 'Сайтқа қайту'}</span>
            </Link>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLocale('kk')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  locale === 'kk' ? 'bg-[#00afca] text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Қазақша
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  locale === 'en' ? 'bg-[#00afca] text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex-1 md:w-64">
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://your-domain.kz"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#00afca] font-mono"
                title={isEn ? 'Change QR Target URL' : 'QR сілтемесін өзгерту'}
              />
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white font-bold text-xs shadow-md shadow-[#00afca]/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>{isEn ? 'Print A4 Poster' : 'Басып шығару (А4)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="a4-sheet w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white rounded-none sm:rounded-2xl shadow-2xl p-8 sm:p-14 flex flex-col justify-between relative overflow-hidden text-slate-900 border border-slate-200 print:border-none print:shadow-none">
        {/* Decorative Top Accent Border */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#0b0f17] via-[#00afca] to-[#0b0f17]" />

        {/* 1. Header with Lyceum / AQL Council Branding */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0b0f17] text-[#00afca] flex items-center justify-center font-black text-xl shadow-md border border-slate-700">
              AQL
            </div>
            <div className="text-left">
              <div className="text-[11px] font-mono font-black tracking-widest text-[#00afca] uppercase">
                {isEn ? 'School Lyceum Parliament' : 'Мектеп-лицей парламенті'}
              </div>
              <div className="text-base font-black text-[#0b0f17] tracking-tight">
                AQL COUNCIL 2026
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h1 className="text-4xl sm:text-5xl font-black text-[#0b0f17] tracking-tight uppercase">
              {isEn ? 'Parliament Portal' : 'Парламент сайты'}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1 max-w-lg mx-auto">
              {isEn
                ? 'Official digital platform for school news, events, votes & student initiatives'
                : 'Мектеп өміріндегі басты жаңалықтар, сауалнамалар және іс-шараларға тіркелу'}
            </p>
          </div>
        </div>

        {/* 2. Giant QR Code Centerpiece */}
        <div className="my-auto py-4 flex flex-col items-center justify-center text-center">
          {/* Framed QR Box */}
          <div className="relative p-5 sm:p-7 rounded-3xl bg-white border-2 border-slate-900 shadow-xl max-w-xs sm:max-w-sm w-full mx-auto flex flex-col items-center">
            {/* Corner Decorative Accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-[#00afca]" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-[#00afca]" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-[#00afca]" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-[#00afca]" />

            {/* QR SVG */}
            <div
              className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: svgQr }}
            />

            <div className="mt-4 pt-3 border-t border-slate-200 w-full text-center">
              <div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center justify-center gap-1.5">
                <span className="text-[#00afca]">📸</span>
                <span>
                  {isEn ? 'Scan with phone camera' : 'Камераны жақындатып, сайтқа өтіңіз'}
                </span>
              </div>
              <div className="mt-1 text-sm font-mono font-bold text-[#00afca]">
                {displayDomain}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Poster Feature Cards (4 highlights) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 my-2">
          {/* Sticker contest feature */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎨</span>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                {isEn ? 'Sticker Pack Contest' : 'Стикерпак байқауы'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
              {isEn
                ? 'Submit your original sticker and vote for the best school sticker!'
                : 'Өз стикеріңді жүктеп, мектеп топтамасына үздікті таңда!'}
            </p>
          </div>

          {/* Voting feature */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🗳️</span>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                {isEn ? 'Open Student Voting' : 'Ашық дауыс беру'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
              {isEn
                ? 'Fair 1-person-1-vote polls on school events and initiatives.'
                : 'Мектеп сұрақтары мен іс-шараларына 1 адам = 1 дауыс беру.'}
            </p>
          </div>

          {/* Event registrations */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📅</span>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                {isEn ? 'Event Registration' : 'Іс-шараларға тіркелу'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
              {isEn
                ? 'Hackathons, sports tournaments and assemblies with live countdown.'
                : 'Хакатондар, спорттық турнирлер мен мерекелерге онлайн жазылу.'}
            </p>
          </div>

          {/* Direct Proposals */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💡</span>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                {isEn ? 'Student Inquiries' : 'Өтініштер мен идеялар'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
              {isEn
                ? 'Send your direct ideas and proposals straight to the Parliament.'
                : 'Өз ұсынысыңды немесе идеяңды Парламентке тікелей жолда.'}
            </p>
          </div>
        </div>

        {/* 4. Footer */}
        <div className="pt-4 border-t-2 border-slate-900/10 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
          <div>
            <span>{isEn ? 'Official School Parliament Lyceum Portal' : 'Мектеп Парламентінің ресми порталы'}</span>
            <span className="mx-2 text-slate-300">•</span>
            <span>AQL Council</span>
          </div>

          <div className="font-bold text-[#00afca]">
            {isEn ? 'Student voice matters' : 'Біз бірге мықтымыз'}
          </div>
        </div>
      </div>
    </div>
  );
}
