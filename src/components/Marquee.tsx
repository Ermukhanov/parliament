'use client';

interface MarqueeProps {
  locale: string;
}

export default function Marquee({ locale }: MarqueeProps) {
  const wordsEn = ['Leadership', 'Initiative', 'Responsibility', 'Teamwork', 'Self-Governance', 'AQL Council'];
  const wordsKk = ['Көшбасшылық', 'Бастама', 'Жауапкершілік', 'Команда', 'Өзін-өзі басқару', 'AQL Council'];

  const words = locale === 'en' ? wordsEn : wordsKk;
  const repeated = [...words, ...words, ...words, ...words];

  return (
    <div className="relative py-4 bg-[#00afca] text-[#ffffff] overflow-hidden select-none">
      <div className="marquee-track flex items-center whitespace-nowrap">
        {repeated.map((word, index) => (
          <div key={index} className="flex items-center">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.18em] uppercase text-[#ffffff] px-6">
              {word}
            </span>
            <span className="text-[#ffffff] text-sm">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
