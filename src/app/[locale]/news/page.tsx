import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import NewsSection, { NewsItem } from '@/components/NewsSection';

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
  const rawNews = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  const news: NewsItem[] = rawNews.map((n) => ({
    id: n.id,
    slug: n.slug,
    titleRu: n.titleRu,
    titleKk: n.titleKk,
    excerpt: n.excerpt,
    ministry: n.ministry,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="py-6 sm:py-10">
      <NewsSection locale={locale} news={news} />
    </div>
  );
}
