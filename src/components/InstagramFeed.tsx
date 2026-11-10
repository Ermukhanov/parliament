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
  type?: 'post' | 'reel' | 'event';
}

interface InstagramFeedProps {
  locale: string;
  posts?: InstagramPostItem[];
}

const defaultPosts: InstagramPostItem[] = [
  {
    id: '1',
    url: 'https://www.instagram.com/aql_council',
    image: '/images/members/president.png',
    captionKk: 'Мектеп Президенті мен Парламент Төралқасының жаңа оқу жылына арналған жоспарлары мен бастамалары.',
    captionEn: 'School President and Parliament Presidium initiatives for the academic year.',
    date: 'Қараша 2026',
    type: 'post',
  },
  {
    id: '2',
    url: 'https://www.instagram.com/aql_council',
    image: '/images/members/it.png',
    captionKk: 'IT және цифрландыру фракциясы: жаңа мектеп порталы мен цифрлық шешімдер.',
    captionEn: 'IT & Digitalization faction: launch of the school web portal.',
    date: 'Қараша 2026',
    type: 'post',
  },
  {
    id: '3',
    url: 'https://www.instagram.com/aql_council',
    image: '/images/members/culture.png',
    captionKk: 'Мәдениет және өнер фракциясы: мектеп мерекелері мен шығармашылық жобалар.',
    captionEn: 'Culture and Arts faction: school festivals and art projects.',
    date: 'Қараша 2026',
    type: 'reel',
  },
  {
    id: '4',
    url: 'https://www.instagram.com/aql_council',
    image: '/images/members/sport.png',
    captionKk: 'Спорт фракциясы: волейбол және үстел теннисі турнирлері.',
    captionEn: 'Sports faction: volleyball and table tennis championships.',
    date: 'Қараша 2026',
    type: 'post',
  },
  {
    id: '5',
    url: 'https://www.instagram.com/aql_council',
    image: '/images/members/volunteers.png',
    captionKk: 'Еріктілер фракциясы: «Жүректен жүрекке» қайырымдылық акциясы.',
    captionEn: 'Volunteers faction: From Heart to Heart charity initiative.',
    date: 'Қараша 2026',
    type: 'reel',
  },
  {
    id: '6',
    url: 'https://www.instagram.com/aql_council',
    image: '/images/members/discipline.png',
    captionKk: 'Құқық және тәртіп фракциясы: лицей ережелері мен қауіпсіздік мәдениеті.',
    captionEn: 'Law and Order faction: school charter compliance and safety culture.',
    date: 'Қараша 2026',
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
    <section className="py-12 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white border-y border-slate-100">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all hover:scale-105 active:scale-95"
            >
              <span>{isEn ? 'Follow on Instagram' : 'Instagram-да жазылу'}</span>
              <span>↗</span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-sm"
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-sm"
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
              className="group flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#00afca]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Media frame */}
                <div className="relative aspect-[4/4] overflow-hidden bg-slate-900">
                  <Image
                    src={post.image}
                    alt={post.captionKk}
                    fill
                    sizes="(max-width: 768px) 260px, 290px"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                    {post.type === 'reel' ? (
                      <>
                        <span>▶</span>
                        <span>Reels</span>
                      </>
                    ) : (
                      <>
                        <span>📷</span>
                        <span>Post</span>
                      </>
                    )}
                  </div>

                  {/* Gradient shine on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <span>Instagram-да ашу</span>
                      <span>↗</span>
                    </span>
                  </div>
                </div>

                {/* Caption snippet */}
                <div className="p-4">
                  {post.date && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {post.date}
                    </div>
                  )}
                  <p className="text-xs text-slate-700 font-medium line-clamp-3 leading-relaxed group-hover:text-slate-900 transition-colors">
                    {isEn ? post.captionEn || post.captionKk : post.captionKk}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#00afca] bg-slate-50/50">
                <span className="flex items-center gap-1">
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
