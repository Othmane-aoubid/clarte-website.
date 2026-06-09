import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { ContactForm } from '@/components/sections/ContactForm'
import { JsonLd }      from '@/components/seo/JsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title:       t('contact_title'),
    description: t('contact_description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/contact`,
      languages: {
        fr: `${BASE_URL}/fr/contact`,
        ar: `${BASE_URL}/ar/contact`,
        en: `${BASE_URL}/en/contact`,
      },
    },
    openGraph: {
      title:       t('contact_title'),
      description: t('contact_description'),
      url:         `${BASE_URL}/${locale}/contact`,
    },
  }
}

export default function ContactPage({ params: { locale } }) {
  setRequestLocale(locale)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/${locale}/contact` },
    ],
  }

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type':    'ContactPage',
    name:       'Contactez Clarté',
    description:'Contactez notre équipe pour toute demande de nettoyage ou d\'information.',
    url:        `${BASE_URL}/${locale}/contact`,
    mainEntity: {
      '@type':    ['LocalBusiness', 'ProfessionalService'],
      '@id':      `${BASE_URL}/#business`,
      name:       'Clarté',
      telephone:  '+33123456789',
      email:      'contact@clarte.fr',
      url:        BASE_URL,
      address: {
        '@type':         'PostalAddress',
        addressCountry:  'FR',
        addressLocality: 'Paris',
      },
      openingHoursSpecification: [
        {
          '@type':   'OpeningHoursSpecification',
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
          opens:     '08:00',
          closes:    '19:00',
        },
        {
          '@type':   'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens:     '09:00',
          closes:    '17:00',
        },
      ],
      contactPoint: {
        '@type':     'ContactPoint',
        telephone:   '+33123456789',
        email:       'contact@clarte.fr',
        contactType: 'customer service',
        availableLanguage: ['French', 'Arabic', 'English'],
      },
    },
  }

  return (
    <main className="pt-16">
      <JsonLd data={breadcrumbSchema}  />
      <JsonLd data={contactPageSchema} />

      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-xl text-brand-100">Notre équipe vous répond sous 24h</p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <address className="not-italic space-y-8">
              {[
                { icon: Phone, title: 'Téléphone',      value: '+33 1 23 45 67 89', href: 'tel:+33123456789'        },
                { icon: Mail,  title: 'Email',           value: 'contact@clarte.fr',  href: 'mailto:contact@clarte.fr' },
                { icon: MapPin,title: 'Zone de service', value: 'Toute la France'                                     },
                { icon: Clock, title: 'Horaires',        value: 'Lun–Ven 8h–19h\nSam 9h–17h'                         },
              ].map(({ icon: Icon, title, value, href }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
                    {href
                      ? <a href={href} className="text-brand-600 dark:text-brand-400 hover:underline whitespace-pre-line">{value}</a>
                      : <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{value}</p>
                    }
                  </div>
                </div>
              ))}
            </address>

            {/* Form */}
            <div className="lg:col-span-2">
              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
