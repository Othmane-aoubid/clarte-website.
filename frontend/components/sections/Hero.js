import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Star, Users, Award } from 'lucide-react'

export async function Hero({ locale }) {
  const t = await getTranslations({ locale, namespace: 'hero' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  return (
    <section  className="relative min-h-screen flex items-center overflow-hidden"
    style={{
      backgroundImage:
        "linear-gradient(rgba(10,25,47,.75), rgba(10,25,47,.75)), url('/images/project-macclean-featured-2.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-700/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            4.9/5 — Plus de 500 clients satisfaits
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('title')}
          </h1>

          <p className="text-lg sm:text-xl text-brand-100 mb-10 leading-relaxed max-w-xl">
            {t('subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <Link
              href={`/${locale}/booking`}
              className="inline-flex items-center gap-2 px-7 py-4 bg-white text-brand-700 font-bold rounded-button hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('cta_primary')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center gap-2 px-7 py-4 bg-transparent border-2 border-white/60 text-white font-bold rounded-button hover:bg-white/10 transition-all"
            >
              {t('cta_secondary')}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { icon: Users, value: '500+', label: 'Clients satisfaits' },
              { icon: Star, value: '4.9★', label: 'Note moyenne' },
              { icon: Award, value: '10 ans', label: "D'expérience" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-none">{value}</div>
                  <div className="text-brand-200 text-sm">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 69.3C1200 69.3 1320 58.7 1380 53.3L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white" className="dark:fill-[rgb(13,17,23)]" />
        </svg>
      </div>
    </section>
  )
}
