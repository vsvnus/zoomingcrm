'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { getCurrentBalance } from './financeiro'
import { startOfMonth, endOfMonth, subMonths, format, startOfDay } from 'date-fns'

export type CashFlowDataPoint = {
  date: string
  month: string
  receitas: number
  despesas: number
  saldo: number
}

export type DashboardStats = {
  activeProjects: number
  newClients: number
  currentBalance: number
  projects: any[]
  upcomingShoots: any[]
  cashFlowData: CashFlowDataPoint[]
  pendingReceivables: number
  pendingPayables: number
}

export async function getDashboardStats(dateRange?: { start: Date; end: Date }): Promise<DashboardStats> {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  // SPRINT 0: Buscar saldo atual
  const currentBalance = await getCurrentBalance(organizationId)

  // Buscar projetos ativos ordenados por deadline/última alteração
  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('organization_id', organizationId)
    .neq('stage', 'ARCHIVED')
    .neq('stage', 'DELIVERED')
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(5)

  // Contar total de projetos ativos
  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .neq('stage', 'DELIVERED')
    .neq('stage', 'ARCHIVED')

  // Contar novos clientes do mês
  const monthStart = startOfMonth(new Date())

  const { count: newClientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', monthStart.toISOString())

  // Buscar próximas gravações (projetos com shooting_date ou shooting_dates)
  const today = startOfDay(new Date())

  const { data: upcomingShoots } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('organization_id', organizationId)
    .not('shooting_date', 'is', null)
    .gte('shooting_date', today.toISOString())
    .order('shooting_date', { ascending: true })
    .limit(5)

  // Buscar dados de fluxo de caixa (últimos 6 meses)
  const cashFlowData = await getCashFlowData(organizationId, dateRange)

  // Buscar pendentes (a receber e a pagar)
  const { data: pendingReceivablesData } = await supabase
    .from('financial_transactions')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('type', 'INCOME')
    .in('status', ['PENDING', 'SCHEDULED'])

  const { data: pendingPayablesData } = await supabase
    .from('financial_transactions')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('type', 'EXPENSE')
    .in('status', ['PENDING', 'SCHEDULED'])

  const pendingReceivables = pendingReceivablesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const pendingPayables = pendingPayablesData?.reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0) || 0

  return {
    activeProjects: activeProjectsCount || 0,
    newClients: newClientsCount || 0,
    currentBalance,
    projects: projects || [],
    upcomingShoots: upcomingShoots || [],
    cashFlowData,
    pendingReceivables,
    pendingPayables,
  }
}

async function getCashFlowData(
  organizationId: string,
  dateRange?: { start: Date; end: Date }
): Promise<CashFlowDataPoint[]> {
  const supabase = await createClient()

  // Definir período (default: últimos 6 meses)
  const endDate = dateRange?.end || new Date()
  const startDate = dateRange?.start || subMonths(endDate, 5)

  // Buscar transações do período
  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('type, amount, status, transaction_date, payment_date')
    .eq('organization_id', organizationId)
    .gte('transaction_date', startOfMonth(startDate).toISOString())
    .lte('transaction_date', endOfMonth(endDate).toISOString())
    .eq('status', 'PAID')
    .order('transaction_date', { ascending: true })

  if (!transactions || transactions.length === 0) {
    // Retornar dados vazios para os últimos 6 meses
    const result: CashFlowDataPoint[] = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      result.push({
        date: format(date, 'yyyy-MM'),
        month: format(date, 'MMM'),
        receitas: 0,
        despesas: 0,
        saldo: 0,
      })
    }
    return result
  }

  // Agrupar por mês
  const monthlyData: Record<string, { receitas: number; despesas: number }> = {}

  // Inicializar meses
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(endDate, i)
    const key = format(date, 'yyyy-MM')
    monthlyData[key] = { receitas: 0, despesas: 0 }
  }

  // Processar transações
  transactions.forEach((tx) => {
    const txDate = new Date(tx.transaction_date)
    const key = format(txDate, 'yyyy-MM')

    if (monthlyData[key]) {
      const amount = Math.abs(Number(tx.amount))
      if (tx.type === 'INCOME' || tx.type === 'INITIAL_CAPITAL') {
        monthlyData[key].receitas += amount
      } else if (tx.type === 'EXPENSE') {
        monthlyData[key].despesas += amount
      }
    }
  })

  // Converter para array com saldo acumulado
  const result: CashFlowDataPoint[] = []
  let saldoAcumulado = 0

  Object.keys(monthlyData)
    .sort()
    .forEach((key) => {
      const data = monthlyData[key]
      saldoAcumulado += data.receitas - data.despesas

      result.push({
        date: key,
        month: format(new Date(key + '-01'), 'MMM'),
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: saldoAcumulado,
      })
    })

  return result
}
