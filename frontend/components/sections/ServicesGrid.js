import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Home, Building2, HardHat, Sun, Truck, Zap, ArrowRight } from 'lucide-react'

const SERVICES = [
  { key: 'menage', icon: Home, price: 49, unit: 'hour', slug: 'menage-domicile', color: 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' },
  { key: 'bureau', icon: Building2, price: 79, unit: 'flat', slug: 'nettoyage-bureau', color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { key: 'apres_travaux', icon: HardHat, price: 149, unit: 'flat', slug: 'apres-travaux', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400' },
  { key: 'vitres', icon: Sun, price: 59, unit: 'flat', slug: 'vitres', color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { key: 'demenagement', icon: Truck, price: 199, unit: 'flat', slug: 'demenagement', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { key: 'desinfection', icon: Zap, price: 89, unit: 'flat', slug: 'desinfection', color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
]

export async function ServicesGrid({ locale }) {
  const t = await getTranslations({ locale, namespace: 'services' })

  return (
    <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(({ key, icon: Icon, price, slug, color }) => (
            <div key={key} className="group bg-white dark:bg-[rgb(30,37,46)] rounded-card border border-slate-200 dark:border-slate-700 p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t(`${key}.name`)}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">{t(`${key}.description`)}</p>
              <div className="flex items-center justify-between">
                <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
                  {t('from_price', { price: `${price}€` })}
                </span>
                <Link
                  href={`/${locale}/booking`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-2 transition-all"
                >
                  {t('book_service')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold rounded-button hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white transition-all">
            Voir tous les services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
