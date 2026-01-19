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

  if (error || !userData) {
    console.error('Erro ao buscar organização do usuário:', error)
    throw new Error('Organização não encontrada')
  }

  return userData.organization_id
})
