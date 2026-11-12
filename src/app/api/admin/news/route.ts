import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';
import { newsSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const news = await prisma.news.findMany({
    where: session.hasFullAccess ? undefined : { ministry: session.login },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ news });
}

export async function POST(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = newsSchema.parse(body);

    const titleRu = validated.titleRu || validated.titleKk;
    const contentRu = validated.contentRu || validated.contentKk;
    const excerpt = validated.excerpt || validated.contentKk.slice(0, 160);

    const article = await prisma.news.create({
      data: {
        ...validated,
        titleRu,
        contentRu,
        excerpt,
        ministry: session.hasFullAccess ? (validated.ministry || 'general') : session.login,
      },
    });

    revalidatePath('/kk');
    revalidatePath('/en');
    revalidatePath('/kk/news');
    revalidatePath('/en/news');

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (err) {
    console.error('Create news error:', err);
    return NextResponse.json({ error: 'Неверные данные новости' }, { status: 400 });
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

  try {
    if (!session.hasFullAccess) {
      const existing = await prisma.news.findUnique({ where: { id } });
      if (!existing || existing.ministry !== session.login) {
        return NextResponse.json({ error: 'Доступ только к новостям своей фракции' }, { status: 403 });
      }
    }

    await prisma.news.delete({ where: { id } });
    revalidatePath('/kk');
    revalidatePath('/en');
    revalidatePath('/kk/news');
    revalidatePath('/en/news');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления новости' }, { status: 500 });
  }
}
