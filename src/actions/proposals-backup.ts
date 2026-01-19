'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProposals() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(id, name, company)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }

  return data || []
}

export async function addProposal(formData: {
  title: string
  client_id: string
  base_value: number
  discount?: number
}) {
  const supabase = await createClient()

  const organizationId = 'org_demo'

  // Gerar token único para a proposta
  const token = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Calcular valor total
  const discount = formData.discount || 0
  const total_value = formData.base_value - discount

  const { data, error } = await supabase
    .from('proposals')
    .insert([
      {
        token,
        title: formData.title,
        client_id: formData.client_id,
        organization_id: organizationId,
        base_value: formData.base_value,
        discount,
        total_value,
        status: 'DRAFT',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating proposal:', error)
    throw new Error('Erro ao criar proposta')
  }

  revalidatePath('/proposals')
  return data
}

/**
 * Aprovar proposta
 * IMPORTANTE: Ao aprovar, o trigger SQL criará automaticamente
 * uma receita em financial_transactions
 */
export async function approveProposal(proposalId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', proposalId)
    .select('*, clients(id, name, company)')
    .single()

  if (error) {
    console.error('Error approving proposal:', error)
    throw new Error('Erro ao aprovar proposta: ' + error.message)
  }

  revalidatePath('/proposals')
  revalidatePath('/financeiro')
  return data
}

/**
 * Rejeitar proposta
 */
export async function rejectProposal(proposalId: string, reason?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'REJECTED',
      notes: reason,
    })
    .eq('id', proposalId)
    .select('*, clients(id, name, company)')
    .single()

  if (error) {
    console.error('Error rejecting proposal:', error)
    throw new Error('Erro ao rejeitar proposta: ' + error.message)
  }

  revalidatePath('/proposals')
  return data
}

/**
 * Enviar proposta para cliente
 */
export async function sendProposal(proposalId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'SENT',
    })
    .eq('id', proposalId)
    .select('*, clients(id, name, company)')
    .single()

  if (error) {
    console.error('Error sending proposal:', error)
    throw new Error('Erro ao enviar proposta: ' + error.message)
  }

  revalidatePath('/proposals')
  return data
}

/**
 * Buscar proposta por ID
 */
export async function getProposal(proposalId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(id, name, company, email, phone)')
    .eq('id', proposalId)
    .single()

  if (error) {
    console.error('Error fetching proposal:', error)
    return null
  }

  return data
}

/**
 * Atualizar proposta
 */
export async function updateProposal(
  proposalId: string,
  formData: {
    title?: string
    description?: string
    base_value?: number
    discount?: number
    valid_until?: string
  }
) {
  const supabase = await createClient()

  // Recalcular total_value se base_value ou discount mudaram
  let updateData: any = { ...formData }

  if (formData.base_value !== undefined || formData.discount !== undefined) {
    // Buscar valores atuais
    const { data: current } = await supabase
      .from('proposals')
      .select('base_value, discount')
      .eq('id', proposalId)
      .single()

    const base_value = formData.base_value ?? current?.base_value ?? 0
    const discount = formData.discount ?? current?.discount ?? 0
    updateData.total_value = base_value - discount
  }

  const { data, error } = await supabase
    .from('proposals')
    .update(updateData)
    .eq('id', proposalId)
    .select('*, clients(id, name, company)')
    .single()

  if (error) {
    console.error('Error updating proposal:', error)
    throw new Error('Erro ao atualizar proposta: ' + error.message)
  }

  revalidatePath('/proposals')
  return data
}

/**
 * Deletar proposta
 * ATENÇÃO: Propostas aprovadas não podem ser deletadas (constraint no banco)
 */
export async function deleteProposal(proposalId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('proposals').delete().eq('id', proposalId)

  if (error) {
    console.error('Error deleting proposal:', error)
    throw new Error('Erro ao deletar proposta: ' + error.message)
  }

  revalidatePath('/proposals')
}
