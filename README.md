# Clarté — Services de Nettoyage Professionnels

<p align="center">
  <img src="frontend/public/images/og-image.jpg" alt="Clarté" width="800" />
</p>

<p align="center">
  <strong>A full-stack, multilingual cleaning services website built with Next.js 14 and FastAPI.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#project-structure">Structure</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#environment-variables">Environment Variables</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#seo">SEO</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

**Clarté** is a professional cleaning services platform targeting the French market. It supports three languages (French, Arabic, English) with full RTL layout for Arabic, dark/light mode, a 4-step booking wizard, and a complete SEO setup including structured data (JSON-LD), sitemap, robots.txt, Open Graph, and Twitter Cards.

---

## Features

### Public Website
- **Home** — Hero, trust bar, services grid, how-it-works, why us, pricing, testimonials, gallery, FAQ, CTA
- **Services** — Full service catalogue with pricing and booking CTAs
- **Pricing** — 3 plans (one-time, weekly, monthly) + comparison table
- **About** — Company story, stats, values
- **Contact** — Contact form + business info sidebar
- **FAQ** — Accordion FAQ with rich results schema
- **Gallery** — Before/after photo grid
- **Booking** — 4-step wizard: Service → Date & Time → Address → Summary

### Internationalisation
- **3 languages**: French (default), Arabic, English
- **RTL layout** automatically applied for Arabic
- **Locale-prefixed routing**: `/fr`, `/ar`, `/en`
- Language switcher in header and mobile nav
- All strings in `messages/*.json` — never hardcoded

### SEO (Full Suite)
- `sitemap.xml` — all pages × all locales (24 URLs)
- `robots.txt` — crawler rules + sitemap pointer
- **JSON-LD structured data** per page:
  - `LocalBusiness` + `WebSite` + `Organization` (home)
  - `ItemList` + `Service` + `Offer` (services)
  - `FAQPage` — expands directly in Google search results
  - `Product` + `Offer` with prices (pricing)
  - `Organization` + `AboutPage` (about)
  - `ContactPage` (contact)
  - `BreadcrumbList` (all inner pages)
- **Open Graph** + **Twitter Cards** on every page
- `hreflang` alternates for all locale variants
- Canonical URLs per page
- Per-page metadata (title, description, OG, Twitter)

### Performance & Security
- `image/avif` + `image/webp` formats via `next/image`
- Immutable cache headers on static assets
- Security headers: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`
- PWA manifest (`/manifest.json`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 14 (App Router) |
| Language | JavaScript (zero TypeScript) |
| Styling | Tailwind CSS |
| i18n | next-intl v3 |
| Dark mode | next-themes |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 (via Supabase) |
| Auth | Supabase Auth + `@supabase/ssr` |
| Payments | Stripe (SEPA, card, Apple/Google Pay) |
| Cache | Redis (Upstash) |
| Container | Docker Compose |
| Reverse proxy | Nginx |
| Deployment | Vercel (frontend) · Railway (backend) |

---

## Project Structure

```
clarte/
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── [locale]/                # Locale-prefixed routes
│   │   │   ├── page.js              # Home
│   │   │   ├── services/page.js
│   │   │   ├── pricing/page.js
│   │   │   ├── about/page.js
│   │   │   ├── contact/page.js
│   │   │   ├── faq/page.js
│   │   │   ├── gallery/page.js
│   │   │   ├── booking/page.js      # 4-step booking wizard
│   │   │   └── layout.js            # Root locale layout
│   │   ├── robots.js                # robots.txt
│   │   └── sitemap.js               # sitemap.xml (24 URLs)
│   ├── components/
│   │   ├── layout/                  # Header, Footer, Nav, ThemeToggle, LanguageSwitcher
│   │   ├── sections/                # Hero, ServicesGrid, PricingCards, Testimonials, FAQ…
│   │   └── seo/                     # JsonLd — structured data injector
│   ├── messages/
│   │   ├── fr.json                  # French (source)
│   │   ├── ar.json                  # Arabic
│   │   └── en.json                  # English
│   ├── lib/
│   │   ├── utils.js                 # cn() helper
│   │   ├── api.js                   # Typed fetch wrapper
│   │   ├── supabase/                # Supabase client + server
│   │   └── stripe.js                # Stripe client
│   ├── navigation.js                # next-intl createNavigation (locale-aware routing)
│   ├── routing.js                   # Shared locale config (middleware + navigation)
│   ├── middleware.js                # next-intl middleware + admin route guard
│   ├── i18n.js                      # next-intl request config
│   ├── next.config.js               # Next.js config + security headers
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                         # FastAPI
│   ├── app/
│   │   ├── main.py                  # App factory, CORS, health check
│   │   ├── core/
│   │   │   ├── config.py            # pydantic-settings env vars
│   │   │   ├── security.py          # Auth helpers
│   │   │   └── deps.py              # FastAPI dependencies
│   │   ├── api/v1/                  # Route handlers
│   │   ├── db/                      # SQLAlchemy async engine + models
│   │   ├── schemas/                 # Pydantic v2 schemas
│   │   └── services/                # Business logic
│   ├── alembic/                     # Database migrations
│   └── requirements.txt
│
├── docker-compose.yml               # Local dev stack
├── .github/workflows/               # CI/CD pipelines
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 22+
- Python 3.12+
- Git

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Frontend setup

```bash
cd frontend
npm install --ignore-scripts
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/fr` automatically.

### 3. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 4. Full stack with Docker

```bash
docker compose up --build
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` and fill in your values:

```env
NEXT_PUBLIC_SITE_URL=<your-production-url>
NEXT_PUBLIC_API_URL=<your-backend-url>/api/v1
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<your-google-search-console-code>
```

### Backend (`backend/.env`)

Copy `backend/.env.example` and fill in your values:

```env
DATABASE_URL=<your-supabase-postgres-connection-string>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
INTERNAL_API_KEY=<generate-a-random-secret>
REDIS_URL=<your-upstash-redis-url>
ENVIRONMENT=development
DEBUG=true
```

---

## Deployment

### Frontend → Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repo from GitHub
3. Set **Root Directory** to `frontend`
4. Add all `NEXT_PUBLIC_*` environment variables
5. Deploy

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the repo → set **Root Directory** to `backend`
3. Add all backend environment variables
4. Railway auto-detects Python and uses `requirements.txt`

### Database → Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the project URL and keys into your env vars
3. Run migrations: `alembic upgrade head`

---

## SEO

| URL | What it serves |
|-----|---------------|
| `/sitemap.xml` | 24 URLs (8 pages × 3 locales) with priority + changeFrequency |
| `/robots.txt` | Crawler rules, blocks `/admin` and `/api/` |
| `/manifest.json` | PWA manifest for "Add to Home Screen" |

**Structured data (JSON-LD) unlocks Google rich results:**

| Page | Schema | Rich result |
|------|--------|------------|
| Home | `LocalBusiness` + `WebSite` | Business panel + sitelinks |
| Services | `ItemList` + `Service` + `Offer` | Service cards with prices |
| FAQ | `FAQPage` | Expandable FAQ in search |
| Pricing | `Product` + `Offer` | Price snippets |
| About | `Organization` | Knowledge panel |
| Contact | `ContactPage` | Contact info |
| All pages | `BreadcrumbList` | Breadcrumbs in URLs |

---

## Roadmap

- [x] Public website (all pages)
- [x] Multilingual FR / AR / EN
- [x] Dark / light mode
- [x] 4-step booking wizard (UI)
- [x] Full SEO suite
- [x] Security headers
- [ ] Supabase auth (login / signup)
- [ ] Backend API — bookings saved to database
- [ ] Admin panel — manage bookings, services, availability
- [ ] Stripe payments at checkout
- [ ] Email notifications (booking confirmation)
- [ ] Real-time availability calendar

---

## License

Private — all rights reserved © Clarté.


