'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addMonths, format } from 'date-fns'
import { validateInput, transactionSchema } from '@/lib/validations'
import type { Transaction } from '@/types/financial'
import { createNotificationInternal, getOrganizationAdmin } from '@/actions/notifications'

// ============================================
// ACTIONS
// ============================================

/**
 * Buscar overview financeiro (dashboard)
 */
/**
 * Buscar overview financeiro (dashboard)
 */
export async function getFinancialOverview() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('financial_overview')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching financial overview:', error)
    return null
  }

  // FORCE RECALCULATION OF BALANCE (Sprint Fix 3)
  // The view might be outdated or incorrect. We calculate manually.
  const realBalance = await getCurrentBalance(organizationId)

  return {
    ...data,
    current_balance: realBalance
  }
}

/**
 * Buscar contas a pagar
 */
export async function getAccountsPayable() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('accounts_payable')
    .select(`
      *,
      projects:project_id(id, title),
      freelancers:freelancer_id(id, name)
    `)
    .eq('organization_id', organizationId)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching accounts payable:', error)
    return []
  }

  return data
}

/**
 * Buscar contas a receber
 */
export async function getAccountsReceivable() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('accounts_receivable')
    .select(`
      *,
      projects:project_id(id, title),
      clients:client_id(id, name),
      proposals:proposal_id(id, title)
    `)
    .eq('organization_id', organizationId)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching accounts receivable:', error)
    return []
  }

  return data
}

/**
 * Buscar financeiro de um projeto específico
 */
export async function getProjectFinancials(projectId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('project_financials')
    .select('*')
    .eq('project_id', projectId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching project financials:', error)
    return null
  }

  return data
}

/**
 * Adicionar uma nova transação financeira
 */
export async function addTransaction(transaction: Transaction) {
  validateInput(transactionSchema, transaction)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('financial_transactions')
    .insert([
      {
        ...transaction,
        created_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding transaction:', error)
    throw new Error('Erro ao adicionar transação: ' + error.message)
  }

  // Notificação: transação de alto valor (>= R$ 5.000)
  try {
    const LARGE_TRANSACTION_THRESHOLD = 5000
    if (Number(data.amount) >= LARGE_TRANSACTION_THRESHOLD) {
      const adminId = await getOrganizationAdmin(transaction.organization_id)
      if (adminId && adminId !== user.id) {
        const amount = Number(data.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        const typeLabel = data.type === 'INCOME' ? 'Receita' : 'Despesa'
        await createNotificationInternal(adminId, {
          title: `Transação de alto valor registrada`,
          message: `${data.description} - ${amount} (${typeLabel}).`,
          type: 'WARNING',
          action_link: '/financeiro'
        })
      }
    }
  } catch (notifError) {
    console.error('Error creating large transaction notification:', notifError)
  }

  revalidatePath('/financeiro')
  return data
}

/**
 * Busca o saldo atual calculado
 */
export async function getCurrentBalance(organizationId: string): Promise<number> {
  const supabase = await createClient()

  try {
    // Buscar todas as transações PAGAS (PAID) para cálculo preciso
    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('type, amount')
      .eq('organization_id', organizationId)
      .eq('status', 'PAID')

    if (!transactions) return 0

    let saldo = 0

    transactions.forEach((t) => {
      const valor = Number(t.amount || 0)

      if (t.type === 'INITIAL_CAPITAL' || t.type === 'INCOME') {
        saldo += valor
      } else if (t.type === 'EXPENSE') {
        saldo -= Math.abs(valor) // Garantir que despesa subtraia mesmo se salva positivo
      }
      // TRANSFER: Se for relevante, adicionar lógica aqui. Por enquanto, ignora (ou assume neutro).
    })

    return saldo
  } catch (error) {
    console.error('Error calculating current balance:', error)
    return 0
  }
}

/**
 * Adicionar múltiplas transações de parcelamento
 */
export async function addInstallmentTransactions(transactions: Transaction[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const transactionsWithUser = transactions.map(t => ({
    ...t,
    created_by: user.id,
    organization_id: t.organization_id // Ensure org id is passed if not already in t
  }))

  const { data, error } = await supabase
    .from('financial_transactions')
    .insert(transactionsWithUser)
    .select()

  if (error) {
    console.error('Error adding installment transactions:', error)
    throw new Error('Erro ao adicionar parcelas: ' + error.message)
  }

  revalidatePath('/financeiro')
  return data
}

/**
 * Atualizar uma transação existente
 */
export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch current data for audit log
  const { data: oldData, error: fetchError } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError) {
    console.error('Error fetching original transaction for update:', fetchError)
    throw new Error('Erro ao buscar transação original')
  }

  // 2. Perform Update
  const { data, error } = await supabase
    .from('financial_transactions')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    throw new Error('Erro ao atualizar transação: ' + error.message)
  }

  // 3. Create Audit Log (Fire and forget or await? Await is safer)
  try {
    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      table_name: 'financial_transactions',
      record_id: id,
      action: 'UPDATE',
      old_data: oldData,
      new_data: data,
      changed_by: user?.id,
    })
  } catch (auditError) {
    console.error('Error creating audit log:', auditError)
    // Don't fail the transaction update if audit fails, but log it critical
  }

  revalidatePath('/financeiro')
  return data
}

/**
 * Marcar transação como paga
 */
export async function markAsPaid(id: string, paymentDate?: string, paymentMethod?: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('financial_transactions')
    .update({
      status: 'PAID',
      payment_date: paymentDate || new Date().toISOString().split('T')[0],
      payment_method: paymentMethod || undefined,
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error marking transaction as paid:', error)
    throw new Error('Erro ao marcar como pago: ' + error.message)
  }

  // Notificação: pagamento confirmado
  const adminId = await getOrganizationAdmin(organizationId).catch(() => null)
  try {
    if (adminId) {
      const typeLabel = data.type === 'INCOME' ? 'Recebimento' : 'Pagamento'
      const amount = Number(data.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      await createNotificationInternal(adminId, {
        title: `${typeLabel} confirmado`,
        message: `${data.description} - ${amount} marcado como pago.`,
        type: 'SUCCESS',
        action_link: '/financeiro'
      })
    }
  } catch (notifError) {
    console.error('Error creating payment notification:', notifError)
  }

  // ===========================================
  // LÓGICA DE RECORRÊNCIA AUTOMÁTICA
  // ===========================================
  try {
    const transaction = data
    if (transaction?.is_recurring && transaction?.recurrence_period === 'MONTHLY') {
      const currentDueDate = transaction.due_date ? new Date(transaction.due_date) : new Date()
      const nextDueDate = addMonths(currentDueDate, 1)

      await supabase.from('financial_transactions').insert({
        organization_id: organizationId,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        status: 'PENDING',
        due_date: format(nextDueDate, 'yyyy-MM-dd'),
        is_recurring: true,
        recurrence_period: transaction.recurrence_period,
        parent_transaction_id: transaction.parent_transaction_id || transaction.id,
        project_id: transaction.project_id,
        created_by: transaction.created_by,
        notes: transaction.notes
      })

      // Notificação: recorrência criada
      if (adminId) {
        const nextDateFormatted = format(nextDueDate, 'dd/MM/yyyy')
        await createNotificationInternal(adminId, {
          title: 'Transação recorrente criada',
          message: `Nova parcela de "${transaction.description}" criada para ${nextDateFormatted}.`,
          type: 'INFO',
          action_link: '/financeiro'
        })
      }
    }
  } catch (recError) {
    console.error('Erro ao processar recorrência:', recError)
  }

  revalidatePath('/financeiro')
  return data
}

/**
 * Cancelar uma transação
 */
export async function cancelTransaction(id: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('financial_transactions')
    .update({ status: 'CANCELLED' })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error cancelling transaction:', error)
    throw new Error('Erro ao cancelar transação: ' + error.message)
  }

  revalidatePath('/financeiro')
  return data
}

/**
 * Deletar uma transação
 */
export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { error } = await supabase
    .from('financial_transactions')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting transaction:', error)
    throw new Error('Erro ao deletar transação: ' + error.message)
  }

  revalidatePath('/financeiro')
}

// ============================================
// SPRINT 0 - CAPITAL INICIAL
// ============================================

/**
 * Cria a transação de capital inicial no cadastro
 * Esta função é chamada após o usuário informar o capital inicial
 */
export async function createInitialCapitalTransaction(
  organizationId: string,
  valor: number,
  createdBy?: string
): Promise<{
  success: boolean
  message: string
  transactionId?: string
}> {
  const supabase = await createClient()

  try {
    // Verificar se já existe capital inicial registrado
    const { data: existing } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('type', 'INITIAL_CAPITAL')
      .single()

    if (existing) {
      return {
        success: false,
        message: 'Capital inicial já foi registrado para esta organização.',
      }
    }

    // Validar valor
    if (valor < 0) {
      return {
        success: false,
        message: 'Capital inicial não pode ser negativo.',
      }
    }

    // Buscar a data da primeira transação (não-capital) para definir capital ANTES dela
    const { data: firstTransaction } = await supabase
      .from('financial_transactions')
      .select('due_date')
      .eq('organization_id', organizationId)
      .neq('type', 'INITIAL_CAPITAL')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .limit(1)
      .maybeSingle()

    let initialDate: Date
    if (firstTransaction && firstTransaction.due_date) {
      // Parse como data local para evitar problemas de timezone
      const dateStr = firstTransaction.due_date.toString().split('T')[0]
      const [y, m, d] = dateStr.split('-').map(Number)
      initialDate = new Date(y, m - 1, d - 1) // 1 dia antes da primeira transação
    } else {
      initialDate = new Date()
    }

    // Criar transação com schema correto do banco
    const { data: transaction, error: transactionError } = await supabase
      .from('financial_transactions')
      .insert([
        {
          organization_id: organizationId,
          type: 'INITIAL_CAPITAL',
          category: 'REGISTRATION',
          status: 'PAID',
          amount: valor,
          description: 'Capital inicial informado no cadastro',
          created_by: createdBy,
          due_date: initialDate.toISOString().split('T')[0],
          payment_date: initialDate.toISOString().split('T')[0],
        },
      ])
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating initial capital transaction:', transactionError)
      return {
        success: false,
        message: 'Erro ao criar transação: ' + transactionError.message,
      }
    }

    // Atualizar organização com data de definição
    const { error: orgError } = await supabase
      .from('organizations')
      .update({
        initial_capital: valor,
        initial_capital_set_at: new Date().toISOString(),
      })
      .eq('id', organizationId)

    if (orgError) {
      console.error('Error updating organization:', orgError)
      // Não falhar se a organização não for atualizada, a transação já foi criada
    }

    revalidatePath('/dashboard')
    revalidatePath('/financeiro')

    return {
      success: true,
      message: 'Capital inicial registrado com sucesso.',
      transactionId: transaction.id,
    }
  } catch (error: any) {
    console.error('Unexpected error creating initial capital:', error)
    return {
      success: false,
      message: 'Erro inesperado: ' + error.message,
    }
  }
}

/**
 * Verifica se a organização já possui capital inicial registrado
 */
export async function checkHasInitialCapital(organizationId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('financial_transactions')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('type', 'INITIAL_CAPITAL')
    .single()

  return !!data
}

/**
 * Busca o saldo atual calculado
 */
// getCurrentBalance removed (duplicate)

/**
 * Busca o resumo financeiro completo
 */
export async function getFinancialSummaryV2(organizationId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('financial_summary')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      console.error('Error fetching financial summary:', error)
      return null
    }

    return {
      organizationId: data.organization_id,
      organizationName: data.organization_name,
      initialCapital: Number(data.initial_capital || 0),
      capitalInicialTransaction: Number(data.capital_inicial_transaction || 0),
      totalReceitas: Number(data.total_receitas || 0),
      totalDespesas: Number(data.total_despesas || 0),
      receitasPendentes: Number(data.receitas_pendentes || 0),
      despesasPendentes: Number(data.despesas_pendentes || 0),
      saldoAtual: Number(data.saldo_atual || 0),
      totalReceitasCount: data.total_receitas_count || 0,
      totalDespesasCount: data.total_despesas_count || 0,
      ultimaTransacao: data.ultima_transacao,
    }
  } catch (error) {
    console.error('Error fetching financial summary:', error)
    return null
  }
}

// ============================================
// SPRINT 2: INTEGRAÇÃO FREELANCERS
// ============================================

/**
 * Cria ou atualiza transação de despesa para freelancer
 * REGRA CRÍTICA: Quando o valor do freelancer é editado no projeto,
 * deve atualizar automaticamente o "Contas a Pagar" no financeiro
 */
export async function upsertFreelancerPayable(data: {
  projectId: string
  freelancerId: string
  freelancerName: string
  amount: number
  date: string
  organizationId: string
}) {
  const supabase = await createClient()

  // Buscar se já existe uma transação para este freelancer neste projeto
  const { data: existing, error: searchError } = await supabase
    .from('financial_transactions')
    .select('id, amount')
    .eq('project_id', data.projectId)
    .eq('freelancer_id', data.freelancerId)
    .eq('organization_id', data.organizationId)
    .eq('type', 'EXPENSE')
    .single()

  if (searchError && searchError.code !== 'PGRST116') {
    // PGRST116 = not found (ok)
    console.error('Error searching freelancer transaction:', searchError)
    throw new Error('Erro ao buscar transação do freelancer')
  }

  if (existing) {
    // Atualizar transação existente
    const { error: updateError } = await supabase
      .from('financial_transactions')
      .update({
        amount: data.amount,
        due_date: data.date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .eq('organization_id', data.organizationId)

    if (updateError) {
      console.error('Error updating freelancer transaction:', updateError)
      throw new Error('Erro ao atualizar pagamento do freelancer')
    }

    revalidatePath('/financeiro')
    return { id: existing.id, updated: true }
  } else {
    // Criar nova transação
    const { data: newTransaction, error: insertError } = await supabase
      .from('financial_transactions')
      .insert([
        {
          organization_id: data.organizationId,
          project_id: data.projectId,
          freelancer_id: data.freelancerId,
          type: 'EXPENSE',
          category: 'CREW_TALENT',
          status: 'PENDING',
          description: `Pagamento freelancer: ${data.freelancerName}`,
          amount: data.amount,
          due_date: data.date,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating freelancer transaction:', insertError)
      throw new Error('Erro ao criar pagamento do freelancer')
    }

    revalidatePath('/financeiro')
    return { id: newTransaction.id, updated: false }
  }
}
/**
 * Busca contadores para os badges do menu lateral
 */
export async function getSidebarBadges() {
  try {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()
    const today = new Date().toISOString().split('T')[0]

    // Executar queries em paralelo para performance
    const [proposalsResult, projectsResult, financialResult] = await Promise.all([
      // 1. Propostas pendentes (Rascunho ou Aguardando Aprovação - status SENT)
      supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .in('status', ['DRAFT', 'SENT']),

      // 2. Projetos ativos (Em andamento - ex: não DONE nem ARCHIVED)
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .neq('status', 'DONE')
        .neq('status', 'ARCHIVED')
        .neq('status', 'REVIEW'), // Opcional: considerar REVIEW como ativo ou não? Geralmente sim. Vamos manter ativo.

      // 3. Financeiro: Contas a PAGAR vencidas
      supabase
        .from('financial_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('type', 'EXPENSE')
        .neq('status', 'PAID')
        .neq('status', 'CANCELLED')
        .lt('due_date', today)
    ])

    return {
      proposals: proposalsResult.count || 0,
      projects: projectsResult.count || 0,
      financial: financialResult.count || 0,
    }
  } catch (error) {
    // Se o usuário não tem organização configurada, retornar badges vazios
    console.error('getSidebarBadges error (user may not have organization):', error)
    return {
      proposals: 0,
      projects: 0,
      financial: 0,
    }
  }
}

// ============================================
// ALERTAS FINANCEIROS AUTOMÁTICOS
// ============================================

/**
 * Verifica transações vencidas e próximas do vencimento,
 * criando notificações com deduplicação (1 alerta por transação por dia).
 * Deve ser chamada fire-and-forget no carregamento do dashboard.
 */
export async function checkFinancialAlerts() {
  try {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const adminId = await getOrganizationAdmin(organizationId)
    if (!adminId) return

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0]

    // Buscar transações vencidas e próximas do vencimento em paralelo
    const [overdueResult, upcomingResult] = await Promise.all([
      supabase
        .from('financial_transactions')
        .select('id, description, amount, due_date, type')
        .eq('organization_id', organizationId)
        .not('status', 'in', '("PAID","CANCELLED")')
        .lt('due_date', todayStr),
      supabase
        .from('financial_transactions')
        .select('id, description, amount, due_date, type')
        .eq('organization_id', organizationId)
        .not('status', 'in', '("PAID","CANCELLED")')
        .gte('due_date', todayStr)
        .lte('due_date', threeDaysStr)
    ])

    const overdueTransactions = overdueResult.data || []
    const upcomingTransactions = upcomingResult.data || []

    if (overdueTransactions.length === 0 && upcomingTransactions.length === 0) return

    // Deduplicação: buscar notificações de alerta já criadas hoje
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('action_link')
      .eq('recipient_id', adminId)
      .like('action_link', '/financeiro/alert/%')
      .gte('created_at', todayStr)

    const existingLinks = new Set(
      (existingNotifications || []).map((n: { action_link: string | null }) => n.action_link)
    )

    // Criar alertas de transações vencidas
    for (const t of overdueTransactions) {
      const alertLink = `/financeiro/alert/${t.id}/${todayStr}`
      if (existingLinks.has(alertLink)) continue

      const amount = Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const typeLabel = t.type === 'EXPENSE' ? 'Conta a pagar' : 'Conta a receber'
      const dueDate = new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR')

      await createNotificationInternal(adminId, {
        title: `${typeLabel} vencida`,
        message: `"${t.description}" - ${amount} venceu em ${dueDate}.`,
        type: 'ERROR',
        action_link: alertLink
      })
    }

    // Criar alertas de transações próximas do vencimento
    for (const t of upcomingTransactions) {
      const alertLink = `/financeiro/alert/${t.id}/${todayStr}`
      if (existingLinks.has(alertLink)) continue

      const amount = Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const dueDate = new Date(t.due_date + 'T12:00:00')
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const dueLabel = diffDays === 0 ? 'vence hoje' :
                       diffDays === 1 ? 'vence amanhã' :
                       `vence em ${diffDays} dias`
      const typeLabel = t.type === 'EXPENSE' ? 'Conta a pagar' : 'Conta a receber'

      await createNotificationInternal(adminId, {
        title: `${typeLabel} ${dueLabel}`,
        message: `"${t.description}" - ${amount} (${dueDate.toLocaleDateString('pt-BR')}).`,
        type: 'WARNING',
        action_link: alertLink
      })
    }
  } catch (error) {
    console.error('Error checking financial alerts:', error)
  }
}
