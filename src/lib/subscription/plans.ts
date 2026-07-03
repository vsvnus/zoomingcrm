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

export type PlanKey =
  | 'TRIAL'
  | 'PRO'
  | 'MAX'
  | 'STUDIO_STARTER'
  | 'STUDIO_PLUS'
  | 'STUDIO_PRO'
  | 'STUDIO_MAX'
  | 'EXPIRED'

type PlanFeatures = Record<Feature, boolean>

// Acesso total dentro do vocabulário de features deste app (CRM + Studio + IA chat).
const FULL_ACCESS: PlanFeatures = {
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
}

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
  STUDIO_STARTER: FULL_ACCESS,
  STUDIO_PLUS: FULL_ACCESS,
  STUDIO_PRO: FULL_ACCESS,
  STUDIO_MAX: FULL_ACCESS,
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
  STUDIO_STARTER: 14900,
  STUDIO_PLUS: 19900,
  STUDIO_PRO: 34900,
  STUDIO_MAX: 39900,
} as const

export const PLAN_LABELS: Record<PlanKey, string> = {
  TRIAL: 'Trial (7 dias)',
  PRO: 'Clapper Pro',
  MAX: 'Clapper Max',
  STUDIO_STARTER: 'Clapper Studio AI — Spark',
  STUDIO_PLUS: 'Clapper Studio AI — Boost',
  STUDIO_PRO: 'Clapper Studio AI — Turbo',
  STUDIO_MAX: 'Clapper Studio AI — Nitro',
  EXPIRED: 'Sem plano',
}

export const MAX_ONLY_FEATURES: Feature[] = ['studio', 'budgetCalculator', 'aiChat']
