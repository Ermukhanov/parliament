import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import VotingSection, { PollData } from '@/components/VotingSection';
import StickerContestSection from '@/components/StickerContestSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn
      ? 'Sticker Contest & Student Voting | AQL Council'
      : 'Стикерлер Байқауы және Дауыс Беру | AQL Council',
    description: isEn
      ? 'Add your sticker to the school sticker pack and participate in student voting on active school questions.'
      : 'Мектептің стикерлер топтамасына өз стикеріңді қос және мектептік сауалнамаларға қатыс.',
  };
}

export default async function VotePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let formattedPoll: PollData | null = null;

  try {
    const poll = await prisma.poll.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
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

    if (poll) {
      formattedPoll = {
        id: poll.id,
        questionRu: poll.questionRu,
        questionKk: poll.questionKk,
        options: poll.options.map((opt) => ({
          id: opt.id,
          textRu: opt.textRu,
          textKk: opt.textKk,
          votesCount: opt._count.votes,
        })),
      };
    }
  } catch (err) {
    console.error('VotePage DB query error:', err);
  }

  return (
    <div className="py-6 sm:py-10 space-y-10 sm:space-y-16">
      <StickerContestSection locale={locale} />
      <VotingSection locale={locale} poll={formattedPoll} />
    </div>
  );
}
