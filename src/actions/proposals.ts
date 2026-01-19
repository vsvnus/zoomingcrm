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
 * Buscar proposta por TOKEN (para página pública)
 * NÃO requer autenticação
 */
export async function getProposalByToken(token: string) {
  const supabase = await createClient()

  const { data, error} = await supabase
    .from('proposals')
    .select(`
      *,
      clients (id, name, company, email, phone),
      organizations (id, name, logo, email, phone, website),
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
 */
export async function addProposal(formData: {
  title: string
  client_id: string
  base_value?: number
  discount?: number
  description?: string
}) {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  // Gerar token único para a proposta
  const token = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Calcular valor total (será recalculado pelo trigger SQL)
  const baseValue = formData.base_value || 0
  const discount = formData.discount || 0
  const totalValue = baseValue - (baseValue * (discount / 100))

  const { data, error } = await supabase
    .from('proposals')
    .insert([
      {
        token,
        title: formData.title,
        description: formData.description,
        client_id: formData.client_id,
        organization_id: organizationId,
        base_value: baseValue,
        discount,
        total_value: totalValue,
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
 */
export async function duplicateProposal(proposalId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Buscar proposta original completa
  const { data: original } = await supabase
    .from('proposals')
    .select(`
      *,
      items:proposal_items (*),
      optionals:proposal_optionals (*),
      videos:proposal_videos (*)
    `)
    .eq('id', proposalId)
    .single()

  if (!original) {
    throw new Error('Proposta original não encontrada')
  }

  // Gerar novo token
  const token = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Criar nova proposta
  const { data: newProposal, error: proposalError } = await supabase
    .from('proposals')
    .insert({
      token,
      title: `${original.title} (Cópia)`,
      description: original.description,
      client_id: original.client_id,
      organization_id: organizationId,
      discount: original.discount,
      base_value: 0, // Será recalculado pelos itens
      total_value: 0, // Será recalculado pelo trigger
      status: 'DRAFT',
      version: 1,
    })
    .select()
    .single()

  if (proposalError) {
    throw new Error('Erro ao duplicar proposta: ' + proposalError.message)
  }

  // Duplicar itens
  if (original.items && original.items.length > 0) {
    const itemsToInsert = original.items.map((item: any) => ({
      proposal_id: newProposal.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      order: item.order,
    }))

    await supabase.from('proposal_items').insert(itemsToInsert)
  }

  // Duplicar opcionais
  if (original.optionals && original.optionals.length > 0) {
    const optionalsToInsert = original.optionals.map((opt: any) => ({
      proposal_id: newProposal.id,
      title: opt.title,
      description: opt.description,
      price: opt.price,
      is_selected: false, // Resetar seleção
      dependency: opt.dependency,
      order: opt.order,
    }))

    await supabase.from('proposal_optionals').insert(optionalsToInsert)
  }

  // Duplicar vídeos
  if (original.videos && original.videos.length > 0) {
    const videosToInsert = original.videos.map((video: any) => ({
      proposal_id: newProposal.id,
      title: video.title,
      video_url: video.video_url,
      order: video.order,
    }))

    await supabase.from('proposal_videos').insert(videosToInsert)
  }

  revalidatePath('/proposals')
  return newProposal
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

  // Trigger SQL recalcula total_value automaticamente
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
    .select('id, status, valid_until')
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

  // Aprovar
  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', proposal.id)
    .select(`
      *,
      clients (id, name, email),
      organizations (id, name, email)
    `)
    .single()

  if (error) {
    throw new Error('Erro ao aceitar proposta: ' + error.message)
  }

  // 🔔 TRIGGER SQL cria receita automaticamente aqui

  // TODO: Enviar email para produtor notificando aceitação
  // await sendProposalAcceptedEmail(data.organizations.email, data.title)

  revalidatePath('/proposals')
  revalidatePath('/financeiro')

  return data
}

// =============================================
// PROPOSTAS - ITENS
// =============================================

/**
 * Adicionar item à proposta
 */
export async function addProposalItem(
  proposalId: string,
  item: {
    description: string
    quantity: number
    unit_price: number
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
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao adicionar item: ' + error.message)
  }

  // Trigger SQL recalcula total_value automaticamente
  revalidatePath(`/proposals/${proposalId}/edit`)
  revalidatePath('/proposals')
  return data
}

/**
 * Atualizar item
 */
export async function updateProposalItem(
  itemId: string,
  updates: {
    description?: string
    quantity?: number
    unit_price?: number
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

  revalidatePath(`/proposals`)
  return data
}

/**
 * Deletar item
 */
export async function deleteProposalItem(itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error('Erro ao deletar item: ' + error.message)
  }

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

  const { data, error } = await supabase
    .from('proposal_optionals')
    .update(updates)
    .eq('id', optionalId)
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao atualizar opcional: ' + error.message)
  }

  revalidatePath(`/proposals`)
  return data
}

/**
 * Deletar opcional
 */
export async function deleteProposalOptional(optionalId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_optionals')
    .delete()
    .eq('id', optionalId)

  if (error) {
    throw new Error('Erro ao deletar opcional: ' + error.message)
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

  revalidatePath(`/proposals/${proposalId}/edit`)
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
  revalidatePath('/proposals')
  return data
}

/**
 * Atualizar vídeo
 */
export async function updateProposalVideo(
  videoId: string,
  updates: {
    title?: string
    video_url?: string
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_videos')
    .update(updates)
    .eq('id', videoId)
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao atualizar vídeo: ' + error.message)
  }

  revalidatePath(`/proposals`)
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
 * Upload de vídeo para proposta
 */
export async function uploadProposalVideo(
  proposalId: string,
  data: {
    title: string
    file: File
  }
) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  try {
    // Gerar nome único para o arquivo
    const fileExt = data.file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${organizationId}/proposal-videos/${fileName}`

    // Upload do arquivo para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, data.file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error('Erro ao fazer upload do vídeo: ' + uploadError.message)
    }

    // Obter URL pública do vídeo
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    // Buscar último order
    const { data: lastVideo } = await supabase
      .from('proposal_videos')
      .select('order')
      .eq('proposal_id', proposalId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = lastVideo ? (lastVideo.order || 0) + 1 : 1

    // Adicionar registro do vídeo no banco
    const { data: videoData, error: videoError } = await supabase
      .from('proposal_videos')
      .insert({
        proposal_id: proposalId,
        title: data.title,
        video_url: publicUrl,
        order: nextOrder,
      })
      .select()
      .single()

    if (videoError) {
      // Se falhar ao criar registro, tentar remover o arquivo do storage
      await supabase.storage.from('videos').remove([filePath])
      throw new Error('Erro ao salvar vídeo: ' + videoError.message)
    }

    revalidatePath(`/proposals/${proposalId}/edit`)
    revalidatePath('/proposals')
    return videoData
  } catch (error) {
    console.error('Erro no upload do vídeo:', error)
    throw error
  }
}

/**
 * Reordenar vídeos (drag and drop)
 */
export async function reorderProposalVideos(proposalId: string, videoIds: string[]) {
  const supabase = await createClient()

  // Atualizar order de cada vídeo
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
// SPRINT 3: PAYMENT SCHEDULE
// =============================================

/**
 * Adicionar parcela ao cronograma de pagamento
 */
export async function addPaymentSchedule(proposalId: string, payment: {
  description: string
  dueDate: string
  amount: number
  percentage?: number
  order: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_schedule')
    .insert([
      {
        proposal_id: proposalId,
        description: payment.description,
        due_date: payment.dueDate,
        amount: payment.amount,
        percentage: payment.percentage,
        order: payment.order,
        paid: false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding payment schedule:', error)
    throw new Error('Erro ao adicionar parcela')
  }

  revalidatePath(`/proposals/${proposalId}`)
  return data
}

/**
 * Criar "Contas a Receber" automaticamente quando proposta é aceita
 * REGRA CRÍTICA DO SPRINT 3
 */
export async function createReceivablesFromProposal(proposalId: string) {
  const supabase = await createClient()

  // Buscar proposta e cronograma
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('*, payment_schedule(*)')
    .eq('id', proposalId)
    .single()

  if (proposalError || !proposal) {
    throw new Error('Proposta não encontrada')
  }

  if (!proposal.payment_schedule || proposal.payment_schedule.length === 0) {
    throw new Error('Proposta não possui cronograma de pagamento')
  }

  // Criar uma transação para cada parcela
  const transactions = proposal.payment_schedule.map((payment: any) => ({
    organization_id: proposal.organization_id,
    proposal_id: proposal.id,
    client_id: proposal.client_id,
    type: 'INCOME',
    category: 'CLIENT_PAYMENT',
    status: 'PENDING',
    description: `${payment.description} - ${proposal.title}`,
    amount: payment.amount,
    due_date: payment.due_date,
  }))

  const { error: transactionsError } = await supabase
    .from('financial_transactions')
    .insert(transactions)

  if (transactionsError) {
    console.error('Error creating receivables:', transactionsError)
    throw new Error('Erro ao criar contas a receber')
  }

  revalidatePath('/financeiro')
  return transactions.length
}
