import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';
import { pollSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ polls });
}

export async function POST(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json(
      { error: 'Тек Президент, Вице-президент және IT министрі дауыс беруді қоса алады' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // Support both structured array `options` and individual fields `option1Kk`, `option2Kk`, etc.
    let rawOptions = body.options;
    if (!rawOptions || !Array.isArray(rawOptions) || rawOptions.length === 0) {
      const collected: { textKk: string; textRu?: string }[] = [];
      ['option1', 'option2', 'option3', 'option4', 'option5', 'option6'].forEach((k) => {
        const kk = body[`${k}Kk`] || body[k];
        const ru = body[`${k}Ru`] || kk;
        if (kk && typeof kk === 'string' && kk.trim().length > 0) {
          collected.push({ textKk: kk.trim(), textRu: ru ? ru.trim() : kk.trim() });
        }
      });
      rawOptions = collected;
    }

    const normalizedOptions = (rawOptions as unknown[]).map((opt) => {
      if (typeof opt === 'string') {
        const t = opt.trim();
        return { textKk: t, textRu: t };
      }
      if (opt && typeof opt === 'object') {
        const o = opt as Record<string, unknown>;
        const kk = String(o.textKk || o.text || '').trim();
        const ru = String(o.textRu || kk).trim();
        return { textKk: kk, textRu: ru || kk };
      }
      return { textKk: '', textRu: '' };
    }).filter((opt) => opt.textKk.length > 0);

    const rawQuestionKk = String(body.questionKk || body.question || '').trim();
    const rawQuestionRu = String(body.questionRu || rawQuestionKk).trim();
    const active = body.active !== undefined ? Boolean(body.active) : true;

    const validated = pollSchema.parse({
      questionKk: rawQuestionKk,
      questionRu: rawQuestionRu || rawQuestionKk,
      active,
      options: normalizedOptions,
    });

    // If activating new poll, deactivate others so one active poll is in focus
    if (validated.active) {
      await prisma.poll.updateMany({
        data: { active: false },
      });
    }

    const poll = await prisma.poll.create({
      data: {
        questionRu: validated.questionRu || validated.questionKk,
        questionKk: validated.questionKk,
        active: validated.active,
        options: {
          create: validated.options.map((opt) => ({
            textRu: opt.textRu || opt.textKk,
            textKk: opt.textKk,
          })),
        },
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, poll }, { status: 201 });
  } catch (err: unknown) {
    console.error('Create poll error:', err);
    let message = 'Сауалнаманы құру мүмкін болмады';
    if (err && typeof err === 'object' && 'issues' in err) {
      const zodErr = err as { issues?: { message?: string }[] };
      if (zodErr.issues && zodErr.issues[0]?.message) {
        message = zodErr.issues[0].message;
      }
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json({ error: 'Құқығыңыз жеткіліксіз' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, active } = body;

    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'ID немесе күй көрсетілмеген' }, { status: 400 });
    }

    if (active) {
      // Deactivate other polls
      await prisma.poll.updateMany({
        where: { id: { not: id } },
        data: { active: false },
      });
    }

    const poll = await prisma.poll.update({
      where: { id },
      data: { active },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, poll });
  } catch (err) {
    console.error('Toggle poll error:', err);
    return NextResponse.json({ error: 'Сауалнама күйін өзгерту мүмкін болмады' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (!session.hasFullAccess) {
    return NextResponse.json({ error: 'Нет прав на удаление' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
  }

  await prisma.poll.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
