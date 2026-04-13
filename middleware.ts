import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // If we are already on the maintenance page, do nothing
  if (request.nextUrl.pathname === '/maintenance') {
    return NextResponse.next()
  }

  // Redirect all other non-static, non-API traffic to maintenance
  return NextResponse.redirect(new URL('/maintenance', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
