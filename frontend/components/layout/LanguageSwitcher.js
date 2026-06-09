'use client'
import { usePathname, useRouter } from '@/navigation'

const locales = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher({ locale }) {
  const pathname = usePathname()   // path WITHOUT locale prefix, e.g. "/" or "/services"
  const router = useRouter()

  const switchLocale = (newLocale) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
            locale === code
              ? 'bg-brand-600 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
