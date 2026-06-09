import { setRequestLocale, getTranslations } from 'next-intl/server'
import { CTABanner } from '@/components/sections/CTABanner'
import { JsonLd }    from '@/components/seo/JsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title:       t('about_title'),
    description: t('about_description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/about`,
      languages: {
        fr: `${BASE_URL}/fr/about`,
        ar: `${BASE_URL}/ar/about`,
        en: `${BASE_URL}/en/about`,
      },
    },
    openGraph: {
      title:       t('about_title'),
      description: t('about_description'),
      url:         `${BASE_URL}/${locale}/about`,
    },
  }
}

export default function AboutPage({ params: { locale } }) {
  setRequestLocale(locale)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil',    item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'À propos',   item: `${BASE_URL}/${locale}/about` },
    ],
  }

  // Full Organization schema — signals trust and entity knowledge to Google
  const orgSchema = {
    '@context':    'https://schema.org',
    '@type':       'Organization',
    '@id':         `${BASE_URL}/#organization`,
    name:          'Clarté',
    legalName:     'Clarté Services de Nettoyage',
    url:           BASE_URL,
    logo:          `${BASE_URL}/icons/icon-512.png`,
    image:         `${BASE_URL}/images/og-image.jpg`,
    description:   'Fondée en 2014, Clarté offre des services de nettoyage professionnels pour particuliers et entreprises en France.',
    foundingDate:  '2014',
    email:         'contact@clarte.fr',
    telephone:     '+33123456789',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 20 },
    areaServed: { '@type': 'Country', name: 'France' },
    address: {
      '@type':         'PostalAddress',
      addressCountry:  'FR',
      addressLocality: 'Paris',
    },
    contactPoint: [
      {
        '@type':       'ContactPoint',
        telephone:     '+33123456789',
        contactType:   'customer service',
        availableLanguage: ['French', 'Arabic', 'English'],
        hoursAvailable: {
          '@type':     'OpeningHoursSpecification',
          dayOfWeek:   ['Monday','Tuesday','Wednesday','Thursday','Friday'],
          opens:       '08:00',
          closes:      '19:00',
        },
      },
    ],
    sameAs: [
      'https://www.facebook.com/clarte.fr',
      'https://www.instagram.com/clarte.fr',
    ],
    aggregateRating: {
      '@type':      'AggregateRating',
      ratingValue:  '4.9',
      bestRating:   '5',
      worstRating:  '1',
      ratingCount:  '500',
    },
  }

  const aboutPageSchema = {
    '@context':  'https://schema.org',
    '@type':     'AboutPage',
    url:         `${BASE_URL}/${locale}/about`,
    name:        'À propos de Clarté',
    description: 'Découvrez l\'histoire, les valeurs et l\'équipe de Clarté, votre partenaire nettoyage de confiance depuis 2014.',
    mainEntity:  { '@id': `${BASE_URL}/#organization` },
  }

  return (
    <main className="pt-16">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={orgSchema}        />
      <JsonLd data={aboutPageSchema}  />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">À propos de Clarté</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">Notre histoire, nos valeurs, notre engagement</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Notre histoire</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                Fondée en 2014, Clarté est née d'une conviction simple : chaque foyer mérite un environnement sain et impeccable. En dix ans, nous avons accompagné plus de 500 clients dans toute la France.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                Ce qui nous distingue ? Une équipe de professionnels certifiés, des produits 100% écologiques, et une garantie de satisfaction totale.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Aujourd'hui présents dans plus de 15 villes françaises, nous continuons à grandir guidés par la même passion : vous offrir un intérieur impeccable, sans effort de votre part.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+',  label: 'Clients satisfaits', color: 'bg-brand-600' },
                { value: '10',    label: "Ans d'expérience",   color: 'bg-green-600' },
                { value: '4.9/5', label: 'Note moyenne',       color: 'bg-orange-500' },
                { value: '15+',   label: 'Villes couvertes',   color: 'bg-purple-600' },
              ].map(({ value, label, color }) => (
                <div key={label} className={`${color} rounded-card p-8 text-white text-center`}>
                  <div className="text-3xl font-extrabold mb-1">{value}</div>
                  <div className="text-sm font-medium opacity-90">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50 dark:bg-[rgb(22,27,34)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-14">Nos Valeurs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Excellence', desc: 'Nous ne nous contentons pas du bon — nous visons le parfait.', emoji: '🏆' },
              { title: 'Confiance',  desc: 'Transparence, ponctualité et respect en toutes circonstances.', emoji: '🤝' },
              { title: 'Écologie',   desc: 'Produits verts, pratiques responsables, impact réduit.',        emoji: '🌿' },
              { title: 'Humanité',   desc: 'Nous traitons chaque client et chaque logement avec soin.',      emoji: '❤️' },
            ].map(({ title, desc, emoji }) => (
              <div key={title} className="bg-white dark:bg-[rgb(30,37,46)] rounded-card p-8 border border-slate-200 dark:border-slate-700 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-4" role="img" aria-label={title}>{emoji}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner locale={locale} />
    </main>
  )
}
