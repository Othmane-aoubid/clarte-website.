import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Check } from 'lucide-react'

const PLANS = [
  { key: 'ponctuel', price: 49, interval: null, popular: false },
  { key: 'hebdomadaire', price: 149, interval: 'month', popular: true },
  { key: 'mensuel', price: 89, interval: 'month', popular: false },
]

export async function PricingCards({ locale }) {
  const t = await getTranslations({ locale, namespace: 'pricing' })

  return (
    <section className="py-20 bg-slate-50 dark:bg-[rgb(22,27,34)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map(({ key, price, interval, popular }) => {
            const features = t.raw(`${key}.features`)
            return (
              <div key={key} className={`relative rounded-card p-8 border-2 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${
                popular
                  ? 'border-brand-600 bg-brand-600 text-white shadow-xl scale-105'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[rgb(30,37,46)]'
              }`}>
                {popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-brand-700 text-xs font-bold rounded-full shadow">
                    {t('popular_badge')}
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {t(`${key}.name`)}
                </h3>
                <p className={`text-sm mb-6 ${popular ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {t(`${key}.description`)}
                </p>
                <div className="flex items-end gap-1 mb-8">
                  <span className={`text-4xl font-extrabold ${popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {price}€
                  </span>
                  <span className={`text-sm mb-1 ${popular ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {interval ? t('per_month') : t('per_service')}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {Array.isArray(features) && features.map((f, i) => (
                    <li key={i} className={`flex items-center gap-2.5 text-sm ${popular ? 'text-brand-100' : 'text-slate-600 dark:text-slate-300'}`}>
                      <Check className={`w-4 h-4 shrink-0 ${popular ? 'text-white' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${locale}/booking`}
                  className={`flex items-center justify-center w-full py-3 rounded-button font-semibold transition-all ${
                    popular
                      ? 'bg-white text-brand-700 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {interval ? t('cta_subscribe') : t('cta_book')}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
