// Clapper — Definição de planos e features

export type Feature =
  | 'dashboard'
  | 'proposals'
  | 'projects'
  | 'clients'
  | 'calendar'
  | 'financeiro'
  | 'freelancers'
  | 'inventory'
  | 'studio'
  | 'budgetCalculator'
  | 'aiChat'

export type PlanKey = 'TRIAL' | 'PRO' | 'MAX' | 'EXPIRED'

type PlanFeatures = Record<Feature, boolean>

export const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  TRIAL: {
    dashboard: true,
    proposals: true,
    projects: true,
    clients: true,
    calendar: true,
    financeiro: true,
    freelancers: true,
    inventory: true,
    studio: true,
    budgetCalculator: true,
    aiChat: true,
  },
  PRO: {
    dashboard: true,
    proposals: true,
    projects: true,
    clients: true,
    calendar: true,
    financeiro: true,
    freelancers: true,
    inventory: true,
    studio: false,
    budgetCalculator: false,
    aiChat: false,
  },
  MAX: {
    dashboard: true,
    proposals: true,
    projects: true,
    clients: true,
    calendar: true,
    financeiro: true,
    freelancers: true,
    inventory: true,
    studio: true,
    budgetCalculator: true,
    aiChat: true,
  },
  EXPIRED: {
    dashboard: true,
    proposals: false,
    projects: false,
    clients: false,
    calendar: false,
    financeiro: false,
    freelancers: false,
    inventory: false,
    studio: false,
    budgetCalculator: false,
    aiChat: false,
  },
} as const

export const PLAN_PRICES = {
  PRO: 4990,
  MAX: 7990,
} as const

export const PLAN_LABELS: Record<PlanKey, string> = {
  TRIAL: 'Trial (7 dias)',
  PRO: 'Clapper Pro',
  MAX: 'Clapper Max',
  EXPIRED: 'Sem plano',
}

export const MAX_ONLY_FEATURES: Feature[] = ['studio', 'budgetCalculator', 'aiChat']
