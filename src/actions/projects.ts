'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  CreateProjectData,
  MinimalProjectData,
  CreateProjectFromProposalData,
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
import { upsertFreelancerPayable, deleteTransaction } from '@/actions/financeiro'

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
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // 1. Buscar projetos
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, clients(id, name, company)')
    .eq('organization_id', organizationId)
    .neq('status', 'ARCHIVED') // Kanban não mostra arquivados geralmente
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects for kanban:', error)
    return { columns: [] }
  }

  // 2. Buscar próximas gravações para esses projetos
  const today = new Date().toISOString().split('T')[0]
  const projectIds = projects?.map(p => p.id) || []

  let shootingDatesMap: Record<string, string> = {}
  let taskProgressMap: Record<string, { total: number; completed: number }> = {}
  let nextTaskMap: Record<string, string> = {}

  if (projectIds.length > 0) {
    // Buscar próximas gravações
    const { data: nextShoots } = await supabase
      .from('shooting_dates')
      .select('projectId, date')
      .in('projectId', projectIds)
      .gte('date', today)
      .order('date', { ascending: true })

    // Pegar apenas a PRÓXIMA data de cada projeto (o primeiro da lista já que ordenamos asc)
    nextShoots?.forEach(shoot => {
      // Como está ordenado por data ASC, o primeiro que aparecer para o projeto é o mais próximo
      if (!shootingDatesMap[shoot.projectId]) {
        shootingDatesMap[shoot.projectId] = shoot.date
      }
    })

    // Buscar tarefas para contagem e próxima tarefa pendente
    const { data: allTasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('project_id, title, completed, order')
      .in('project_id', projectIds)
      .order('order', { ascending: true })

    if (tasksError) {
      console.error('Error fetching tasks for kanban:', tasksError)
    }

    if (allTasks) {
      allTasks.forEach((task) => {
        // Inicializar contadores se não existir
        if (!taskProgressMap[task.project_id]) {
          taskProgressMap[task.project_id] = { total: 0, completed: 0 }
        }

        // Contar total
        taskProgressMap[task.project_id].total++

        if (task.completed) {
          // Contar completed
          taskProgressMap[task.project_id].completed++
        } else {
          // Primeira tarefa não completa = próxima tarefa
          if (!nextTaskMap[task.project_id]) {
            nextTaskMap[task.project_id] = task.title
          }
        }
      })
    }
  }

  const columns: KanbanBoardData['columns'] = [
    { id: 'BRIEFING', title: 'Briefing', projects: [] },
    { id: 'PRE_PROD', title: 'Pré-Produção', projects: [] },
    { id: 'SHOOTING', title: 'Gravação', projects: [] },
    { id: 'POST_PROD', title: 'Pós-Produção', projects: [] },
    { id: 'REVIEW', title: 'Revisão', projects: [] },
    { id: 'DONE', title: 'Concluído', projects: [] },
  ]

  projects?.forEach((project) => {
    // Injetar próxima gravação e progresso de tarefas no objeto do projeto
    const taskProgress = taskProgressMap[project.id] || { total: 0, completed: 0 }
    const projectWithEvent = {
      ...project,
      next_shooting: shootingDatesMap[project.id] || null,
      tasks_total: taskProgress.total,
      tasks_completed: taskProgress.completed,
      next_task: nextTaskMap[project.id] || null,
    }

    const column = columns.find((col) => col.id === project.status)
    if (column) {
      column.projects.push(projectWithEvent)
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
    // PGRST116 = "no rows returned" - não é um erro real, apenas projeto não encontrado
    if (error.code !== 'PGRST116') {
      console.error('Error fetching project:', error)
    }
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

  // Buscar project_items separadamente (SPRINT 2)
  let items: any[] = []
  try {
    const { data: itemsData, error: itemsError } = await supabase
      .from('project_items')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true })

    if (!itemsError && itemsData) {
      items = itemsData
    }
  } catch (e) {
    // Tabela pode não existir ainda
  }

  // Buscar project_tasks (To-Do List)
  let tasks: any[] = []
  try {
    const { data: tasksData, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true })

    if (!tasksError && tasksData) {
      tasks = tasksData
    }
  } catch (e) {
    // Tabela pode não existir ainda
  }

  return {
    ...data,
    shooting_dates: shootingDates,
    delivery_dates: deliveryDates,
    items: items,
    tasks: tasks,
  }
}

/**
 * Criar projeto manualmente (fluxo simplificado)
 * Apenas 3 campos: título, cliente e descrição opcional
 */
export async function createProject(formData: MinimalProjectData) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Validação de campos obrigatórios
  if (!formData.title?.trim()) {
    throw new Error('Título do projeto é obrigatório')
  }

  if (!formData.client_id) {
    throw new Error('Cliente é obrigatório')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        title: formData.title.trim(),
        description: formData.description || null,
        client_id: formData.client_id,
        organization_id: organizationId,
        status: 'BRIEFING',
        origin: 'manual',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Erro ao criar projeto: ' + error.message)
  }

  // Inicializar finanças do projeto
  await supabase.from('project_finances').insert({
    project_id: data.id,
    organization_id: organizationId,
    approved_value: 0,
    target_margin_percent: 30,
  })

  revalidatePath('/projects')
  return data
}

/**
 * Criar projeto a partir de proposta aprovada (fluxo automático)
 * Cria projeto, finanças, transação e itens de uma vez
 */
export async function createProjectFromProposal(formData: CreateProjectFromProposalData, userId?: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // 1. Criar projeto com status PRE_PROD
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([
      {
        title: formData.title,
        description: formData.description || null,
        client_id: formData.client_id,
        organization_id: organizationId,
        status: 'PRE_PROD',
        origin: 'proposal',
        budget: formData.budget,
        deadline_date: formData.deadline_date,
        assigned_to_id: formData.assigned_to_id || userId || null,
        proposal_id: formData.proposal_id,
      },
    ])
    .select()
    .single()

  if (projectError) {
    console.error('Error creating project from proposal:', projectError)
    throw new Error('Erro ao criar projeto: ' + projectError.message)
  }

  // 2. Criar project_finances
  const { error: financesError } = await supabase.from('project_finances').insert({
    project_id: project.id,
    organization_id: organizationId,
    approved_value: formData.budget,
    target_margin_percent: 30,
  })

  if (financesError) {
    console.error('Erro ao criar finanças do projeto:', financesError)
  }

  // 3. Criar project_items (se fornecidos)
  if (formData.items && formData.items.length > 0) {
    const itemsToCreate = formData.items.map((item, index) => ({
      project_id: project.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      status: 'PENDING',
      due_date: item.due_date || null,
      order: index + 1,
    }))

    const { error: itemsError } = await supabase.from('project_items').insert(itemsToCreate)
    if (itemsError) {
      console.error('Erro ao criar itens do projeto:', itemsError)
    }
  }

  revalidatePath('/projects')
  return project
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
    throw new Error('Erro ao atualizar projeto')
  }

  // ============================================
  // SINCRONIZAÇÃO FINANCEIRA
  // ============================================
  // Se o budget foi atualizado, atualizar project_finances e a transação de receita
  if (formData.budget !== undefined) {
    // 1. Atualizar project_finances
    await supabase
      .from('project_finances')
      .update({ approved_value: formData.budget })
      .eq('project_id', projectId)
      .eq('organization_id', organizationId)

    // 2. Atualizar transação de receita (se existir e estiver PENDENTE)
    // Busca a transação principal do projeto (CLIENT_PAYMENT)
    const { data: transaction } = await supabase
      .from('financial_transactions')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('category', 'CLIENT_PAYMENT')
      .eq('type', 'INCOME')
      .eq('organization_id', organizationId)
      .limit(1)
      .single()

    if (transaction && transaction.status !== 'PAID') {
      await supabase
        .from('financial_transactions')
        .update({ amount: formData.budget })
        .eq('id', transaction.id)
    }
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  return updateProject(projectId, { status })
}

export async function deleteProject(projectId: string, deleteLinkedProposal: boolean = false) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // 1. Deletar eventos do calendário associados (importante por causa do ON DELETE SET NULL)
  await supabase
    .from('calendar_events')
    .delete()
    .eq('project_id', projectId)
    .eq('organization_id', organizationId)

  // 2. Deletar proposta vinculada se solicitado
  if (deleteLinkedProposal) {
    // Buscar ID da proposta
    const { data: project } = await supabase
      .from('projects')
      .select('proposal_id')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single()

    if (project?.proposal_id) {
      // Se estiver ACEITA, mudar para CANCELLED antes de deletar (ver actions/proposals.ts)
      await supabase
        .from('proposals')
        .update({ status: 'CANCELLED' })
        .eq('id', project.proposal_id)

      await supabase
        .from('proposals')
        .delete()
        .eq('id', project.proposal_id)
        .eq('organization_id', organizationId)
    }
  }

  // 3. Deletar projeto
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
  revalidatePath('/proposals')
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

  // INTEGRAÇÃO FINANCEIRA: Criar despesa se houver valor acordado
  if (formData.agreed_fee && formData.agreed_fee > 0) {
    const { data: freelancer } = await supabase
      .from('freelancers')
      .select('name')
      .eq('id', formData.freelancer_id)
      .single()

    if (freelancer) {
      // Data de vencimento padrão: 30 dias após hoje, ou data do projeto?
      // Por enquanto usamos hoje como placeholder para ser editado depois no financeiro
      const defaultDate = new Date().toISOString().split('T')[0]

      await upsertFreelancerPayable({
        projectId: formData.project_id,
        freelancerId: formData.freelancer_id,
        freelancerName: freelancer.name,
        amount: formData.agreed_fee,
        date: defaultDate,
        organizationId
      })
    }
  }

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

  // INTEGRAÇÃO FINANCEIRA: Atualizar ou criar despesa
  if (formData.agreed_fee !== undefined) {
    // Buscar freelancer info e project_id do member atual (pois updateProjectMember recebe memberId)
    const { data: member } = await supabase
      .from('project_members')
      .select('project_id, freelancer_id, freelancers(name)')
      .eq('id', memberId)
      .single()

    if (member && member.freelancers) {
      const amount = formData.agreed_fee || 0
      if (amount > 0) {
        const defaultDate = new Date().toISOString().split('T')[0]
        // Safety check for freelancers relation type (single vs array)
        const freelancerName = Array.isArray(member.freelancers)
          ? member.freelancers[0]?.name
          : (member.freelancers as any)?.name

        await upsertFreelancerPayable({
          projectId: member.project_id,
          freelancerId: member.freelancer_id,
          freelancerName: freelancerName || 'Freelancer',
          amount: amount,
          date: defaultDate,
          organizationId
        })
      }
    }
  }

  return data
}

export async function removeProjectMember(memberId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Buscar dados antes de excluir para remover transação financeira
  const { data: memberToDelete } = await supabase
    .from('project_members')
    .select('project_id, freelancer_id')
    .eq('id', memberId)
    .single()

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)
    .eq('organization_id', organizationId)

  // Remover transação financeira se existir
  if (!error && memberToDelete) {
    const { data: transaction } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('project_id', memberToDelete.project_id)
      .eq('freelancer_id', memberToDelete.freelancer_id)
      .eq('type', 'EXPENSE')
      .single()

    if (transaction) {
      await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transaction.id)
    }
  }

  if (error) {
    console.error('Error removing project member:', error)
    throw new Error('Erro ao remover membro do projeto')
  }

  revalidatePath('/projects')

  // INTEGRAÇÃO FINANCEIRA: Remover despesa associada
  // Buscar transação associada ao freelancer neste projeto
  // Como removeProjectMember recebe memberId, precisamos primeiro saber quem é o freelancer
  // O código original JÁ DELETOU o membro, então não conseguimos buscar o freelancer_id dele.
  // CORREÇÃO: Mover a deleção para o final ou fazer select antes. 
  // Na ordem atual original (linhas 582-587) já deletou. 
  // Alteração necessária: Buscar antes de deletar.
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

export async function getProjectShootingDates(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shooting_dates')
    .select('id, date, location, time')
    .eq('projectId', projectId)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching shooting dates:', error)
    return []
  }

  return data
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




export async function getOrganizationUsers() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data
}

export async function toggleProjectItemStatus(itemId: string, projectId: string, status: 'PENDING' | 'DONE') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_items')
    .update({ status })
    .eq('id', itemId)

  if (error) {
    console.error('Error updating project item:', error)
    throw new Error('Erro ao atualizar item')
  }

  revalidatePath(`/projects/${projectId}`)
}

/**
 * Recalcular Receita do Projeto com base nos Itens do Escopo
 * Sincroniza: project_items sum -> projects.budget -> project_finances.approved_value -> financial_transactions (Income)
 */
async function recalculateProjectRevenue(projectId: string, organizationId: string) {
  const supabase = await createClient()

  // 1. Calcular soma dos itens
  const { data: items } = await supabase
    .from('project_items')
    .select('total_price')
    .eq('project_id', projectId)

  const totalValue = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0

  if (totalValue > 0) {
    // 2. Atualizar Budget no Projeto
    await supabase.from('projects')
      .update({ budget: totalValue })
      .eq('id', projectId)

    // 3. Atualizar Project Finances
    // Verifica se existe registro primeiro
    const { data: finance } = await supabase
      .from('project_finances')
      .select('id')
      .eq('project_id', projectId)
      .maybeSingle()

    if (finance) {
      await supabase.from('project_finances')
        .update({ approved_value: totalValue })
        .eq('project_id', projectId)
    } else {
      await supabase.from('project_finances').insert({
        project_id: projectId,
        organization_id: organizationId,
        approved_value: totalValue,
        target_margin_percent: 30
      })
    }

    // 4. Atualizar ou Criar Transação de Receita
    const { data: existingTx } = await supabase
      .from('financial_transactions')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('category', 'CLIENT_PAYMENT')
      .eq('type', 'INCOME')
      .eq('organization_id', organizationId)
      .limit(1)
      .maybeSingle()

    if (existingTx) {
      if (existingTx.status !== 'PAID') {
        await supabase.from('financial_transactions')
          .update({ amount: totalValue })
          .eq('id', existingTx.id)
      }
    } else {
      // Criar transação se não existir
      const { data: project } = await supabase.from('projects')
        .select('title, client_id')
        .eq('id', projectId).single()

      if (project) {
        await supabase.from('financial_transactions').insert({
          organization_id: organizationId,
          project_id: projectId,
          client_id: project.client_id,
          type: 'INCOME',
          category: 'CLIENT_PAYMENT',
          status: 'PENDING',
          description: `Receita: ${project.title}`,
          amount: totalValue,
          // Data de vencimento hoje ou null? Vamos por null e deixar user definir, ou hoje.
          due_date: new Date().toISOString().split('T')[0]
        })
      }
    }
  }
}

export async function addProjectItem(projectId: string, item: {
  description: string
  quantity: number
  unit_price: number
  due_date?: string | null
}) {
  const supabase = await createClient()

  // Buscar último order
  const { data: lastItem } = await supabase
    .from('project_items')
    .select('order')
    .eq('project_id', projectId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = lastItem ? (lastItem.order || 0) + 1 : 1

  const { error } = await supabase.from('project_items').insert({
    project_id: projectId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price,
    status: 'PENDING',
    due_date: item.due_date,
    order: nextOrder
  })

  if (error) {
    console.error('Error adding project item:', error)
    throw new Error('Erro ao adicionar item')
  }

  revalidatePath(`/projects/${projectId}`)

  // INTEGRAÇÃO FINANCEIRA
  const organizationId = await getUserOrganization()
  await recalculateProjectRevenue(projectId, organizationId)
}

export async function updateProjectItem(itemId: string, projectId: string, updates: {
  description?: string
  quantity?: number
  unit_price?: number
  due_date?: string | null
}) {
  const supabase = await createClient()

  const updateData: any = { ...updates }

  if (updates.quantity !== undefined || updates.unit_price !== undefined) {
    // Se mudou quantidade ou preço, recalcular total
    // Precisamos buscar o valor atual do que não mudou se apenas um deles mudou
    if (updates.quantity !== undefined && updates.unit_price !== undefined) {
      updateData.total_price = updates.quantity * updates.unit_price
    } else {
      const { data: currentItem } = await supabase
        .from('project_items')
        .select('quantity, unit_price')
        .eq('id', itemId)
        .single()

      if (currentItem) {
        const qty = updates.quantity ?? currentItem.quantity
        const price = updates.unit_price ?? currentItem.unit_price
        updateData.total_price = qty * price
      }
    }
  }

  const { error } = await supabase
    .from('project_items')
    .update(updateData)
    .eq('id', itemId)

  if (error) {
    console.error('Error updating project item:', error)
    throw new Error('Erro ao atualizar item')
  }

  revalidatePath(`/projects/${projectId}`)

  // INTEGRAÇÃO FINANCEIRA
  const organizationId = await getUserOrganization()
  await recalculateProjectRevenue(projectId, organizationId)
}

export async function deleteProjectItem(itemId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error deleting project item:', error)
    throw new Error('Erro ao deletar item')
  }

  revalidatePath(`/projects/${projectId}`)

  // INTEGRAÇÃO FINANCEIRA
  const organizationId = await getUserOrganization()
  await recalculateProjectRevenue(projectId, organizationId)
}

// ============================================
// PROJECT TASKS (TO-DO LIST)
// ============================================

const DEFAULT_TASKS = [
  'Briefing',
  'Roteiro',
  'Preparação de Setup',
  'Produção',
]

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching project tasks:', error)
    return []
  }

  return data || []
}

export async function addProjectTask(projectId: string, title: string) {
  const supabase = await createClient()

  // Buscar último order
  const { data: lastTask } = await supabase
    .from('project_tasks')
    .select('order')
    .eq('project_id', projectId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = lastTask ? (lastTask.order || 0) + 1 : 1

  const { data, error } = await supabase
    .from('project_tasks')
    .insert({
      project_id: projectId,
      title: title.trim(),
      completed: false,
      order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding project task:', error)
    throw new Error('Erro ao adicionar tarefa')
  }

  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function toggleProjectTask(taskId: string, projectId: string, completed: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_tasks')
    .update({ completed })
    .eq('id', taskId)

  if (error) {
    console.error('Error toggling project task:', error)
    throw new Error('Erro ao atualizar tarefa')
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteProjectTask(taskId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting project task:', error)
    throw new Error('Erro ao remover tarefa')
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function updateProjectTask(taskId: string, projectId: string, title: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_tasks')
    .update({ title: title.trim() })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating project task:', error)
    throw new Error('Erro ao atualizar tarefa')
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/projects') // Refresh kanban too
}

export async function initializeDefaultTasks(projectId: string) {
  const supabase = await createClient()

  // Verificar se já tem tarefas
  const { count } = await supabase
    .from('project_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  if (count && count > 0) {
    return // Já tem tarefas, não precisa criar padrão
  }

  // Criar tarefas padrão
  const tasksToCreate = DEFAULT_TASKS.map((title, index) => ({
    project_id: projectId,
    title,
    completed: false,
    order: index + 1,
  }))

  const { error } = await supabase.from('project_tasks').insert(tasksToCreate)

  if (error) {
    console.error('Error initializing default tasks:', error)
  }

  revalidatePath(`/projects/${projectId}`)
}
