import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import os from 'os';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  // If remote database (Postgres, Turso, Supabase, etc.) is configured, use it!
  if (
    envUrl &&
    !envUrl.startsWith('file:') &&
    !envUrl.startsWith('./') &&
    !envUrl.startsWith('../')
  ) {
    return envUrl;
  }

  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  );

  const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (isServerless) {
    const tmpDbPath = path.join(os.tmpdir(), 'school_parliament_v1.db');
    try {
      const needsInit = !fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0;
      if (needsInit && fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        try {
          fs.chmodSync(tmpDbPath, 0o666);
        } catch {
          // ignore
        }
      }
      return `file:${tmpDbPath}`;
    } catch (err) {
      console.error('Error setting up writable SQLite in tmpdir:', err);
      return `file:${sourceDbPath}`;
    }
  }

  return `file:${sourceDbPath}`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
