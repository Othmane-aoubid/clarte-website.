import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'

export async function CTABanner({ locale }) {
  const t = await getTranslations({ locale, namespace: 'cta_banner' })

  return (
    <section className="py-20 bg-gradient-to-r from-brand-700 to-brand-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('title')}</h2>
        <p className="text-lg text-brand-100 mb-10">{t('subtitle')}</p>
        <Link
          href={`/${locale}/booking`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-button hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {t('button')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
