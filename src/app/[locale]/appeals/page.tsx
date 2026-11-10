import type { Metadata } from 'next';
import AppealsSection from '@/components/AppealsSection';

export const revalidate = 0;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Student Inquiries & Petitions | AQL Council' : 'Өтініштер Жолдау | AQL Council',
    description: isEn
      ? 'Direct channel for students to submit initiatives, ask questions, or apply to join specialized faction teams.'
      : 'Мектеп Президенті мен 7 фракцияға тікелей ұсыныс жолдау немесе командаға қосылу.',
  };
}

export default async function AppealsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="py-6 sm:py-10">
      <AppealsSection locale={locale} />
    </div>
  );
}
