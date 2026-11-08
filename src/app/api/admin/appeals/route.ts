import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const appeals = await prisma.appeal.findMany({
    where: session.hasFullAccess ? undefined : { ministry: session.login },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ appeals });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    if (!['new', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Неверный статус' }, { status: 400 });
    }

    if (!session.hasFullAccess) {
      const existing = await prisma.appeal.findUnique({ where: { id } });
      if (!existing || existing.ministry !== session.login) {
        return NextResponse.json({ error: 'Доступ только к обращениям своей фракции' }, { status: 403 });
      }
    }

    const updated = await prisma.appeal.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, appeal: updated });
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}
