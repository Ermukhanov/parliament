import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n';
import type { Metadata } from 'next';
import SplashScreen from '@/components/SplashScreen';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackgroundEffects from '@/components/BackgroundEffects';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'AQL Council | Мектеп Президенті',
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
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SplashScreen />
      <div className="relative min-h-screen bg-[#ffffff] text-[#0f172a] flex flex-col justify-between selection:bg-[#00afca] selection:text-white">
        <BackgroundEffects />
        <Header locale={locale} />
        <main className="flex-1 w-full pt-16 sm:pt-20">
          {children}
        </main>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
