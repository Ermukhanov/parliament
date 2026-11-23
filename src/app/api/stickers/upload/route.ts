import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVoterIdentity, attachVoterCookies } from '@/lib/voter';
import { checkRateLimit } from '@/lib/rate-limit';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  // Rate limit: max 10 attempts per minute
  if (!checkRateLimit(clientIp, 10, 60000)) {
    return NextResponse.json(
      { error: 'Сұраныстар тым көп. Біраздан соң қайталап көріңіз.' },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const authorName = String(formData.get('authorName') || '').trim();
    const authorGrade = String(formData.get('authorGrade') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const deviceId = String(formData.get('deviceId') || '').trim();
    const file = formData.get('file') as File | null;

    if (!authorName || authorName.length < 2) {
      return NextResponse.json(
        { error: 'Аты-жөніңізді толық енгізіңіз (кемінде 2 әріп)' },
        { status: 400 }
      );
    }

    if (!authorGrade || authorGrade.length < 1) {
      return NextResponse.json(
        { error: 'Сыныбыңызды көрсетіңіз (мысалы: 10А немесе 9B)' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'Стикер суретін таңдаңыз' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.byteLength > 6 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Сурет көлемі 6MB-тан аспауы керек' },
        { status: 400 }
      );
    }

    const voter = getVoterIdentity(req, deviceId);

    // Multi-layer check: cookie check
    const cookieUploaded = req.cookies.get('aql_uploaded_sticker')?.value;
    if (cookieUploaded) {
      return NextResponse.json(
        {
          error:
            'Сіз өз стикеріңізді жүктеп қойдыңыз! Әр оқушы тек бір рет стикер ұсына алады. / You have already submitted a sticker.',
        },
        { status: 409 }
      );
    }

    // Database check: has this user/device already uploaded?
    const existingSticker = await prisma.sticker.findFirst({
      where: {
        uploaderKey: {
          in: voter.lookupKeys,
        },
      },
    });

    if (existingSticker) {
      return NextResponse.json(
        {
          error:
            'Сіз өз стикеріңізді жүктеп қойдыңыз! Әр оқушы тек бір рет стикер ұсына алады. / You have already submitted a sticker.',
        },
        { status: 409 }
      );
    }

    // Save image to filesystem
    let imageUrl = '';
    const isServerless = Boolean(
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY
    );

    if (!isServerless) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'stickers');
        await mkdir(uploadDir, { recursive: true });

        const rawExt = path.extname(file.name) || '.png';
        const ext = rawExt.toLowerCase();
        const safeName = authorName
          .toLowerCase()
          .replace(/[^a-z0-9а-яәіңғүұқөһ]+/gi, '_')
          .slice(0, 20);
        const fileName = `sticker_${Date.now()}_${safeName}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        imageUrl = `/images/stickers/${fileName}`;
      } catch (fsErr) {
        console.warn('Filesystem write failed, falling back to data URL:', fsErr);
      }
    }

    if (!imageUrl) {
      const mime = file.type || 'image/png';
      imageUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    }

    const sticker = await prisma.sticker.create({
      data: {
        title: title || 'Мектеп стикері',
        authorName,
        authorGrade,
        imageUrl,
        uploaderKey: voter.primaryKey,
        status: 'approved',
      },
    });

    const res = NextResponse.json(
      {
        success: true,
        message: 'Стикеріңіз сәтті жүктелді және байқауға қосылды!',
        sticker: {
          id: sticker.id,
          title: sticker.title,
          authorName: sticker.authorName,
          authorGrade: sticker.authorGrade,
          imageUrl: sticker.imageUrl,
          votesCount: 0,
        },
      },
      { status: 201 }
    );

    attachVoterCookies(res, voter.token, {
      aql_uploaded_sticker: sticker.id,
    });

    return res;
  } catch (err) {
    console.error('Sticker upload error:', err);
    return NextResponse.json(
      { error: 'Стикерді жүктеу кезінде серверлік қате кетті' },
      { status: 500 }
    );
  }
}
