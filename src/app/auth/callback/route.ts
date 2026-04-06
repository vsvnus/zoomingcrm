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
      await ensureUserRecords(supabase)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to login with error if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=recovery`)
}

/**
 * Garante que usuários OAuth tenham registros na tabela users e organizations.
 * Chamado após exchangeCodeForSession para novos usuários Google.
 */
async function ensureUserRecords(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const serviceClient = await createServiceClient()

  // Verificar se usuário já existe na tabela users
  const { data: existingUser } = await serviceClient
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingUser) return // Já existe, nada a fazer

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
    return
  }

  // Novo usuário OAuth - criar organização e registro
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  const orgSlug = `org_${user.id.slice(0, 12)}`
  const companyName = `Produtora de ${userName}`

  const { error: orgError } = await serviceClient
    .from('organizations')
    .insert([{
      id: orgSlug,
      slug: orgSlug,
      name: companyName,
      email: user.email,
      initial_capital: 0,
    }])

  if (orgError) {
    console.error('[oauth] Erro ao criar organização:', orgError)
    return
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
  }
}
