import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';
import { pollSchema } from '@/lib/validations';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const polls = await prisma.poll.findMany({
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

  return NextResponse.json({ polls });
}

export async function POST(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json({ error: 'Тек Президент, Вице-президент және IT министрі дауыс беруді қоса алады' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = pollSchema.parse(body);

    // Deactivate old polls if the new one is active
    if (validated.active) {
      await prisma.poll.updateMany({
        data: { active: false },
      });
    }

    const poll = await prisma.poll.create({
      data: {
        questionRu: validated.questionRu,
        questionKk: validated.questionKk,
        active: validated.active ?? true,
        options: {
          create: validated.options.map((opt) => ({
            textRu: opt.textRu,
            textKk: opt.textKk,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({ success: true, poll }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Ошибка создания опроса' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json({ error: 'Нет прав на удаление' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
  }

  await prisma.poll.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
