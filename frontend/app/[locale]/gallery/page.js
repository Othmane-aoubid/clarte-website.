import { setRequestLocale, getTranslations } from 'next-intl/server'
import { CTABanner } from '@/components/sections/CTABanner'
import { JsonLd }    from '@/components/seo/JsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarte.fr'

const ALL_GALLERY = [
  { id: 1,  color: 'from-blue-400 to-blue-600',   label: 'Salon — Avant/Après',        cat: 'before-after'  },
  { id: 2,  color: 'from-green-400 to-green-600',  label: 'Bureau Open Space',           cat: 'commercial'    },
  { id: 3,  color: 'from-purple-400 to-purple-600',label: 'Cuisine après travaux',       cat: 'before-after'  },
  { id: 4,  color: 'from-orange-400 to-orange-600',label: 'Salle de bain',               cat: 'residential'   },
  { id: 5,  color: 'from-teal-400 to-teal-600',    label: 'Restaurant',                  cat: 'commercial'    },
  { id: 6,  color: 'from-rose-400 to-rose-600',    label: 'Appartement déménagement',    cat: 'before-after'  },
  { id: 7,  color: 'from-indigo-400 to-indigo-600',label: 'Chambre — Résidentiel',       cat: 'residential'   },
  { id: 8,  color: 'from-cyan-400 to-cyan-600',    label: 'Vitres & baies vitrées',      cat: 'residential'   },
  { id: 9,  color: 'from-amber-400 to-amber-600',  label: 'Locaux commerciaux',          cat: 'commercial'    },
  { id: 10, color: 'from-lime-400 to-lime-600',    label: 'Après chantier',              cat: 'before-after'  },
  { id: 11, color: 'from-sky-400 to-sky-600',      label: 'Cuisine résidentielle',       cat: 'residential'   },
  { id: 12, color: 'from-violet-400 to-violet-600',label: 'Salle de réunion',            cat: 'commercial'    },
]

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title:       t('gallery_title'),
    description: t('gallery_description'),
    alternates: {
      canonical: `${BASE_URL}/${locale}/gallery`,
      languages: {
        fr: `${BASE_URL}/fr/gallery`,
        ar: `${BASE_URL}/ar/gallery`,
        en: `${BASE_URL}/en/gallery`,
      },
    },
    openGraph: {
      title:       t('gallery_title'),
      description: t('gallery_description'),
      url:         `${BASE_URL}/${locale}/gallery`,
      type:        'website',
    },
  }
}

export default async function GalleryPage({ params: { locale } }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'gallery' })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Galerie', item: `${BASE_URL}/${locale}/gallery` },
    ],
  }

  const gallerySchema = {
    '@context': 'https://schema.org',
    '@type':    'CollectionPage',
    name:       'Galerie Clarté — Avant et Après',
    description:'Photos de nos réalisations de nettoyage avant et après intervention.',
    url:        `${BASE_URL}/${locale}/gallery`,
    provider: { '@type': 'Organization', name: 'Clarté', url: BASE_URL },
  }

  return (
    <main className="pt-16">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={gallerySchema}    />

      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-brand-100">{t('subtitle')}</p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ALL_GALLERY.map(({ id, color, label }) => (
              <figure
                key={id}
                className={`group relative aspect-square rounded-card overflow-hidden bg-gradient-to-br ${color} shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <figcaption className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg">{label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CTABanner locale={locale} />
    </main>
  )
}
