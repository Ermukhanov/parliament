import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventDetailClient from './EventDetailClient';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) return { title: locale === 'en' ? 'Event not found' : 'Іс-шара табылмады' };

  const title = event.titleKk || event.titleRu;
  const description = event.descKk || event.descRu;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
    },
  };
}

export default async function EventPage({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) notFound();

  return (
    <main className="relative min-h-screen bg-[#ffffff] text-[#00afca] overflow-x-hidden">
      <Header locale={locale} />

      <EventDetailClient
        locale={locale}
        event={{
          id: event.id,
          slug: event.slug,
          titleRu: event.titleRu,
          titleKk: event.titleKk,
          descRu: event.descRu,
          descKk: event.descKk,
          category: event.category,
          date: event.date.toISOString(),
          location: event.location,
          maxSeats: event.maxSeats,
          programRu: event.programRu,
          programKk: event.programKk,
          gallery: event.gallery,
          archived: event.archived,
          registrationsCount: event._count.registrations,
        }}
      />

      <Footer locale={locale} />
    </main>
  );
}
