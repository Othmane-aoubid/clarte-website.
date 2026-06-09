import { getTranslations } from 'next-intl/server'
import { FAQAccordion } from './FAQAccordion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export async function FAQSection({ locale, limit = 6 }) {
  const t = await getTranslations({ locale, namespace: 'faq' })

  return (
    <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>
        <FAQAccordion locale={locale} limit={limit} />
        {limit < 6 && (
          <div className="text-center mt-8">
            <Link href={`/${locale}/faq`} className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Voir toutes les questions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
