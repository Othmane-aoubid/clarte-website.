'use client'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'

export function MobileNav({ locale, links, bookLabel, open, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute top-0 right-0 bottom-0 w-72 bg-white dark:bg-[rgb(22,27,34)] shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <Link href={`/${locale}`} onClick={onClose} className="flex items-center gap-2 font-bold text-lg text-brand-600 dark:text-brand-400">
            <Sparkles className="w-5 h-5" />
            Clarté
          </Link>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle />
          </div>
          <Link
            href={`/${locale}/booking`}
            onClick={onClose}
            className="flex items-center justify-center w-full py-3 bg-brand-600 text-white font-semibold rounded-button hover:bg-brand-700 transition-colors"
          >
            {bookLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
