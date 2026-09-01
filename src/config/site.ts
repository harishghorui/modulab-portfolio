export const siteConfig = {
  name: 'Modulab Portfolio',
  description: 'Multi-tenant developer portfolio platform',
  url:
    process.env.NEXT_PUBLIC_PORTFOLIO_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://portfolio.modulab.online'
      : 'http://localhost:3000'),
  platformUrl:
    process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://modulab.online',
};

export type SiteConfig = typeof siteConfig;
