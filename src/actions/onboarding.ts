'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkOnboardingStatus(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return true // Se não autenticado, skip

  const { data } = await supabase
    .from('users')
    .select('onboarded')
    .eq('id', user.id)
    .single()

  return data?.onboarded ?? false
}

export async function completeOnboarding(): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autenticado')
  }

  const { error } = await supabase
    .from('users')
    .update({ onboarded: true })
    .eq('id', user.id)

  if (error) {
    console.error('Erro ao completar onboarding:', error)
    throw new Error('Erro ao salvar progresso do onboarding')
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
