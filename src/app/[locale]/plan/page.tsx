import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import TimelineSection from '@/components/TimelineSection';
import { FALLBACK_TIMELINE } from '@/lib/fallbacks';

export const revalidate = 0;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Annual Roadmap | AQL Council' : 'Жыл Жоспары | AQL Council',
    description: isEn
      ? 'Academic year roadmap and strategic goals of the AQL Council School Parliament from September to May.'
      : 'Қыркүйектен мамырға дейінгі AQL Council мектеп парламентінің даму бағыты мен жылдық жоспары.',
  };
}

export default async function PlanPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let timeline = FALLBACK_TIMELINE;
  try {
    const dbTimeline = await prisma.timelineItem.findMany({
      orderBy: { order: 'asc' },
    });
    if (dbTimeline && dbTimeline.length > 0) {
      timeline = dbTimeline;
    }
  } catch (err) {
    console.error('PlanPage DB query error (using fallback timeline):', err);
  }

  return (
    <div className="py-6 sm:py-10">
      <TimelineSection locale={locale} items={timeline} />
    </div>
  );
}
