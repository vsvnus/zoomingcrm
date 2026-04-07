// Clapper — Asaas Subscription Management

import { asaasRequest } from './client'
import { PLAN_PRICES } from '@/lib/subscription/plans'

export type AsaasBillingType = 'CREDIT_CARD' | 'BOLETO' | 'PIX' | 'UNDEFINED'

export interface AsaasSubscription {
  id: string
  customer: string
  billingType: AsaasBillingType
  value: number
  nextDueDate: string
  cycle: string
  status: string
  description: string
}

interface CreateSubscriptionInput {
  customerId: string
  plan: 'PRO' | 'MAX'
  billingType: AsaasBillingType
  nextDueDate?: string // YYYY-MM-DD, default: hoje
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function createAsaasSubscription(
  input: CreateSubscriptionInput
): Promise<AsaasSubscription> {
  const value = PLAN_PRICES[input.plan] / 100 // Converter centavos para reais

  return asaasRequest<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.billingType,
      value,
      nextDueDate: input.nextDueDate || formatDate(new Date()),
      cycle: 'MONTHLY',
      description: `Clapper ${input.plan} - Assinatura Mensal`,
    }),
  })
}

export async function getAsaasSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>(`/subscriptions/${subscriptionId}`)
}

export async function updateAsaasSubscription(
  subscriptionId: string,
  data: { plan?: 'PRO' | 'MAX'; billingType?: AsaasBillingType }
): Promise<AsaasSubscription> {
  const updateData: Record<string, unknown> = {}

  if (data.plan) {
    updateData.value = PLAN_PRICES[data.plan] / 100
    updateData.description = `Clapper ${data.plan} - Assinatura Mensal`
  }

  if (data.billingType) {
    updateData.billingType = data.billingType
  }

  return asaasRequest<AsaasSubscription>(`/subscriptions/${subscriptionId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  })
}

export async function cancelAsaasSubscription(subscriptionId: string): Promise<void> {
  await asaasRequest(`/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
  })
}
