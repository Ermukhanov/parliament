import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const [
    totalEvents,
    totalRegistrations,
    totalVotes,
    totalAppeals,
    pendingAppeals,
    pendingSuggestions,
    statsCounters,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.registration.count(),
    prisma.vote.count(),
    prisma.appeal.count(),
    prisma.appeal.count({ where: { status: 'new' } }),
    prisma.suggestion.count({ where: { status: 'pending' } }),
    prisma.stat.findMany(),
  ]);

  return NextResponse.json({
    metrics: {
      totalEvents,
      totalRegistrations,
      totalVotes,
      totalAppeals,
      pendingAppeals,
      pendingSuggestions,
    },
    statsCounters,
    stats: statsCounters,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json({ error: 'Нет прав на изменение счётчиков школы' }, { status: 403 });
  }

  try {
    const { key, value } = await req.json();

    const updated = await prisma.stat.upsert({
      where: { key },
      update: { value: Number(value) },
      create: { key, value: Number(value) },
    });

    return NextResponse.json({ success: true, stat: updated });
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления счётчика' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}
