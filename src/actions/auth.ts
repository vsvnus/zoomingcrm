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
    throw new Error(authError.message)
  }

  // Criar usuário na tabela users
  if (authData.user) {
    // FASE 1: Criar organização única para cada usuário
    const orgSlug = `org_${authData.user.id.slice(0, 12)}`

    // Usar service role para bypass de RLS durante o cadastro
    const { createServiceClient } = await import('@/lib/supabase/server')
    const serviceClient = await createServiceClient()

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
      throw new Error('Erro ao criar organização no banco de dados')
    }

    const organizationId = orgSlug

    // Criar usuário vinculado à organização usando service role
    const { error: userError } = await serviceClient.from('users').insert([
      {
        id: authData.user.id,
        email: authData.user.email,
        name,
        organization_id: organizationId,
        role: 'ADMIN', // Primeiro usuário é admin
      },
    ])

    if (userError) {
      console.error('Error creating user:', userError)
      throw new Error('Erro ao criar usuário no banco de dados')
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
          // Não falhar o cadastro, apenas logar o erro
          // O usuário pode adicionar o capital inicial depois
        } else {
          console.log('Capital inicial registrado:', result.transactionId)
        }
      } catch (error) {
        console.error('Erro inesperado ao criar capital inicial:', error)
        // Não falhar o cadastro
      }
    }
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
