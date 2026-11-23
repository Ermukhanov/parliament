import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVoterIdentity, attachVoterCookies } from '@/lib/voter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const voter = getVoterIdentity(req);

    const stickers = await prisma.sticker.findMany({
      where: { status: 'approved' },
      orderBy: [
        { votes: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    // Check if current user already voted for any sticker
    const existingVote = await prisma.stickerVote.findFirst({
      where: {
        voterKey: {
          in: voter.lookupKeys,
        },
      },
      select: { stickerId: true },
    });

    const cookieVotedStickerId = req.cookies.get('aql_voted_stickers')?.value;
    const userVotedStickerId = existingVote?.stickerId || cookieVotedStickerId || null;
    const hasVoted = Boolean(userVotedStickerId);

    // Check if current user already uploaded a sticker
    const existingUpload = await prisma.sticker.findFirst({
      where: {
        uploaderKey: {
          in: voter.lookupKeys,
        },
      },
      select: { id: true },
    });
    const cookieUploaded = req.cookies.get('aql_uploaded_sticker')?.value;
    const canUpload = !existingUpload && !cookieUploaded;

    const formatted = stickers.map((s) => ({
      id: s.id,
      title: s.title,
      authorName: s.authorName,
      authorGrade: s.authorGrade,
      imageUrl: s.imageUrl,
      createdAt: s.createdAt,
      votesCount: s._count.votes,
      isMyVote: userVotedStickerId === s.id,
    }));

    const res = NextResponse.json(
      {
        stickers: formatted,
        totalVotes: formatted.reduce((acc, s) => acc + s.votesCount, 0),
        hasVoted,
        userVotedStickerId,
        canUpload,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

    if (voter.isNewToken) {
      attachVoterCookies(res, voter.token);
    }

    return res;
  } catch (err) {
    console.error('Error fetching stickers:', err);
    return NextResponse.json({ error: 'Стикерлерді алу мүмкін болмады' }, { status: 500 });
  }
}
