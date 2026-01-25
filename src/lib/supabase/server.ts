import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component
          }
        },
      },
    }
  )
}

/**
 * FASE 1: Helper para pegar a organização do usuário logado
 * Usa React.cache() para evitar múltiplas chamadas na mesma requisição
 *
 * Se o usuário não tiver organização (conta legada), cria automaticamente
 */
export const getUserOrganization = cache(async (): Promise<string> => {
  const supabase = await createClient()

  // Pegar usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Buscar organização do usuário
  const { data: userData, error } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Se usuário existe, retornar organização
  if (userData?.organization_id) {
    return userData.organization_id
  }

  // Usuário não existe na tabela users (conta legada) - criar automaticamente
  console.log('Usuário legado detectado, criando organização e registro...')

  const orgSlug = `org_${user.id.slice(0, 12)}`
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  const companyName = user.user_metadata?.company || `Produtora de ${userName}`

  // Criar organização
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert([
      {
        id: orgSlug,
        slug: orgSlug,
        name: companyName,
        email: user.email,
      },
    ])
    .select()
    .single()

  if (orgError) {
    console.error('Erro ao criar organização para usuário legado:', orgError)
    throw new Error('Erro ao criar organização')
  }

  // Criar usuário na tabela users
  const { error: userError } = await supabase.from('users').insert([
    {
      id: user.id,
      email: user.email,
      name: userName,
      organization_id: org.id,
      role: 'ADMIN',
    },
  ])

  if (userError) {
    console.error('Erro ao criar usuário legado:', userError)
    throw new Error('Erro ao criar usuário')
  }

  console.log('Organização e usuário criados com sucesso:', org.id)
  return org.id
})
