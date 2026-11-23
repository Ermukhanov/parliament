import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVoterIdentity, attachVoterCookies } from '@/lib/voter';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  if (!checkRateLimit(clientIp, 60, 60000)) {
    return NextResponse.json(
      { error: 'Сұраныстар тым көп. Біраздан соң қайталап көріңіз.' },
      { status: 429 }
    );
  }

  try {
    const stickerId = params.id;
    const body = await req.json().catch(() => ({}));
    const deviceId = typeof body?.deviceId === 'string' ? body.deviceId : '';

    const sticker = await prisma.sticker.findUnique({
      where: { id: stickerId },
    });

    if (!sticker || sticker.status !== 'approved') {
      return NextResponse.json(
        { error: 'Стикер табылмады немесе жабылған' },
        { status: 404 }
      );
    }

    const voter = getVoterIdentity(req, deviceId);

    // Multi-layer check: cookie check
    const cookieVoted = req.cookies.get('aql_voted_stickers')?.value;
    if (cookieVoted) {
      return NextResponse.json(
        {
          error:
            'Сіз стикерпак байқауында өз дауысыңызды беріп қойғансыз! / You have already cast your vote in the sticker contest.',
        },
        { status: 409 }
      );
    }

    // Database check: has this voter voted for ANY sticker in this contest?
    const existingVote = await prisma.stickerVote.findFirst({
      where: {
        voterKey: {
          in: voter.lookupKeys,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        {
          error:
            'Сіз стикерпак байқауында өз дауысыңызды беріп қойғансыз! / You have already cast your vote in the sticker contest.',
        },
        { status: 409 }
      );
    }

    // Create vote in database
    await prisma.stickerVote.create({
      data: {
        stickerId,
        voterKey: voter.primaryKey,
      },
    });

    // Get fresh vote count for this sticker
    const updatedCount = await prisma.stickerVote.count({
      where: { stickerId },
    });

    const res = NextResponse.json(
      {
        success: true,
        stickerId,
        votesCount: updatedCount,
        message: 'Дауысыңыз сәтті қабылданды!',
      },
      { status: 201 }
    );

    attachVoterCookies(res, voter.token, {
      aql_voted_stickers: stickerId,
    });

    return res;
  } catch (err: unknown) {
    console.error('Sticker voting error:', err);
    // Handle unique constraint violation if fired concurrently
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Сіз бұл сауалнамада дауыс беріп қойғансыз' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Дауыс беру кезінде сервер қатесі орын алды' },
      { status: 500 }
    );
  }
}
