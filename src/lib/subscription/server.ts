// Clapper — Helpers server-side para subscription (cached por request)

import { cache } from 'react'
import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { getEffectivePlan, canAccessFeature } from './access'
import type { Feature, PlanKey } from './plans'

export interface OrganizationSubscription {
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  trialStartedAt: string | null
  trialEndsAt: string | null
  subscriptionStartedAt: string | null
  subscriptionEndsAt: string | null
  canceledAt: string | null
  asaasCustomerId: string | null
  asaasSubscriptionId: string | null
  effectivePlan: PlanKey
  organizationId: string
}

export const getOrganizationSubscription = cache(async (): Promise<OrganizationSubscription> => {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('organizations')
    .select(
      'subscription_plan, subscription_status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at, canceled_at, asaas_customer_id, asaas_subscription_id'
    )
    .eq('id', organizationId)
    .single()

  if (error || !data) {
    return {
      subscriptionPlan: null,
      subscriptionStatus: null,
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionStartedAt: null,
      subscriptionEndsAt: null,
      canceledAt: null,
      asaasCustomerId: null,
      asaasSubscriptionId: null,
      effectivePlan: 'EXPIRED',
      organizationId,
    }
  }

  const effectivePlan = getEffectivePlan({
    subscriptionPlan: data.subscription_plan,
    subscriptionStatus: data.subscription_status,
    trialEndsAt: data.trial_ends_at,
    subscriptionEndsAt: data.subscription_ends_at,
    canceledAt: data.canceled_at,
  })

  return {
    subscriptionPlan: data.subscription_plan,
    subscriptionStatus: data.subscription_status,
    trialStartedAt: data.trial_started_at,
    trialEndsAt: data.trial_ends_at,
    subscriptionStartedAt: data.subscription_started_at,
    subscriptionEndsAt: data.subscription_ends_at,
    canceledAt: data.canceled_at,
    asaasCustomerId: data.asaas_customer_id,
    asaasSubscriptionId: data.asaas_subscription_id,
    effectivePlan,
    organizationId,
  }
})

export async function requireFeature(feature: Feature): Promise<void> {
  const sub = await getOrganizationSubscription()
  if (!canAccessFeature(sub.effectivePlan, feature)) {
    throw new Error('SUBSCRIPTION_REQUIRED')
  }
}

export async function requireActivePlan(): Promise<void> {
  const sub = await getOrganizationSubscription()
  if (sub.effectivePlan === 'EXPIRED') {
    throw new Error('SUBSCRIPTION_REQUIRED')
  }
}
