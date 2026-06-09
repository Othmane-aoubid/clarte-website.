export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'
  const locales = ['fr', 'ar', 'en']

  const pages = [
    { path: '',          priority: 1.0, changeFrequency: 'daily'   },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly'  },
    { path: '/pricing',  priority: 0.9, changeFrequency: 'weekly'  },
    { path: '/booking',  priority: 0.9, changeFrequency: 'daily'   },
    { path: '/contact',  priority: 0.8, changeFrequency: 'monthly' },
    { path: '/faq',      priority: 0.8, changeFrequency: 'weekly'  },
    { path: '/about',    priority: 0.7, changeFrequency: 'monthly' },
    { path: '/gallery',  priority: 0.6, changeFrequency: 'monthly' },
  ]

  const lastModified = new Date().toISOString()

  return pages.flatMap(({ path, priority, changeFrequency }) =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }))
  )
}
