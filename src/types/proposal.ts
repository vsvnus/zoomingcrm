// Sprint 3: Tipos de Proposta/Orçamento

export interface ProposalItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  order: number
}

export interface ProposalOptional {
  id?: string
  title: string
  description?: string
  price: number
  isSelected?: boolean
  dependency?: string
}

export interface ProposalVideo {
  id?: string
  title: string
  videoUrl: string
  order: number
}

export interface PaymentScheduleItem {
  id?: string
  description: string
  dueDate: Date | string
  amount: number
  percentage?: number
  order: number
  paid?: boolean
  paidAt?: Date | string
}

export interface ProposalFormData {
  title: string
  description?: string
  clientId: string
  baseValue: number
  discount: number
  totalValue: number
  validUntil?: Date | string
  items: ProposalItem[]
  optionals: ProposalOptional[]
  portfolioVideos: ProposalVideo[]
  paymentSchedule: PaymentScheduleItem[]
}

export type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
