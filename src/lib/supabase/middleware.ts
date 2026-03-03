import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Public routes that do NOT require authentication.
 * - /login       -> login page
 * - /p/          -> public proposals shared with clients
 * - static assets are already excluded by the matcher in middleware.ts
 */
const PUBLIC_PREFIXES = ['/login', '/p/', '/auth/callback', '/reset-password']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function updateSession(request: NextRequest) {
  // Start with a mutable response so Supabase can set/refresh cookies
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Set on the request (so downstream handlers see them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // 2. Recreate the response so headers stay in sync
          supabaseResponse = NextResponse.next({
            request,
          })
          // 3. Set on the response (so the browser stores them)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Always call getUser() -- this refreshes the session token
  // and keeps the auth cookies up-to-date. Do NOT use getSession() here
  // because it reads from cookies without server-side validation.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // --- Authenticated user trying to access /login -> redirect to dashboard ---
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // --- Unauthenticated user on a protected route -> redirect to /login ---
  if (!user && !isPublicRoute(pathname)) {
    // Anti-loop: only redirect when destination differs from current path
    if (pathname !== '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
