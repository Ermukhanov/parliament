import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { suggestionSchema } from '@/lib/validations';
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

    const validated = suggestionSchema.parse(body);

    const suggestion = await prisma.suggestion.create({
      data: {
        text: validated.text,
        author: validated.author || 'Аноним',
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, suggestion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Ошибка при сохранении идеи' }, { status: 400 });
  }
}
