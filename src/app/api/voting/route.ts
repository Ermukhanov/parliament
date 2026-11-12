import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { voteSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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

    if (!poll) {
      return NextResponse.json(
        { poll: null },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
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

    return NextResponse.json(
      { poll: formatted },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ error: 'Ошибка получения опроса' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  // Allow up to 150 votes per minute on shared school Wi-Fi
  if (!checkRateLimit(clientIp, 150, 60000)) {
    return NextResponse.json(
      { error: 'Сұраныстар тым көп. Біраздан соң қайталап көріңіз.' },
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
        { error: 'Бұл нұсқа табылмады немесе сауалнама жабылған' },
        { status: 404 }
      );
    }

    // Determine unique voter identifier:
    // deviceId allows classmates on same school Wi-Fi to vote independently
    const voterKey = validated.deviceId && validated.deviceId.trim().length > 3
      ? `dev_${validated.deviceId.trim()}`
      : `ip_${clientIp}`;

    // Check if this device/voter has already voted for this poll
    const existingVote = await prisma.vote.findFirst({
      where: {
        ip: voterKey,
        option: {
          pollId: option.pollId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Сіздің құрылғыңыздан бұл сауалнамаға дауыс берілген' },
        { status: 409 }
      );
    }

    await prisma.vote.create({
      data: {
        optionId: validated.optionId,
        ip: voterKey,
      },
    });

    // Fetch updated counts
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: option.pollId },
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

    const freshOptions = updatedPoll?.options.map((opt) => ({
      id: opt.id,
      textRu: opt.textRu,
      textKk: opt.textKk,
      votesCount: opt._count.votes,
    })) || [];

    return NextResponse.json(
      { success: true, options: freshOptions },
      { status: 201, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: unknown) {
    console.error('Voting error:', err);
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Қате деректер' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Дауыс беру кезінде сервер қатесі орын алды' }, { status: 500 });
  }
}
