# CLARTÉ — Master Build Plan
# Agent Instructions: Read this entirely before writing a single file.
# This document is the authoritative specification. Nothing overrides it.

---

## 0. PROJECT CONTEXT

**Client:** Clarté — Professional cleaning services ("Des services de nettoyage qui font briller la vie")
**Primary market:** France (French-speaking), secondary: Arabic-speaking, English-speaking
**Brand colors (from logo):** Blue (#1B5E9B), Green (#27AE60), Orange/Red accent (#E74C3C)
**Tagline:** "Des services de nettoyage qui font briller la vie"
**Purpose:** Convert visitors into paying customers. Book → Pay → Clean.

---

## 1. LOCKED STACK DECISIONS

| Layer | Technology | Reasoning |
|---|---|---|
| Frontend | Next.js 14 (App Router, **no TypeScript**, no Pages Router) | SSR/SSG for SEO, App Router for layouts, plain JS |
| Styling | Tailwind CSS v3 | Utility-first, built-in dark mode, RTL support with `rtl:` variants |
| i18n | `next-intl` | Best App Router support, locale-aware routing, server component compatible |
| Dark mode | `next-themes` | Prevents flash, cookie-based persistence, SSR safe |
| Backend | FastAPI (Python 3.12) | Explicit user choice, async, clean validation with Pydantic v2 |
| Database | Supabase PostgreSQL (free tier) | 500MB free, Row Level Security, Auth built-in, webhooks, Edge Functions |
| Auth | Supabase Auth + `@supabase/ssr` | Cookie-based sessions, SSR-safe, no hydration issues |
| File storage | Supabase Storage | Free 1GB, integrated with Postgres RLS |
| Payments | **Stripe** | Only viable choice for France: SEPA, EUR, Apple/Google Pay, webhooks work on free tier |
| Email | Resend (free: 3K emails/month) | Booking confirmations, admin alerts |
| Frontend host | Vercel (free) | Native Next.js, global CDN, preview deployments |
| Backend host | Render (free tier) | FastAPI host, note: spins down after 15 min — use cron ping via GitHub Actions |
| DNS/CDN | Cloudflare (free) | DDoS, caching, SSL, analytics |
| Domain provider | **OVH** | French company, trusted in FR market, .fr domain ~€7/year |
| CI/CD | GitHub Actions | Free for public/private repos up to 2000 min/month |

### Why NOT Firebase:
Firebase Spark (free) plan **blocks outbound network calls** from Cloud Functions — Stripe webhooks are impossible without upgrading to Blaze (pay-as-you-go). Supabase Edge Functions allow inbound webhooks on the free tier. Decision: Supabase.

### Why Stripe and not PayPal:
- Stripe: 1.5% + €0.25 for EU cards (vs PayPal's 3.49% + fixed fee)
- SEPA Direct Debit: standard in France, PayPal doesn't support it well
- Stripe's subscription billing is best-in-class
- French consumers increasingly trust Stripe-powered checkouts
- Developer experience is vastly superior

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                             │
│  Next.js (Vercel) — Server Components + Client Components  │
│  Locale: /fr | /ar | /en      Dark/Light: cookie-based     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
         ┌───────────────┼───────────────┐
         │               │               │
    Supabase Auth   FastAPI (Render)  Stripe API
    (sessions)      /api/v1/*        (payments)
         │               │
         └───────┬───────┘
                 │
         Supabase PostgreSQL
         (database + storage)
                 │
         Resend (email)
```

**Rule:** Next.js talks to FastAPI for all business logic. Next.js talks to Supabase Auth directly for session management (using `@supabase/ssr`). Stripe webhooks hit a Next.js API route at `/api/webhooks/stripe` — this route then calls FastAPI internally.

---

## 3. DIRECTORY STRUCTURE

```
clarte-website/
├── .github/
│   └── workflows/
│       ├── ci.yml                 ← lint + test on every push
│       ├── deploy.yml             ← production deploy on main merge
│       └── backend-ping.yml       ← cron ping to prevent Render spin-down
├── frontend/                      ← Next.js App
│   ├── app/
│   │   ├── [locale]/              ← ALL pages under locale prefix
│   │   │   ├── layout.js          ← locale + theme provider
│   │   │   ├── page.js            ← Home page
│   │   │   ├── services/
│   │   │   │   └── page.js
│   │   │   ├── booking/
│   │   │   │   └── page.js        ← multi-step booking form
│   │   │   ├── pricing/
│   │   │   │   └── page.js
│   │   │   ├── about/
│   │   │   │   └── page.js
│   │   │   ├── contact/
│   │   │   │   └── page.js
│   │   │   ├── gallery/
│   │   │   │   └── page.js
│   │   │   ├── blog/
│   │   │   │   ├── page.js        ← blog listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.js    ← blog post
│   │   │   ├── faq/
│   │   │   │   └── page.js
│   │   │   ├── booking-success/
│   │   │   │   └── page.js
│   │   │   ├── admin/             ← protected route group
│   │   │   │   ├── layout.js      ← admin auth guard
│   │   │   │   ├── page.js        ← dashboard
│   │   │   │   ├── bookings/
│   │   │   │   ├── services/
│   │   │   │   ├── pricing/
│   │   │   │   ├── customers/
│   │   │   │   ├── gallery/
│   │   │   │   ├── blog/
│   │   │   │   └── reviews/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── callback/
│   │   │   ├── privacy-policy/
│   │   │   ├── terms/
│   │   │   └── legal/
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.js   ← Stripe webhook receiver
│   │   └── layout.js              ← Root: html lang + suppressHydrationWarning
│   ├── components/
│   │   ├── ui/                    ← Atomic UI: Button, Card, Input, Badge, Modal, Spinner
│   │   ├── sections/              ← Hero, ServicesGrid, Testimonials, PricingCards, etc.
│   │   ├── booking/               ← multi-step booking wizard components
│   │   ├── layout/                ← Header, Footer, MobileNav, LanguageSwitcher, ThemeToggle
│   │   └── seo/                   ← JsonLd, BreadcrumbJsonLd, etc.
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js          ← browser Supabase client
│   │   │   └── server.js          ← server Supabase client (cookies)
│   │   ├── stripe.js              ← Stripe instance
│   │   ├── api.js                 ← typed fetch wrapper for FastAPI
│   │   └── utils.js               ← cn(), formatCurrency(), formatDate()
│   ├── messages/                  ← i18n translation files
│   │   ├── fr.json                ← French (default)
│   │   ├── ar.json                ← Arabic (RTL)
│   │   └── en.json                ← English
│   ├── public/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── logo-white.png
│   │   │   ├── og-image.jpg       ← 1200x630 Open Graph image
│   │   │   └── services/          ← service images
│   │   ├── icons/
│   │   └── fonts/                 ← self-hosted fonts (no Google Fonts CDN for GDPR)
│   ├── styles/
│   │   └── globals.css            ← Tailwind directives + CSS variables
│   ├── middleware.js               ← locale detection + auth guard
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── next-sitemap.config.js
│   └── package.json
├── backend/                       ← FastAPI
│   ├── app/
│   │   ├── main.py                ← FastAPI app factory
│   │   ├── core/
│   │   │   ├── config.py          ← pydantic-settings, all env vars
│   │   │   ├── security.py        ← Supabase JWT verification
│   │   │   └── deps.py            ← get_current_user dependency
│   │   ├── api/v1/
│   │   │   ├── __init__.py
│   │   │   ├── bookings.py
│   │   │   ├── services.py        ← cleaning service CRUD
│   │   │   ├── pricing.py
│   │   │   ├── payments.py        ← Stripe create-intent, subscription
│   │   │   ├── users.py
│   │   │   ├── reviews.py
│   │   │   ├── blog.py
│   │   │   ├── gallery.py
│   │   │   └── contact.py
│   │   ├── db/
│   │   │   ├── base.py            ← SQLAlchemy async engine
│   │   │   └── models/
│   │   │       ├── booking.py
│   │   │       ├── service.py
│   │   │       ├── payment.py
│   │   │       ├── review.py
│   │   │       ├── blog_post.py
│   │   │       └── contact_message.py
│   │   ├── schemas/               ← Pydantic v2 schemas
│   │   └── services/              ← business logic (no DB in routes)
│   │       ├── booking_service.py
│   │       ├── payment_service.py
│   │       ├── email_service.py
│   │       └── stripe_service.py
│   ├── alembic/
│   │   └── versions/
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── Dockerfile
│   └── .env.example
└── docker-compose.yml             ← local dev only
```

---

## 4. DATABASE SCHEMA (PostgreSQL via Supabase)

```sql
-- All tables use UUID primary keys (prevent enumeration)
-- All tables have created_at, updated_at
-- Soft delete where applicable (deleted_at)

-- SERVICES TABLE
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,       -- 'menage-domicile', 'nettoyage-bureau'
  icon VARCHAR(50),                         -- icon name for UI
  base_price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,               -- 'hour', 'flat', 'm2'
  duration_minutes INTEGER,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE TRANSLATIONS
CREATE TABLE service_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,              -- 'fr', 'ar', 'en'
  name VARCHAR(200) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  UNIQUE(service_id, locale)
);

-- PRICING PLANS
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,       -- 'ponctuel', 'hebdomadaire', 'mensuel'
  stripe_price_id VARCHAR(200),            -- Stripe Price ID for subscriptions
  stripe_product_id VARCHAR(200),
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  billing_interval VARCHAR(20),            -- NULL=one-time, 'week', 'month'
  is_popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRICING PLAN TRANSLATIONS
CREATE TABLE pricing_plan_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES pricing_plans(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  features JSONB,                          -- ["Feature 1", "Feature 2"]
  UNIQUE(plan_id, locale)
);

-- CUSTOMERS (linked to Supabase auth.users)
CREATE TABLE customers (
  id UUID PRIMARY KEY,                     -- same as auth.users.id
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  stripe_customer_id VARCHAR(200),         -- Stripe customer ID
  preferred_locale VARCHAR(5) DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE ADDRESSES
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  label VARCHAR(100),                      -- 'Home', 'Office'
  street VARCHAR(300) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) DEFAULT 'FR',
  area_sqm INTEGER,                        -- apartment surface area
  floor INTEGER,
  elevator BOOLEAN DEFAULT false,
  access_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(20) UNIQUE NOT NULL,   -- 'CLT-2026-001' human-readable
  customer_id UUID REFERENCES customers(id),
  service_id UUID REFERENCES services(id),
  address_id UUID REFERENCES addresses(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  frequency VARCHAR(20) DEFAULT 'once',    -- 'once', 'weekly', 'biweekly', 'monthly'
  status VARCHAR(30) DEFAULT 'pending',    -- pending, confirmed, in_progress, completed, cancelled
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  stripe_payment_intent_id VARCHAR(200) UNIQUE,
  stripe_subscription_id VARCHAR(200),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(30) DEFAULT 'pending',   -- pending, succeeded, failed, refunded
  payment_method VARCHAR(50),             -- 'card', 'sepa_debit', 'paypal'
  receipt_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_name VARCHAR(200),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLOG POSTS
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  author_id UUID REFERENCES customers(id),  -- admin user
  cover_image_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',       -- draft, published
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- BLOG POST TRANSLATIONS
CREATE TABLE blog_post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  title VARCHAR(300) NOT NULL,
  excerpt VARCHAR(500),
  content TEXT NOT NULL,                    -- HTML (sanitized) or Markdown
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  UNIQUE(post_id, locale)
);

-- GALLERY
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  category VARCHAR(50),                     -- 'residential', 'commercial', 'before-after'
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACT MESSAGES
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(300),
  message TEXT NOT NULL,
  locale VARCHAR(5),
  status VARCHAR(20) DEFAULT 'unread',     -- unread, read, replied
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AVAILABILITY BLOCKS (admin sets unavailable slots)
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);
CREATE INDEX idx_reviews_published ON reviews(published);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
```

---

## 5. DESIGN SYSTEM

### 5.1 Color Palette (Tailwind Config)

```js
// tailwind.config.js — colors section
colors: {
  brand: {
    50:  '#EBF5FB',
    100: '#D6EAF8',
    200: '#AED6F1',
    300: '#85C1E9',
    400: '#5DADE2',
    500: '#2E86C1',  // primary blue (logo-derived)
    600: '#1B5E9B',  // primary dark
    700: '#154E80',
    800: '#0F3B61',
    900: '#0A2744',
  },
  green: {
    400: '#52BE80',
    500: '#27AE60',  // accent green (logo-derived)
    600: '#1E8449',
  },
  orange: {
    400: '#F1948A',
    500: '#E74C3C',  // accent red/orange (logo-derived)
    600: '#CB4335',
  },
  // Neutral palette for text/backgrounds
  surface: {
    // Light mode
    'bg':         '#FFFFFF',
    'bg-alt':     '#F8FAFC',
    'bg-card':    '#FFFFFF',
    'border':     '#E2E8F0',
    'text':       '#0F172A',
    'text-muted': '#64748B',
    // Dark mode values set via CSS variables
  }
}
```

### 5.2 CSS Variables (globals.css)

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg:           255 255 255;
    --bg-alt:       248 250 252;
    --bg-card:      255 255 255;
    --border:       226 232 240;
    --text:         15 23 42;
    --text-muted:   100 116 139;
    --brand:        46 134 193;
    --brand-dark:   27 94 155;
  }

  .dark {
    --bg:           13 17 23;
    --bg-alt:       22 27 34;
    --bg-card:      30 37 46;
    --border:       48 54 61;
    --text:         230 237 243;
    --text-muted:   139 148 158;
    --brand:        83 166 221;
    --brand-dark:   94 182 240;
  }

  /* RTL font for Arabic */
  [dir="rtl"] {
    font-family: 'Noto Sans Arabic', 'Cairo', system-ui, sans-serif;
  }

  /* LTR font */
  [dir="ltr"] {
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* Smooth theme transition */
  * {
    @apply transition-colors duration-200;
  }
  /* Exclude from transition to avoid layout shift */
  img, svg, video {
    transition: none !important;
  }
}
```

### 5.3 Typography Scale

```js
// tailwind.config.js — fontFamily
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
}
// fontSize uses default Tailwind scale
// Heading hierarchy: text-4xl (h1) → text-3xl (h2) → text-2xl (h3)
```

### 5.4 Shadows & Radius

```js
borderRadius: {
  DEFAULT: '0.5rem',
  'card': '1rem',
  'button': '0.5rem',
  'full': '9999px',
}
boxShadow: {
  'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.15)',
  'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
}
```

---

## 6. DARK MODE IMPLEMENTATION (CRITICAL — NO FLASH)

### The problem:
`localStorage` is read after JavaScript loads → white flash before theme applies.

### The solution:
`next-themes` injects a blocking inline script into `<html>` **before** React hydrates. This script reads from `localStorage` and applies the `dark` class synchronously — zero flash.

```js
// app/layout.js — Root layout
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning is MANDATORY here
    // next-themes modifies the class attribute on the server vs client
    // suppressHydrationWarning silences the React mismatch warning (it's expected)
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```js
// components/layout/ThemeToggle.js
'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // CRITICAL: only render after mount to prevent hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" /> // placeholder, same dimensions

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
```

**Rule:** Every component that reads `useTheme()` or `useTranslations()` MUST guard with `mounted` state or server-side rendering. This prevents all hydration mismatches.

---

## 7. i18n IMPLEMENTATION (NO REFRESH ISSUES)

### 7.1 Locale Routing Structure

```
/fr         → French (default, primary)
/ar         → Arabic (RTL)
/en         → English
/           → 301 redirect to /fr (based on Accept-Language or cookie)
```

### 7.2 middleware.js (locale detection + auth guard)

```js
// middleware.js
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'ar', 'en'],
  defaultLocale: 'fr',
  localeDetection: true,        // reads Accept-Language header
  localePrefix: 'always',       // always show /fr/ prefix
})

export default async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. Handle locale routing
  const response = intlMiddleware(request)

  // 2. Guard admin routes
  if (pathname.includes('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { /* cookie handlers */ } }
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const locale = pathname.split('/')[1] || 'fr'
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### 7.3 Auto-Translation Pipeline (CRITICAL — do NOT manually edit ar.json or en.json)

**Source of truth:** `messages/fr.json` — only file written by humans.
**Auto-generated:** `messages/ar.json` and `messages/en.json` — produced by `scripts/translate.js`.

#### How it works

```
Edit fr.json
    ↓
npm run translate          (local dev)
    OR
git push fr.json           (GitHub Actions auto-translate.yml runs automatically)
    ↓
OpenAI gpt-4o-mini translates only NEW or CHANGED strings (diff cache)
    ↓
ar.json and en.json updated and committed automatically
```

#### scripts/translate.js — key behaviors

- **Diff-based:** stores MD5 hash of each source string in `.translation-cache.json`. Only sends strings whose hash changed to OpenAI. A run with no changes to `fr.json` costs $0.
- **Batch processing:** sends 50 strings per API call to respect token limits.
- **Fallback:** if a batch fails, keeps existing translation for those strings rather than crashing.
- **Force mode:** `node scripts/translate.js --force` re-translates everything from scratch.
- **Brand-aware:** system prompt tells OpenAI about Clarté's tone and to preserve `{placeholders}` and HTML tags.

#### Required secret
Add `OPENAI_API_KEY` to GitHub repository secrets (Settings → Secrets → Actions).

#### npm script to add
```json
"scripts": {
  "translate": "node scripts/translate.js",
  "translate:force": "node scripts/translate.js --force"
}
```

#### Files to commit vs ignore
```
messages/fr.json              ← commit (source, hand-written)
messages/ar.json              ← commit (generated, do NOT hand-edit)
messages/en.json              ← commit (generated, do NOT hand-edit)
messages/.translation-cache.json  ← commit (tracks what needs re-translation)
```

#### Translation Files Structure

```json
// messages/fr.json  ← ONLY THIS FILE IS WRITTEN MANUALLY
{
  "nav": {
    "home": "Accueil",
    "services": "Nos Services",
    "pricing": "Tarifs",
    "about": "À propos",
    "contact": "Contact",
    "book": "Réserver"
  },
  "hero": {
    "title": "Un intérieur impeccable, sans effort",
    "subtitle": "Des services de nettoyage professionnels qui font briller votre vie",
    "cta_primary": "Réserver maintenant",
    "cta_secondary": "Voir nos services"
  },
  "services": { ... },
  "booking": { ... },
  "pricing": { ... },
  "contact": { ... },
  "footer": { ... },
  "meta": {
    "home_title": "Clarté — Services de Nettoyage Professionnels",
    "home_description": "Services de nettoyage professionnels pour votre domicile et vos bureaux. Réservez en ligne en 2 minutes."
  }
}
```

```json
// messages/ar.json — Arabic (RTL)
{
  "nav": {
    "home": "الرئيسية",
    "services": "خدماتنا",
    "pricing": "الأسعار",
    "about": "من نحن",
    "contact": "اتصل بنا",
    "book": "احجز الآن"
  },
  "hero": {
    "title": "مساحة نظيفة، بلا جهد",
    "subtitle": "خدمات تنظيف احترافية تجعل حياتك تتألق",
    ...
  }
}
```

### 7.4 RTL Support

```js
// app/[locale]/layout.js
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const locales = ['fr', 'ar', 'en']
const rtlLocales = ['ar']

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()
  const isRTL = rtlLocales.includes(locale)

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={isRTL ? 'font-arabic' : 'font-sans'}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

```css
/* RTL-specific Tailwind usage */
/* In components, use rtl: variant for RTL adjustments */
<div className="ml-4 rtl:ml-0 rtl:mr-4">...</div>
<div className="text-left rtl:text-right">...</div>
<svg className="rotate-0 rtl:rotate-180">...</svg>  {/* arrows */}
```

---

## 8. SEO STRATEGY (ALL TYPES)

### 8.1 Technical SEO

```js
// app/[locale]/layout.js — base metadata
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  return {
    metadataBase: new URL(baseUrl),
    title: { template: `%s | Clarté`, default: t('home_title') },
    description: t('home_description'),
    keywords: ['nettoyage', 'ménage', 'nettoyage professionnel', 'service ménage'],
    authors: [{ name: 'Clarté' }],
    creator: 'Clarté',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_MA' : 'en_US',
      alternateLocale: ['fr_FR', 'ar_MA', 'en_US'],
      url: `${baseUrl}/${locale}`,
      siteName: 'Clarté',
      images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Clarté Services' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home_title'),
      description: t('home_description'),
      images: ['/images/og-image.jpg'],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'fr': `${baseUrl}/fr`,
        'ar': `${baseUrl}/ar`,
        'en': `${baseUrl}/en`,
        'x-default': `${baseUrl}/fr`,
      }
    },
    // Local SEO meta
    other: {
      'geo.region': 'FR',
      'geo.placename': 'France',
    }
  }
}
```

### 8.2 Structured Data (JSON-LD)

Every page injects relevant JSON-LD. Create a `components/seo/JsonLd.js` component:

```js
// JSON-LD for the main LocalBusiness (inject on Home page)
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "https://clarte.fr/#business",
  "name": "Clarté",
  "description": "Services de nettoyage professionnels pour domiciles et bureaux",
  "url": "https://clarte.fr",
  "telephone": "+33-X-XX-XX-XX-XX",
  "email": "contact@clarte.fr",
  "logo": "https://clarte.fr/images/logo.png",
  "image": "https://clarte.fr/images/og-image.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "FR",
    "addressLocality": "France"
  },
  "priceRange": "€€",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "17:00" }
  ],
  "sameAs": ["https://facebook.com/clarte", "https://instagram.com/clarte"],
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "87" }
}
```

**Additional JSON-LD per page:**
- Services page → `Service` schema for each service
- Blog post → `Article` or `BlogPosting` schema
- FAQ page → `FAQPage` schema
- Booking page → `Service` with `offers`
- Contact page → `ContactPage` with `ContactPoint`

### 8.3 Sitemap (auto-generated)

```js
// next-sitemap.config.js
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  alternateRefs: [
    { href: `${process.env.NEXT_PUBLIC_SITE_URL}/fr`, hreflang: 'fr' },
    { href: `${process.env.NEXT_PUBLIC_SITE_URL}/ar`, hreflang: 'ar' },
    { href: `${process.env.NEXT_PUBLIC_SITE_URL}/en`, hreflang: 'en' },
    { href: `${process.env.NEXT_PUBLIC_SITE_URL}/fr`, hreflang: 'x-default' },
  ],
  exclude: ['/*/admin/*', '/*/auth/*', '/*/booking-success'],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/auth'] }
    ]
  }
}
```

### 8.4 Core Web Vitals Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| LCP | < 2.5s | `next/image` with priority on above-fold images, self-hosted fonts |
| FID/INP | < 100ms | Minimal client JS, no blocking scripts |
| CLS | < 0.1 | Reserve space for all async content, explicit image dimensions |
| TTFB | < 600ms | Server Components, Vercel Edge Functions |

**Image rules:**
- Always use `<Image>` from `next/image` — never `<img>` for content images
- Always specify `width`, `height` or use `fill` with a sized container
- Hero image: `priority={true}` to preload
- Below-fold images: `loading="lazy"` (default)
- Use WebP format, serve via Supabase Storage with transform parameters

---

## 9. PAGES — DETAILED REQUIREMENTS

### 9.1 Home Page (`/[locale]`)

**Sections (top to bottom):**
1. **Header** — Logo, nav links, language switcher, theme toggle, "Réserver" CTA button
2. **Hero** — Full-width, headline, subheadline, 2 CTAs (Book Now + See Services), background: photo of clean interior or CSS gradient with brand colors, floating stats bubble (500+ clients, 4.9★ rating)
3. **Trust bar** — Logos/icons: Insured, Eco-Friendly Products, Satisfaction Guaranteed, Available 7/7
4. **Services Overview** — 6 cards: Ménage domicile, Nettoyage bureau, Après travaux, Vitres, Déménagement, Désinfection — icon + name + short description + price from
5. **How It Works** — 3-step process: 1. Book online → 2. We clean → 3. You relax
6. **Why Clarté** — 4-column: Professionnels formés, Produits écologiques, Assurance incluse, Satisfaction garantie
7. **Pricing Teaser** — Show 3 plans (Ponctuel, Hebdomadaire, Mensuel) with CTA
8. **Testimonials** — Carousel/grid of customer reviews with star ratings
9. **Gallery Preview** — Masonry grid of 6 before/after photos with "Voir tout" link
10. **FAQ teaser** — 4 most common questions
11. **CTA Banner** — Full-width colored section: "Prêt pour un intérieur impeccable?" + booking button
12. **Footer** — Logo, links, social, contact info, legal links, locale switcher

### 9.2 Services Page (`/[locale]/services`)

- Grid of all services (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each card: image, icon, name, description, price, duration, "Réserver ce service" button
- Filter tabs by category (Résidentiel, Commercial, Spécialisé)
- Each service links to a detail modal or expands inline

### 9.3 Booking Page (`/[locale]/booking`)

**Multi-step wizard (5 steps):**

```
Step 1: Service Selection
  └── Grid of service cards, select one, show estimated price/duration

Step 2: Date & Time
  └── Calendar component (react-day-picker)
  └── Available time slots for selected date (fetched from API)
  └── Frequency selector: Once | Weekly | Bi-weekly | Monthly

Step 3: Address & Details
  └── If logged in: choose from saved addresses or add new
  └── If not logged in: enter address + optional account creation
  └── Surface area (m²), floor, access notes

Step 4: Summary & Payment
  └── Full summary of order
  └── Price breakdown
  └── Stripe Checkout (embedded with Stripe Elements)
  └── Payment methods: Card, SEPA Direct Debit

Step 5: Confirmation
  └── Booking reference number
  └── Email confirmation notice
  └── Add to Google Calendar button
  └── "Book another service" + "View my bookings" CTAs
```

**State management:** React Context (no Redux/Zustand for this scope). Booking state persists in sessionStorage so browser refresh doesn't wipe the form.

### 9.4 Pricing Page (`/[locale]/pricing`)

```
- 3 plan cards (mobile: stacked, desktop: side-by-side)
- Toggle: Mensuel / Annuel (with annual discount %)
- Most popular badge on Hebdomadaire plan
- Feature comparison table below cards
- FAQ section below
- CTA below FAQ
```

Plans:
| Plan | FR Name | Price | Billing | Stripe |
|------|---------|-------|---------|--------|
| one-time | Ponctuel | From €49 | per service | Payment Intent |
| weekly | Hebdomadaire | €149/month | monthly | Subscription |
| monthly | Mensuel | €89/month | monthly | Subscription |

### 9.5 Admin Dashboard (`/[locale]/admin`)

**Protected — requires admin role in Supabase**

Pages:
- `/admin` — Dashboard: today's bookings, revenue this month, pending reviews
- `/admin/bookings` — Table with filters (date, status, service), confirm/cancel actions
- `/admin/bookings/[id]` — Booking detail, status update, notes, payment status
- `/admin/services` — CRUD for services, drag to reorder
- `/admin/pricing` — Edit plan names/prices, features list
- `/admin/customers` — Customer list, booking history per customer
- `/admin/gallery` — Upload/delete gallery images, drag to reorder
- `/admin/blog` — Blog post list + editor (rich text with Tiptap)
- `/admin/reviews` — Moderate reviews, publish/unpublish
- `/admin/availability` — Block dates/times
- `/admin/settings` — Company info, contact details, email templates

---

## 10. PAYMENT IMPLEMENTATION (STRIPE)

### 10.1 One-time Payment Flow

```
Customer fills booking form
  → POST /api/v1/payments/create-intent
    { booking_id, amount, currency }
  → Backend creates Stripe PaymentIntent
    stripe.paymentIntents.create({ amount, currency, metadata: { booking_id } })
  → Returns { client_secret }
  → Frontend renders Stripe Elements with client_secret
  → Customer enters card / selects SEPA / Apple Pay
  → Stripe.js confirms payment client-side
  → On success: Stripe sends webhook to /api/webhooks/stripe
  → Webhook handler: update payments.status = 'succeeded', bookings.status = 'confirmed'
  → Send confirmation email via Resend
```

### 10.2 Subscription Flow

```
Customer selects weekly/monthly plan on pricing page
  → POST /api/v1/payments/create-subscription
    { plan_id, customer_id }
  → Backend creates/retrieves Stripe Customer
  → Creates Stripe Checkout Session (hosted) for subscription
  → Redirect customer to Stripe Checkout URL
  → On success: Stripe redirects to /booking-success?session_id=xxx
  → Webhook: subscription.created → create recurring booking records
  → Customer can manage via Stripe Customer Portal
```

### 10.3 Webhook Handler (`/api/webhooks/stripe/route.js`)

```js
// CRITICAL: verify Stripe signature before processing
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Forward to FastAPI for business logic
  await fetch(`${process.env.INTERNAL_API_URL}/api/v1/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Key': process.env.INTERNAL_API_KEY },
    body: JSON.stringify(event)
  })

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
```

---

## 11. COMPONENT LIBRARY

### Core UI Components to build (in order):

```
components/ui/
├── Button.js        — variants: primary, secondary, outline, ghost; sizes: sm, md, lg
├── Card.js          — with hover animation, optional image header
├── Input.js         — text, email, tel, textarea; error state; RTL support
├── Select.js        — custom styled select
├── Badge.js         — status badges: success, warning, error, info
├── Modal.js         — accessible dialog with focus trap
├── Spinner.js       — loading spinner
├── Toast.js         — success/error notifications (use react-hot-toast)
├── Stepper.js       — multi-step wizard progress indicator
├── StarRating.js    — display/input star ratings
├── DatePicker.js    — wraps react-day-picker with locale support
└── ImageUpload.js   — drag-and-drop with preview (admin only)

components/layout/
├── Header.js        — responsive, mobile menu, locale switcher, theme toggle
├── MobileNav.js     — slide-in drawer for mobile
├── Footer.js        — 4-column footer
├── LanguageSwitcher.js  — FR | AR | EN toggle
├── ThemeToggle.js   — sun/moon icon
└── AdminSidebar.js  — collapsible admin navigation

components/sections/
├── Hero.js
├── ServicesGrid.js
├── HowItWorks.js
├── PricingCards.js
├── TestimonialsCarousel.js
├── GalleryGrid.js
├── FAQAccordion.js
├── CTABanner.js
├── TrustBar.js
└── StatsCounter.js
```

---

## 12. ENVIRONMENT VARIABLES

### frontend/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SITE_URL=https://clarte.fr
NEXT_PUBLIC_API_URL=https://api.clarte.fr
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
INTERNAL_API_URL=http://backend:8000
INTERNAL_API_KEY=random-256-bit-hex
RESEND_API_KEY=re_...
```

### backend/.env
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
INTERNAL_API_KEY=same-key-as-frontend
ENVIRONMENT=production
CORS_ORIGINS=["https://clarte.fr","https://www.clarte.fr"]
```

---

## 13. DEPLOYMENT ARCHITECTURE

### 13.1 Domain Setup (OVH)

1. Purchase `clarte.fr` on **ovhcloud.com** (~€7/year)
2. In OVH DNS: point nameservers to **Cloudflare** (free tier)
3. In Cloudflare: add DNS records

```
clarte.fr         A     76.76.21.21  (Vercel IP)       proxied ✓
www.clarte.fr     CNAME cname.vercel-dns.com           proxied ✓
api.clarte.fr     CNAME your-app.onrender.com          proxied ✓
```

4. In Vercel: add custom domain `clarte.fr` and `www.clarte.fr`
5. In Render: add custom domain `api.clarte.fr`
6. Cloudflare handles SSL (full strict mode with Vercel/Render's origin certs)

### 13.2 Vercel (Frontend)

```json
// vercel.json
{
  "redirects": [
    { "source": "/", "destination": "/fr", "permanent": false },
    { "source": "/www.clarte.fr/(.*)", "destination": "https://clarte.fr/$1", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 13.3 Render (Backend)

- Service type: **Web Service**
- Runtime: Python 3.12
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/v1/health`
- Auto-deploy: enabled (on push to `main`)

**Free tier spin-down mitigation:** Use GitHub Actions cron job to ping every 14 minutes.

### 13.4 Supabase

- Region: **eu-west-1** (Paris) — latency for French users
- Enable Row Level Security on all tables
- Set up Supabase Auth with:
  - Email/password for customers
  - Magic link option
  - Set `site_url` to `https://clarte.fr`
  - Redirect URLs: `https://clarte.fr/*/auth/callback`

---

## 14. CI/CD PIPELINE (GitHub Actions)

### 14.1 `.github/workflows/ci.yml` — runs on every push

```yaml
name: CI

on:
  push:
    branches: ['*']
  pull_request:
    branches: [main]

jobs:
  lint-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build  # verify it compiles

  lint-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install ruff
      - run: ruff check .

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - working-directory: frontend
        run: npm audit --audit-level=high
```

### 14.2 `.github/workflows/deploy.yml` — on push to main

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
      - name: Wait for deployment
        run: sleep 60
      - name: Health check
        run: curl -f https://api.clarte.fr/api/v1/health

  # Frontend deploys automatically via Vercel GitHub integration
  # No manual step needed

  notify-success:
    needs: [deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Notify deployment success
        run: echo "✅ Production deployment complete"
```

### 14.3 `.github/workflows/backend-ping.yml` — prevent Render spin-down

```yaml
name: Keep Render Alive

on:
  schedule:
    - cron: '*/14 * * * *'  # every 14 minutes

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend
        run: curl -f https://api.clarte.fr/api/v1/health || true
```

### 14.4 Branch strategy

```
main          → production (clarte.fr)
develop       → staging (Vercel preview URL)
feature/*     → opens PR → Vercel preview deploy → CI runs
```

---

## 15. FASTAPI BACKEND STRUCTURE

### 15.1 main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import router as v1_router

app = FastAPI(
    title="Clarté API",
    version="1.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
```

### 15.2 Auth (Supabase JWT verification)

FastAPI verifies Supabase JWT tokens — no separate auth system needed:

```python
# core/security.py
import jwt
from fastapi import HTTPException, status

def verify_supabase_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_exp": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 16. BUILD PHASES — EXECUTE IN ORDER

### PHASE 0: Project Foundation (Day 1-2)

**Deliverables:**
- [ ] Git repo initialized with `.gitignore`, `README.md`
- [ ] `frontend/` Next.js app created with: `npx create-next-app@latest frontend --js --app --tailwind --no-eslint-strict`
- [ ] `backend/` FastAPI project with all directories
- [ ] `docker-compose.yml` for local dev (PostgreSQL + Redis)
- [ ] Both projects runnable locally
- [ ] GitHub Actions CI skeleton (lint only, must pass)

**Frontend package.json dependencies:**
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-intl": "^3.15.0",
    "next-themes": "^0.3.0",
    "@supabase/supabase-js": "^2.44.0",
    "@supabase/ssr": "^0.4.0",
    "stripe": "^16.0.0",
    "@stripe/stripe-js": "^4.0.0",
    "@stripe/react-stripe-js": "^2.7.0",
    "react-hot-toast": "^2.4.1",
    "react-day-picker": "^8.10.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.390.0"
  },
  "devDependencies": {
    "next-sitemap": "^4.2.3"
  }
}
```

**Backend requirements.txt:**
```
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy[asyncio]==2.0.31
asyncpg==0.29.0
alembic==1.13.1
pydantic==2.7.4
pydantic-settings==2.3.4
python-jose[cryptography]==3.3.0
PyJWT==2.8.0
httpx==0.27.0
stripe==10.1.0
resend==2.2.0
python-multipart==0.0.9
```

---

### PHASE 1: Design System (Day 3-4)

**Deliverables:**
- [ ] `tailwind.config.js` with full brand config (colors, fonts, breakpoints, dark mode)
- [ ] `globals.css` with CSS variables for light/dark themes
- [ ] Self-hosted fonts downloaded to `public/fonts/` (Inter + Cairo/Noto Sans Arabic)
- [ ] All core UI components built (Button, Card, Input, Select, Badge, Modal, Spinner, Toast)
- [ ] Dark/light mode working with zero flash
- [ ] RTL layout switching working for Arabic
- [ ] Header + Footer + MobileNav components
- [ ] Visual check: every component looks correct in light, dark, LTR, RTL

**Font loading (no GDPR issues, no external requests):**
```css
/* globals.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-display: swap;
  font-style: normal;
}
@font-face {
  font-family: 'Cairo';
  src: url('/fonts/Cairo-Variable.woff2') format('woff2');
  font-display: swap;
  font-style: normal;
}
```

---

### PHASE 2: Translation Files (Day 4)

**Deliverables:**
- [ ] Complete `messages/fr.json` — every string in the app
- [ ] Complete `messages/ar.json` — full Arabic translation
- [ ] Complete `messages/en.json` — full English translation
- [ ] Locale switcher working (persists across refreshes via cookie)
- [ ] `middleware.js` handling locale detection and routing

---

### PHASE 3: Public Pages (Day 5-8)

Build in this order:
1. **Home page** — all sections
2. **Services page**
3. **Pricing page**
4. **About page**
5. **Contact page** (static for now, form wired in Phase 6)
6. **FAQ page**
7. **Gallery page** (static images for now)

Each page must have:
- [ ] Correct `generateMetadata()` export with locale-aware meta
- [ ] JSON-LD structured data component
- [ ] Mobile-first layout (min-w: 0, build for 375px first, then 768, then 1280)
- [ ] Dark mode looks correct
- [ ] Arabic RTL layout looks correct
- [ ] Scroll animations (use Intersection Observer, no heavy libraries)

---

### PHASE 4: Database + Backend API (Day 9-11)

- [ ] Supabase project created, region eu-west-1
- [ ] All tables created (run SQL from Section 4 above)
- [ ] Row Level Security policies configured
- [ ] Alembic migrations for FastAPI models
- [ ] All FastAPI route files scaffolded
- [ ] `/api/v1/health` returns 200
- [ ] `/api/v1/services` returns list of services (seeded data)
- [ ] `/api/v1/pricing` returns pricing plans (seeded data)
- [ ] Supabase Auth configured (email/password, magic link)
- [ ] CORS configured for frontend domain

---

### PHASE 5: Auth + Admin Panel (Day 12-15)

- [ ] Login/register pages
- [ ] `middleware.js` guards `/[locale]/admin/*`
- [ ] Admin layout with sidebar
- [ ] Admin dashboard (stats cards, recent bookings table)
- [ ] Bookings management (list, filter, detail view, status update)
- [ ] Services CRUD (add/edit/delete/reorder)
- [ ] Pricing management
- [ ] Gallery management (upload to Supabase Storage)
- [ ] Blog CMS (Tiptap rich text editor)
- [ ] Reviews moderation (publish/unpublish)
- [ ] Availability management (block dates)

---

### PHASE 6: Booking System (Day 16-18)

- [ ] Booking wizard component (5 steps)
- [ ] Calendar with available slots (fetch from API)
- [ ] Address form with Google Places autocomplete (optional) or manual entry
- [ ] Booking session stored in sessionStorage (survives refresh)
- [ ] `POST /api/v1/bookings` creates booking in DB
- [ ] Booking confirmation page

---

### PHASE 7: Payments (Day 19-21)

- [ ] Stripe account created, products/prices configured
- [ ] Stripe Payment Elements embedded in booking step 4
- [ ] SEPA Direct Debit option enabled
- [ ] Apple Pay / Google Pay (requires HTTPS — only works in production or ngrok)
- [ ] Webhook handler at `/api/webhooks/stripe`
- [ ] FastAPI webhook processor updates booking/payment status
- [ ] Booking confirmation email via Resend
- [ ] Admin email notification on new booking
- [ ] Subscription management: customer portal link

---

### PHASE 8: SEO & Performance (Day 22-23)

- [ ] All pages have correct `generateMetadata()`
- [ ] JSON-LD on every page
- [ ] `next-sitemap` generates sitemap.xml + robots.txt on build
- [ ] `hreflang` tags in `<head>` for all locales
- [ ] All images using `next/image` with proper dimensions
- [ ] No render-blocking resources
- [ ] Lighthouse scores: Performance ≥ 90, SEO = 100, Accessibility ≥ 90
- [ ] Google Search Console: submit sitemap

---

### PHASE 9: Deployment (Day 24-25)

- [ ] OVH: purchase domain
- [ ] Cloudflare: configure DNS, enable proxy, SSL/TLS: Full Strict
- [ ] Supabase: set `site_url` to production domain
- [ ] Vercel: connect GitHub repo, configure environment variables, add custom domain
- [ ] Render: create web service, set environment variables, enable auto-deploy
- [ ] GitHub Actions: set all secrets (RENDER_DEPLOY_HOOK, etc.)
- [ ] Test full booking + payment flow in production with Stripe test mode
- [ ] Switch Stripe to live mode
- [ ] Full smoke test: booking, payment, email, admin dashboard
- [ ] Google Business Profile: update with website URL
- [ ] Google Search Console: verify domain, submit sitemap

---

## 17. WHAT NEVER TO DO

- Never use `<img>` for content images — always `next/image`
- Never put secrets in `NEXT_PUBLIC_*` variables (they're exposed to browser)
- Never use `localStorage` for auth tokens — Supabase uses httpOnly cookies via `@supabase/ssr`
- Never render user-facing content purely client-side if it should be SEO-indexed
- Never use `router.push` after payment success — use the `return_url` parameter in Stripe Elements to prevent double-charge UX issues
- Never skip the `suppressHydrationWarning` on `<html>` — dark mode will throw console errors
- Never store Stripe raw card data — use Stripe Elements (PCI compliant)
- Never skip locale prefix on internal links — always use `useRouter()` from `next-intl/navigation`
- Never hard-code copy — every string must be in `messages/*.json`
- Never use Google Fonts CDN — self-host fonts for GDPR compliance and performance

---

## 18. COMMON BUGS AND FIXES

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| White flash before dark mode | `useTheme()` read before mount | Add `mounted` guard, return placeholder |
| Page shows English on refresh despite FR selected | Locale stored in URL only, not cookie | `next-intl` reads cookie via middleware |
| Stripe payment works but booking not confirmed | Webhook not received (dev) | Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| "Hydration mismatch" on date/time display | Server renders UTC, client renders local time | Wrap time display in `useEffect` or use `suppressHydrationWarning` on that element |
| Arabic layout breaks on mobile | Margin/padding not using RTL variants | Replace `ml-` with `ms-` (margin-inline-start) |
| Admin routes accessible without login | Middleware not matching admin path | Check `matcher` in middleware config |
| Render backend returns 502 on first request | Free tier spin-down | GitHub Actions cron ping every 14 min |
| Images not loading in production | Supabase Storage bucket is private | Set bucket to public or use signed URLs |

---

## 19. QUICK REFERENCE

### Useful commands
```bash
# Frontend dev
cd frontend && npm run dev          # http://localhost:3000

# Backend dev
cd backend && uvicorn app.main:app --reload --port 8000

# Local DB
docker-compose up -d db             # PostgreSQL on :5432

# Run Alembic migration
cd backend && alembic upgrade head

# Generate sitemap (after build)
cd frontend && npx next-sitemap

# Stripe webhook listener (dev)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Build check
cd frontend && npm run build        # must pass with 0 errors before deploy
```

### Key URLs (production)
```
Site:        https://clarte.fr
API:         https://api.clarte.fr/api/v1
API docs:    https://api.clarte.fr/api/docs (disabled in production)
Admin:       https://clarte.fr/fr/admin
Supabase:    https://supabase.com/dashboard
Stripe:      https://dashboard.stripe.com
Vercel:      https://vercel.com/dashboard
Render:      https://dashboard.render.com
Cloudflare:  https://dash.cloudflare.com
OVH:         https://www.ovhcloud.com
```

---

*End of PROJECT-PLAN.md*
*Version: 1.0 — Created: 2026-06-09*
*Stack: Next.js 14 (JS) + Tailwind + FastAPI + Supabase + Stripe + Vercel + Render*
