import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { registrationSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate limit: max 5 registrations per minute per IP
  if (!checkRateLimit(ip, 5, 60000)) {
    return NextResponse.json(
      { error: 'Слишком много попыток. Подождите минуту.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ success: true, message: 'Успешно' });
    }

    const validated = registrationSchema.parse({
      ...body,
      eventId: params.id,
    });

    // Check event existence and seat availability
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Мероприятие не найдено' },
        { status: 404 }
      );
    }

    if (event.archived) {
      return NextResponse.json(
        { error: 'Регистрация на это мероприятие закрыта' },
        { status: 400 }
      );
    }

    if (event._count.registrations >= event.maxSeats) {
      return NextResponse.json(
        { error: 'К сожалению, все места на мероприятие уже заняты' },
        { status: 400 }
      );
    }

    // Check duplicate: same event, same name and grade
    const existing = await prisma.registration.findFirst({
      where: {
        eventId: params.id,
        name: validated.name,
        grade: validated.grade,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ученик с таким именем и классом уже записан на это событие' },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        eventId: params.id,
        name: validated.name,
        grade: validated.grade,
        phone: validated.phone || '',
      },
    });

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Неверные данные формы' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}
