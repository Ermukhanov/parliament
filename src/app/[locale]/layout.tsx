import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n';
import type { Metadata } from 'next';
import SplashScreen from '@/components/SplashScreen';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'AQL Council',
    template: '%s | AQL Council',
  },
  description: 'AQL Council — Мектеп Президентінің ресми порталы | School President Official Portal',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'AQL Council',
    description: 'AQL Council — Мектеп Президентінің ресми порталы | School President Official Portal',
    type: 'website',
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
};

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <>
      <SplashScreen />
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
