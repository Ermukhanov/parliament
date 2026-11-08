import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const article = await prisma.news.findUnique({
    where: { slug },
  });

  if (!article) return { title: locale === 'en' ? 'Article not found' : 'Жаңалық табылмады' };

  const title = article.titleKk || article.titleRu;
  const description = article.excerpt || (article.contentKk || article.contentRu).slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function NewsArticlePage({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}) {
  const article = await prisma.news.findUnique({
    where: { slug },
  });

  if (!article) notFound();

  const title = locale === 'kk' ? article.titleKk : article.titleRu;
  const content = locale === 'kk' ? article.contentKk : article.contentRu;

  return (
    <main className="relative min-h-screen bg-[#ffffff] text-[#00afca] overflow-x-hidden">
      <Header locale={locale} />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-[#ffffff]">
        <div>
          <Link
            href={`/${locale}#news`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#00afca] hover:underline"
          >
            <span>←</span>
            <span>{locale === 'en' ? 'Back to all news' : 'Барлық жаңалықтарға қайту'}</span>
          </Link>
        </div>

        <article className="rounded-2xl p-6 sm:p-10 space-y-6 bg-[#ffffff] border-2 border-[#00afca]">
          <div className="flex items-center gap-2 text-xs text-[#00afca] font-bold uppercase tracking-wider">
            <span>
              {new Date(article.createdAt).toLocaleDateString(
                locale === 'en' ? 'en-US' : 'kk-KZ',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#00afca] leading-tight">
            {title}
          </h1>

          <div className="border-t-2 border-[#00afca] pt-6 text-[#00afca] text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </article>
      </div>

      <Footer locale={locale} />
    </main>
  );
}
