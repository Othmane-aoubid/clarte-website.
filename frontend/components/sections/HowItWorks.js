import { getTranslations } from 'next-intl/server'
import { MousePointerClick, Sparkles, Smile } from 'lucide-react'

export async function HowItWorks({ locale }) {
  const t = await getTranslations({ locale, namespace: 'how_it_works' })

  const steps = [
    { num: '01', icon: MousePointerClick, title: t('step1_title'), desc: t('step1_desc') },
    { num: '02', icon: Sparkles, title: t('step2_title'), desc: t('step2_desc') },
    { num: '03', icon: Smile, title: t('step3_title'), desc: t('step3_desc') },
  ]

  return (
    <section className="py-20 bg-slate-50 dark:bg-[rgb(22,27,34)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-brand-200 to-brand-200 dark:from-brand-800 dark:to-brand-800" />

          {steps.map(({ num, icon: Icon, title, desc }, i) => (
            <div key={num} className="flex flex-col items-center text-center relative">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border-2 border-brand-600 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
