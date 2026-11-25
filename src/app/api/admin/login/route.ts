import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionToken, FULL_ACCESS_LOGINS } from '@/lib/auth';

const LOGIN_ALIASES: Record<string, string> = {
  // culture / мәдениет
  culture: 'aqlmadn26',
  madeniet: 'aqlmadn26',
  'мәдениет': 'aqlmadn26',
  madeni: 'aqlmadn26',
  aqlmadeni26: 'aqlmadn26',
  aqlmadeniet26: 'aqlmadn26',
  aqlmadn26: 'aqlmadn26',

  // president / төралқа
  president: 'aqlbas26',
  'президент': 'aqlbas26',
  pres: 'aqlbas26',
  bas: 'aqlbas26',
  aqlbas26: 'aqlbas26',

  // vice / вице-президент
  vice: 'aqlvice26',
  'вице': 'aqlvice26',
  'вице-президент': 'aqlvice26',
  aqlvice26: 'aqlvice26',

  // it / цифрландыру
  it: 'aqlit26',
  'айти': 'aqlit26',
  'цифр': 'aqlit26',
  'цифрландыру': 'aqlit26',
  aqlit26: 'aqlit26',

  // media / баспасөз
  media: 'aqlmedia26',
  'медиа': 'aqlmedia26',
  aqlmedia26: 'aqlmedia26',

  // volunteers / еріктілер
  volunteers: 'aqlerik26',
  volunteer: 'aqlerik26',
  'еріктілер': 'aqlerik26',
  'ерікті': 'aqlerik26',
  'волонтер': 'aqlerik26',
  aqlerik26: 'aqlerik26',

  // sport / спорт
  sport: 'aqlsport26',
  'спорт': 'aqlsport26',
  aqlsport26: 'aqlsport26',

  // discipline / құқық және тәртіп
  discipline: 'aqlzang26',
  'тәртіп': 'aqlzang26',
  'заң': 'aqlzang26',
  zang: 'aqlzang26',
  tartip: 'aqlzang26',
  aqlzang26: 'aqlzang26',

  // education / білім
  education: 'aqlbilim26',
  'білім': 'aqlbilim26',
  bilim: 'aqlbilim26',
  aqlbilim26: 'aqlbilim26',
};

const LEGACY_PASSWORDS: Record<string, string[]> = {
  aqlmadn26: ['Madeni#26', 'madeni#26', 'Madeni26', 'AqlCult&2026', 'parliament2025'],
  aqlbas26: ['Kenges@2026', 'kenges@2026', 'AqlPres!2026', 'parliament2025'],
  aqlvice26: ['Birlik#2026', 'birlik#2026', 'AqlVice#2026', 'parliament2025'],
  aqlit26: ['Digit@l26', 'digit@l26', 'AqlIt@2026', 'parliament2025'],
  aqlmedia26: ['Kontent#26', 'kontent#26', 'AqlMedia$2026', 'parliament2025'],
  aqlerik26: ['Erictil@26', 'erictil@26', 'AqlVolun#2026', 'parliament2025'],
  aqlsport26: ['Champ!26', 'champ!26', 'AqlSport*2026', 'parliament2025'],
  aqlzang26: ['Tartip@26', 'tartip@26', 'AqlDisc!2026', 'parliament2025'],
  aqlbilim26: ['Oqytu#26', 'oqytu#26', 'AqlEdu@2026', 'parliament2025'],
};

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();
    const masterPassword = process.env.ADMIN_PASSWORD || 'parliament2025';
    const inputLogin = (login || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    if (!inputLogin) {
      return NextResponse.json({ error: 'Логинді енгізіңіз' }, { status: 400 });
    }

    // Master admin
    if (inputLogin === 'admin') {
      if (inputPass !== masterPassword) {
        return NextResponse.json({ error: 'Құпиясөз қате / Invalid password' }, { status: 401 });
      }
      const token = getSessionToken('admin');
      const res = NextResponse.json({
        success: true,
        login: 'admin',
        role: 'Бас әкімші (Super Admin)',
        ministry: 'all',
        ownMinistry: 'all',
        hasFullAccess: true,
      });
      res.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
      return res;
    }

    const targetLogin = LOGIN_ALIASES[inputLogin] || inputLogin;

    // Search minister by alias/login first, then ministry name
    let minister = await prisma.member.findUnique({
      where: { login: targetLogin },
    });

    if (!minister) {
      minister = await prisma.member.findFirst({
        where: {
          OR: [
            { login: inputLogin },
            { ministry: inputLogin },
            { ministry: targetLogin },
          ],
        },
      });
    }

    if (!minister) {
      return NextResponse.json(
        { error: 'Логин немесе құпиясөз қате / Invalid credentials' },
        { status: 401 }
      );
    }

    const canonicalLogin = minister.login;
    const acceptedPasses = [
      minister.password,
      ...(LEGACY_PASSWORDS[canonicalLogin] || []),
      masterPassword,
    ];

    const passMatches = acceptedPasses.some(
      (p) => p === inputPass || p.toLowerCase() === inputPass.toLowerCase()
    );

    if (!passMatches) {
      return NextResponse.json(
        { error: 'Логин немесе құпиясөз қате / Invalid credentials' },
        { status: 401 }
      );
    }

    const sessionRole = `${minister.roleKk}${minister.nameKk ? ` — ${minister.nameKk}` : ''}`;
    const sessionMinistry = minister.ministry;
    const hasFullAccess =
      FULL_ACCESS_LOGINS.includes(canonicalLogin) ||
      FULL_ACCESS_LOGINS.includes(inputLogin);

    const token = getSessionToken(canonicalLogin);
    const response = NextResponse.json({
      success: true,
      login: canonicalLogin,
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
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Сервер қатесі / Server error' }, { status: 500 });
  }
}
