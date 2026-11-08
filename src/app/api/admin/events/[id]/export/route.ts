import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 });
  }

  // Generate CSV with BOM for Russian Excel support
  const header = '№,Имя Фамилия,Класс,Телефон,Дата записи\n';
  const rows = event.registrations
    .map(
      (r, idx) =>
        `${idx + 1},"${r.name.replace(/"/g, '""')}","${r.grade}","${r.phone}","${new Date(
          r.createdAt
        ).toLocaleString('ru-RU')}"`
    )
    .join('\n');

  const csv = '\uFEFF' + header + rows;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="attendees-${event.slug}.csv"`,
    },
  });
}
