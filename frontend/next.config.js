const createNextIntlPlugin = require('next-intl/plugin')
const path = require('path')

const withNextIntl = createNextIntlPlugin('./i18n.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],   // modern formats → faster LCP
  },

  // ── Security + SEO headers ─────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          // Deny framing (clickjacking) — improves trust signals
          { key: 'X-Frame-Options',             value: 'DENY' },
          // Referrer: send origin only to cross-origin
          { key: 'Referrer-Policy',             value: 'strict-origin-when-cross-origin' },
          // Disable unnecessary browser features
          { key: 'Permissions-Policy',          value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'X-DNS-Prefetch-Control',      value: 'on' },
          // Prevent cross-origin leaks
          { key: 'Cross-Origin-Opener-Policy',  value: 'same-origin' },
          // CSP — blocks XSS; adjust when adding third-party scripts
          {
            key:   'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",   // 'unsafe-inline' needed for JSON-LD
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com",
            ].join('; '),
          },
        ],
      },
      // Aggressive cache for static assets → better Core Web Vitals
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
    ]
  },

  // ── Webpack ────────────────────────────────────────────────────────────────
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname)
    return config
  },
}

module.exports = withNextIntl(nextConfig)
