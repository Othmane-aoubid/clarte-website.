'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function FAQAccordion({ locale, limit }) {
  const t = useTranslations('faq')
  const [open, setOpen] = useState(null)

  const count = limit || 6
  const items = Array.from({ length: count }, (_, i) => ({
    q: t(`q${i + 1}`),
    a: t(`a${i + 1}`),
  }))

  return (
    <div className="space-y-3">
      {items.map(({ q, a }, i) => (
        <div key={i} className="bg-white dark:bg-[rgb(30,37,46)] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="pr-4">{q}</span>
            <ChevronDown className={`w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
              {a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
