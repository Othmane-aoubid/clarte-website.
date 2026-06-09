'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  CheckCircle, ChevronRight, ChevronLeft, Sparkles,
  Home, Building2, Hammer, Wind, Truck, ShieldCheck,
  Calendar, Clock, MapPin, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Static data ──────────────────────────────────────────────────────────────

const SERVICES = [
  { id: 'menage',        Icon: Home,        price: 49,  duration: 120 },
  { id: 'bureau',        Icon: Building2,   price: 79,  duration: 180 },
  { id: 'apres_travaux', Icon: Hammer,      price: 129, duration: 300 },
  { id: 'vitres',        Icon: Wind,        price: 59,  duration: 90  },
  { id: 'demenagement',  Icon: Truck,       price: 99,  duration: 240 },
  { id: 'desinfection',  Icon: ShieldCheck, price: 89,  duration: 120 },
]

const FREQUENCIES = ['once', 'weekly', 'biweekly', 'monthly']
const TIME_SLOTS  = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00']
const TOTAL_STEPS = 4

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={cn(
            'flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border-2 transition-all',
            i < current  ? 'bg-brand-600 border-brand-600 text-white'
            : i === current ? 'bg-white dark:bg-slate-900 border-brand-600 text-brand-600'
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400'
          )}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < TOTAL_STEPS - 1 && (
            <div className={cn('h-0.5 w-12 sm:w-20 transition-colors', i < current ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1 — Service ─────────────────────────────────────────────────────────

function StepService({ booking, setBooking }) {
  const t  = useTranslations('booking')
  const ts = useTranslations('services')

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('step1_title')}</h2>

      {/* Frequency */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('frequency_label')}</p>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map(f => (
            <button
              key={f}
              onClick={() => setBooking(b => ({ ...b, frequency: f }))}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                booking.frequency === f
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400'
              )}
            >
              {t(`frequency_${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map(({ id, Icon, price, duration }) => (
          <button
            key={id}
            onClick={() => setBooking(b => ({ ...b, serviceId: id, serviceName: ts(`${id}.name`), price, duration }))}
            className={cn(
              'relative text-left p-5 rounded-xl border-2 transition-all',
              booking.serviceId === id
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 bg-white dark:bg-slate-800/50'
            )}
          >
            {booking.serviceId === id && (
              <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-brand-600" />
            )}
            <Icon className={cn('w-8 h-8 mb-3', booking.serviceId === id ? 'text-brand-600' : 'text-slate-500 dark:text-slate-400')} />
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{ts(`${id}.name`)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ts(`${id}.short`)}</p>
            <p className="mt-3 text-brand-600 dark:text-brand-400 font-bold text-sm">
              À partir de {price}€ · {duration} min
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2 — Date & Time ─────────────────────────────────────────────────────

function StepDateTime({ booking, setBooking }) {
  const t = useTranslations('booking')

  // Next 14 non-Sunday days
  const days = []
  const today = new Date()
  for (let i = 1; days.length < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() !== 0) days.push(d)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('step2_title')}</h2>

      {/* Date grid */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t('select_date')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {days.map((d, i) => {
            const iso = d.toISOString().split('T')[0]
            const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
            return (
              <button
                key={i}
                onClick={() => setBooking(b => ({ ...b, date: iso, time: '' }))}
                className={cn(
                  'py-3 px-2 rounded-lg text-center text-xs sm:text-sm border transition-colors',
                  booking.date === iso
                    ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 text-slate-700 dark:text-slate-300'
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {booking.date && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('select_time')}
          </p>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => setBooking(b => ({ ...b, time: slot }))}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                  booking.time === slot
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 text-slate-700 dark:text-slate-300'
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 3 — Address ─────────────────────────────────────────────────────────

function StepAddress({ booking, setBooking }) {
  const t = useTranslations('booking')

  const Field = ({ name, label, type = 'text', span = false }) => (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={booking[name] || ''}
        onChange={e => setBooking(b => ({ ...b, [name]: e.target.value }))}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-brand-600" />
        {t('step3_title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field name="street" label={t('address_street')} span />
        <Field name="city"   label={t('address_city')} />
        <Field name="postal" label={t('address_postal')} />
        <Field name="floor"  label={t('address_floor')} />
        <Field name="sqm"    label={t('address_sqm')} type="number" />

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('address_elevator')}</p>
          <div className="flex gap-3">
            {[{ label: 'Oui', val: true }, { label: 'Non', val: false }].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => setBooking(b => ({ ...b, elevator: val }))}
                className={cn(
                  'px-6 py-2 rounded-lg text-sm font-medium border transition-colors',
                  booking.elevator === val
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('address_notes')}</label>
          <textarea
            rows={3}
            value={booking.notes || ''}
            onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Step 4 — Summary ─────────────────────────────────────────────────────────

function StepSummary({ booking }) {
  const t = useTranslations('booking')

  const rows = [
    { label: t('summary_service'),  value: booking.serviceName || '—' },
    { label: t('frequency_label'),  value: t(`frequency_${booking.frequency || 'once'}`) },
    { label: t('summary_date'),     value: booking.date ? `${booking.date}  ${booking.time || ''}` : '—' },
    { label: t('summary_address'),  value: booking.street ? `${booking.street}, ${booking.postal} ${booking.city}` : '—' },
    { label: t('summary_duration'), value: booking.duration ? `${booking.duration} min` : '—' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('summary_title')}</h2>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {rows.map(({ label, value }, i) => (
          <div
            key={i}
            className={cn(
              'flex justify-between px-5 py-4 text-sm',
              i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'
            )}
          >
            <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            <span className="text-slate-900 dark:text-white font-semibold text-right max-w-[60%]">{value}</span>
          </div>
        ))}

        <div className="flex justify-between px-5 py-5 bg-brand-50 dark:bg-brand-900/20 border-t border-brand-200 dark:border-brand-800">
          <span className="font-bold text-slate-900 dark:text-white">{t('summary_total')}</span>
          <span className="font-bold text-2xl text-brand-600 dark:text-brand-400">
            {booking.price ? `${booking.price}€` : '—'}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        Paiement sécurisé. Aucun frais supplémentaire.
      </p>
    </div>
  )
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

function Confirmation({ locale }) {
  const t   = useTranslations('booking')
  const ref = `CLT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('confirmation_title')}</h2>
      <p className="text-brand-600 dark:text-brand-400 font-semibold mb-2">
        {t('confirmation_ref', { ref })}
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{t('confirmation_email')}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/${locale}/booking`}
          className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-button hover:bg-brand-700 transition-colors"
        >
          {t('confirmation_book_another')}
        </Link>
        <Link
          href={`/${locale}`}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-button hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {t('confirmation_my_bookings')}
        </Link>
      </div>
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function BookingPage({ params: { locale } }) {
  const t = useTranslations('booking')
  const [step, setStep]       = useState(0)          // 0–3 wizard, 4 confirmed
  const [booking, setBooking] = useState({ frequency: 'once' })

  const canAdvance = () => {
    if (step === 0) return !!booking.serviceId
    if (step === 1) return !!(booking.date && booking.time)
    if (step === 2) return !!(booking.street && booking.city && booking.postal)
    return true
  }

  if (step === 4) {
    return (
      <main className="min-h-screen pt-16 bg-slate-50 dark:bg-[rgb(13,17,23)]">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-card p-8">
            <Confirmation locale={locale} />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-16 bg-slate-50 dark:bg-[rgb(13,17,23)]">
      {/* Hero strip */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-700 py-10">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-brand-200 text-sm font-medium">Clarté</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">{t('title')}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <StepIndicator current={step} />

        <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-card p-6 sm:p-8">

          {step === 0 && <StepService  booking={booking} setBooking={setBooking} />}
          {step === 1 && <StepDateTime booking={booking} setBooking={setBooking} />}
          {step === 2 && <StepAddress  booking={booking} setBooking={setBooking} />}
          {step === 3 && <StepSummary  booking={booking} />}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">

            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('back')}
              </button>
            ) : (
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('back')}
              </Link>
            )}

            <button
              onClick={() => step < 3 ? setStep(s => s + 1) : setStep(4)}
              disabled={!canAdvance()}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-button transition-all',
                canAdvance()
                  ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-button'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              )}
            >
              {step === 3 ? (
                <><CreditCard className="w-4 h-4" />{t('pay_now')}</>
              ) : (
                <>{t('next')}<ChevronRight className="w-4 h-4" /></>
              )}
            </button>

          </div>
        </div>
      </div>
    </main>
  )
}
