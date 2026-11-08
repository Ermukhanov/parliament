import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const events = await prisma.event.findMany({ select: { slug: true, updatedAt: true } });
  const news = await prisma.news.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });

  const routes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/ru`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/kk`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  ];

  events.forEach((ev) => {
    routes.push({
      url: `${siteUrl}/ru/events/${ev.slug}`,
      lastModified: ev.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
    routes.push({
      url: `${siteUrl}/kk/events/${ev.slug}`,
      lastModified: ev.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  news.forEach((n) => {
    routes.push({
      url: `${siteUrl}/ru/news/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
    routes.push({
      url: `${siteUrl}/kk/news/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  return routes;
}
