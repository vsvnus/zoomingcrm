// ============================================
// TYPES: Financial Module
// ============================================

// IMPORTANTE: Estes tipos devem corresponder exatamente aos ENUMs do PostgreSQL (UPPERCASE)
export type TransactionTypeDB = 'INITIAL_CAPITAL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type TransactionCategoryDB = 'REGISTRATION' | 'CLIENT_PAYMENT' | 'ADDITIVE' | 'OTHER_INCOME' | 'CREW_TALENT' | 'EQUIPMENT_RENTAL' | 'LOCATION' | 'LOGISTICS' | 'POST_PRODUCTION' | 'PRODUCTION' | 'OFFICE_RENT' | 'UTILITIES' | 'SOFTWARE' | 'SALARY' | 'INSURANCE' | 'MARKETING' | 'MAINTENANCE' | 'OTHER_EXPENSE'
export type PaymentStatusDB = 'PENDING' | 'SCHEDULED' | 'PAID' | 'OVERDUE' | 'CANCELLED'

// Legacy types (manter para compatibilidade)
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type PaymentStatus = 'PENDING' | 'SCHEDULED' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export type TransactionCategory =
  // Receitas
  | 'CLIENT_PAYMENT'
  | 'ADDITIVE'
  | 'OTHER_INCOME'
  // Despesas Variáveis (Projetos)
  | 'CREW_TALENT'
  | 'EQUIPMENT_RENTAL'
  | 'LOCATION'
  | 'LOGISTICS'
  | 'POST_PRODUCTION'
  | 'PRODUCTION'
  // Despesas Fixas (Empresa)
  | 'OFFICE_RENT'
  | 'UTILITIES'
  | 'SOFTWARE'
  | 'SALARY'
  | 'INSURANCE'
  | 'MARKETING'
  | 'MAINTENANCE'
  | 'OTHER_EXPENSE'

export interface Transaction {
  id?: string
  organization_id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  estimated_amount?: number
  status?: PaymentStatus
  due_date?: string
  payment_date?: string
  payment_method?: string
  project_id?: string
  proposal_id?: string
  client_id?: string
  freelancer_id?: string
  equipment_id?: string
  invoice_number?: string
  notes?: string
  created_by?: string
  // Recorrência
  is_recurring?: boolean
  recurrence_period?: 'MONTHLY' | 'YEARLY' | 'WEEKLY'
  parent_transaction_id?: string
}
