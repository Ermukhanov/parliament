'use client';

import Link from 'next/link';

export interface NewsItem {
  id: string;
  slug: string;
  titleRu: string;
  titleKk: string;
  excerpt: string;
  image?: string;
  ministry?: string;
  createdAt: string;
}

interface NewsSectionProps {
  locale: string;
  news: NewsItem[];
}

export default function NewsSection({ locale, news }: NewsSectionProps) {
  return (
    <section id="news" className="py-12 sm:py-16 relative z-10 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="section-kicker">
            {locale === 'en' ? 'Press Service & Media' : 'Баспасөз қызметі & Посттар'}
          </div>
          <h2 className="section-title">
            {locale === 'en' ? 'School Parliament News & Posts' : 'Мектеп жаңалықтары мен посттар'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-2">
            {locale === 'en'
              ? 'Official announcements, event reports, and stories from our student council factions.'
              : 'Фракциялардың ресми мәлімдемелері, іс-шаралар есептері мен мектеп өмірінің басты жаңалықтары.'}
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-12 aql-card p-8 bg-white max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl">
              📰
            </div>
            <p className="font-extrabold text-xl text-slate-800 mb-2">
              {locale === 'en' ? 'No news articles published yet' : 'Жаңалықтар әзірге жарияланбаған'}
            </p>
            <p className="text-sm text-slate-500">
              {locale === 'en'
                ? 'School reports, announcements, and media updates will appear here soon.'
                : 'Мектеп жаңалықтары мен мақалалары жақында осы бөлімде жарияланады.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {news.map((item) => {
              const dateFormatted = new Date(item.createdAt).toLocaleDateString(
                locale === 'en' ? 'en-US' : 'kk-KZ',
                { day: 'numeric', month: 'long', year: 'numeric' }
              );

              return (
                <article
                  key={item.id}
                  className="aql-card p-6 sm:p-8 flex flex-col justify-between bg-white group overflow-hidden border border-slate-100 hover:border-sky-200 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    {item.image && (
                      <div className="h-52 sm:h-60 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 overflow-hidden bg-slate-100 relative">
                        <img
                          src={item.image}
                          alt={item.titleKk || item.titleRu}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                      {item.ministry && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#00afca] border border-sky-200 text-[10px] font-bold">
                          {item.ministry}
                        </span>
                      )}
                      <span>{dateFormatted}</span>
                    </div>

                    <Link href={`/${locale}/news/${item.slug}`}>
                      <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 group-hover:text-[#00afca] transition-colors mb-3 leading-snug">
                        {item.titleKk || item.titleRu}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/${locale}/news/${item.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00afca] hover:translate-x-1 transition-transform"
                    >
                      <span>{locale === 'en' ? 'Read Article' : 'Толық оқу'}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
