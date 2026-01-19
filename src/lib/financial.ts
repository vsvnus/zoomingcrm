/**
 * ============================================
 * FINANCIAL SYSTEM - HELPER FUNCTIONS
 * SPRINT 0 - Sistema Financeiro Base
 * ============================================
 */

import { createClient } from '@/lib/supabase/server'

// ============================================
// TIPOS
// ============================================

export type TransactionType = 'CAPITAL_INICIAL' | 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA'
export type TransactionOrigin = 'CADASTRO' | 'PROJETO' | 'MANUAL' | 'PROPOSTA' | 'SISTEMA'
export type TransactionStatus = 'CONFIRMADO' | 'PENDENTE' | 'AGENDADO' | 'CANCELADO'

export interface FinancialTransaction {
  id?: string
  organizationId: string
  projectId?: string | null
  proposalId?: string | null
  clientId?: string | null
  type: TransactionType
  origin: TransactionOrigin
  status: TransactionStatus
  valor: number
  description: string
  category?: string | null
  transactionDate: Date
  dueDate?: Date | null
  notes?: string | null
  metadata?: Record<string, any> | null
  createdBy?: string | null
}

export interface FinancialSummary {
  organizationId: string
  organizationName: string
  initialCapital: number | null
  capitalInicialTransaction: number | null
  totalReceitas: number
  totalDespesas: number
  receitasPendentes: number
  despesasPendentes: number
  saldoAtual: number
  totalReceitasCount: number
  totalDespesasCount: number
  ultimaTransacao: Date | null
}

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Calcula o saldo atual do caixa baseado em todas as transações confirmadas
 * Fórmula: Capital Inicial + Receitas - Despesas
 */
export async function calculateCurrentBalance(organizationId: string): Promise<number> {
  const supabase = await createClient()

  // Buscar capital inicial
  const { data: capitalData } = await supabase
    .from('financial_transactions')
    .select('valor')
    .eq('organization_id', organizationId)
    .eq('type', 'CAPITAL_INICIAL')
    .eq('status', 'CONFIRMADO')
    .single()

  const capitalInicial = capitalData?.valor || 0

  // Buscar total de receitas confirmadas
  const { data: receitasData } = await supabase
    .from('financial_transactions')
    .select('valor')
    .eq('organization_id', organizationId)
    .eq('type', 'RECEITA')
    .eq('status', 'CONFIRMADO')

  const totalReceitas = receitasData?.reduce((sum, item) => sum + Number(item.valor), 0) || 0

  // Buscar total de despesas confirmadas
  const { data: despesasData } = await supabase
    .from('financial_transactions')
    .select('valor')
    .eq('organization_id', organizationId)
    .eq('type', 'DESPESA')
    .eq('status', 'CONFIRMADO')

  const totalDespesas = despesasData?.reduce((sum, item) => sum + Math.abs(Number(item.valor)), 0) || 0

  // Calcular saldo
  const saldoAtual = Number(capitalInicial) + totalReceitas - totalDespesas

  return saldoAtual
}

/**
 * Busca o resumo financeiro completo de uma organização
 */
export async function getFinancialSummary(organizationId: string): Promise<FinancialSummary | null> {
  const supabase = await createClient()

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
    initialCapital: data.initial_capital,
    capitalInicialTransaction: data.capital_inicial_transaction,
    totalReceitas: Number(data.total_receitas || 0),
    totalDespesas: Number(data.total_despesas || 0),
    receitasPendentes: Number(data.receitas_pendentes || 0),
    despesasPendentes: Number(data.despesas_pendentes || 0),
    saldoAtual: Number(data.saldo_atual || 0),
    totalReceitasCount: data.total_receitas_count || 0,
    totalDespesasCount: data.total_despesas_count || 0,
    ultimaTransacao: data.ultima_transacao ? new Date(data.ultima_transacao) : null,
  }
}

/**
 * Verifica se a organização já possui capital inicial registrado
 */
export async function hasInitialCapital(organizationId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('financial_transactions')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('type', 'CAPITAL_INICIAL')
    .single()

  return !!data
}

/**
 * Busca todas as transações de uma organização
 */
export async function getTransactions(
  organizationId: string,
  filters?: {
    type?: TransactionType
    status?: TransactionStatus
    startDate?: Date
    endDate?: Date
  }
): Promise<FinancialTransaction[]> {
  const supabase = await createClient()

  let query = supabase
    .from('financial_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('transaction_date', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.startDate) {
    query = query.gte('transaction_date', filters.startDate.toISOString())
  }

  if (filters?.endDate) {
    query = query.lte('transaction_date', filters.endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    projectId: item.project_id,
    proposalId: item.proposal_id,
    clientId: item.client_id,
    type: item.type,
    origin: item.origin,
    status: item.status,
    valor: Number(item.valor),
    description: item.description,
    category: item.category,
    transactionDate: new Date(item.transaction_date),
    dueDate: item.due_date ? new Date(item.due_date) : null,
    notes: item.notes,
    metadata: item.metadata,
    createdBy: item.created_by,
  }))
}

/**
 * Formata valores monetários para o padrão brasileiro (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Valida se o valor é positivo e válido
 */
export function validateAmount(amount: number, allowNegative = false): boolean {
  if (isNaN(amount) || !isFinite(amount)) {
    return false
  }

  if (!allowNegative && amount < 0) {
    return false
  }

  return true
}

/**
 * Calcula a porcentagem de um valor em relação a outro
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Retorna o saldo projetado considerando receitas e despesas agendadas
 */
export async function getProjectedBalance(organizationId: string): Promise<{
  currentBalance: number
  projectedBalance: number
  scheduledIncome: number
  scheduledExpenses: number
}> {
  const supabase = await createClient()

  // Saldo atual
  const currentBalance = await calculateCurrentBalance(organizationId)

  // Receitas agendadas
  const { data: incomeData } = await supabase
    .from('financial_transactions')
    .select('valor')
    .eq('organization_id', organizationId)
    .eq('type', 'RECEITA')
    .in('status', ['AGENDADO', 'PENDENTE'])

  const scheduledIncome = incomeData?.reduce((sum, item) => sum + Number(item.valor), 0) || 0

  // Despesas agendadas
  const { data: expensesData } = await supabase
    .from('financial_transactions')
    .select('valor')
    .eq('organization_id', organizationId)
    .eq('type', 'DESPESA')
    .in('status', ['AGENDADO', 'PENDENTE'])

  const scheduledExpenses = expensesData?.reduce((sum, item) => sum + Math.abs(Number(item.valor)), 0) || 0

  // Saldo projetado
  const projectedBalance = currentBalance + scheduledIncome - scheduledExpenses

  return {
    currentBalance,
    projectedBalance,
    scheduledIncome,
    scheduledExpenses,
  }
}
