'use client'
import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export function ContactForm({ locale }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-card p-10 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message envoyé !</h3>
        <p className="text-slate-600 dark:text-slate-300">Notre équipe vous répondra sous 24h.</p>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-[rgb(30,37,46)] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-[rgb(22,27,34)] rounded-card p-8 border border-slate-200 dark:border-slate-700 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nom *</label>
          <input type="text" required placeholder="Jean Dupont" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
          <input type="email" required placeholder="jean@exemple.fr" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Téléphone</label>
          <input type="tel" placeholder="+33 6 12 34 56 78" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sujet</label>
          <select className={inputClass}>
            <option value="">Choisir un sujet</option>
            <option>Demande de devis</option>
            <option>Information service</option>
            <option>Réclamation</option>
            <option>Autre</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message *</label>
        <textarea required rows={5} placeholder="Décrivez votre besoin..." className={inputClass + ' resize-none'} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-600 text-white font-semibold rounded-button hover:bg-brand-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-button"
      >
        {loading ? 'Envoi...' : <><Send className="w-4 h-4" /> Envoyer le message</>}
      </button>
    </form>
  )
}
