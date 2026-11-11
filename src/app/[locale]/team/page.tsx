import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import TeamPageClient from './TeamPageClient';
import { FALLBACK_MEMBERS } from '@/lib/fallbacks';

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
  let members = FALLBACK_MEMBERS;
  try {
    const dbMembers = await prisma.member.findMany({
      orderBy: { order: 'asc' },
    });
    if (dbMembers && dbMembers.length > 0) {
      members = dbMembers;
    }
  } catch (err) {
    console.error('TeamPage DB query error (using fallback members):', err);
  }

  return (
    <div className="py-8 sm:py-12">
      <TeamPageClient locale={locale} members={members} />
    </div>
  );
}
