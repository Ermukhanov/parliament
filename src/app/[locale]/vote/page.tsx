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
  let formattedPoll: PollData | null = null;

  try {
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

  // Fallback poll if DB is empty or during migration
  if (!formattedPoll) {
    formattedPoll = {
      id: 'default_poll',
      questionKk: 'Лицейдегі ең сүйікті фракциялық бастамаңыз қайсысы?',
      questionRu: 'Какая фракционная инициатива в лицее вам ближе всего?',
      options: [
        { id: 'opt_1', textKk: 'AQL IT Hackathon және цифрлық жобалар', textRu: 'AQL IT Hackathon и цифровые проекты', votesCount: 42 },
        { id: 'opt_2', textKk: 'Мектеп спартакиадасы мен киберспорт турнирлері', textRu: 'Школьная спартакиада и киберспорт', votesCount: 38 },
        { id: 'opt_3', textKk: 'TEDx AQL және мәдени кештер', textRu: 'TEDx AQL и творческие вечера', votesCount: 29 },
        { id: 'opt_4', textKk: 'Қайырымдылық жәрмеңкелері & Эко-бастамалар', textRu: 'Благотворительные ярмарки и эко-акции', votesCount: 35 },
      ],
    };
  }

  return (
    <div className="py-8 sm:py-12">
      <VotingSection locale={locale} poll={formattedPoll} />
    </div>
  );
}
