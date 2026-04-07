// Clapper — Lógica de gating e verificação de acesso

import { PLAN_FEATURES, type Feature, type PlanKey } from './plans'

export const ROUTE_FEATURE_MAP: Record<string, Feature> = {
  '/proposals': 'proposals',
  '/projects': 'projects',
  '/clients': 'clients',
  '/calendar': 'calendar',
  '/financeiro': 'financeiro',
  '/freelancers': 'freelancers',
  '/inventory': 'inventory',
  '/studio': 'studio',
  '/budget-calculator': 'budgetCalculator',
}

// Rotas isentas de verificação de subscription (sempre acessíveis)
export const SUBSCRIPTION_EXEMPT_ROUTES = [
  '/dashboard',
  '/settings',
  '/api/',
  '/onboarding',
]

export function getFeatureForRoute(pathname: string): Feature | null {
  for (const [prefix, feature] of Object.entries(ROUTE_FEATURE_MAP)) {
    if (pathname.startsWith(prefix)) {
      return feature
    }
  }
  return null
}

export function getEffectivePlan(org: {
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  trialEndsAt: string | Date | null
  subscriptionEndsAt?: string | Date | null
  canceledAt?: string | Date | null
}): PlanKey {
  const status = org.subscriptionStatus

  if (status === 'EXPIRED') {
    return 'EXPIRED'
  }

  if (status === 'CANCELED') {
    // Acesso mantido até o fim do período
    if (org.subscriptionEndsAt && new Date(org.subscriptionEndsAt) > new Date()) {
      return (org.subscriptionPlan as 'PRO' | 'MAX') ?? 'EXPIRED'
    }
    return 'EXPIRED'
  }

  if (status === 'TRIALING') {
    if (org.trialEndsAt && new Date(org.trialEndsAt) < new Date()) {
      return 'EXPIRED'
    }
    return 'TRIAL'
  }

  if (status === 'PAST_DUE') {
    // Grace period — mantém acesso por enquanto
    return (org.subscriptionPlan as 'PRO' | 'MAX') ?? 'EXPIRED'
  }

  if (status === 'ACTIVE') {
    return (org.subscriptionPlan as 'PRO' | 'MAX') ?? 'EXPIRED'
  }

  return 'EXPIRED'
}

export function canAccessFeature(plan: PlanKey, feature: Feature): boolean {
  return PLAN_FEATURES[plan]?.[feature] ?? false
}

export function isSubscriptionExemptRoute(pathname: string): boolean {
  return SUBSCRIPTION_EXEMPT_ROUTES.some((prefix) => pathname.startsWith(prefix))
}
