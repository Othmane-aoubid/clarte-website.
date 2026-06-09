import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Hero }         from '@/components/sections/Hero'
import { TrustBar }     from '@/components/sections/TrustBar'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { HowItWorks }   from '@/components/sections/HowItWorks'
import { WhyClarte }    from '@/components/sections/WhyClarte'
import { PricingCards } from '@/components/sections/PricingCards'
import { Testimonials } from '@/components/sections/Testimonials'
import { GalleryGrid }  from '@/components/sections/GalleryGrid'
import { FAQSection }   from '@/components/sections/FAQSection'
import { CTABanner }    from '@/components/sections/CTABanner'
import { JsonLd }       from '@/components/seo/JsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title:       t('home_title'),
    description: t('home_description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
    },
  }
}

export default function HomePage({ params: { locale } }) {
  setRequestLocale(locale)

  // ── WebSite schema ─────────────────────────────────────────────────────────
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    '@id':      `${BASE_URL}/#website`,
    url:        BASE_URL,
    name:       'Clarté',
    description:'Services de nettoyage professionnels en France',
    inLanguage: ['fr', 'ar', 'en'],
    potentialAction: {
      '@type':       'SearchAction',
      target:        `${BASE_URL}/fr/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  // ── LocalBusiness / CleaningService schema ────────────────────────────────
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type':    ['LocalBusiness', 'ProfessionalService'],
    '@id':      `${BASE_URL}/#business`,
    name:       'Clarté',
    legalName:  'Clarté Services de Nettoyage',
    description:'Services de nettoyage professionnels pour particuliers et entreprises en France',
    url:        BASE_URL,
    telephone:  '+33123456789',
    email:      'contact@clarte.fr',
    foundingDate: '2014',
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted:    'Carte bancaire, SEPA, Apple Pay, Google Pay',
    image:  `${BASE_URL}/images/og-image.jpg`,
    logo: {
      '@type': 'ImageObject',
      url:     `${BASE_URL}/icons/icon-512.png`,
    },
    areaServed: {
      '@type': 'Country',
      name:    'France',
    },
    address: {
      '@type':           'PostalAddress',
      addressCountry:    'FR',
      addressLocality:   'Paris',
    },
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   '48.8566',
      longitude:  '2.3522',
    },
    openingHoursSpecification: [
      {
        '@type':     'OpeningHoursSpecification',
        dayOfWeek:   ['Monday','Tuesday','Wednesday','Thursday','Friday'],
        opens:       '08:00',
        closes:      '19:00',
      },
      {
        '@type':   'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens:     '09:00',
        closes:    '17:00',
      },
    ],
    aggregateRating: {
      '@type':       'AggregateRating',
      ratingValue:   '4.9',
      bestRating:    '5',
      worstRating:   '1',
      ratingCount:   '500',
      reviewCount:   '500',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name:    'Services de nettoyage',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ménage à domicile'      } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Nettoyage de bureau'    } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Nettoyage après travaux'} },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Nettoyage de vitres'    } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Nettoyage déménagement' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Désinfection'           } },
      ],
    },
    sameAs: [
      'https://www.facebook.com/clarte.fr',
      'https://www.instagram.com/clarte.fr',
    ],
  }

  // ── Organization schema ───────────────────────────────────────────────────
  const orgSchema = {
    '@context':    'https://schema.org',
    '@type':       'Organization',
    '@id':         `${BASE_URL}/#organization`,
    name:          'Clarté',
    url:           BASE_URL,
    logo:          `${BASE_URL}/icons/icon-512.png`,
    foundingDate:  '2014',
    email:         'contact@clarte.fr',
    telephone:     '+33123456789',
    sameAs: [
      'https://www.facebook.com/clarte.fr',
      'https://www.instagram.com/clarte.fr',
    ],
  }

  return (
    <main>
      <JsonLd data={websiteSchema} />
      <JsonLd data={businessSchema} />
      <JsonLd data={orgSchema} />

      <Hero         locale={locale} />
      <TrustBar     locale={locale} />
      <ServicesGrid locale={locale} />
      <HowItWorks   locale={locale} />
      <WhyClarte    locale={locale} />
      <PricingCards locale={locale} />
      <Testimonials locale={locale} />
      <GalleryGrid  locale={locale} />
      <FAQSection   locale={locale} limit={4} />
      <CTABanner    locale={locale} />
    </main>
  )
}
