import { getTranslations } from 'next-intl/server'
import { Star, Quote } from 'lucide-react'

const REVIEWS = [
  { name: 'Sophie M.', location: 'Paris', rating: 5, text: 'Service impeccable ! L\'équipe est ponctuelle, professionnelle et mon appartement n\'a jamais été aussi propre. Je recommande vivement Clarté !', avatar: 'SM' },
  { name: 'Karim B.', location: 'Lyon', rating: 5, text: 'Excellent rapport qualité-prix. Le nettoyage après travaux était parfait, rien à redire. Je ferai appel à eux pour l\'entretien régulier.', avatar: 'KB' },
  { name: 'Marie L.', location: 'Marseille', rating: 5, text: 'Mon bureau n\'a jamais été aussi propre. L\'équipe est discrète, efficace et utilise des produits éco-responsables. Parfait !', avatar: 'ML' },
  { name: 'Thomas R.', location: 'Bordeaux', rating: 4, text: 'Très satisfait du service. L\'agent attitré connaît maintenant mes préférences et le résultat est toujours au rendez-vous.', avatar: 'TR' },
  { name: 'Amina K.', location: 'Toulouse', rating: 5, text: 'Réservation facile en ligne, équipe réactive et résultat irréprochable. Que demander de plus ? Merci Clarté !', avatar: 'AK' },
  { name: 'Jean-Pierre V.', location: 'Nice', rating: 5, text: 'Après plusieurs déceptions avec d\'autres services, Clarté a su nous convaincre. Qualité constante et équipe sympathique.', avatar: 'JV' },
]

export async function Testimonials({ locale }) {
  const t = await getTranslations({ locale, namespace: 'testimonials' })

  return (
    <section className="py-20 bg-white dark:bg-[rgb(13,17,23)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map(({ name, location, rating, text, avatar }) => (
            <div key={name} className="bg-slate-50 dark:bg-[rgb(30,37,46)] rounded-card p-6 border border-slate-200 dark:border-slate-700 hover:shadow-card-hover transition-all duration-300">
              <Quote className="w-8 h-8 text-brand-200 dark:text-brand-800 mb-4" />
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">{text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">
                    {avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{location}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
