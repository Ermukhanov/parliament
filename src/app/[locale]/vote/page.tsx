import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import VotingSection, { PollData } from '@/components/VotingSection';

export const revalidate = 0;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Student Voting | AQL Council' : 'Ашық Дауыс Беру | AQL Council',
    description: isEn
      ? 'Participate in student voting on active school questions and submit your own initiatives to the AQL Council Parliament.'
      : 'Мектеп парламентінің сауалнамаларына дауыс беріп, өз идеяларыңызды ұсыныңыз.',
  };
}

export default async function VotePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const poll = await prisma.poll.findFirst({
    where: { active: true },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  const formattedPoll: PollData | null = poll
    ? {
        id: poll.id,
        questionRu: poll.questionRu,
        questionKk: poll.questionKk,
        options: poll.options.map((opt) => ({
          id: opt.id,
          textRu: opt.textRu,
          textKk: opt.textKk,
          votesCount: opt._count.votes,
        })),
      }
    : null;

  return (
    <div className="py-6 sm:py-10">
      <VotingSection locale={locale} poll={formattedPoll} />
    </div>
  );
}
