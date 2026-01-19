'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  CreateProjectData,
  UpdateProjectData,
  ProjectStatus,
  ProjectWithClient,
  ProjectWithRelations,
  AddProjectMemberData,
  UpdateProjectMemberData,
  ProjectMemberWithFreelancer,
  ProjectTeamSummary,
  KanbanBoardData,
  ProjectStats,
} from '@/types/projects'

// ============================================
// PROJECTS CRUD
// ============================================

export async function getProjects(): Promise<ProjectWithClient[]> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(id, name, company)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function getProjectsForKanban(): Promise<KanbanBoardData> {
  const projects = await getProjects()

  const columns: KanbanBoardData['columns'] = [
    { id: 'BRIEFING', title: 'Briefing', projects: [] },
    { id: 'PRE_PROD', title: 'Pré-Produção', projects: [] },
    { id: 'SHOOTING', title: 'Gravação', projects: [] },
    { id: 'POST_PROD', title: 'Pós-Produção', projects: [] },
    { id: 'REVIEW', title: 'Revisão', projects: [] },
    { id: 'DONE', title: 'Concluído', projects: [] },
  ]

  projects.forEach((project) => {
    const column = columns.find((col) => col.id === project.status)
    if (column) {
      column.projects.push(project)
    }
  })

  return { columns }
}

export async function getProject(projectId: string): Promise<ProjectWithRelations | null> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Primeiro, buscar o projeto com os relacionamentos básicos
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      clients(id, name, company, email, phone),
      users(id, name, email, role),
      project_members(
        id,
        role,
        status,
        agreed_fee,
        freelancers(id, name, email, phone, daily_rate)
      )
    `
    )
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  // Buscar shooting_dates separadamente (para evitar erro se tabela não existir)
  let shootingDates: any[] = []
  try {
    const { data: sdData, error: sdError } = await supabase
      .from('shooting_dates')
      .select('*')
      .eq('projectId', projectId)
      .order('date', { ascending: true })

    if (!sdError && sdData) {
      shootingDates = sdData.map(sd => ({
        id: sd.id,
        date: sd.date,
        time: sd.time,
        location: sd.location,
        notes: sd.notes,
        project_id: projectId,
        created_at: sd.createdAt || sd.created_at,
        updated_at: sd.updatedAt || sd.updated_at,
      }))
    }
  } catch (e) {
    // Tabela pode não existir ainda
  }

  // Buscar delivery_dates separadamente
  let deliveryDates: any[] = []
  try {
    const { data: ddData, error: ddError } = await supabase
      .from('delivery_dates')
      .select('*')
      .eq('projectId', projectId)
      .order('date', { ascending: true })

    if (!ddError && ddData) {
      deliveryDates = ddData.map(dd => ({
        id: dd.id,
        date: dd.date,
        description: dd.description,
        completed: dd.completed,
        project_id: projectId,
        created_at: dd.createdAt || dd.created_at,
        updated_at: dd.updatedAt || dd.updated_at,
      }))
    }
  } catch (e) {
    // Tabela pode não existir ainda
  }

  return {
    ...data,
    shooting_dates: shootingDates,
    delivery_dates: deliveryDates,
  }
}

export async function createProject(formData: CreateProjectData) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        ...formData,
        organization_id: organizationId,
        status: 'BRIEFING',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Erro ao criar projeto')
  }

  revalidatePath('/projects')
  return data
}

export async function updateProject(projectId: string, formData: UpdateProjectData) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('projects')
    .update(formData)
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw new Error('Erro ao atualizar projeto')
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  return updateProject(projectId, { status })
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Erro ao deletar projeto')
  }

  revalidatePath('/projects')
}

// ============================================
// PROJECT MEMBERS (TEAM)
// ============================================

export async function getProjectMembers(
  projectId: string
): Promise<ProjectMemberWithFreelancer[]> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('project_members')
    .select('*, freelancers(id, name, email, phone, skills, daily_rate, rating)')
    .eq('project_id', projectId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching project members:', error)
    return []
  }

  return data || []
}

export async function addProjectMember(formData: AddProjectMemberData) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('project_members')
    .insert([
      {
        ...formData,
        organization_id: organizationId,
        status: 'INVITED',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding project member:', error)
    throw new Error('Erro ao adicionar membro ao projeto')
  }

  revalidatePath(`/projects/${formData.project_id}`)
  return data
}

export async function updateProjectMember(
  memberId: string,
  formData: UpdateProjectMemberData
) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const updateData: any = { ...formData }

  // Se confirmar, adicionar timestamp
  if (formData.status === 'CONFIRMED') {
    updateData.confirmed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('project_members')
    .update(updateData)
    .eq('id', memberId)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project member:', error)
    throw new Error('Erro ao atualizar membro do projeto')
  }

  revalidatePath('/projects')
  return data
}

export async function removeProjectMember(memberId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error removing project member:', error)
    throw new Error('Erro ao remover membro do projeto')
  }

  revalidatePath('/projects')
}

// ============================================
// PROJECT VIEWS & ANALYTICS
// ============================================

export async function getProjectTeamSummary(
  projectId: string
): Promise<ProjectTeamSummary | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_team_summary')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project team summary:', error)
    return null
  }

  return data
}

export async function getProjectStats(): Promise<ProjectStats> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Total de projetos
  const { count: total_projects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  // Projetos ativos (não concluídos)
  const { count: active_projects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .neq('status', 'DONE')

  // Projetos concluídos
  const { count: completed_projects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'DONE')

  // Projetos por status
  const { data: projectsByStatus } = await supabase
    .from('projects')
    .select('status')
    .eq('organization_id', organizationId)

  const projects_by_status: Record<ProjectStatus, number> = {
    BRIEFING: 0,
    PRE_PROD: 0,
    SHOOTING: 0,
    POST_PROD: 0,
    REVIEW: 0,
    DONE: 0,
  }

  projectsByStatus?.forEach((p) => {
    projects_by_status[p.status as ProjectStatus]++
  })

  // Próximas gravações (próximos 7 dias)
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const { data: upcomingShootingsData } = await supabase
    .from('projects')
    .select('id, title, shooting_date, clients(name)')
    .eq('organization_id', organizationId)
    .gte('shooting_date', today.toISOString())
    .lte('shooting_date', nextWeek.toISOString())
    .order('shooting_date', { ascending: true })

  const upcoming_shootings =
    upcomingShootingsData?.map((p) => {
      const client = Array.isArray(p.clients) ? p.clients[0] : p.clients
      return {
        project_id: p.id,
        project_title: p.title,
        shooting_date: p.shooting_date!,
        client_name: client?.name || 'Cliente não informado',
        days_until: Math.ceil(
          (new Date(p.shooting_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    }) || []

  // Projetos atrasados (deadline passou)
  const { data: overdueProjectsData } = await supabase
    .from('projects')
    .select('id, title, deadline_date, clients(name)')
    .eq('organization_id', organizationId)
    .neq('status', 'DONE')
    .lt('deadline_date', today.toISOString())
    .order('deadline_date', { ascending: true })

  const overdue_projects =
    overdueProjectsData?.map((p) => {
      const client = Array.isArray(p.clients) ? p.clients[0] : p.clients
      return {
        project_id: p.id,
        project_title: p.title,
        deadline_date: p.deadline_date!,
        client_name: client?.name || 'Cliente não informado',
        days_overdue: Math.ceil(
          (today.getTime() - new Date(p.deadline_date!).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    }) || []

  return {
    total_projects: total_projects || 0,
    active_projects: active_projects || 0,
    completed_projects: completed_projects || 0,
    projects_by_status,
    upcoming_shootings,
    overdue_projects,
  }
}

// ============================================
// LEGACY COMPATIBILITY (deprecated)
// ============================================

/**
 * @deprecated Use updateProjectStatus instead
 */
export async function updateProjectStage(projectId: string, stage: string) {
  return updateProjectStatus(projectId, stage as ProjectStatus)
}

/**
 * @deprecated Use createProject instead
 */
export async function addProject(formData: any) {
  return createProject(formData)
}

// ============================================
// SPRINT 2: SHOOTING & DELIVERY DATES
// ============================================

export async function addShootingDate(projectId: string, shootingDate: {
  date: string
  time?: string
  location?: string
  notes?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shooting_dates')
    .insert([
      {
        projectId: projectId, // camelCase conforme migration
        date: shootingDate.date,
        time: shootingDate.time,
        location: shootingDate.location,
        notes: shootingDate.notes,
        updatedAt: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding shooting date:', error)
    throw new Error('Erro ao adicionar data de gravação')
  }

  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function addDeliveryDate(projectId: string, deliveryDate: {
  date: string
  description: string
  completed?: boolean
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('delivery_dates')
    .insert([
      {
        projectId: projectId, // camelCase conforme migration
        date: deliveryDate.date,
        description: deliveryDate.description,
        completed: deliveryDate.completed || false,
        updatedAt: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding delivery date:', error)
    throw new Error('Erro ao adicionar data de entrega')
  }

  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteShootingDate(shootingDateId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shooting_dates')
    .delete()
    .eq('id', shootingDateId)

  if (error) {
    console.error('Error deleting shooting date:', error)
    throw new Error('Erro ao remover data de gravação')
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteDeliveryDate(deliveryDateId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('delivery_dates')
    .delete()
    .eq('id', deliveryDateId)

  if (error) {
    console.error('Error deleting delivery date:', error)
    throw new Error('Erro ao remover data de entrega')
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function toggleDeliveryComplete(deliveryDateId: string, projectId: string, completed: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('delivery_dates')
    .update({ completed })
    .eq('id', deliveryDateId)

  if (error) {
    console.error('Error updating delivery date:', error)
    throw new Error('Erro ao atualizar entrega')
  }

  revalidatePath(`/projects/${projectId}`)
}
