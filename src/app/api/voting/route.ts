import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { voteSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
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

    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    const formatted = {
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

    return NextResponse.json({ poll: formatted });
  } catch {
    return NextResponse.json({ error: 'Ошибка получения опроса' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

  // Limit rapid voting attempts
  if (!checkRateLimit(ip, 6, 60000)) {
    return NextResponse.json(
      { error: 'Слишком много запросов. Подождите.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validated = voteSchema.parse(body);

    const option = await prisma.pollOption.findUnique({
      where: { id: validated.optionId },
      include: { poll: true },
    });

    if (!option || !option.poll.active) {
      return NextResponse.json(
        { error: 'Вариант не найден или опрос завершён' },
        { status: 404 }
      );
    }

    // Check if IP has already voted for this poll
    const existingVote = await prisma.vote.findFirst({
      where: {
        ip,
        option: {
          pollId: option.pollId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'С вашего устройства/IP уже был отдан голос в этом опросе' },
        { status: 400 }
      );
    }

    await prisma.vote.create({
      data: {
        optionId: validated.optionId,
        ip,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
