// ============================================
// TYPES: Item Assignments & Freelancer Details
// ============================================

export type ItemAssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE'

export interface ItemAssignment {
    id: string
    freelancer_id: string
    proposal_item_id?: string | null
    project_item_id?: string | null
    role?: string
    agreed_fee?: number
    estimated_hours?: number
    scheduled_date?: string
    status: ItemAssignmentStatus
    notes?: string
    organization_id: string
    created_at: string
    updated_at: string
}

export interface ItemAssignmentWithFreelancer extends ItemAssignment {
    freelancers: {
        id: string
        name: string
        email?: string
        phone?: string
        daily_rate?: number
    }
}

export interface CreateItemAssignmentData {
    freelancer_id: string
    proposal_item_id?: string
    project_item_id?: string
    role?: string
    agreed_fee?: number
    estimated_hours?: number
    scheduled_date?: string
    notes?: string
}

export interface UpdateItemAssignmentData {
    role?: string
    agreed_fee?: number
    estimated_hours?: number
    scheduled_date?: string
    status?: ItemAssignmentStatus
    notes?: string
}

// ============================================
// Freelancer Work History (from view)
// ============================================

export interface FreelancerWorkHistoryItem {
    freelancer_id: string
    freelancer_name: string
    assignment_id: string
    role?: string
    agreed_fee?: number
    status: ItemAssignmentStatus
    scheduled_date?: string
    created_at: string
    item_description: string
    source_type: 'proposal' | 'project'
    source_id: string
    source_title: string
    client_name?: string
    organization_id: string
}

// ============================================
// Freelancer Financial Summary (from view)
// ============================================

export interface FreelancerFinancialSummary {
    freelancer_id: string
    freelancer_name: string
    daily_rate?: number
    total_assignments: number
    completed_assignments: number
    pending_assignments: number
    total_agreed_fees: number
    completed_fees: number
    total_paid: number
    pending_payment: number
    projects_count: number
    organization_id: string
}

// ============================================
// Freelancer Detail Page Types
// ============================================

export interface FreelancerWithDetails {
    id: string
    name: string
    email?: string
    phone?: string
    cpf?: string
    pix_key?: string
    skills?: string
    daily_rate?: number
    rating?: number
    notes?: string
    organization_id: string
    created_at: string
    updated_at: string

    // Agregados
    work_history?: FreelancerWorkHistoryItem[]
    financial_summary?: FreelancerFinancialSummary
    upcoming_assignments?: ItemAssignment[]
    monthly_earnings?: Array<{
        month: string
        amount: number
    }>
}

// ============================================
// Constants
// ============================================

export const ASSIGNMENT_STATUS_LABELS: Record<ItemAssignmentStatus, string> = {
    PENDING: 'Pendente',
    IN_PROGRESS: 'Em andamento',
    DONE: 'Concluído',
}

export const ASSIGNMENT_STATUS_COLORS: Record<ItemAssignmentStatus, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    DONE: { bg: 'bg-green-500/10', text: 'text-green-400' },
}

export const COMMON_ROLES = [
    'Diretor',
    'Câmera',
    'Assistente de Câmera',
    'Editor',
    'Colorista',
    'Roteirista',
    'Produtor',
    'Assistente de Produção',
    'Sound Designer',
    'Motion Designer',
    'Drone',
    'Fotógrafo',
    'Maquiador(a)',
    'Figurinista',
    'Iluminador',
    'Eletricista',
]
