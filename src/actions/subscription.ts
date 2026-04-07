'use server'

import { createClient, getUserOrganization, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createCustomer,
  createAsaasSubscription,
  cancelAsaasSubscription,
  updateAsaasSubscription,
  getSubscriptionPayments,
} from '@/lib/asaas'
import type { AsaasBillingType } from '@/lib/asaas'

export async function getSubscriptionData() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('organizations')
    .select(
      'name, email, cnpj, subscription_plan, subscription_status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at, canceled_at, asaas_customer_id, asaas_subscription_id'
    )
    .eq('id', organizationId)
    .single()

  if (error || !data) {
    throw new Error('Erro ao buscar dados da assinatura')
  }

  return {
    organizationId,
    name: data.name,
    email: data.email,
    cnpj: data.cnpj,
    subscriptionPlan: data.subscription_plan,
    subscriptionStatus: data.subscription_status,
    trialStartedAt: data.trial_started_at,
    trialEndsAt: data.trial_ends_at,
    subscriptionStartedAt: data.subscription_started_at,
    subscriptionEndsAt: data.subscription_ends_at,
    canceledAt: data.canceled_at,
    asaasCustomerId: data.asaas_customer_id,
    asaasSubscriptionId: data.asaas_subscription_id,
  }
}

export async function startSubscription(
  plan: 'PRO' | 'MAX',
  billingType: AsaasBillingType,
  cpfCnpj: string
) {
  try {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    // Buscar dados da org
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('name, email, cnpj, asaas_customer_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      console.error('[subscription] Erro ao buscar org:', orgError)
      throw new Error('Erro ao buscar dados da organização')
    }

    let asaasCustomerId = org.asaas_customer_id

    // Criar customer no Asaas se não existir
    if (!asaasCustomerId) {
      console.log('[subscription] Criando customer no Asaas para:', org.name)
      const customer = await createCustomer({
        name: org.name,
        email: org.email,
        cpfCnpj: cpfCnpj || org.cnpj || '',
      })
      asaasCustomerId = customer.id
      console.log('[subscription] Customer criado:', asaasCustomerId)

      // Salvar customer ID na org
      const serviceClient = await createServiceClient()
      await serviceClient
        .from('organizations')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', organizationId)
    }

    // Criar subscription no Asaas
    console.log('[subscription] Criando subscription:', plan, billingType)
    const subscription = await createAsaasSubscription({
      customerId: asaasCustomerId,
      plan,
      billingType,
    })
    console.log('[subscription] Subscription criada:', subscription.id)

    // Atualizar org com dados da subscription
    const serviceClient = await createServiceClient()
    const { error: updateError } = await serviceClient
      .from('organizations')
      .update({
        subscription_plan: plan,
        subscription_status: 'ACTIVE',
        subscription_started_at: new Date().toISOString(),
        subscription_ends_at: subscription.nextDueDate,
        asaas_subscription_id: subscription.id,
        canceled_at: null,
      })
      .eq('id', organizationId)

    if (updateError) {
      console.error('[subscription] Erro ao atualizar org:', updateError)
      throw new Error('Erro ao atualizar assinatura')
    }

    revalidatePath('/settings/billing')
    revalidatePath('/', 'layout')
    return { success: true as const, subscriptionId: subscription.id, error: null }
  } catch (error) {
    console.error('[subscription] startSubscription error:', error)
    const message = error instanceof Error ? error.message : 'Erro ao processar assinatura'
    return { success: false as const, subscriptionId: null, error: message }
  }
}

export async function changePlan(newPlan: 'PRO' | 'MAX') {
  try {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('asaas_subscription_id, subscription_plan')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return { success: false as const, error: 'Erro ao buscar dados da organização' }
    }

    if (!org.asaas_subscription_id) {
      return { success: false as const, error: 'Nenhuma assinatura ativa encontrada' }
    }

    if (org.subscription_plan === newPlan) {
      return { success: false as const, error: 'Você já está neste plano' }
    }

    await updateAsaasSubscription(org.asaas_subscription_id, { plan: newPlan })

    const serviceClient = await createServiceClient()
    await serviceClient
      .from('organizations')
      .update({ subscription_plan: newPlan })
      .eq('id', organizationId)

    revalidatePath('/settings/billing')
    revalidatePath('/', 'layout')
    return { success: true as const, error: null }
  } catch (error) {
    console.error('[subscription] changePlan error:', error)
    const message = error instanceof Error ? error.message : 'Erro ao alterar plano'
    return { success: false as const, error: message }
  }
}

export async function cancelSubscriptionAction() {
  try {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('asaas_subscription_id, subscription_ends_at')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return { success: false as const, error: 'Erro ao buscar dados da organização' }
    }

    if (!org.asaas_subscription_id) {
      return { success: false as const, error: 'Nenhuma assinatura ativa encontrada' }
    }

    await cancelAsaasSubscription(org.asaas_subscription_id)

    const serviceClient = await createServiceClient()
    await serviceClient
      .from('organizations')
      .update({
        subscription_status: 'CANCELED',
        canceled_at: new Date().toISOString(),
      })
      .eq('id', organizationId)

    revalidatePath('/settings/billing')
    revalidatePath('/', 'layout')
    return { success: true as const, error: null }
  } catch (error) {
    console.error('[subscription] cancelSubscription error:', error)
    const message = error instanceof Error ? error.message : 'Erro ao cancelar assinatura'
    return { success: false as const, error: message }
  }
}

export async function getInvoices() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('asaas_subscription_id')
    .eq('id', organizationId)
    .single()

  if (orgError || !org || !org.asaas_subscription_id) {
    return { payments: [], totalCount: 0 }
  }

  const result = await getSubscriptionPayments(org.asaas_subscription_id)
  return { payments: result.data, totalCount: result.totalCount }
}
