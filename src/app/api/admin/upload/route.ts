import { NextRequest, NextResponse } from 'next/server';
import { getSessionInfo } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'members');
    await mkdir(uploadDir, { recursive: true });

    // Clean file name
    const ext = path.extname(file.name) || '.png';
    const cleanBaseName = `${session.login || 'member'}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, cleanBaseName);

    await writeFile(filePath, buffer);

    const publicUrl = `/images/members/${cleanBaseName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Файлды жүктеу кезінде қате орын алды' }, { status: 500 });
  }
}
