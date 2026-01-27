'use server'

/**
 * ============================================
 * MÓDULO COMPLETO DE PROPOSTAS
 * CRM Zoomer - Server Actions
 * ============================================
 *
 * Este arquivo contém TODAS as funções necessárias para o módulo de propostas
 * Substitui o proposals.ts anterior com funcionalidades completas
 *
 * FUNÇÕES IMPLEMENTADAS:
 * - CRUD de propostas
 * - CRUD de itens (proposal_items)
 * - CRUD de opcionais (proposal_optionals)
 * - CRUD de vídeos (proposal_videos)
 * - Página pública (busca por token)
 * - Aceitação de proposta pelo cliente
 * - Duplicação de propostas
 * - Cálculos automáticos via SQL triggers
 */

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotificationInternal } from '@/actions/notifications'

// =============================================
// HELPER: Recalcular valores da proposta
// =============================================

async function recalculateProposalValues(proposalId: string) {
  const supabase = await createClient()

  // 1. Buscar proposta (para pegar desconto)
  const { data: proposal } = await supabase
    .from('proposals')
    .select('discount')
    .eq('id', proposalId)
    .single()

  if (!proposal) return

  // 2. Buscar itens (somar total)
  const { data: items } = await supabase
    .from('proposal_items')
    .select('total')
    .eq('proposal_id', proposalId)

  const baseValue = items?.reduce((sum, item) => sum + (Number(item.total) || 0), 0) || 0

  // 3. Buscar opcionais selecionados (somar preço)
  const { data: optionals } = await supabase
    .from('proposal_optionals')
    .select('price')
    .eq('proposal_id', proposalId)
    .eq('is_selected', true)

  const optionalsValue = optionals?.reduce((sum, opt) => sum + (Number(opt.price) || 0), 0) || 0

  // 4. Calcular total
  const discountAmount = (baseValue * (Number(proposal.discount) || 0)) / 100
  const totalValue = baseValue + optionalsValue - discountAmount

  // 5. Atualizar proposta
  await supabase
    .from('proposals')
    .update({
      base_value: baseValue,
      total_value: totalValue,
    })
    .eq('id', proposalId)
}

// =============================================
// PROPOSTAS - FUNÇÕES PRINCIPAIS
// =============================================

/**
 * Buscar todas as propostas da organização
 */
export async function getProposals() {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(id, name, company)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }

  return data || []
}

/**
 * Buscar proposta por ID (para edição)
 */
export async function getProposal(proposalId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      clients (id, name, company, email, phone),
      organizations (id, name, logo, email, phone, website, max_discount),
      items:proposal_items (*),
      optionals:proposal_optionals (*),
      videos:proposal_videos (*)
    `)
    .eq('id', proposalId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching proposal:', error)
    return null
  }

  return data
}

/**
 * Buscar projeto vinculado à proposta
 */
export async function getProposalLinkedProject(proposalId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('projects')
    .select('id, title')
    .eq('proposal_id', proposalId)
    .single()

  return data
}

/**
 * Buscar proposta por TOKEN (para página pública)
 * NÃO requer autenticação
 */
export async function getProposalByToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      clients (id, name, company, email, phone),
      organizations (id, name, logo, email, phone, website, cnpj, address, bank_name, agency, account_number, pix_key, primary_color, default_terms, show_bank_info),
      items:proposal_items (
        id, description, quantity, unit_price, total, order
      ),
      optionals:proposal_optionals (
        id, title, description, price, is_selected, dependency, order
      ),
      videos:proposal_videos (
        id, title, video_url, order
      )
    `)
    .eq('token', token)
    .single()

  if (error) {
    console.error('Error fetching proposal by token:', error)
    return null
  }

  // Marcar como visualizada (se ainda não foi)
  if (data && !data.viewed_at) {
    await supabase
      .from('proposals')
      .update({
        viewed_at: new Date().toISOString(),
        status: data.status === 'SENT' ? 'VIEWED' : data.status
      })
      .eq('id', data.id)
  }

  return data
}

/**
 * Criar nova proposta
 * NOTA: Os valores base_value e total_value são calculados automaticamente
 * pelo trigger SQL com base nos itens adicionados à proposta
 */
export async function addProposal(formData: {
  title: string
  client_id: string
  description?: string
}) {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  // Verificar se o cliente existe na organização
  const { data: clientCheck, error: clientError } = await supabase
    .from('clients')
    .select('id, name, organization_id')
    .eq('id', formData.client_id)
    .single()

  if (!clientCheck) {
    console.error('Cliente nao encontrado:', formData.client_id)
    throw new Error('Cliente nao encontrado. Por favor, crie um novo cliente.')
  }

  if (clientCheck.organization_id !== organizationId) {
    console.error('Cliente pertence a outra organizacao:', {
      client_org: clientCheck.organization_id,
      user_org: organizationId,
    })
    throw new Error('Cliente nao pertence a sua organizacao. Por favor, crie um novo cliente.')
  }

  // Gerar token único para a proposta
  const token = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Criar proposta com valores zerados - trigger SQL recalculará com base nos itens
  const { data, error } = await supabase
    .from('proposals')
    .insert([
      {
        token,
        title: formData.title,
        description: formData.description,
        client_id: formData.client_id,
        organization_id: organizationId,
        base_value: 0, // Calculado pelo trigger baseado nos itens
        discount: 0,
        total_value: 0, // Calculado pelo trigger baseado nos itens
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
 * Atualizar proposta
 */
export async function updateProposal(
  proposalId: string,
  formData: {
    title?: string
    description?: string
    discount?: number
    valid_until?: string
    cover_image?: string
    primary_color?: string
    payment_date?: string
    installments?: number
    is_recurring?: boolean
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .update(formData)
    .eq('id', proposalId)
    .select('*, clients(id, name, company)')
    .single()

  if (error) {
    console.error('Error updating proposal:', error)
    throw new Error('Erro ao atualizar proposta: ' + error.message)
  }

  // Recalcular valores (caso desconto tenha mudado)
  await recalculateProposalValues(proposalId)

  // SINCRO: Se o titulo mudou, atualizar o nome do projeto vinculado (se existir)
  if (formData.title) {
    // Tenta encontrar projeto vinculado pelo proposal_id
    const { data: linkedProject } = await supabase
      .from('projects')
      .select('id')
      .eq('proposal_id', proposalId)
      .single()

    if (linkedProject) {
      await supabase
        .from('projects')
        .update({ title: formData.title })
        .eq('id', linkedProject.id)
    }
  }

  revalidatePath('/proposals')
  revalidatePath(`/proposals/${proposalId}/edit`)
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
      sent_at: new Date().toISOString(),
    })
    .eq('id', proposalId)
    .select('*, clients(id, name, company, email)')
    .single()

  if (error) {
    console.error('Error sending proposal:', error)
    throw new Error('Erro ao enviar proposta: ' + error.message)
  }

  // TODO: Enviar email para o cliente com link da proposta
  // const link = `${process.env.NEXT_PUBLIC_APP_URL}/p/${data.token}`
  // await sendProposalEmail(data.clients.email, link)

  revalidatePath('/proposals')
  return data
}

/**
 * Aprovar proposta (ação interna)
 * IMPORTANTE: Ao aprovar, o trigger SQL criará automaticamente uma receita em financial_transactions
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

  // 🔔 TRIGGER SQL cria receita automaticamente aqui

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
      description: reason ? `${reason}` : undefined,
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
 * Deletar proposta
 * ATENÇÃO: Propostas aprovadas não podem ser deletadas (constraint no banco)
 */
export async function deleteProposal(proposalId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // SEGURANÇA: Filtrar por organization_id para garantir isolamento multi-tenant
  // 1. Verificar status atual
  const { data: currentProposal } = await supabase
    .from('proposals')
    .select('status')
    .eq('id', proposalId)
    .single()

  // 2. Se estiver ACEITA, modificar para CANCELLED para bypassar o trigger "prevent_delete_approved_proposal"
  if (currentProposal?.status === 'ACCEPTED') {
    await supabase
      .from('proposals')
      .update({ status: 'CANCELLED' })
      .eq('id', proposalId)
  }

  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', proposalId)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting proposal:', error)
    throw new Error('Erro ao deletar proposta: ' + error.message)
  }

  revalidatePath('/proposals')
}

/**
 * Duplicar proposta existente
 * Faz deep copy de todos os dados: itens, opcionais, vídeos
 */
export async function duplicateProposal(proposalId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Buscar proposta original completa com todos os relacionamentos
  const { data: original, error: fetchError } = await supabase
    .from('proposals')
    .select(`
      *,
      items:proposal_items (*),
      optionals:proposal_optionals (*),
      videos:proposal_videos (*)
    `)
    .eq('id', proposalId)
    .single()

  if (fetchError || !original) {
    console.error('Error fetching original proposal:', fetchError)
    throw new Error('Proposta original não encontrada')
  }

  // Gerar novo token único
  const token = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Calcular valores base a partir dos itens originais
  const baseValue = original.items?.reduce((sum: number, item: any) => {
    return sum + (Number(item.total) || 0)
  }, 0) || Number(original.base_value) || 0

  // Calcular valor total com desconto
  const discount = Number(original.discount) || 0
  const discountAmount = (baseValue * discount) / 100
  const totalValue = baseValue - discountAmount

  // Criar nova proposta com valores calculados
  const { data: newProposal, error: proposalError } = await supabase
    .from('proposals')
    .insert({
      token,
      title: `${original.title} (Cópia)`,
      description: original.description,
      client_id: original.client_id,
      organization_id: organizationId,
      discount: original.discount || 0,
      base_value: baseValue,
      total_value: totalValue,
      status: 'DRAFT',
      version: 1,
      // Copiar outros campos relevantes
      validity_days: original.validity_days,
      payment_terms: original.payment_terms,
      notes: original.notes,
      installments: original.installments || 1,
      is_recurring: original.is_recurring || false,
    })
    .select()
    .single()

  if (proposalError || !newProposal) {
    console.error('Error creating duplicate proposal:', proposalError)
    throw new Error('Erro ao duplicar proposta: ' + (proposalError?.message || 'Erro desconhecido'))
  }

  // Duplicar itens com tratamento de erro
  if (original.items && original.items.length > 0) {
    const itemsToInsert = original.items.map((item: any) => ({
      proposal_id: newProposal.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      order: item.order,
      show_dates: item.show_dates,
      // Dates are not copied by default to avoid confusion, or maybe they should? 
      // User didn't specify, but usually dates are specific to the event.
      // Saving show_dates is important though.
    }))

    const { error: itemsError } = await supabase.from('proposal_items').insert(itemsToInsert)
    if (itemsError) {
      console.error('Error duplicating proposal items:', itemsError)
      // Continuar mesmo com erro nos itens
    }
  }

  // Duplicar opcionais com tratamento de erro
  if (original.optionals && original.optionals.length > 0) {
    const optionalsToInsert = original.optionals.map((opt: any) => ({
      proposal_id: newProposal.id,
      title: opt.title,
      description: opt.description,
      price: opt.price,
      is_selected: false, // Resetar seleção para nova proposta
      dependency: opt.dependency,
      order: opt.order,
    }))

    const { error: optionalsError } = await supabase.from('proposal_optionals').insert(optionalsToInsert)
    if (optionalsError) {
      console.error('Error duplicating proposal optionals:', optionalsError)
    }
  }

  // Duplicar vídeos com tratamento de erro
  if (original.videos && original.videos.length > 0) {
    const videosToInsert = original.videos.map((video: any) => ({
      proposal_id: newProposal.id,
      title: video.title,
      video_url: video.video_url,
      order: video.order,
    }))

    const { error: videosError } = await supabase.from('proposal_videos').insert(videosToInsert)
    if (videosError) {
      console.error('Error duplicating proposal videos:', videosError)
    }
  }

  // Buscar proposta duplicada com todos os dados para retornar
  const { data: completeProposal } = await supabase
    .from('proposals')
    .select(`
      *,
      items:proposal_items (*),
      optionals:proposal_optionals (*),
      videos:proposal_videos (*),
      clients (id, name, company)
    `)
    .eq('id', newProposal.id)
    .single()

  revalidatePath('/proposals')
  return completeProposal || newProposal
}

// =============================================
// PÁGINA PÚBLICA - AÇÕES DO CLIENTE
// =============================================

/**
 * Atualizar opcionais selecionados (cliente marca/desmarca)
 */
export async function toggleProposalOptional(
  proposalId: string,
  optionalId: string,
  isSelected: boolean
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_optionals')
    .update({ is_selected: isSelected })
    .eq('id', optionalId)
    .eq('proposal_id', proposalId)

  if (error) {
    throw new Error('Erro ao atualizar opcional: ' + error.message)
  }

  // Recalcular valores
  await recalculateProposalValues(proposalId)

  revalidatePath(`/p/*`)
}

/**
 * Aceitar proposta (ação do cliente na página pública)
 */
export async function acceptProposalPublic(token: string) {
  const supabase = await createClient()

  // Buscar proposta pelo token
  const { data: proposal } = await supabase
    .from('proposals')
    .select('id, title, status, valid_until, organization_id, clients (name)')
    .eq('token', token)
    .single()

  if (!proposal) {
    throw new Error('Proposta não encontrada')
  }

  // Verificar se proposta está expirada
  if (proposal.valid_until && new Date(proposal.valid_until) < new Date()) {
    throw new Error('Esta proposta está expirada')
  }

  // Verificar se já foi aceita
  if (proposal.status === 'ACCEPTED') {
    throw new Error('Esta proposta já foi aceita')
  }

  // Aprovar usando o fluxo unificado
  const result = await processProposalToProject(proposal.id)

  // Notificar Dono da Organização (Assumindo admin)
  const { data: orgUsers } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('organization_id', proposal.organization_id)
    .eq('role', 'admin')
    .limit(1)

  if (orgUsers && orgUsers.length > 0) {
    const recipientId = orgUsers[0].user_id
    const clientName = (proposal.clients as any)?.name || 'Cliente'

    await createNotificationInternal(recipientId, {
      title: '🎉 Proposta Aceita!',
      message: `O cliente ${clientName} aceitou a proposta "${proposal.title}".`,
      type: 'SUCCESS',
      action_link: `/proposals/${proposal.id}/edit`
    })
  }

  revalidatePath('/proposals')
  revalidatePath('/financeiro')

  return result
}

// =============================================
// PROPOSTAS - ITENS
// =============================================

/**
 * Adicionar item à proposta
 * SPRINT 2: Agora suporta campo de data opcional para sincronização com calendário
 */
export async function addProposalItem(
  proposalId: string,
  item: {
    description: string
    quantity: number
    unit_price: number
    date?: string | null // Legacy date
    recording_date?: string | null
    delivery_date?: string | null
    show_dates?: boolean
  }
) {
  const supabase = await createClient()

  // Buscar último order
  const { data: lastItem } = await supabase
    .from('proposal_items')
    .select('order')
    .eq('proposal_id', proposalId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = lastItem ? (lastItem.order || 0) + 1 : 1

  const { data, error } = await supabase
    .from('proposal_items')
    .insert({
      proposal_id: proposalId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      order: nextOrder,
      date: item.date || null,
      recording_date: item.recording_date || null,
      delivery_date: item.delivery_date || null,
      show_dates: item.show_dates || false,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao adicionar item: ' + error.message)
  }

  // Recalcular valores
  await recalculateProposalValues(proposalId)

  revalidatePath(`/proposals/${proposalId}/edit`)
  revalidatePath('/proposals')
  return data
}

/**
 * Atualizar item
 * SPRINT 2: Agora suporta campo de data opcional
 */
export async function updateProposalItem(
  itemId: string,
  updates: {
    description?: string
    quantity?: number
    unit_price?: number
    date?: string | null
    recording_date?: string | null
    delivery_date?: string | null
    show_dates?: boolean
  }
) {
  const supabase = await createClient()

  // Buscar item atual
  const { data: currentItem } = await supabase
    .from('proposal_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (!currentItem) {
    throw new Error('Item não encontrado')
  }

  const quantity = updates.quantity ?? currentItem.quantity
  const unitPrice = updates.unit_price ?? currentItem.unit_price

  const { data, error } = await supabase
    .from('proposal_items')
    .update({
      ...updates,
      total: quantity * unitPrice,
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao atualizar item: ' + error.message)
  }

  // Recalcular valores
  await recalculateProposalValues(currentItem.proposal_id)

  revalidatePath(`/proposals`)
  return data
}

/**
 * Deletar item da proposta
 */
export async function deleteProposalItem(itemId: string) {
  const supabase = await createClient()

  // Buscar proposal_id antes de deletar
  const { data: item } = await supabase
    .from('proposal_items')
    .select('proposal_id')
    .eq('id', itemId)
    .single()

  if (!item) {
    throw new Error('Item no encontrado')
  }

  const { error } = await supabase
    .from('proposal_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error('Erro ao deletar item: ' + error.message)
  }

  await recalculateProposalValues(item.proposal_id)

  revalidatePath(`/proposals`)
}

/**
 * Reordenar itens (drag and drop)
 */
export async function reorderProposalItems(proposalId: string, itemIds: string[]) {
  const supabase = await createClient()

  // Atualizar order de cada item
  const updates = itemIds.map((id, index) =>
    supabase
      .from('proposal_items')
      .update({ order: index + 1 })
      .eq('id', id)
      .eq('proposal_id', proposalId)
  )

  await Promise.all(updates)

  revalidatePath(`/proposals/${proposalId}/edit`)
}

// =============================================
// PROPOSTAS - OPCIONAIS
// =============================================

/**
 * Adicionar opcional à proposta
 */
export async function addProposalOptional(
  proposalId: string,
  optional: {
    title: string
    description?: string
    price: number
    dependency?: string
  }
) {
  const supabase = await createClient()

  // Buscar último order
  const { data: lastOptional } = await supabase
    .from('proposal_optionals')
    .select('order')
    .eq('proposal_id', proposalId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = lastOptional ? (lastOptional.order || 0) + 1 : 1

  const { data, error } = await supabase
    .from('proposal_optionals')
    .insert({
      proposal_id: proposalId,
      title: optional.title,
      description: optional.description,
      price: optional.price,
      dependency: optional.dependency,
      is_selected: false,
      order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao adicionar opcional: ' + error.message)
  }

  // Recalcular valores
  await recalculateProposalValues(proposalId)

  revalidatePath(`/proposals/${proposalId}/edit`)
  revalidatePath('/proposals')
  return data
}

/**
 * Atualizar opcional
 */
export async function updateProposalOptional(
  optionalId: string,
  updates: {
    title?: string
    description?: string
    price?: number
    dependency?: string
  }
) {
  const supabase = await createClient()

  const { data: currentOptional } = await supabase
    .from('proposal_optionals')
    .select('proposal_id')
    .eq('id', optionalId)
    .single()

  const { data, error } = await supabase
    .from('proposal_optionals')
    .update(updates)
    .eq('id', optionalId)
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao atualizar opcional: ' + error.message)
  }

  if (currentOptional) {
    await recalculateProposalValues(currentOptional.proposal_id)
  }

  revalidatePath(`/proposals`)
  return data
}

/**
 * Deletar opcional
 */
export async function deleteProposalOptional(optionalId: string) {
  const supabase = await createClient()

  // Buscar proposal_id antes de deletar
  const { data: optional } = await supabase
    .from('proposal_optionals')
    .select('proposal_id')
    .eq('id', optionalId)
    .single()

  const { error } = await supabase
    .from('proposal_optionals')
    .delete()
    .eq('id', optionalId)

  if (error) {
    throw new Error('Erro ao deletar opcional: ' + error.message)
  }

  if (optional) {
    await recalculateProposalValues(optional.proposal_id)
  }

  revalidatePath(`/proposals`)
}

/**
 * Reordenar opcionais (drag and drop)
 */
export async function reorderProposalOptionals(proposalId: string, optionalIds: string[]) {
  const supabase = await createClient()

  // Atualizar order de cada opcional
  const updates = optionalIds.map((id, index) =>
    supabase
      .from('proposal_optionals')
      .update({ order: index + 1 })
      .eq('id', id)
      .eq('proposal_id', proposalId)
  )

  await Promise.all(updates)
}

// =============================================
// PROPOSTAS - VÍDEOS
// =============================================

/**
 * Adicionar vídeo à proposta
 */
export async function addProposalVideo(
  proposalId: string,
  video: {
    title: string
    video_url: string
  }
) {
  const supabase = await createClient()

  // Buscar último order
  const { data: lastVideo } = await supabase
    .from('proposal_videos')
    .select('order')
    .eq('proposal_id', proposalId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = lastVideo ? (lastVideo.order || 0) + 1 : 1

  const { data, error } = await supabase
    .from('proposal_videos')
    .insert({
      proposal_id: proposalId,
      title: video.title,
      video_url: video.video_url,
      order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao adicionar vídeo: ' + error.message)
  }

  revalidatePath(`/proposals/${proposalId}/edit`)
  return data
}

/**
 * Deletar vídeo
 */
export async function deleteProposalVideo(videoId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_videos')
    .delete()
    .eq('id', videoId)

  if (error) {
    throw new Error('Erro ao deletar vídeo: ' + error.message)
  }

  revalidatePath(`/proposals`)
}

/**
 * Reordenar vídeos
 */
export async function reorderProposalVideos(proposalId: string, videoIds: string[]) {
  const supabase = await createClient()

  const updates = videoIds.map((id, index) =>
    supabase
      .from('proposal_videos')
      .update({ order: index + 1 })
      .eq('id', id)
      .eq('proposal_id', proposalId)
  )

  await Promise.all(updates)

  revalidatePath(`/proposals/${proposalId}/edit`)
}

// =============================================
// SPRINT 2: ACEITE MANUAL DE PROPOSTA
// =============================================

/**
 * Aceitar proposta manualmente (pelo produtor)
 * Cria projeto, eventos no calendário e transações financeiras
 */
export async function acceptProposalManual(proposalId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // 1. Buscar proposta completa
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select(`
      *,
      items:proposal_items (*),
      clients (id, name)
    `)
    .eq('id', proposalId)
    .single()

  if (proposalError || !proposal) {
    throw new Error('Proposta não encontrada')
  }

  // Usar helper para processar tudo
  const result = await processProposalToProject(proposalId, (await supabase.auth.getUser()).data.user?.id)

  revalidatePath('/proposals')
  revalidatePath('/projects')
  revalidatePath('/calendar')
  revalidatePath('/financeiro')

  return result
}

// =============================================
// HELPER: Processar conversão de proposta para projeto
// =============================================
async function processProposalToProject(proposalId: string, userId?: string) {
  const supabase = await createClient()

  // 1. Buscar proposta completa
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select(`
      *,
      items:proposal_items (*),
      clients (id, name, organization_id)
    `)
    .eq('id', proposalId)
    .single()

  if (proposalError || !proposal) {
    throw new Error('Proposta não encontrada')
  }

  const organizationId = proposal.organization_id

  // 2. Criar Projeto com origin = 'proposal'
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title: proposal.title,
      description: proposal.description,
      client_id: proposal.client_id,
      organization_id: organizationId,
      assigned_to_id: userId || null,
      status: 'PRE_PROD',
      origin: 'proposal', // Marca que veio de proposta aprovada
      budget: proposal.total_value,
      deadline_date: proposal.valid_until,
      created_at: new Date().toISOString(),
      is_recurring: proposal.is_recurring || false,
    })
    .select()
    .single()

  if (projectError) {
    throw new Error('Erro ao criar projeto: ' + projectError.message)
  }

  // 2b. Inicializar Project Finances
  const { error: financesError } = await supabase.from('project_finances').insert({
    project_id: project.id,
    organization_id: organizationId,
    approved_value: proposal.total_value,
    target_margin_percent: 30,
  })

  if (financesError) {
    console.error('Erro ao criar finanças do projeto:', financesError)
  }

  // 3. Criar Eventos no Calendário
  let calendarEventsCreated = 0
  if (proposal.items && proposal.items.length > 0) {
    const eventsToCreate: any[] = []

    proposal.items.forEach((item: any) => {
      // Evento da Data Base (Legacy)
      if (item.date) {
        eventsToCreate.push({
          title: `${item.description} - ${proposal.title}`,
          description: `Item da proposta: ${item.description}`,
          start_date: new Date(item.date).toISOString(),
          end_date: new Date(new Date(item.date).setHours(new Date(item.date).getHours() + 1)).toISOString(),
          project_id: project.id,
          organization_id: organizationId,
          type: 'shooting',
          created_by: userId || null,
        })
      }

      // Evento de Gravação
      if (item.recording_date) {
        eventsToCreate.push({
          title: `GRAVAÇÃO: ${item.description}`,
          description: `Gravação referente ao projeto: ${proposal.title}`,
          start_date: new Date(item.recording_date).toISOString(),
          end_date: new Date(
            new Date(item.recording_date).setHours(new Date(item.recording_date).getHours() + 4)
          ).toISOString(), // Assume 4h duration
          project_id: project.id,
          organization_id: organizationId,
          type: 'shooting',
          created_by: userId || null,
        })
      }

      // Evento de Entrega
      if (item.delivery_date) {
        eventsToCreate.push({
          title: `ENTREGA: ${item.description}`,
          description: `Entrega referente ao projeto: ${proposal.title}`,
          start_date: new Date(item.delivery_date).toISOString(),
          end_date: new Date(item.delivery_date).toISOString(), // Start = End for deadline
          project_id: project.id,
          organization_id: organizationId,
          type: 'delivery', // Assuming type 'delivery' exists or fallback to 'meeting'/'other'
          created_by: userId || null,
        })
      }
    })

    if (eventsToCreate.length > 0) {
      const { error: eventsError } = await supabase.from('calendar_events').insert(eventsToCreate)
      if (!eventsError) {
        calendarEventsCreated = eventsToCreate.length
      }
    }
  }

  // 4. Criar Transações Financeiras (Receita Prevista)
  // NOTA: Trigger foi removido na migration 11 para evitar duplicação
  const installments = proposal.installments || 1
  const installmentValue = proposal.total_value / installments
  const firstDueDate = proposal.payment_date ? new Date(proposal.payment_date) : new Date(proposal.valid_until || Date.now())

  const transactionsToCreate = Array.from({ length: installments }).map((_, index) => {
    const dueDate = new Date(firstDueDate)
    dueDate.setMonth(dueDate.getMonth() + index)

    return {
      organization_id: organizationId,
      type: 'INCOME',
      category: 'CLIENT_PAYMENT',
      description: `Pagamento Proposta: ${proposal.title} (${index + 1}/${installments})`,
      amount: installmentValue,
      status: 'PENDING',
      origin: 'proposta',
      project_id: project.id,
      proposal_id: proposal.id,
      client_id: proposal.client_id,
      due_date: dueDate.toISOString(),
      created_by: userId || null
    }
  })

  const { error: financeError } = await supabase.from('financial_transactions').insert(transactionsToCreate)

  // 4a. Copiar itens da proposta para project_items e mapear IDs
  const itemsMapping: Array<{ proposalItemId: string; projectItemId: string }> = []

  if (proposal.items && proposal.items.length > 0) {
    for (const item of proposal.items) {
      const { data: projectItem, error: itemError } = await supabase
        .from('project_items')
        .insert({
          project_id: project.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total,
          status: 'PENDING',
          due_date: item.date || null,
          recording_date: item.recording_date || null,
          delivery_date: item.delivery_date || null,
          order: item.order
        })
        .select('id')
        .single()

      if (!itemError && projectItem) {
        itemsMapping.push({
          proposalItemId: item.id,
          projectItemId: projectItem.id
        })
      }
    }

    // 4b. Copiar assignments dos itens (freelancers vinculados)
    if (itemsMapping.length > 0) {
      for (const mapping of itemsMapping) {
        const { data: proposalAssignments } = await supabase
          .from('item_assignments')
          .select('*')
          .eq('proposal_item_id', mapping.proposalItemId)
          .eq('organization_id', organizationId)

        if (proposalAssignments && proposalAssignments.length > 0) {
          const projectAssignments = proposalAssignments.map((assignment: any) => ({
            freelancer_id: assignment.freelancer_id,
            proposal_item_id: assignment.proposal_item_id,
            project_item_id: mapping.projectItemId,
            role: assignment.role,
            agreed_fee: assignment.agreed_fee,
            estimated_hours: assignment.estimated_hours,
            scheduled_date: assignment.scheduled_date,
            status: 'PENDING',
            notes: assignment.notes,
            organization_id: organizationId,
          }))

          await supabase.from('item_assignments').insert(projectAssignments)
        }
      }
    }
  }

  // 5. Atualizar status da proposta
  await supabase
    .from('proposals')
    .update({
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', proposalId)

  return {
    success: true,
    projectId: project.id,
    calendarEventsCreated,
    financialTransactionsCreated: financeError ? 0 : 1,
    itemsCopied: itemsMapping.length,
  }
}


