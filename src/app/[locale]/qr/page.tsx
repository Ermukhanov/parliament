import type { Metadata } from 'next';
import A4QrPoster from '@/components/A4QrPoster';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn
      ? 'A4 QR Poster | School Parliament Portal'
      : 'А4 Плакат QR-код | Парламент Сайты',
    description: isEn
      ? 'Printable A4 QR code poster for the School Parliament Lyceum Portal.'
      : 'Мектеп парламентінің сайтына арналған А4 форматындағы басып шығаратын QR-код плакаты.',
  };
}

export default function QrPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <A4QrPoster initialLocale={locale} />;
}
