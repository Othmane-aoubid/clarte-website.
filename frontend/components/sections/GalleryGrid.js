import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'

// Placeholder gallery items with colored backgrounds
const GALLERY_ITEMS = [
  { id: 1, category: 'residential', color: 'from-blue-400 to-blue-600', label: 'Salon — Avant/Après' },
  { id: 2, category: 'commercial', color: 'from-green-400 to-green-600', label: 'Bureau Open Space' },
  { id: 3, category: 'before-after', color: 'from-purple-400 to-purple-600', label: 'Cuisine — Après travaux' },
  { id: 4, category: 'residential', color: 'from-orange-400 to-orange-600', label: 'Salle de bain' },
  { id: 5, category: 'commercial', color: 'from-teal-400 to-teal-600', label: 'Restaurant' },
  { id: 6, category: 'before-after', color: 'from-rose-400 to-rose-600', label: 'Appartement — Déménagement' },
]

export async function GalleryGrid({ locale, limit = 6 }) {
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const items = GALLERY_ITEMS.slice(0, limit)

  return (
    <section className="py-20 bg-slate-50 dark:bg-[rgb(22,27,34)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ id, color, label }) => (
            <div key={id} className={`group relative aspect-[4/3] rounded-card overflow-hidden bg-gradient-to-br ${color} shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href={`/${locale}/gallery`} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold rounded-button hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white transition-all">
            {t('view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
