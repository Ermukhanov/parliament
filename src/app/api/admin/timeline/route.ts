import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';
import { timelineSchema } from '@/lib/validations';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const items = await prisma.timelineItem.findMany({
    where: session.hasFullAccess ? undefined : { ministry: session.login },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = timelineSchema.parse(body);

    const item = await prisma.timelineItem.create({
      data: {
        ...validated,
        ministry: session.hasFullAccess ? validated.ministry : session.login,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
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
    const existing = await prisma.timelineItem.findUnique({ where: { id } });
    if (!existing || existing.ministry !== session.login) {
      return NextResponse.json({ error: 'Доступ только к плану своей фракции' }, { status: 403 });
    }
  }

  await prisma.timelineItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
