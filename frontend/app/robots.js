export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/fr/admin', '/ar/admin', '/en/admin'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
