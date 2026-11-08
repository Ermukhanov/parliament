import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'admin_session';
const SESSION_DURATION = 60 * 60 * 24; // 24 hours

export const FULL_ACCESS_LOGINS = ['president', 'vice', 'it', 'admin'];

export interface SessionInfo {
  login: string;
  hasFullAccess: boolean;
}

export async function getSessionInfo(): Promise<SessionInfo | null> {
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  if (!session) return null;
  if (!session.value.startsWith('session_') || !session.value.endsWith('_parliament')) {
    return null;
  }
  // Format: session_${login}_${hash}_parliament
  const parts = session.value.split('_');
  if (parts.length < 4) return null;
  const login = parts.slice(1, parts.length - 2).join('_');
  const expectedToken = getSessionToken(login);
  if (session.value !== expectedToken) return null;

  return {
    login,
    hasFullAccess: FULL_ACCESS_LOGINS.includes(login),
  };
}

export async function verifyAdmin(): Promise<boolean> {
  const info = await getSessionInfo();
  return info !== null;
}

export function getSessionToken(login: string = 'admin'): string {
  const secret = process.env.ADMIN_PASSWORD || 'parliament2025';
  let hash = 0;
  const raw = `${login}:${secret}`;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `session_${login}_${Math.abs(hash).toString(36)}_parliament`;
}

export function createSessionCookie(login: string = 'admin'): string {
  const token = getSessionToken(login);
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION}`;
}

export function clearSessionCookie(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
