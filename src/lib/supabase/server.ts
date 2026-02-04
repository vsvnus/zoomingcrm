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
 * Create a Supabase client with service role (bypasses RLS)
 * Only use for admin operations like creating users/organizations
 */
export async function createServiceClient() {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
  // Usar service role para bypass de RLS
  console.log('Usuário legado detectado, criando organização e registro...')

  const serviceClient = await createServiceClient()

  const orgSlug = `org_${user.id.slice(0, 12)}`
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  const companyName = user.user_metadata?.company || `Produtora de ${userName}`

  // Primeiro, verificar se a organização já existe
  const { data: existingOrg } = await serviceClient
    .from('organizations')
    .select('id')
    .eq('id', orgSlug)
    .single()

  let organizationId = orgSlug

  if (!existingOrg) {
    // Criar organização usando service role (bypass RLS)
    const { data: org, error: orgError } = await serviceClient
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
      console.error('Erro ao criar organização para usuário legado:', JSON.stringify(orgError, null, 2))
      throw new Error('Erro ao criar organização')
    }

    organizationId = org.id
    console.log('Organização criada:', organizationId)
  } else {
    console.log('Organização já existe:', existingOrg.id)
    organizationId = existingOrg.id
  }

  // Verificar se o usuário já existe (por ID ou email)
  const { data: existingUserById } = await serviceClient
    .from('users')
    .select('id, organization_id')
    .eq('id', user.id)
    .single()

  if (existingUserById) {
    console.log('Usuário já existe no banco (por ID)')
    return existingUserById.organization_id
  }

  // Verificar se existe um usuário com o mesmo email (conta anterior)
  const { data: existingUserByEmail } = await serviceClient
    .from('users')
    .select('id, organization_id')
    .eq('email', user.email)
    .single()

  if (existingUserByEmail) {
    // Migrar: atualizar ID do usuário para o novo auth ID
    console.log('Migrando usuário legado para novo auth ID:', user.id)
    const { error: updateError } = await serviceClient
      .from('users')
      .update({ id: user.id })
      .eq('email', user.email)

    if (updateError) {
      console.error('Erro ao migrar usuário legado:', updateError)
      // Mesmo com erro, retornar a organização existente
    }

    return existingUserByEmail.organization_id
  }

  // Criar usuário na tabela users usando service role
  const { error: userError } = await serviceClient.from('users').insert([
    {
      id: user.id,
      email: user.email,
      name: userName,
      organization_id: organizationId,
      role: 'ADMIN',
    },
  ])

  if (userError) {
    console.error('Erro ao criar usuário legado:', JSON.stringify(userError, null, 2))
    throw new Error('Erro ao criar usuário')
  }
  console.log('Usuário criado com sucesso')

  console.log('Organização resolvida:', organizationId)
  return organizationId
})

