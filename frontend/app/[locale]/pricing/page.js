import { setRequestLocale, getTranslations } from 'next-intl/server'
import { PricingCards } from '@/components/sections/PricingCards'
import { FAQSection }   from '@/components/sections/FAQSection'
import { CTABanner }    from '@/components/sections/CTABanner'
import { Check, X }     from 'lucide-react'
import { JsonLd }       from '@/components/seo/JsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

const COMPARISON = [
  { feature: 'Agent attitré',       ponctuel: false, hebdo: true,  mensuel: true  },
  { feature: 'Produits fournis',    ponctuel: true,  hebdo: true,  mensuel: true  },
  { feature: 'Support prioritaire', ponctuel: false, hebdo: true,  mensuel: false },
  { feature: 'Planning flexible',   ponctuel: true,  hebdo: true,  mensuel: false },
  { feature: 'Rapport de nettoyage',ponctuel: true,  hebdo: true,  mensuel: true  },
  { feature: 'Assurance incluse',   ponctuel: true,  hebdo: true,  mensuel: true  },
]

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title:       t('pricing_title'),
    description: t('pricing_description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/pricing`,
      languages: {
        fr: `${BASE_URL}/fr/pricing`,
        ar: `${BASE_URL}/ar/pricing`,
        en: `${BASE_URL}/en/pricing`,
      },
    },
    openGraph: {
      title:       t('pricing_title'),
      description: t('pricing_description'),
      url:         `${BASE_URL}/${locale}/pricing`,
    },
  }
}

export default async function PricingPage({ params: { locale } }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'pricing' })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Tarifs',  item: `${BASE_URL}/${locale}/pricing` },
    ],
  }

  // Product + Offers schema — enables rich price snippets in Google
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:       'Services de Nettoyage Clarté',
    description:'Services de nettoyage professionnels pour particuliers et entreprises',
    brand: {
      '@type': 'Brand',
      name:    'Clarté',
    },
    image:  `${BASE_URL}/images/og-image.jpg`,
    url:    `${BASE_URL}/${locale}/pricing`,
    aggregateRating: {
      '@type':      'AggregateRating',
      ratingValue:  '4.9',
      bestRating:   '5',
      worstRating:  '1',
      ratingCount:  '500',
    },
    offers: [
      {
        '@type':       'Offer',
        name:          'Prestation ponctuelle',
        description:   'Nettoyage ponctuel sans engagement',
        price:         '49',
        priceCurrency: 'EUR',
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        availability:  'https://schema.org/InStock',
        url:           `${BASE_URL}/${locale}/booking`,
        seller: { '@type': 'Organization', name: 'Clarté' },
      },
      {
        '@type':       'Offer',
        name:          'Abonnement hebdomadaire',
        description:   'Nettoyage hebdomadaire avec agent attitré',
        price:         '149',
        priceCurrency: 'EUR',
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        availability:  'https://schema.org/InStock',
        url:           `${BASE_URL}/${locale}/booking`,
        seller: { '@type': 'Organization', name: 'Clarté' },
      },
      {
        '@type':       'Offer',
        name:          'Abonnement mensuel',
        description:   'Nettoyage mensuel avec agent attitré',
        price:         '79',
        priceCurrency: 'EUR',
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        availability:  'https://schema.org/InStock',
        url:           `${BASE_URL}/${locale}/booking`,
        seller: { '@type': 'Organization', name: 'Clarté' },
      },
    ],
  }

  return (
    <main className="pt-16">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={pricingSchema}    />

      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-brand-100">{t('subtitle')}</p>
        </div>
      </section>

      <PricingCards locale={locale} />

      {/* Comparison table */}
      <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">{t('comparison_title')}</h2>
          <div className="rounded-card overflow-hidden border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-[rgb(30,37,46)]">
                  <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Fonctionnalité</th>
                  {['Ponctuel', 'Hebdomadaire', 'Mensuel'].map(p => (
                    <th key={p} className="text-center px-4 py-4 font-semibold text-slate-700 dark:text-slate-200">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ feature, ponctuel, hebdo, mensuel }, i) => (
                  <tr key={feature} className={i % 2 === 0 ? 'bg-white dark:bg-[rgb(13,17,23)]' : 'bg-slate-50 dark:bg-[rgb(22,27,34)]'}>
                    <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300">{feature}</td>
                    {[ponctuel, hebdo, mensuel].map((v, j) => (
                      <td key={j} className="text-center px-4 py-3.5">
                        {v
                          ? <Check className="w-5 h-5 text-green-500 mx-auto" aria-label="Inclus" />
                          : <X     className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" aria-label="Non inclus" />
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FAQSection locale={locale} limit={4} />
      <CTABanner  locale={locale} />
    </main>
  )
}
