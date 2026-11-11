import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  eslint: {
    // Prevent minor ESLint warnings/unused variables from failing production deployments on Vercel
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
