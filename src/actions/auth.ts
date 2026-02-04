'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createInitialCapitalTransaction } from './financeiro'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  companyName: string,
  whatsapp?: string,
  capitalInicial?: number
) {
  const supabase = await createClient()
  const { createServiceClient } = await import('@/lib/supabase/server')
  const serviceClient = await createServiceClient()

  // 1. Verificar se email já existe na tabela users
  const { data: existingUsersByEmail } = await serviceClient
    .from('users')
    .select('id, organization_id')
    .eq('email', email)
    .single()

  if (existingUsersByEmail) {
    throw new Error('Este email já está cadastrado. Faça login.')
  }

  // 2. Tentar criar usuário no auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        whatsapp,
      },
    },
  })

  if (authError) {
    // Traduzir erros comuns do Supabase
    if (authError.message.includes('already registered')) {
      throw new Error('Este email já está cadastrado. Faça login.')
    }
    if (authError.message.includes('password')) {
      throw new Error('Senha muito fraca. Use no mínimo 6 caracteres.')
    }
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Erro ao criar conta. Tente novamente.')
  }

  // 3. Criar organização e usuário na tabela users
  const orgSlug = `org_${authData.user.id.slice(0, 12)}`

  try {
    // Criar organização usando service role
    const { error: orgError } = await serviceClient
      .from('organizations')
      .insert([
        {
          id: orgSlug,
          slug: orgSlug,
          name: companyName,
          email: email,
          initial_capital: capitalInicial || 0,
          initial_capital_set_at: capitalInicial ? new Date().toISOString() : null,
        },
      ])

    if (orgError) {
      console.error('Error creating organization:', orgError)
      // Deletar usuário do auth se falhar criar org
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      throw new Error('Erro ao criar organização. Tente novamente.')
    }

    const organizationId = orgSlug

    // Criar usuário vinculado à organização usando service role
    const { error: userError } = await serviceClient.from('users').insert([
      {
        id: authData.user.id,
        email: authData.user.email,
        name,
        organization_id: organizationId,
        role: 'ADMIN',
      },
    ])

    if (userError) {
      console.error('Error creating user:', userError)
      // Limpar tudo se falhar
      await serviceClient.from('organizations').delete().eq('id', orgSlug)
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      throw new Error('Erro ao criar usuário. Tente novamente.')
    }

    // SPRINT 0: Criar transação de capital inicial se informado
    if (capitalInicial && capitalInicial > 0) {
      try {
        const result = await createInitialCapitalTransaction(
          organizationId,
          capitalInicial,
          authData.user.id
        )

        if (!result.success) {
          console.error('Erro ao criar capital inicial:', result.message)
        }
      } catch (error) {
        console.error('Erro inesperado ao criar capital inicial:', error)
      }
    }
  } catch (error: any) {
    // Se for um erro nosso (já traduzido), repassar
    if (error.message && !error.message.includes('Error')) {
      throw error
    }
    throw new Error('Erro ao criar conta. Tente novamente.')
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentUserData() {
  const supabase = await createClient()

  // Pegar usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Buscar dados completos do usuário na tabela users
  const { data: userData, error } = await supabase
    .from('users')
    .select('name, email, role, avatar')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    console.error('Erro ao buscar dados do usuário:', error)
    return {
      name: user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      role: 'USER',
      avatar: null,
    }
  }

  return userData
}
