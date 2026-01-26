// ============================================
// TYPES: Projects Module
// ============================================

export type ProjectStatus =
  | 'BRIEFING'
  | 'PRE_PROD'
  | 'SHOOTING'
  | 'POST_PROD'
  | 'REVIEW'
  | 'DONE'

export type ProjectMemberStatus = 'INVITED' | 'CONFIRMED' | 'DECLINED' | 'REMOVED'

export type ProjectOrigin = 'manual' | 'proposal'

export type VideoFormat = '16:9' | '9:16' | '1:1' | '4:5'
export type VideoResolution = '1080p' | '4K' | '8K'

// ============================================
// Database Tables Interfaces
// ============================================

export interface Project {
  id: string
  title: string
  description?: string
  status: ProjectStatus
  origin?: ProjectOrigin // Origem do projeto: manual | proposal
  deadline_date?: string
  shooting_date?: string
  shooting_end_date?: string
  shooting_time?: string
  location?: string
  video_format?: VideoFormat
  resolution?: VideoResolution
  drive_folder_link?: string
  script_link?: string
  client_id: string
  assigned_to_id?: string
  organization_id: string
  created_at: string
  updated_at: string
  budget?: number // SPRINT 2: Orçamento do projeto
}

export interface ProjectMember {
  id: string
  project_id: string
  freelancer_id: string
  role: string
  agreed_fee?: number
  status: ProjectMemberStatus
  invited_at: string
  confirmed_at?: string
  notes?: string
  organization_id: string
  created_at: string
  updated_at: string
}

// ============================================
// Enriched Interfaces (with relations)
// ============================================

export interface ProjectWithClient extends Project {
  clients: {
    id: string
    name: string
    company?: string
  }
}

// SPRINT 2: Múltiplas datas de gravação e entrega
export interface ShootingDate {
  id: string
  date: string
  time?: string
  location?: string
  notes?: string
  project_id: string
  created_at: string
  updated_at: string
}

export interface DeliveryDate {
  id: string
  date: string
  description: string
  completed: boolean
  project_id: string
  created_at: string
  updated_at: string
}

export interface ProjectItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'
  due_date?: string
  project_id: string
  created_at: string
  updated_at: string
}

export interface ProjectWithRelations extends Project {
  clients: {
    id: string
    name: string
    company?: string
    email?: string
    phone?: string
  }
  users?: {
    id: string
    name: string
    email: string
    role: string
  }
  project_members?: Array<{
    id: string
    role: string
    status: ProjectMemberStatus
    agreed_fee?: number
    freelancers: {
      id: string
      name: string
      email?: string
      phone?: string
      daily_rate?: number
    }
  }>
  // SPRINT 2: Múltiplas datas
  shooting_dates?: ShootingDate[]
  delivery_dates?: DeliveryDate[]
  items?: ProjectItem[]
}

export interface ProjectMemberWithFreelancer extends ProjectMember {
  freelancers: {
    id: string
    name: string
    email?: string
    phone?: string
    skills?: string
    daily_rate?: number
    rating?: number
  }
}

// ============================================
// View Interfaces
// ============================================

export interface ProjectTeamSummary {
  project_id: string
  project_title: string
  project_status: ProjectStatus
  total_members: number
  confirmed_members: number
  pending_members: number
  total_crew_cost: number
  confirmed_crew_cost: number
  team_members: Array<{
    freelancer_id: string
    name: string
    role: string
    status: ProjectMemberStatus
    agreed_fee?: number
  }>
}

// ============================================
// Form Data Interfaces
// ============================================

/**
 * Dados mínimos para criação manual de projeto
 * Apenas título, cliente e descrição opcional
 */
export interface MinimalProjectData {
  title: string
  client_id: string
  description?: string
}

/**
 * Dados completos para criação de projeto (inclui todos os campos opcionais)
 * @deprecated Para criação manual, use MinimalProjectData
 */
export interface CreateProjectData {
  title: string
  description?: string
  client_id: string
  deadline_date?: string
  shooting_date?: string
  shooting_end_date?: string
  shooting_time?: string
  location?: string
  video_format?: VideoFormat
  resolution?: VideoResolution
  drive_folder_link?: string
  script_link?: string
  assigned_to_id?: string
}

/**
 * Dados para criação de projeto a partir de proposta aprovada
 */
export interface CreateProjectFromProposalData {
  title: string
  description?: string
  client_id: string
  budget: number
  deadline_date?: string
  assigned_to_id?: string
  items?: Array<{
    description: string
    quantity: number
    unit_price: number
    total_price: number
    due_date?: string | null
  }>
  proposal_id?: string
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: ProjectStatus
  origin?: ProjectOrigin
}


export interface AddProjectMemberData {
  project_id: string
  freelancer_id: string
  role: string
  agreed_fee?: number
  notes?: string
}

export interface UpdateProjectMemberData {
  status?: ProjectMemberStatus
  role?: string
  agreed_fee?: number
  notes?: string
}

// ============================================
// Kanban Board Types
// ============================================

export interface KanbanColumn {
  id: ProjectStatus
  title: string
  projects: ProjectWithClient[]
}

export interface KanbanBoardData {
  columns: KanbanColumn[]
}

// ============================================
// Project Dashboard Types
// ============================================

export interface ProjectStats {
  total_projects: number
  active_projects: number
  completed_projects: number
  projects_by_status: Record<ProjectStatus, number>
  upcoming_shootings: Array<{
    project_id: string
    project_title: string
    shooting_date: string
    client_name: string
    days_until: number
  }>
  overdue_projects: Array<{
    project_id: string
    project_title: string
    deadline_date: string
    client_name: string
    days_overdue: number
  }>
}

// ============================================
// Utility Types
// ============================================

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  BRIEFING: 'Briefing',
  PRE_PROD: 'Pré-Produção',
  SHOOTING: 'Gravação',
  POST_PROD: 'Pós-Produção',
  REVIEW: 'Revisão',
  DONE: 'Concluído',
}

export const PROJECT_STATUS_COLORS: Record<
  ProjectStatus,
  { bg: string; text: string; border: string }
> = {
  BRIEFING: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  PRE_PROD: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  SHOOTING: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
  POST_PROD: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
  },
  REVIEW: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  DONE: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
}

export const PROJECT_MEMBER_STATUS_LABELS: Record<ProjectMemberStatus, string> = {
  INVITED: 'Convidado',
  CONFIRMED: 'Confirmado',
  DECLINED: 'Recusado',
  REMOVED: 'Removido',
}
