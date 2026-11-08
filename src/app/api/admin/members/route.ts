import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';
import { memberSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const allMembers = await prisma.member.findMany({
    orderBy: { order: 'asc' },
  });

  const currentMember = allMembers.find((m) => m.login === session.login);
  const members = session.hasFullAccess
    ? allMembers
    : allMembers.filter((m) => m.login === session.login);

  const currentUser = {
    login: session.login,
    ministry: session.hasFullAccess ? 'all' : (currentMember?.ministry || session.login),
    ownMinistry: currentMember?.ministry || session.login,
    role: currentMember
      ? `${currentMember.roleKk} — ${currentMember.nameKk}`
      : 'Мектеп Президенті',
    name: currentMember?.nameKk || session.login,
    hasFullAccess: session.hasFullAccess,
  };

  return NextResponse.json({ members, currentUser });
}

export async function POST(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session || !session.hasFullAccess) {
    return NextResponse.json({ error: 'Доступ разрешён только Президенту, Вице-президенту и Министру IT' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = memberSchema.parse(body);

    const member = await prisma.member.create({
      data: validated,
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Неверные данные или такой логин уже существует' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID министра не указан' }, { status: 400 });
    }

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Фракция не найдена' }, { status: 404 });
    }

    if (!session.hasFullAccess && existing.login !== session.login) {
      return NextResponse.json({ error: 'Вы можете редактировать только свою фракцию' }, { status: 403 });
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        login: session.hasFullAccess ? updateData.login : existing.login,
        password: updateData.password,
        ministry: session.hasFullAccess ? updateData.ministry : existing.ministry,
        ministryNameRu: updateData.ministryNameRu,
        ministryNameKk: updateData.ministryNameKk,
        nameRu: updateData.nameRu ?? '',
        nameKk: updateData.nameKk ?? '',
        grade: updateData.grade ?? '',
        roleRu: updateData.roleRu,
        roleKk: updateData.roleKk,
        quoteRu: updateData.quoteRu ?? '',
        quoteKk: updateData.quoteKk ?? '',
        bioRu: updateData.bioRu ?? '',
        bioKk: updateData.bioKk ?? '',
        assistants: typeof updateData.assistants === 'string' ? updateData.assistants : existing.assistants,
        photo: updateData.photo ?? '',
        order: session.hasFullAccess && typeof updateData.order === 'number' ? updateData.order : existing.order,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления данных министра' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session || !session.hasFullAccess) {
    return NextResponse.json({ error: 'Доступ разрешён только Президенту, Вице-президенту и Министру IT' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
  }

  await prisma.member.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
