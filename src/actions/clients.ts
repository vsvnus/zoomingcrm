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
  email: string
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

export async function deleteClient(id: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // SEGURANÇA: Filtrar por organization_id para garantir isolamento multi-tenant
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting client:', error)

    // Tratamento de segurança: Impede exclusão se houver projetos vinculados
    if ((error as any).code === '23503') {
      throw new Error('Não é possível excluir: Este cliente possui Projetos vinculados. O sistema protege esses dados. \n\nSugestão: Transfira os projetos para outro cliente antes de tentar novamente.')
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
