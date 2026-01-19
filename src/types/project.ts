// Sprint 2: Tipos do Projeto com novos campos

export interface ShootingDate {
  id?: string
  date: Date | string
  time?: string
  location?: string
  notes?: string
}

export interface DeliveryDate {
  id?: string
  date: Date | string
  description: string
  completed?: boolean
}

export interface ProjectFormData {
  title: string
  description?: string
  clientId: string
  assignedToId?: string
  deadline?: Date | string
  location?: string
  deliverablesDescription?: string
  shootingDates: ShootingDate[]
  deliveryDates: DeliveryDate[]
}

export interface FreelancerAllocationWithRate {
  id?: string
  freelancerId: string
  date: Date | string
  confirmed?: boolean
  customRate?: number | null
}
