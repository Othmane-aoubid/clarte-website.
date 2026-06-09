import { getTranslations } from 'next-intl/server'
import { Shield, Leaf, ThumbsUp, Clock } from 'lucide-react'

export async function TrustBar({ locale }) {
  const t = await getTranslations({ locale, namespace: 'trust_bar' })

  const items = [
    { icon: Shield, label: t('insured'), color: 'text-brand-600 dark:text-brand-400' },
    { icon: Leaf, label: t('eco'), color: 'text-green-600 dark:text-green-400' },
    { icon: ThumbsUp, label: t('satisfaction'), color: 'text-brand-600 dark:text-brand-400' },
    { icon: Clock, label: t('available'), color: 'text-orange-500 dark:text-orange-400' },
  ]

  return (
    <section className="bg-white dark:bg-[rgb(22,27,34)] border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {items.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
