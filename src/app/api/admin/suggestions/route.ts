import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ suggestions });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json({ error: 'Нет прав на модерацию общих идей' }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Неверный статус' }, { status: 400 });
    }

    const updated = await prisma.suggestion.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, suggestion: updated });
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json({ error: 'Тек Президент ұсыныстарды өшіре алады' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID көрсетілмеген' }, { status: 400 });
  }

  try {
    await prisma.suggestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ұсынысты өшіру кезінде қате кетті' }, { status: 500 });
  }
}
