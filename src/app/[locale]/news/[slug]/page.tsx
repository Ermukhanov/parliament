import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href={`/${locale}/news`}
          prefetch
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#00afca] hover:underline"
        >
          <span>←</span>
          <span>{locale === 'en' ? 'Back to all news' : 'Барлық жаңалықтарға қайту'}</span>
        </Link>
      </div>

      <article className="aql-card p-6 sm:p-10 space-y-6 bg-white border border-slate-200 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>
            {new Date(article.createdAt).toLocaleDateString(
              locale === 'en' ? 'en-US' : 'kk-KZ',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </span>
          {article.ministry && (
            <>
              <span>•</span>
              <span className="text-[#00afca] font-extrabold">{article.ministry}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          {title}
        </h1>

        <div className="border-t border-slate-100 pt-6 text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </article>
    </div>
  );
}
