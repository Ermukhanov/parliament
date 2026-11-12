import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import NewsSection, { NewsItem } from '@/components/NewsSection';
import InstagramFeed from '@/components/InstagramFeed';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn ? 'News & Media | AQL Council' : 'Жаңалықтар & Медиа | AQL Council',
    description: isEn
      ? 'Official school articles, meeting chronicles, and media press service of the AQL Council Parliament.'
      : 'Мектеп өмірінің басты жаңалықтары, фракция есептері және ресми мәлімдемелер.',
  };
}

export default async function NewsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let news: NewsItem[] = [];

  try {
    const rawNews = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });

    news = rawNews.map((n) => ({
      id: n.id,
      slug: n.slug,
      titleRu: n.titleRu,
      titleKk: n.titleKk,
      excerpt: n.excerpt,
      image: n.image,
      ministry: n.ministry,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('NewsPage DB query error:', err);
  }

  return (
    <div className="space-y-6 sm:space-y-10 pb-16">
      {/* 1. Parliament Articles & Faction Posts */}
      <NewsSection locale={locale} news={news} />

      {/* 2. Official School Instagram Media Feed */}
      <div className="border-t border-slate-100">
        <InstagramFeed locale={locale} />
      </div>
    </div>
  );
}
