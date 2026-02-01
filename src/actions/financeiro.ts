'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// TIPOS - SPRINT 0
// ============================================

// IMPORTANTE: Estes tipos devem corresponder exatamente aos ENUMs do PostgreSQL (UPPERCASE)
export type TransactionTypeDB = 'INITIAL_CAPITAL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type TransactionCategoryDB = 'REGISTRATION' | 'CLIENT_PAYMENT' | 'ADDITIVE' | 'OTHER_INCOME' | 'CREW_TALENT' | 'EQUIPMENT_RENTAL' | 'LOCATION' | 'LOGISTICS' | 'POST_PRODUCTION' | 'PRODUCTION' | 'OFFICE_RENT' | 'UTILITIES' | 'SOFTWARE' | 'SALARY' | 'INSURANCE' | 'MARKETING' | 'MAINTENANCE' | 'OTHER_EXPENSE'
export type PaymentStatusDB = 'PENDING' | 'SCHEDULED' | 'PAID' | 'OVERDUE' | 'CANCELLED'

// Legacy types (manter para compatibilidade)
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type PaymentStatus = 'PENDING' | 'SCHEDULED' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export type TransactionCategory =
  // Receitas
  | 'CLIENT_PAYMENT'
  | 'ADDITIVE'
  | 'OTHER_INCOME'
  // Despesas Variáveis (Projetos)
  | 'CREW_TALENT'
  | 'EQUIPMENT_RENTAL'
  | 'LOCATION'
  | 'LOGISTICS'
  | 'POST_PRODUCTION'
  | 'PRODUCTION'
  // Despesas Fixas (Empresa)
  | 'OFFICE_RENT'
  | 'UTILITIES'
  | 'SOFTWARE'
  | 'SALARY'
  | 'INSURANCE'
  | 'MARKETING'
  | 'MAINTENANCE'
  | 'OTHER_EXPENSE'

export interface Transaction {
  id?: string
  organization_id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  estimated_amount?: number
  status?: PaymentStatus
  due_date?: string
  payment_date?: string
  payment_method?: string
  project_id?: string
  proposal_id?: string
  client_id?: string
  freelancer_id?: string
  equipment_id?: string
  invoice_number?: string
  notes?: string
  created_by?: string
}

// ============================================
// ACTIONS
// ============================================

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

  return data
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
export async function getCurrentBalance(organizationId: string): Promise<number> {
  const supabase = await createClient()

  try {
    // Buscar capital inicial (INITIAL_CAPITAL com status PAID)
    const { data: capitalData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('organization_id', organizationId)
      .eq('type', 'INITIAL_CAPITAL')
      .eq('status', 'PAID')
      .single()

    const capitalInicial = Number(capitalData?.amount || 0)

    // Buscar total de receitas confirmadas (INCOME com status PAID)
    const { data: receitasData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('organization_id', organizationId)
      .eq('type', 'INCOME')
      .eq('status', 'PAID')

    const totalReceitas = receitasData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

    // Buscar total de despesas confirmadas (EXPENSE com status PAID)
    const { data: despesasData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('organization_id', organizationId)
      .eq('type', 'EXPENSE')
      .eq('status', 'PAID')

    const totalDespesas = despesasData?.reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0) || 0

    // Calcular saldo: Capital Inicial + Receitas - Despesas
    const saldoAtual = capitalInicial + totalReceitas - totalDespesas

    return saldoAtual
  } catch (error) {
    console.error('Error calculating current balance:', error)
    return 0
  }
}

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
}
