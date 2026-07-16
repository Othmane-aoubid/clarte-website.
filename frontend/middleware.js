import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { routing } from './routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request) {
  const { pathname } = request.nextUrl

  // Guard admin routes — check for Supabase session cookie
  if (pathname.match(/\/(fr|ar|en)\/admin/)) {
    try {
      const hasCookies = request.cookies.getAll()
      const hasSession = hasCookies.some(
        (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
      )
      
      if (!hasSession) {
        const locale = pathname.split('/')[1] || 'fr'
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
      }
    } catch (error) {
      // Catch any edge evaluation crashes silently to prevent 500 blocks
      console.error("Auth Guard Failure:", error)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  // Safe exclusion boundary targeting structural paths and static file definitions
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
