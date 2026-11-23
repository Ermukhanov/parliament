import { NextRequest, NextResponse } from 'next/server';

export interface VoterIdentity {
  token: string;
  isNewToken: boolean;
  deviceId: string;
  clientIp: string;
  lookupKeys: string[];
  primaryKey: string;
}

export function getVoterIdentity(req: NextRequest, bodyDeviceId?: string): VoterIdentity {
  let token = req.cookies.get('aql_voter_token')?.value || '';
  const isNewToken = !token;
  if (!token) {
    token = `vtok_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
  }

  const headerDeviceId = req.headers.get('x-device-id') || '';
  const deviceId = (bodyDeviceId || headerDeviceId || '').trim();

  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  const lookupKeys: string[] = [];
  if (token) lookupKeys.push(`tok_${token}`);
  if (deviceId && deviceId.length >= 3) lookupKeys.push(`dev_${deviceId}`);
  if (lookupKeys.length === 0) lookupKeys.push(`ip_${clientIp}`);

  // Primary key used for recording
  const primaryKey = lookupKeys[0];

  return {
    token,
    isNewToken,
    deviceId,
    clientIp,
    lookupKeys,
    primaryKey,
  };
}

export function attachVoterCookies(
  res: NextResponse,
  token: string,
  extraCookies?: Record<string, string>
) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookies.set('aql_voter_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  if (extraCookies) {
    for (const [name, val] of Object.entries(extraCookies)) {
      res.cookies.set(name, val, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }
}
