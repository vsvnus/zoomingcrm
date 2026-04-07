import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  getEffectivePlan,
  canAccessFeature,
  getFeatureForRoute,
  isSubscriptionExemptRoute,
} from '@/lib/subscription/access'

/**
 * Public routes that do NOT require authentication.
 * - /login       -> login page
 * - /p/          -> public proposals shared with clients
 * - static assets are already excluded by the matcher in middleware.ts
 */
const PUBLIC_PREFIXES = ['/login', '/p/', '/auth/callback', '/reset-password', '/privacy', '/terms', '/api/webhooks/', '/api/cron/']

/** Rotas que requerem auth mas não são dashboard (não fazem subscription gating nem redirect de setup) */
const SETUP_ROUTES = ['/setup']

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true
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

  // --- Setup flow: usuários Google que precisam completar cadastro ---
  const isSetupRoute = SETUP_ROUTES.some((prefix) => pathname.startsWith(prefix))

  if (user) {
    const needsSetup = user.app_metadata?.needs_setup === true

    // Usuário precisa completar setup mas está tentando acessar outra rota protegida
    if (needsSetup && !isSetupRoute && !isPublicRoute(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/setup'
      return NextResponse.redirect(url)
    }

    // Usuário já completou setup mas está acessando /setup → redirecionar para dashboard
    if (!needsSetup && isSetupRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Setup routes não passam por subscription gating
  if (isSetupRoute) {
    return supabaseResponse
  }

  // --- Subscription gating: verificar acesso por plano ---
  if (user && !isPublicRoute(pathname) && !isSubscriptionExemptRoute(pathname)) {
    const feature = getFeatureForRoute(pathname)

    if (feature) {
      // Buscar dados de subscription da organização do usuário
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (userData?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('subscription_plan, subscription_status, trial_ends_at, subscription_ends_at, canceled_at')
          .eq('id', userData.organization_id)
          .single()

        if (org) {
          const effectivePlan = getEffectivePlan({
            subscriptionPlan: org.subscription_plan,
            subscriptionStatus: org.subscription_status,
            trialEndsAt: org.trial_ends_at,
            subscriptionEndsAt: org.subscription_ends_at,
            canceledAt: org.canceled_at,
          })

          if (!canAccessFeature(effectivePlan, feature)) {
            const url = request.nextUrl.clone()
            url.pathname = '/settings/billing'
            url.searchParams.set('blocked', feature)
            url.searchParams.set('from', pathname)
            return NextResponse.redirect(url)
          }
        }
      }
    }
  }

  return supabaseResponse
}
