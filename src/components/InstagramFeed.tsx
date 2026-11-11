'use client';

import React, { useRef } from 'react';
import Image from 'next/image';

export interface InstagramPostItem {
  id: string;
  url: string;
  image: string;
  captionKk: string;
  captionEn?: string;
  date?: string;
  type?: 'post' | 'reel';
}

interface InstagramFeedProps {
  locale: string;
  posts?: InstagramPostItem[];
}

const defaultPosts: InstagramPostItem[] = [
  {
    id: 'post-it-quiz',
    url: 'https://www.instagram.com/reel/DfksV3kqMI0/',
    image: '/images/instagram/post-5.jpg',
    captionKk: '10 Қараша – Цифрландыру және ақпараттық технологиялар қызметкерлері күніне орай информатика пәнінен Kahoot викторинасы (IT квиз) өтті 💻',
    captionEn: 'November 10 – Digitalization & IT Workers Day informatics Kahoot IT Quiz competition 💻',
    date: '10 қараша',
    type: 'reel',
  },
  {
    id: 'post-1',
    url: 'https://www.instagram.com/reel/DetXIZGNiq0/',
    image: '/images/instagram/post-1.jpg',
    captionKk: 'Айдарбек Саламатұлы және оның оқушылары 💙 Лицейдегі жылы жүздесу мен шабытты сәттер.',
    captionEn: 'Aidarbek Salamatuly and his students 💙 Inspiring moments at the lyceum.',
    date: '20 қазан',
    type: 'reel',
  },
  {
    id: 'post-2',
    url: 'https://www.instagram.com/reel/DegakjWt1ii/',
    image: '/images/instagram/post-2.jpg',
    captionKk: 'Әр үлкен жетістіктің артында бір ҰСТАЗ тұрады 💙 Ұстаздар күніне арналған лицей мерекесі.',
    captionEn: 'Behind every great achievement stands a Teacher 💙 Teachers’ Day celebration.',
    date: '2 қазан',
    type: 'reel',
  },
  {
    id: 'post-3',
    url: 'https://www.instagram.com/p/DegooevDXHo/',
    image: '/images/instagram/post-3.jpg',
    captionKk: 'AQL RUN — жүректе қалған жылы сәттер 💙 Оқушылар мен ұстаздардың дәстүрлі спорттық жарысы.',
    captionEn: 'AQL RUN — Warm moments in our hearts 💙 Traditional school sports marathon.',
    date: '10 қазан',
    type: 'post',
  },
  {
    id: 'post-4',
    url: 'https://www.instagram.com/p/DdHPIlhIp3j/',
    image: '/images/instagram/post-4.jpg',
    captionKk: 'AQL Council — Мектеп Парламентінің ресми бастамалары, медиа жаңалықтары мен фракциялар жұмысы.',
    captionEn: 'AQL Council — Official school parliament media releases, initiatives and faction projects.',
    date: 'Қазан 2026',
    type: 'post',
  },
];

export default function InstagramFeed({
  locale,
  posts = defaultPosts,
}: InstagramFeedProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const isEn = locale === 'en';

  return (
    <section className="py-14 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-rose-200/40 text-rose-600 text-xs font-black uppercase tracking-wider mb-2">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>{isEn ? 'Official Instagram Feed' : 'Ресми Instagram парақшамыз'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>@aql_council</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              {isEn
                ? 'Follow our official school parliament life, events, and announcements.'
                : 'Парламент жаңалықтары, іс-шаралар есебі мен күнделікті сторис контенттері.'}
            </p>
          </div>

          {/* Action & Controls */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/aql_council"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition-all hover:scale-105 active:scale-95"
            >
              <span>{isEn ? 'Follow on Instagram' : 'Instagram-да жазылу'}</span>
              <span>↗</span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-sm font-bold text-lg"
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-sm font-bold text-lg"
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Swipeable Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-shrink-0 w-64 sm:w-72 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#00afca]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Media frame */}
                <div className="relative aspect-square overflow-hidden bg-slate-900">
                  <Image
                    src={post.image}
                    alt={post.captionKk}
                    fill
                    sizes="(max-width: 768px) 260px, 290px"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                    {post.type === 'reel' ? (
                      <>
                        <span>▶</span>
                        <span>Reels</span>
                      </>
                    ) : (
                      <>
                        <span>📷</span>
                        <span>Пост</span>
                      </>
                    )}
                  </div>

                  {/* Gradient shine on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Instagram-да ашу</span>
                      <span>↗</span>
                    </span>
                  </div>
                </div>

                {/* Caption snippet */}
                <div className="p-4 sm:p-5">
                  {post.date && (
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#00afca] mb-1.5">
                      {post.date}
                    </div>
                  )}
                  <p className="text-xs text-slate-700 font-medium line-clamp-3 leading-relaxed group-hover:text-slate-900 transition-colors">
                    {isEn ? post.captionEn || post.captionKk : post.captionKk}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 sm:px-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00afca] bg-slate-50/60">
                <span className="flex items-center gap-1.5 text-slate-600 group-hover:text-[#00afca] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>@aql_council</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
