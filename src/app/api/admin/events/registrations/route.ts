import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionInfo } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID тіркелу көрсетілмеген' }, { status: 400 });
  }

  try {
    const reg = await prisma.registration.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!reg) {
      return NextResponse.json({ error: 'Тіркелу табылмады' }, { status: 404 });
    }

    const eventMin = (reg.event.ministry || 'general').trim().toLowerCase();
    const sessionMin = (session.login || '').trim().toLowerCase();

    if (!session.hasFullAccess && eventMin !== sessionMin) {
      return NextResponse.json(
        { error: 'Тек өз фракцияңыздың іс-шараларына жазылғандарды өшіре аласыз' },
        { status: 403 }
      );
    }

    await prisma.registration.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete registration error:', err);
    return NextResponse.json({ error: 'Тіркелуді өшіру кезінде қате кетті' }, { status: 500 });
  }
}
