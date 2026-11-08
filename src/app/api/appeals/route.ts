import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { appealSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  if (!checkRateLimit(ip, 5, 60000)) {
    return NextResponse.json(
      { error: 'Слишком много запросов. Подождите.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    if (body.honeypot) {
      return NextResponse.json({ success: true });
    }

    const validated = appealSchema.parse(body);

    const appeal = await prisma.appeal.create({
      data: {
        type: validated.type,
        ministry: validated.ministry || 'general',
        name: validated.anonymous ? '' : validated.name || '',
        grade: validated.anonymous ? '' : validated.grade || '',
        text: validated.text,
        anonymous: validated.anonymous || false,
        status: 'new',
      },
    });

    return NextResponse.json({ success: true, appeal }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Заполните корректно все обязательные поля' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
