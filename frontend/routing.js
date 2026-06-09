// Shared routing config — imported by both navigation.js and middleware.js
// Keep this file free of React imports so it's safe to use in Edge Runtime
export const routing = {
  locales: ['fr', 'ar', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
}
