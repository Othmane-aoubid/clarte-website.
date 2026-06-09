import { setRequestLocale, getTranslations } from 'next-intl/server'
import { FAQAccordion } from '@/components/sections/FAQAccordion'
import { CTABanner }    from '@/components/sections/CTABanner'
import { JsonLd }       from '@/components/seo/JsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

// FAQ data mirrored from messages/fr.json — used for JSON-LD (must be static strings)
const FAQ_DATA = [
  {
    q: "Quels sont vos horaires d'intervention ?",
    a: "Nous intervenons du lundi au vendredi de 8h à 19h, et le samedi de 9h à 17h. Des créneaux exceptionnels peuvent être organisés sur demande.",
  },
  {
    q: "Fournissez-vous les produits de nettoyage ?",
    a: "Oui, nous apportons tous nos produits professionnels écologiques. Vous n'avez rien à prévoir.",
  },
  {
    q: "Que se passe-t-il si je ne suis pas satisfait ?",
    a: "Notre satisfaction est garantie à 100%. Si le résultat ne vous convient pas, nous revenons gratuitement sous 24h.",
  },
  {
    q: "Puis-je avoir toujours le même agent ?",
    a: "Oui, avec nos formules Hebdomadaire et Mensuel, vous bénéficiez d'un agent attitré.",
  },
  {
    q: "Comment payer ?",
    a: "Nous acceptons les cartes bancaires, le prélèvement SEPA, et les paiements mobiles (Apple Pay, Google Pay).",
  },
  {
    q: "Puis-je annuler ou modifier ma réservation ?",
    a: "Vous pouvez annuler ou modifier votre réservation jusqu'à 24h avant l'intervention sans frais.",
  },
]

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title:       t('faq_title'),
    description: t('faq_description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/faq`,
      languages: {
        fr: `${BASE_URL}/fr/faq`,
        ar: `${BASE_URL}/ar/faq`,
        en: `${BASE_URL}/en/faq`,
      },
    },
    openGraph: {
      title:       t('faq_title'),
      description: t('faq_description'),
      url:         `${BASE_URL}/${locale}/faq`,
    },
  }
}

export default async function FAQPage({ params: { locale } }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'faq' })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'FAQ',     item: `${BASE_URL}/${locale}/faq` },
    ],
  }

  // FAQPage schema — Google uses this for rich results (direct FAQ accordion in search)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: FAQ_DATA.map(({ q, a }) => ({
      '@type': 'Question',
      name:    q,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    a,
      },
    })),
  }

  return (
    <main className="pt-16">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema}        />

      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-brand-100">{t('subtitle')}</p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQAccordion locale={locale} limit={6} />
        </div>
      </section>

      <CTABanner locale={locale} />
    </main>
  )
}
