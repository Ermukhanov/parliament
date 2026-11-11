import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import EventsSection, { EventItem } from '@/components/EventsSection';

export const revalidate = 0;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn ? 'School Events | AQL Council' : 'Іс-шаралар Афишасы | AQL Council',
    description: isEn
      ? 'Explore upcoming school parliament tournaments, forums, workshops, and register online.'
      : 'Мектеп парламентінің алдағы іс-шаралары, турнирлері, кештері және онлайн жазылу.',
  };
}

export default async function EventsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let events: EventItem[] = [];

  try {
    const rawEvents = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    events = rawEvents.map((ev) => ({
      id: ev.id,
      slug: ev.slug,
      titleRu: ev.titleRu,
      titleKk: ev.titleKk,
      descRu: ev.descRu,
      descKk: ev.descKk,
      category: ev.category,
      ministry: ev.ministry,
      date: ev.date.toISOString(),
      location: ev.location,
      image: ev.image,
      maxSeats: ev.maxSeats,
      archived: ev.archived,
      registrationsCount: ev._count.registrations,
    }));
  } catch (err) {
    console.error('EventsPage DB query error:', err);
  }

  return (
    <div className="py-6 sm:py-10">
      <EventsSection locale={locale} events={events} />
    </div>
  );
}
