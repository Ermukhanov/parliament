import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';
import { eventSchema } from '@/lib/validations';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: session.hasFullAccess ? undefined : { ministry: session.login },
    orderBy: { date: 'desc' },
    include: {
      registrations: true,
      _count: {
        select: { registrations: true },
      },
    },
  });

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        ...validated,
        ministry: session.hasFullAccess ? validated.ministry : session.login,
        date: new Date(validated.date),
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Неверные данные события' }, { status: 400 });
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
    return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
  }

  if (!session.hasFullAccess) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing || existing.ministry !== session.login) {
      return NextResponse.json({ error: 'Доступ только к событиям своей фракции' }, { status: 403 });
    }
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID события не указан' }, { status: 400 });
    }

    if (!session.hasFullAccess) {
      const existing = await prisma.event.findUnique({ where: { id } });
      if (!existing || existing.ministry !== session.login) {
        return NextResponse.json({ error: 'Доступ только к событиям своей фракции' }, { status: 403 });
      }
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.titleKk && { titleKk: data.titleKk }),
        ...(data.titleRu && { titleRu: data.titleRu }),
        ...(data.descKk && { descKk: data.descKk }),
        ...(data.descRu && { descRu: data.descRu }),
        ...(data.category && { category: data.category }),
        ...(data.location && { location: data.location }),
        ...(data.maxSeats !== undefined && { maxSeats: Number(data.maxSeats) }),
        ...(data.archived !== undefined && { archived: Boolean(data.archived) }),
        ...(data.date && { date: new Date(data.date) }),
        ...(session.hasFullAccess && data.ministry && { ministry: data.ministry }),
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления события' }, { status: 400 });
  }
}
