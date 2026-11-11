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
      const existingMin = (existing?.ministry || 'general').trim().toLowerCase();
      const sessionMin = (session.login || '').trim().toLowerCase();
      if (!existing || existingMin !== sessionMin) {
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

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID өтініш көрсетілмеген' }, { status: 400 });
  }

  try {
    const existing = await prisma.appeal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Өтініш табылмады' }, { status: 404 });
    }

    const existingMin = (existing.ministry || 'general').trim().toLowerCase();
    const sessionMin = (session.login || '').trim().toLowerCase();

    if (!session.hasFullAccess && existingMin !== sessionMin) {
      return NextResponse.json(
        { error: 'Тек өз фракцияңыздың өтініштерін өшіре аласыз' },
        { status: 403 }
      );
    }

    await prisma.appeal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Өтінішті өшіру кезінде қате орын алды' }, { status: 500 });
  }
}
