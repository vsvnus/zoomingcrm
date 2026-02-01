'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data || []
}

export async function addClient(formData: {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        ...formData,
        organization_id: organizationId,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    throw new Error('Erro ao criar cliente: ' + error.message)
  }

  console.log('Cliente criado com sucesso:', data)

  revalidatePath('/clients')
  revalidatePath('/proposals')
  return data
}

export async function updateClient(
  id: string,
  formData: {
    name?: string
    email?: string
    phone?: string | null
    company?: string | null
    notes?: string | null
  }
) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('clients')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    throw new Error('Erro ao atualizar cliente: ' + error.message)
  }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return data
}

export async function getClient(id: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }

  return data
}

export async function getClientProjects(clientId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client projects:', error)
    return []
  }

  return data || []
}

export async function getClientProposals(clientId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('client_id', clientId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client proposals:', error)
    return []
  }

  return data || []
}

export async function getClientFinancials(clientId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('client_id', clientId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client financials:', error)
    return []
  }

  return data || []
}

export async function deleteClient(id: string, forceDelete: boolean = false) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Se forceDelete for true, deletar dependências primeiro
  if (forceDelete) {
    // A. Buscar IDs dos projetos
    const { data: clientProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', id)
      .eq('organization_id', organizationId)
    const projectIds = clientProjects?.map(p => p.id) || []

    // B. Buscar IDs das propostas
    const { data: clientProposals } = await supabase
      .from('proposals')
      .select('id')
      .eq('client_id', id)
      .eq('organization_id', organizationId)
    const proposalIds = clientProposals?.map(p => p.id) || []

    // 1. Deletar Transações Financeiras (Vinculadas ao Cliente, Projetos ou Propostas)
    let orQuery = `client_id.eq.${id}`
    if (projectIds.length > 0) orQuery += `,project_id.in.(${projectIds.join(',')})`
    if (proposalIds.length > 0) orQuery += `,proposal_id.in.(${proposalIds.join(',')})`

    await supabase
      .from('financial_transactions')
      .delete()
      .or(orQuery)
      .eq('organization_id', organizationId)

    // 2. Limpar Dependências de Projetos
    if (projectIds.length > 0) {
      // 2.1 Buscar Itens de Projeto para limpar Assignments
      const { data: projItems } = await supabase.from('project_items').select('id').in('project_id', projectIds)
      const projectItemIds = projItems?.map(i => i.id) || []

      if (projectItemIds.length > 0) {
        await supabase.from('item_assignments').delete().in('project_item_id', projectItemIds)
      }

      // 2.2 Deletar dependências diretas de projeto
      await supabase.from('project_items').delete().in('project_id', projectIds)
      await supabase.from('calendar_events').delete().in('project_id', projectIds)
      await supabase.from('project_tasks').delete().in('project_id', projectIds)
      await supabase.from('project_finances').delete().in('project_id', projectIds)

      // Tentar deletar notas/times se existirem (ignorar erro se tabela não existir ou estiver vazia)
      await supabase.from('project_notes').delete().in('project_id', projectIds)
      await supabase.from('project_team').delete().in('project_id', projectIds)
    }

    // 3. Limpar Dependências de Propostas
    if (proposalIds.length > 0) {
      // 3.1 Buscar Itens de Proposta para limpar Assignments
      const { data: propItems } = await supabase.from('proposal_items').select('id').in('proposal_id', proposalIds)
      const proposalItemIds = propItems?.map(i => i.id) || []

      if (proposalItemIds.length > 0) {
        await supabase.from('item_assignments').delete().in('proposal_item_id', proposalItemIds)
      }

      // 3.2 Deletar dependências diretas de proposta
      await supabase.from('proposal_items').delete().in('proposal_id', proposalIds)
      await supabase.from('proposal_optionals').delete().in('proposal_id', proposalIds)
      await supabase.from('proposal_videos').delete().in('proposal_id', proposalIds)
    }

    // 4. Deletar Projetos
    if (projectIds.length > 0) {
      await supabase
        .from('projects')
        .delete()
        .in('id', projectIds)
        .eq('organization_id', organizationId)
    }

    // 5. Deletar Propostas
    if (proposalIds.length > 0) {
      // Setar status para CANCELLED para evitar triggers de proteção se houver
      await supabase.from('proposals').update({ status: 'CANCELLED' }).in('id', proposalIds)

      await supabase
        .from('proposals')
        .delete()
        .in('id', proposalIds)
        .eq('organization_id', organizationId)
    }
  }

  // SEGURANÇA: Filtrar por organization_id para garantir isolamento multi-tenant
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting client:', error)

    // Tratamento de segurança: Impede exclusão se houver projetos vinculados (apenas se não for forceDelete)
    if ((error as any).code === '23503') {
      throw new Error('DEPENDENCY_ERROR: Este cliente possui Projetos ou Propostas vinculadas.')
    }

    throw new Error('Erro ao deletar cliente')
  }

  revalidatePath('/dashboard/clients')
}

export async function transferAndDeleteClient(sourceClientId: string, targetClientId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // 1. Transferir Projetos
  const { error: projectsError } = await supabase
    .from('projects')
    .update({ client_id: targetClientId })
    .eq('client_id', sourceClientId)
    .eq('organization_id', organizationId)

  if (projectsError) throw new Error('Erro ao transferir projetos: ' + projectsError.message)

  // 2. Transferir Propostas
  const { error: proposalsError } = await supabase
    .from('proposals')
    .update({ client_id: targetClientId })
    .eq('client_id', sourceClientId)
    .eq('organization_id', organizationId)

  if (proposalsError) throw new Error('Erro ao transferir propostas: ' + proposalsError.message)

  // 3. Transferir Financeiro
  const { error: financeError } = await supabase
    .from('financial_transactions')
    .update({ client_id: targetClientId })
    .eq('client_id', sourceClientId)
    .eq('organization_id', organizationId)

  if (financeError) throw new Error('Erro ao transferir financeiro: ' + financeError.message)

  // 4. Deletar Cliente Original
  const { error: deleteError } = await supabase
    .from('clients')
    .delete()
    .eq('id', sourceClientId)
    .eq('organization_id', organizationId)

  if (deleteError) throw new Error('Erro ao deletar cliente original: ' + deleteError.message)

  revalidatePath('/dashboard/clients')
  revalidatePath('/projects')
  revalidatePath('/proposals')
}
