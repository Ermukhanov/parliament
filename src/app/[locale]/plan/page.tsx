import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import TimelineSection from '@/components/TimelineSection';

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
  const timeline = await prisma.timelineItem.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="py-6 sm:py-10">
      <TimelineSection locale={locale} items={timeline} />
    </div>
  );
}
