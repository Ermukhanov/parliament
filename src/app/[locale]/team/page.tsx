import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import TeamPageClient from './TeamPageClient';

export const revalidate = 0;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Parliament Council | AQL Council' : 'Парламент Құрамы | AQL Council',
    description: isEn
      ? 'Meet the School President, Vice-President, and Ministers of the 7 specialized factions of AQL Council.'
      : 'Мектеп Президенті, Вице-президент және 7 бейінді фракция министрлерімен танысыңыз.',
  };
}

export default async function TeamPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const members = await prisma.member.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="py-8 sm:py-12">
      <TeamPageClient locale={locale} members={members} />
    </div>
  );
}
