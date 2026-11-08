import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionToken, FULL_ACCESS_LOGINS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();
    const masterPassword = process.env.ADMIN_PASSWORD || 'parliament2025';
    const cleanLogin = (login || 'president').trim().toLowerCase();

    let sessionRole = 'AQL Council Төралқасы';
    let sessionMinistry = 'all';

    const minister = await prisma.member.findUnique({
      where: { login: cleanLogin },
    });

    if (cleanLogin === 'admin') {
      if (password !== masterPassword) {
        return NextResponse.json({ error: 'Құпиясөз қате / Invalid password' }, { status: 401 });
      }
    } else {
      if (!minister || (minister.password !== password && password !== masterPassword)) {
        return NextResponse.json(
          { error: 'Логин немесе құпиясөз қате / Invalid credentials' },
          { status: 401 }
        );
      }

      sessionRole = `${minister.roleKk}${minister.nameKk ? ` — ${minister.nameKk}` : ''}`;
      sessionMinistry = minister.ministry;
    }

    const hasFullAccess = FULL_ACCESS_LOGINS.includes(cleanLogin);
    const token = getSessionToken(cleanLogin);
    const response = NextResponse.json({
      success: true,
      login: cleanLogin,
      role: sessionRole,
      ministry: hasFullAccess ? 'all' : sessionMinistry,
      ownMinistry: sessionMinistry,
      hasFullAccess,
    });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Сервер қатесі / Server error' }, { status: 500 });
  }
}
