/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  alternateRefs: [
    { href: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'}/fr`, hreflang: 'fr' },
    { href: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'}/ar`, hreflang: 'ar' },
    { href: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'}/en`, hreflang: 'en' },
    { href: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'}/fr`, hreflang: 'x-default' },
  ],
  exclude: ['/*/admin/*', '/*/auth/*', '/*/booking-success'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/auth'] },
    ],
  },
}
