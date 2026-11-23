import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const stickers = await prisma.sticker.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    const formatted = stickers.map((s) => ({
      id: s.id,
      title: s.title,
      authorName: s.authorName,
      authorGrade: s.authorGrade,
      imageUrl: s.imageUrl,
      status: s.status,
      createdAt: s.createdAt,
      votesCount: s._count.votes,
    }));

    return NextResponse.json({ stickers: formatted });
  } catch (err) {
    console.error('Admin get stickers error:', err);
    return NextResponse.json({ error: 'Стикерлерді алу қатесі' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID көрсетілмеген' }, { status: 400 });
  }

  try {
    await prisma.sticker.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Стикер сәтті өшірілді' });
  } catch (err) {
    console.error('Admin delete sticker error:', err);
    return NextResponse.json({ error: 'Стикерді өшіру мүмкін болмады' }, { status: 500 });
  }
}
