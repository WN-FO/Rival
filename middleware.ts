import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()
  
  // Optional: Check if user is authenticated for protected routes
  const { pathname } = request.nextUrl
  const protectedRoutes = ['/admin', '/picks', '/settings', '/profile']
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    // If no session and on a protected route, redirect to login
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return response
}

// Only run middleware on these paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 