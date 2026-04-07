import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const ALLOWED_PATH_RE = /^\/(?!\/)[\w\-\/\.\?\&\=\%\#]*$/
  const next = ALLOWED_PATH_RE.test(rawNext) ? rawNext : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Para usuários OAuth (Google), garantir que org/user existam
      const isNewUser = await ensureUserRecords(supabase)

      // Novos usuários Google precisam completar o cadastro
      if (isNewUser) {
        return NextResponse.redirect(`${origin}/setup`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to login with error if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=recovery`)
}

/**
 * Garante que usuários OAuth tenham registros na tabela users e organizations.
 * Chamado após exchangeCodeForSession para novos usuários Google.
 * Retorna true se é um novo usuário (precisa completar setup).
 */
async function ensureUserRecords(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const serviceClient = await createServiceClient()

  // Verificar se usuário já existe na tabela users
  const { data: existingUser } = await serviceClient
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingUser) return false // Já existe, nada a fazer

  // Verificar se existe por email (conta anterior)
  const { data: existingByEmail } = await serviceClient
    .from('users')
    .select('id, organization_id')
    .eq('email', user.email)
    .single()

  if (existingByEmail) {
    // Vincular auth ID ao usuário existente
    await serviceClient
      .from('users')
      .update({ id: user.id })
      .eq('email', user.email)
    return false
  }

  // Novo usuário OAuth - criar organização e registro
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  const orgSlug = `org_${user.id.slice(0, 12)}`
  const companyName = `Produtora de ${userName}`

  // Calcular trial de 7 dias
  const now = new Date()
  const trialEndsAt = new Date(now)
  trialEndsAt.setDate(trialEndsAt.getDate() + 7)

  const { error: orgError } = await serviceClient
    .from('organizations')
    .insert([{
      id: orgSlug,
      slug: orgSlug,
      name: companyName,
      email: user.email,
      initial_capital: 0,
      subscription_plan: 'TRIAL',
      subscription_status: 'TRIALING',
      trial_started_at: now.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
    }])

  if (orgError) {
    console.error('[oauth] Erro ao criar organização:', orgError)
    return false
  }

  const { error: userError } = await serviceClient
    .from('users')
    .insert([{
      id: user.id,
      email: user.email,
      name: userName,
      organization_id: orgSlug,
      role: 'ADMIN',
      avatar: user.user_metadata?.avatar_url || null,
    }])

  if (userError) {
    console.error('[oauth] Erro ao criar usuário:', userError)
    // Limpar organização criada
    await serviceClient.from('organizations').delete().eq('id', orgSlug)
    return false
  }

  // Marcar como novo usuário que precisa completar setup
  await serviceClient.auth.admin.updateUserById(user.id, {
    app_metadata: { needs_setup: true },
  })

  return true
}
