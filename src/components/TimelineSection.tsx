'use client';

interface TimelineItemData {
  id: string;
  titleRu: string;
  titleKk: string;
  descRu: string;
  descKk: string;
  month: number;
  year: number;
  icon: string;
}

interface TimelineSectionProps {
  locale: string;
  items: TimelineItemData[];
}

const monthNamesEn: Record<number, string> = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

const monthNamesKk: Record<number, string> = {
  1: 'Қаңтар',
  2: 'Ақпан',
  3: 'Наурыз',
  4: 'Сәуір',
  5: 'Мамыр',
  6: 'Маусым',
  7: 'Шілде',
  8: 'Тамыз',
  9: 'Қыркүйек',
  10: 'Қазан',
  11: 'Қараша',
  12: 'Желтоқсан',
};

export default function TimelineSection({ locale, items }: TimelineSectionProps) {
  return (
    <section id="timeline" className="py-20 relative z-10 bg-[#ffffff]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="section-kicker">
            {locale === 'en' ? 'Academic Year Calendar' : 'Оқу жылының күнтізбесі'}
          </div>
          <h2 className="section-title">
            {locale === 'en' ? 'Annual Roadmap' : 'Жылдық жоспар'}
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 aql-card p-8">
            <p className="font-extrabold text-xl text-slate-800 mb-2">
              {locale === 'en' ? 'Annual roadmap is being prepared' : 'Жылдық жоспар толтырылуда'}
            </p>
            <p className="text-sm text-slate-500">
              {locale === 'en'
                ? 'Monthly milestones and faction events for the academic year will be published soon.'
                : 'Оқу жылына арналған ай сайынғы іс-шаралар жоспары жақында жарияланады.'}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="timeline-line" />
            <div className="space-y-8">
              {items.map((item, idx) => {
                const isLeft = idx % 2 === 0;
                const monthLabel =
                  locale === 'en' ? monthNamesEn[item.month] : monthNamesKk[item.month];

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col md:flex-row items-start ${
                      isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className="absolute left-[24px] md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center z-10 text-xs font-extrabold shadow-sm">
                      {item.month}
                    </div>

                    <div
                      className={`w-full md:w-[calc(50%-2.5rem)] pl-14 md:pl-0 ${
                        isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'
                      }`}
                    >
                      <div className="aql-card p-5 bg-white">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-[#00afca] mb-1">
                          {monthLabel} {item.year}
                        </div>
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2">
                          {item.titleKk || item.titleRu}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          {item.descKk || item.descRu}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
