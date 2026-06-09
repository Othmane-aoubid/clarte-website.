import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Home, Building2, HardHat, Sun, Truck, Zap, ArrowRight, Clock, Tag } from 'lucide-react'
import Link    from 'next/link'
import { CTABanner } from '@/components/sections/CTABanner'
import { JsonLd }    from '@/components/seo/JsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

const SERVICES = [
  { key: 'menage',        icon: Home,      price: 49,  duration: 120, category: 'residential', color: 'from-brand-500 to-brand-700',  description: 'Nettoyage complet de votre maison ou appartement par nos experts certifiés.' },
  { key: 'bureau',        icon: Building2, price: 79,  duration: 180, category: 'commercial',  color: 'from-green-500 to-green-700',   description: 'Entretien régulier ou ponctuel de vos locaux professionnels.' },
  { key: 'apres_travaux', icon: HardHat,   price: 149, duration: 300, category: 'specialized', color: 'from-orange-500 to-orange-700', description: 'Nettoyage intensif après rénovation ou construction.' },
  { key: 'vitres',        icon: Sun,       price: 59,  duration: 90,  category: 'residential', color: 'from-sky-500 to-sky-700',       description: 'Vitres et baies vitrées impeccables, intérieur et extérieur.' },
  { key: 'demenagement',  icon: Truck,     price: 199, duration: 360, category: 'specialized', color: 'from-purple-500 to-purple-700', description: 'Nettoyage complet avant ou après un déménagement.' },
  { key: 'desinfection',  icon: Zap,       price: 89,  duration: 120, category: 'commercial',  color: 'from-red-500 to-red-700',       description: 'Désinfection professionnelle avec produits homologués.' },
]

const SERVICE_NAMES = {
  menage:        'Ménage à domicile',
  bureau:        'Nettoyage de bureau',
  apres_travaux: 'Après travaux',
  vitres:        'Nettoyage de vitres',
  demenagement:  'Déménagement',
  desinfection:  'Désinfection',
}

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title:       t('services_title'),
    description: t('services_description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/services`,
      languages: {
        fr: `${BASE_URL}/fr/services`,
        ar: `${BASE_URL}/ar/services`,
        en: `${BASE_URL}/en/services`,
      },
    },
    openGraph: {
      title:       t('services_title'),
      description: t('services_description'),
      url:         `${BASE_URL}/${locale}/services`,
    },
  }
}

export default async function ServicesPage({ params: { locale } }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'services' })

  // ── BreadcrumbList ─────────────────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil',  item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/${locale}/services` },
    ],
  }

  // ── ItemList of Services ───────────────────────────────────────────────────
  const servicesSchema = {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:       'Nos Services de Nettoyage',
    description:'Liste complète des services de nettoyage professionnels de Clarté',
    url:        `${BASE_URL}/${locale}/services`,
    numberOfItems: SERVICES.length,
    itemListElement: SERVICES.map(({ key, price, duration, description }, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      item: {
        '@type':      'Service',
        '@id':        `${BASE_URL}/#service-${key}`,
        name:         SERVICE_NAMES[key],
        description,
        provider: {
          '@type': 'LocalBusiness',
          name:    'Clarté',
          url:     BASE_URL,
        },
        areaServed: { '@type': 'Country', name: 'France' },
        offers: {
          '@type':            'Offer',
          price:              String(price),
          priceCurrency:      'EUR',
          availability:       'https://schema.org/InStock',
          url:                `${BASE_URL}/${locale}/booking`,
          priceSpecification: {
            '@type':        'PriceSpecification',
            price,
            priceCurrency:  'EUR',
            description:    'Prix à partir de',
          },
        },
        hoursAvailable: {
          '@type':     'OpeningHoursSpecification',
          dayOfWeek:   ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
          opens:       '08:00',
          closes:      '19:00',
        },
      },
    })),
  }

  return (
    <main className="pt-16">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={servicesSchema}   />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ key, icon: Icon, price, duration, color, description }) => (
              <article key={key} className="group rounded-card overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-[rgb(30,37,46)] hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                <div className={`h-44 bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden`}>
                  <Icon className="w-16 h-16 text-white/80" aria-hidden="true" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold">
                    À partir de {price}€
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t(`${key}.name`)}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 leading-relaxed">{t(`${key}.description`)}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-5">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" aria-hidden="true" /> {duration} min</span>
                    <span className="flex items-center gap-1.5"><Tag   className="w-4 h-4" aria-hidden="true" /> À partir de {price}€</span>
                  </div>
                  <Link href={`/${locale}/booking`} className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 text-white font-semibold rounded-button hover:bg-brand-700 transition-colors">
                    {t('book_service')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABanner locale={locale} />
    </main>
  )
}
