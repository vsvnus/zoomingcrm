import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { getTokensFromCode, saveConnection } from '@/lib/google-calendar/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // User denied access
  if (error) {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=access_denied', baseUrl)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=no_code', baseUrl)
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    // Verify state matches user ID (CSRF protection)
    if (state !== user.id) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_state', baseUrl)
      )
    }

    const organizationId = await getUserOrganization()

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    // Save encrypted tokens to database
    await saveConnection(user.id, organizationId, tokens)

    return NextResponse.redirect(
      new URL('/settings/integrations?success=google_calendar_connected', baseUrl)
    )
  } catch (err) {
    console.error('Erro no callback do Google Calendar:', err)
    return NextResponse.redirect(
      new URL('/settings/integrations?error=token_exchange_failed', baseUrl)
    )
  }
}
