import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { voteSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { getVoterIdentity, attachVoterCookies } from '@/lib/voter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const voter = getVoterIdentity(req);

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
        { poll: null, userVotedOptionId: null },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    // Check if voter already voted
    let userVotedOptionId: string | null = null;
    const cookieVoted = req.cookies.get(`aql_voted_poll_${poll.id}`)?.value;

    const existingVote = await prisma.vote.findFirst({
      where: {
        option: {
          pollId: poll.id,
        },
        ip: {
          in: voter.lookupKeys,
        },
      },
      select: { optionId: true },
    });

    if (existingVote) {
      userVotedOptionId = existingVote.optionId;
    } else if (cookieVoted) {
      userVotedOptionId = cookieVoted;
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

    const res = NextResponse.json(
      { poll: formatted, userVotedOptionId },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

    if (voter.isNewToken) {
      attachVoterCookies(res, voter.token);
    }

    return res;
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

    const voter = getVoterIdentity(req, validated.deviceId);

    // Multi-layer check: cookie check
    const cookieAlreadyVoted = req.cookies.get(`aql_voted_poll_${option.pollId}`)?.value;
    if (cookieAlreadyVoted) {
      return NextResponse.json(
        { error: 'Сіздің құрылғыңыздан бұл сауалнамаға дауыс берілген / You have already voted' },
        { status: 409 }
      );
    }

    // Database check across lookupKeys
    const existingVote = await prisma.vote.findFirst({
      where: {
        option: {
          pollId: option.pollId,
        },
        ip: {
          in: voter.lookupKeys,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Сіздің құрылғыңыздан бұл сауалнамаға дауыс берілген / You have already voted' },
        { status: 409 }
      );
    }

    await prisma.vote.create({
      data: {
        optionId: validated.optionId,
        ip: voter.primaryKey,
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

    const res = NextResponse.json(
      { success: true, options: freshOptions, userVotedOptionId: option.id },
      { status: 201, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

    attachVoterCookies(res, voter.token, {
      [`aql_voted_poll_${option.pollId}`]: option.id,
    });

    return res;
  } catch (err: unknown) {
    console.error('Voting error:', err);
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Қате деректер' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Дауыс беру кезінде сервер қатесі орын алды' }, { status: 500 });
  }
}
