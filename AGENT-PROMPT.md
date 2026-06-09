# CLARTÉ WEBSITE — AGENT EXECUTION PROMPT
# Paste everything below this line into your AI coding agent (Claude Code, Cursor, etc.)
# ─────────────────────────────────────────────────────────────────────────────────────

---

You are building a production-ready professional website for **Clarté**, a French cleaning services company. Your mission is to execute the build plan located at `PROJECT-PLAN.md` in this directory **exactly and completely**, one phase at a time, without skipping steps or improvising decisions that are already locked.

## YOUR FIRST ACTION — READ THE SPEC

Before writing a single file, read `PROJECT-PLAN.md` completely. It is the authoritative spec. Every decision in it — stack, structure, naming, logic — is final. Do not override it with your defaults.

---

## YOUR OPERATING RULES (follow these always)

### Execution discipline
- Complete **one phase fully** before starting the next. Mark each phase done by confirming every checkbox in that section is satisfied.
- After each file you write, verify it runs (no syntax error, no import error). If it fails, fix it before moving on.
- When you finish a phase, say explicitly: "Phase N complete. All checklist items verified." Then list what you built.
- Never scaffold empty files as placeholders. If you create a file, it must contain real, working code.

### Code quality
- **Zero TypeScript.** This is a plain JavaScript project. No `.ts`, no `.tsx`, no type annotations anywhere.
- **Tailwind CSS only** for all styling. No CSS Modules, no styled-components, no inline style objects (except where absolutely required for dynamic values like Stripe Elements).
- Every component that uses `useTheme()`, `useTranslations()`, or any hook that depends on browser state must guard with a `mounted` state pattern to prevent hydration mismatches.
- Use `clsx` + `tailwind-merge` (via a `cn()` utility) for all conditional class names. Never build class strings with string concatenation.
- All components are functional. No class components.
- `'use client'` only on components that actually need browser APIs or event handlers. Default is Server Component.

### i18n discipline
- **Every user-visible string** goes in `messages/fr.json`, `messages/ar.json`, `messages/en.json`. Nothing hardcoded in JSX.
- For all internal navigation links, use `useRouter` and `Link` from `next-intl/navigation`, never from `next/navigation`. This ensures locale prefix is automatically included.
- Arabic is RTL. Use `ms-` (margin-inline-start) and `me-` (margin-inline-end) instead of `ml-`/`mr-` wherever the direction must flip. Use `rtl:` variant for anything that can't use logical properties.

### Dark mode discipline
- `suppressHydrationWarning` on the root `<html>` element. This is non-negotiable.
- Every component that renders theme-dependent content (icon, label) must only render after mount. Return a same-size placeholder before mount.
- Use CSS variables (defined in `globals.css`) for all colors that change between themes, not hardcoded Tailwind color classes like `bg-white dark:bg-gray-900`.

### Security
- Never put `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_KEY`, or `RESEND_API_KEY` in any `NEXT_PUBLIC_*` variable.
- Stripe webhook handler must verify the Stripe signature before processing any event. Reject without processing if signature is invalid.
- All FastAPI routes that mutate data require a valid Supabase JWT. Use the `get_current_user` dependency.
- All FastAPI input goes through a Pydantic v2 schema with `model_config = ConfigDict(strict=True)`.
- Never return `str(exception)` in an HTTP response body. Always return hardcoded user-friendly messages.

### File and import conventions
- `lib/utils.js` exports `cn()` (clsx + twMerge), `formatCurrency(amount, locale)`, `formatDate(date, locale)`.
- `lib/api.js` exports an `apiFetch(path, options)` wrapper that prepends `NEXT_PUBLIC_API_URL` and handles 401/403 automatically.
- `lib/supabase/client.js` exports a browser Supabase client (call once via singleton pattern).
- `lib/supabase/server.js` exports a function that creates a server-side Supabase client using `@supabase/ssr` cookies.

---

## PHASE EXECUTION ORDER

Execute these phases in strict order. Do not start Phase N+1 until Phase N is verified working.

### PHASE 0 — Foundation
1. Initialize the project structure exactly as specified in Section 3 of PROJECT-PLAN.md.
2. Create `frontend/` with Next.js 14 App Router, plain JavaScript, Tailwind.
3. Create `backend/` with FastAPI, the directory structure from Section 3.
4. Create `docker-compose.yml` for local PostgreSQL.
5. Install all dependencies from the package.json and requirements.txt in Section 16.
6. Create `.github/workflows/ci.yml` (lint only — must pass before any other phase).
7. Create `.env.example` files for both frontend and backend.
8. Verify: `npm run dev` in frontend starts with no errors. `uvicorn app.main:app --reload` in backend starts with no errors. `GET /api/v1/health` returns 200.

### PHASE 1 — Design System
1. Write `tailwind.config.js` with the full config from Section 5 (colors, fonts, radius, shadows, dark mode class strategy).
2. Write `styles/globals.css` with CSS variables for light and dark themes, font-face declarations, RTL font rules, and smooth theme transitions.
3. Download and place self-hosted fonts in `public/fonts/`: Inter Variable (woff2) and Cairo Variable (woff2).
4. Build all components in `components/ui/`: Button (with all variants/sizes), Card, Input, Select, Badge, Modal, Spinner, Toast wrapper (react-hot-toast), Stepper, StarRating, DatePicker.
5. Build layout components: Header, MobileNav (slide-in drawer), Footer, LanguageSwitcher, ThemeToggle.
6. Implement dark/light mode exactly per Section 6. Test: refresh page in dark mode — no flash.
7. Implement RTL: set `dir="rtl"` and `font-arabic` class when locale is `ar`.
8. Verify visually: open each UI component in both light and dark, in both LTR and RTL. Fix any visual issue before proceeding.

### PHASE 2 — Translation System (AUTO — do NOT write ar.json or en.json manually)

**The rule:** Only `messages/fr.json` is written by hand. `messages/ar.json` and `messages/en.json` are generated automatically by `scripts/translate.js`. Never edit ar.json or en.json directly.

1. Write complete `messages/fr.json` with every string needed across all pages (French only).
2. Add `"type": "module"` to `package.json` and add this script entry: `"translate": "node scripts/translate.js"`.
3. The translation script is already written at `scripts/translate.js`. It uses OpenAI `gpt-4o-mini` to translate changed strings only (diff-based cache in `.translation-cache.json`).
4. Run `OPENAI_API_KEY=your-key npm run translate` — this generates `ar.json` and `en.json` automatically.
5. Commit all three files. From now on: edit `fr.json` → run `npm run translate` → commit all three.
6. The GitHub Actions workflow `.github/workflows/auto-translate.yml` runs this script automatically on every push that changes `fr.json`. Add `OPENAI_API_KEY` to GitHub repository secrets.
7. Add `messages/.translation-cache.json` to git (it tracks which strings need re-translation).
8. Add this to `.gitignore`: nothing — ar.json and en.json ARE committed (needed for build).
9. Write `middleware.js` exactly per Section 7.2. Locale from cookie or Accept-Language header, always prefixed routes.
10. Write `app/[locale]/layout.js` with `dir`, `lang`, font class, `NextIntlClientProvider`.
11. Verify: visit `/` → redirects to `/fr`. Visit `/ar/` → `<html dir="rtl" lang="ar">`. Visit `/en/` → English text. Refresh on any locale → locale preserved.
12. Verify translation quality: open `/ar` and check that Arabic strings render correctly (right-to-left, no garbled text).

### PHASE 3 — Public Pages
Build in this exact order. Each page must have working `generateMetadata()`, JSON-LD, correct responsive layout, dark mode, and RTL before moving to the next.

1. **Home page** (`app/[locale]/page.js`): Hero, ServicesGrid (placeholder data), HowItWorks, PricingCards (placeholder), TestimonialsCarousel (placeholder), GalleryGrid (placeholder), FAQAccordion, CTABanner, TrustBar.
2. **Services page**: grid of service cards with placeholder data, filter tabs.
3. **Pricing page**: 3 plan cards with toggle, feature comparison table, FAQ.
4. **About page**: company story, values grid, stats counter.
5. **Contact page**: contact form (no backend yet — just UI), map embed placeholder, contact details.
6. **FAQ page**: accordion with translated questions.
7. **Gallery page**: masonry image grid.

Mobile-first breakpoint rules:
- All layouts start at `min-w-0` (mobile default).
- Breakpoints used: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px).
- Test every page at 375px, 768px, 1280px widths.

### PHASE 4 — Database + Backend API
1. Create Supabase project (region: eu-west-1). Run all SQL from Section 4 to create tables and indexes.
2. Enable Row Level Security on all tables.
3. Write all SQLAlchemy models in `backend/app/db/models/`.
4. Write Alembic migrations.
5. Write all Pydantic v2 schemas in `backend/app/schemas/`.
6. Implement all FastAPI routes in `backend/app/api/v1/`. Every route must validate input via schema, call service layer (no DB queries in route handlers), return schema-validated output.
7. Seed the database with: 6 cleaning services (with FR/AR/EN translations), 3 pricing plans.
8. Verify: `GET /api/v1/services` returns seeded services. `GET /api/v1/pricing` returns plans. Frontend services page loads real data from API.

### PHASE 5 — Auth + Admin Panel
1. Configure Supabase Auth (email/password + magic link).
2. Build login page at `app/[locale]/auth/login/page.js` and auth callback handler.
3. Update `middleware.js` to guard `/[locale]/admin/*` — redirect to login if no session.
4. Build admin layout with collapsible sidebar.
5. Build all admin pages per Section 9.5 of PROJECT-PLAN.md.
6. Wire admin CRUD operations to FastAPI endpoints.
7. Verify: unauthenticated visit to `/fr/admin` redirects to `/fr/auth/login`. After login, admin dashboard loads. Service CRUD works end-to-end.

### PHASE 6 — Booking System
1. Build the 5-step booking wizard per Section 9.3.
2. Booking state in React Context, persisted to `sessionStorage`.
3. Calendar with available time slots (fetch from `GET /api/v1/availability?date=YYYY-MM-DD`).
4. `POST /api/v1/bookings` creates booking record with status `pending`.
5. Booking confirmation page with reference number.
6. Verify: complete a booking end-to-end. Refresh mid-wizard — form state preserved. Completed booking appears in admin panel.

### PHASE 7 — Payments
1. Configure Stripe: create Products and Prices for all 3 plans. Save Price IDs to `.env`.
2. Implement one-time payment flow: Stripe Payment Elements embedded in booking step 4.
3. Implement subscription flow: Stripe Checkout Session (hosted) for weekly/monthly plans.
4. Enable payment methods: Card + SEPA Direct Debit. Apple/Google Pay enabled (will only work on HTTPS).
5. Build `/api/webhooks/stripe/route.js` — verify signature, forward to FastAPI.
6. FastAPI webhook handler: `payment_intent.succeeded` → update booking to `confirmed` + send email.
7. Implement Resend email: booking confirmation to customer + notification to admin.
8. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
9. Verify full flow: book service → pay with test card `4242 4242 4242 4242` → booking confirmed → email received → admin dashboard shows confirmed booking.

### PHASE 8 — SEO + Performance
1. Verify all pages have correct `generateMetadata()` with locale-aware meta, Open Graph, Twitter Cards.
2. Add JSON-LD to every page per Section 8.2.
3. Run `npx next-sitemap` — verify `sitemap.xml` and `robots.txt` generated correctly.
4. Verify `hreflang` tags in `<head>` for all locales.
5. Audit all images: every `<img>` must be replaced with `<Image>` from `next/image` with explicit dimensions.
6. Run Lighthouse on Home, Services, and Pricing pages. Fix anything below: Performance 90, SEO 100, Accessibility 90.
7. Run `npm run build` — zero errors, zero warnings about missing metadata.

### PHASE 9 — Deployment
Follow Section 13 of PROJECT-PLAN.md exactly:
1. Purchase domain on OVH. Set nameservers to Cloudflare.
2. Configure Cloudflare DNS records.
3. Connect GitHub repo to Vercel. Set all environment variables. Add custom domain.
4. Create Render web service. Set environment variables. Enable auto-deploy from main branch.
5. Configure GitHub Actions secrets: `RENDER_DEPLOY_HOOK`, `STRIPE_WEBHOOK_SECRET`, etc.
6. Push to `main`. Verify CI passes. Verify Vercel deploys. Verify Render deploys.
7. Test full booking + payment flow on production with Stripe test mode.
8. Switch Stripe to live mode. Do one real test booking.
9. Submit sitemap to Google Search Console.

---

## WHEN YOU ARE UNSURE

If you hit a decision point not covered in PROJECT-PLAN.md:
- **Lean toward simplicity.** The simplest working implementation that matches the spec is always correct.
- **Never add libraries** not in the locked package list without flagging it first.
- **Never change the stack.** If FastAPI is specified, do not suggest switching to Express.
- **For UI decisions** not specified: use the brand colors from Section 5, maintain the mobile-first approach, and match the premium-but-friendly aesthetic of a professional cleaning service (clean whites/blues, generous whitespace, rounded cards).

If you encounter a genuine blocker (missing credential, API limit, etc.), stop, describe the blocker precisely, and wait for input. Do not work around blockers by skipping features.

---

## DEFINITION OF DONE

The project is complete when:
- [ ] All 9 phases are done and verified
- [ ] `npm run build` passes with zero errors
- [ ] Lighthouse scores: Performance ≥ 90, SEO = 100, Accessibility ≥ 90 on all public pages
- [ ] Full booking + payment + email flow works end-to-end in production
- [ ] Site renders correctly in: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- [ ] All 3 locales (FR, AR, EN) render correctly including RTL for Arabic
- [ ] Dark and light mode switch with zero flash on refresh
- [ ] Admin can log in, manage bookings, update services, publish blog posts
- [ ] Sitemap submitted to Google Search Console
- [ ] No secrets committed to git (`.env` files are in `.gitignore`)

---

## START COMMAND

Begin now with Phase 0. Read `PROJECT-PLAN.md` first, then scaffold the project structure. Report back when Phase 0 is complete with a list of every file created.
