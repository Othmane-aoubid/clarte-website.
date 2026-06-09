import { getTranslations } from 'next-intl/server'
import { GraduationCap, Leaf, Shield, ThumbsUp } from 'lucide-react'

export async function WhyClarte({ locale }) {
  const t = await getTranslations({ locale, namespace: 'why_clarte' })

  const items = [
    { icon: GraduationCap, title: t('pro_title'), desc: t('pro_desc'), color: 'bg-brand-600' },
    { icon: Leaf, title: t('eco_title'), desc: t('eco_desc'), color: 'bg-green-600' },
    { icon: Shield, title: t('insurance_title'), desc: t('insurance_desc'), color: 'bg-brand-600' },
    { icon: ThumbsUp, title: t('guarantee_title'), desc: t('guarantee_desc'), color: 'bg-green-600' },
  ]

  return (
    <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('title')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="text-center p-8 rounded-card bg-slate-50 dark:bg-[rgb(30,37,46)] border border-slate-200 dark:border-slate-700 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`inline-flex w-14 h-14 rounded-2xl ${color} items-center justify-center mb-5 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
