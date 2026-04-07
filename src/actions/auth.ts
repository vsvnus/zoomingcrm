'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createInitialCapitalTransaction } from './financeiro'
import { validateInput, signInSchema, signUpSchema, completeSetupSchema } from '@/lib/validations'
import { logAudit } from '@/lib/security/audit-log'

export async function signIn(email: string, password: string) {
  const validated = validateInput(signInSchema, { email, password })
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  })

  if (error) {
    logAudit({
      action: 'AUTH_FAILED',
      metadata: { email: validated.email, reason: error.message },
      severity: 'WARN',
    })
    throw new Error(error.message)
  }

  const { data: { user } } = await supabase.auth.getUser()
  logAudit({
    action: 'AUTH_LOGIN',
    userId: user?.id ?? null,
    metadata: { email: validated.email },
  })

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
  const validated = validateInput(signUpSchema, { email, password, name, companyName, whatsapp, capitalInicial })
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

  logAudit({
    action: 'AUTH_SIGNUP',
    userId: authData.user.id,
    metadata: { email, name: validated.name, company: validated.companyName },
  })

  // 3. Criar organização e usuário na tabela users
  const orgSlug = `org_${authData.user.id.slice(0, 12)}`

  try {
    // Calcular trial de 7 dias
    const now = new Date()
    const trialEndsAt = new Date(now)
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

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
          subscription_plan: 'TRIAL',
          subscription_status: 'TRIALING',
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
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

export async function resetPassword(email: string) {
  const validated = validateInput(
    signInSchema.pick({ email: true }),
    { email }
  )
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  })

  if (error) {
    throw new Error('Erro ao enviar email de recuperação. Tente novamente.')
  }

  return { success: true }
}

export async function updatePassword(password: string) {
  const validated = validateInput(
    signInSchema.pick({ password: true }),
    { password }
  )
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: validated.password,
  })

  if (error) {
    throw new Error('Erro ao atualizar senha. Tente novamente.')
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

/**
 * Completa o cadastro de usuários Google OAuth.
 * Atualiza nome da empresa, whatsapp, capital inicial e limpa needs_setup.
 */
export async function completeSetup(
  companyName: string,
  whatsapp?: string,
  capitalInicial?: number
) {
  const validated = validateInput(completeSetupSchema, { companyName, whatsapp, capitalInicial })
  const supabase = await createClient()
  const serviceClient = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Buscar organização do usuário
  const { data: userData } = await serviceClient
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userData?.organization_id) {
    throw new Error('Organização não encontrada')
  }

  const organizationId = userData.organization_id

  // Atualizar organização com dados reais
  const updateData: Record<string, unknown> = {
    name: validated.companyName,
  }

  if (validated.capitalInicial && validated.capitalInicial > 0) {
    updateData.initial_capital = validated.capitalInicial
    updateData.initial_capital_set_at = new Date().toISOString()
  }

  const { error: orgError } = await serviceClient
    .from('organizations')
    .update(updateData)
    .eq('id', organizationId)

  if (orgError) {
    console.error('[setup] Erro ao atualizar organização:', orgError)
    throw new Error('Erro ao salvar dados da empresa. Tente novamente.')
  }

  // Salvar whatsapp nos metadados do auth
  if (validated.whatsapp) {
    await serviceClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        whatsapp: validated.whatsapp,
      },
    })
  }

  // Criar transação de capital inicial se informado
  if (validated.capitalInicial && validated.capitalInicial > 0) {
    try {
      const result = await createInitialCapitalTransaction(
        organizationId,
        validated.capitalInicial,
        user.id
      )
      if (!result.success) {
        console.error('[setup] Erro ao criar capital inicial:', result.message)
      }
    } catch (error) {
      console.error('[setup] Erro inesperado ao criar capital inicial:', error)
    }
  }

  // Limpar flag needs_setup
  await serviceClient.auth.admin.updateUserById(user.id, {
    app_metadata: { needs_setup: false },
  })

  revalidatePath('/', 'layout')
  return { success: true }
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
