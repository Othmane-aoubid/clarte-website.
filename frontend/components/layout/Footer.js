import Link from 'next/link'
import { Sparkles, Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function Footer({ locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' })
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 dark:bg-[rgb(13,17,23)] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <Sparkles className="w-6 h-6 text-brand-400" />
              Clarté
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">{t('tagline')}</p>
            <div className="flex gap-3 mt-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-brand-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-brand-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('links_title')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: `/${locale}`, label: nav('home') },
                { href: `/${locale}/services`, label: nav('services') },
                { href: `/${locale}/pricing`, label: nav('pricing') },
                { href: `/${locale}/about`, label: nav('about') },
                { href: `/${locale}/gallery`, label: nav('gallery') },
                { href: `/${locale}/faq`, label: nav('faq') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('legal_title')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: `/${locale}/privacy-policy`, label: t('privacy') },
                { href: `/${locale}/terms`, label: t('terms') },
                { href: `/${locale}/legal`, label: t('legal') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('contact_title')}</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" />
                <span>France</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+33123456789" className="hover:text-brand-400 transition-colors">+33 1 23 45 67 89</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:contact@clarte.fr" className="hover:text-brand-400 transition-colors">contact@clarte.fr</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          {t('copyright', { year })}
        </div>
      </div>
    </footer>
  )
}
