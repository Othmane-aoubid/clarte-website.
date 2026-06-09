import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '../../styles/globals.css'

const locales    = ['fr', 'ar', 'en']
const rtlLocales = ['ar']

const OG_LOCALE = { fr: 'fr_FR', ar: 'ar_MA', en: 'en_US' }

export async function generateMetadata({ params: { locale } }) {
  const t       = await getTranslations({ locale, namespace: 'meta' })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

  return {
    metadataBase: new URL(baseUrl),

    // ── Titles ──────────────────────────────────────────────────────────────
    title: {
      template: `%s | Clarté`,
      default:  t('home_title'),
    },
    description: t('home_description'),

    // ── Indexing & crawl ─────────────────────────────────────────────────────
    robots: {
      index:  true,
      follow: true,
      googleBot: {
        index:               true,
        follow:              true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet':       -1,
      },
    },

    // ── Keywords / authorship ─────────────────────────────────────────────────
    keywords: [
      'nettoyage', 'ménage', 'service nettoyage', 'nettoyage professionnel',
      'nettoyage domicile', 'nettoyage bureau', 'après travaux', 'désinfection',
      'Clarté', 'nettoyage France',
    ],
    authors:   [{ name: 'Clarté', url: baseUrl }],
    creator:   'Clarté',
    publisher: 'Clarté',

    // ── Open Graph ─────────────────────────────────────────────────────────────
    openGraph: {
      type:        'website',
      locale:      OG_LOCALE[locale] || 'fr_FR',
      url:         `${baseUrl}/${locale}`,
      siteName:    'Clarté',
      title:       t('home_title'),
      description: t('home_description'),
      images: [
        {
          url:    '/images/og-image.jpg',
          width:  1200,
          height: 630,
          alt:    'Clarté — Services de Nettoyage Professionnels',
        },
      ],
    },

    // ── Twitter / X card ─────────────────────────────────────────────────────
    twitter: {
      card:        'summary_large_image',
      site:        '@clarte_fr',
      creator:     '@clarte_fr',
      title:       t('home_title'),
      description: t('home_description'),
      images:      ['/images/og-image.jpg'],
    },

    // ── hreflang alternates ───────────────────────────────────────────────────
    alternates: {
      canonical:  `${baseUrl}/${locale}`,
      languages: {
        'fr':        `${baseUrl}/fr`,
        'ar':        `${baseUrl}/ar`,
        'en':        `${baseUrl}/en`,
        'x-default': `${baseUrl}/fr`,
      },
    },

    // ── Icons ────────────────────────────────────────────────────────────────
    icons: {
      icon:             '/favicon.ico',
      shortcut:         '/favicon.ico',
      apple:            '/icons/apple-touch-icon.png',
      other: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/icons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/icons/favicon-16x16.png' },
      ],
    },

    // ── PWA manifest ─────────────────────────────────────────────────────────
    manifest: '/manifest.json',

    // ── Theme colour (browser chrome) ────────────────────────────────────────
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
      { media: '(prefers-color-scheme: dark)',  color: '#0c4a6e' },
    ],

    // ── Verification tags (fill in after creating accounts) ──────────────────
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
      // yandex: 'your-yandex-code',
      // bing:   'your-bing-code',
    },
  }
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound()
  setRequestLocale(locale)

  const messages = await getMessages()
  const isRTL    = rtlLocales.includes(locale)

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={isRTL ? 'font-arabic' : 'font-sans'}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
