'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { getCurrentBalance } from './financeiro'
import { startOfMonth, subMonths, format, startOfDay, eachMonthOfInterval, differenceInDays, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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

  // Definir filtros de data para contagens
  // Se houver dateRange, aplicamos ele para filtrar "novos" projetos/clientes no período
  // Se não houver, mantemos o comportamento padrão (ativos no momento)

  // Buscar projetos ativos ordenados por deadline/última alteração
  let projectsQuery = supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('organization_id', organizationId)
    .neq('status', 'ARCHIVED')
    .neq('status', 'DELIVERED')
    .order('deadline_date', { ascending: true, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(5)

  if (dateRange) {
    // Se tem filtro, talvez o usuário queira ver projetos criados/ativos nesse período?
    // Para "Projetos Ativos" geralmente queremos ver o estado atual, independente de data.
    // Mas para contadores (stats) podemos filtrar.
    // Vamos manter a lista de projetos ativos como "o que está na mesa agora", independente da data.
  }

  const { data: projects } = await projectsQuery

  // Contar total de projetos ativos
  // Se tiver dateRange, contamos quantos projetos foram CRIADOS ou tiveram ATIVIDADE nesse período?
  // O padrão de dashboard geralmente é "no período selecionado".
  // Mas "Projetos Ativos" é um estado momentâneo (snapshot). 
  // Vamos manter o filtro de "ativos agora" para o card, mas se o usuário filtrou data, 
  // podemos mostrar quantos projetos estiveram ativos nesse período (criados ou atualizados).

  let activeProjectsQuery = supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .neq('status', 'DELIVERED')
    .neq('status', 'ARCHIVED')

  if (dateRange) {
    // Se tem filtro de data, vamos mostrar projetos criados neste período para dar um contexto diferente?
    // Ou mantemos "Ativos Agora"? O "Saldo" é "Agora". 
    // Vamos manter a consistência do SNAPSHOT para Active Projects e Current Balance.
    // O DateRange vai afetar principalmente FLUXO DE CAIXA e NOVOS CLIENTES.
  }

  const { count: activeProjectsCount } = await activeProjectsQuery

  // Contar novos clientes
  const { count: newClientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange ? dateRange.start.toISOString() : startOfMonth(new Date()).toISOString())
    .lte('created_at', dateRange ? dateRange.end.toISOString() : new Date().toISOString())

  // Buscar próximas gravações (mesma lógica do calendário)
  const today = startOfDay(new Date())
  const shootsStart = dateRange ? dateRange.start : today
  const shootsEnd = dateRange ? dateRange.end : undefined

  const upcomingShoots: any[] = []

  // 1. Buscar projetos com shooting_date
  let projectShootsQuery = supabase
    .from('projects')
    .select('id, title, shooting_date, shooting_time, location, clients(name)')
    .eq('organization_id', organizationId)
    .not('shooting_date', 'is', null)
    .order('shooting_date', { ascending: true })

  if (shootsEnd) {
    projectShootsQuery = projectShootsQuery
      .gte('shooting_date', shootsStart.toISOString())
      .lte('shooting_date', shootsEnd.toISOString())
  } else {
    projectShootsQuery = projectShootsQuery.gte('shooting_date', shootsStart.toISOString())
  }

  const { data: projectShoots } = await projectShootsQuery.limit(6)

  if (projectShoots) {
    projectShoots.forEach((project) => {
      upcomingShoots.push({
        id: project.id,
        title: project.title,
        shooting_date: project.shooting_date,
        shooting_time: project.shooting_time,
        location: project.location,
        clients: project.clients,
        type: 'project'
      })
    })
  }

  // 2. Buscar shooting_dates (múltiplas gravações)
  let shootingDatesQuery = supabase
    .from('shooting_dates')
    .select('id, date, time, location, notes, project_id, projects(id, title, clients(name))')
    .eq('projects.organization_id', organizationId)
    .order('date', { ascending: true })

  if (shootsEnd) {
    shootingDatesQuery = shootingDatesQuery
      .gte('date', shootsStart.toISOString())
      .lte('date', shootsEnd.toISOString())
  } else {
    shootingDatesQuery = shootingDatesQuery.gte('date', shootsStart.toISOString())
  }

  const { data: shootingDates } = await shootingDatesQuery.limit(6)

  if (shootingDates) {
    shootingDates.forEach((sd) => {
      const project = sd.projects as any
      if (project) {
        upcomingShoots.push({
          id: project.id,
          title: project.title,
          shooting_date: sd.date,
          shooting_time: sd.time,
          location: sd.location,
          clients: project.clients,
          type: 'shooting_date'
        })
      }
    })
  }

  // Ordenar por data e limitar a 6
  upcomingShoots.sort((a, b) => new Date(a.shooting_date).getTime() - new Date(b.shooting_date).getTime())
  const finalUpcomingShoots = upcomingShoots.slice(0, 6)

  // Buscar dados de fluxo de caixa (respeitando o dateRange)
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
    upcomingShoots: finalUpcomingShoots || [],
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

  // Determinar granularidade (Dia ou Mês)
  const daysDiff = differenceInDays(endDate, startDate)
  const isDaily = daysDiff <= 90

  // Configuração de Formatação
  const formatKey = isDaily ? 'yyyy-MM-dd' : 'yyyy-MM'
  const formatLabel = isDaily ? 'dd/MM' : 'MMM' // Ex: 01/01 ou Jan

  // Criar buckets do intervalo
  let intervals: Date[]
  if (isDaily) {
    intervals = eachDayOfInterval({ start: startDate, end: endDate })
  } else {
    intervals = eachMonthOfInterval({ start: startDate, end: endDate })
  }

  const chartDataMap: Record<string, { receitas: number; despesas: number; date: Date }> = {}

  intervals.forEach(date => {
    const key = format(date, formatKey)
    chartDataMap[key] = { receitas: 0, despesas: 0, date }
  })

  // Buscar transações
  // Ajustamos a query para pegar exatamente o range solicitado (com uma margem de segurança para fuso)
  const queryStartDate = isDaily ? startDate : startOfMonth(startDate)

  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('type, amount, status, payment_date, created_at')
    .eq('organization_id', organizationId)
    .eq('status', 'PAID')
    .or(`payment_date.gte.${queryStartDate.toISOString()},and(payment_date.is.null,created_at.gte.${queryStartDate.toISOString()})`)
    .order('payment_date', { ascending: true, nullsFirst: false })

  if (transactions && transactions.length > 0) {
    transactions.forEach((tx) => {
      // Ignorar transações após a data final (já que a query não filtra teto)
      const txDate = new Date(tx.payment_date || tx.created_at)
      if (txDate > endDate) return

      const key = format(txDate, formatKey)

      if (chartDataMap[key]) {
        const amount = Math.abs(Number(tx.amount))
        if (tx.type === 'INCOME' || tx.type === 'INITIAL_CAPITAL') {
          chartDataMap[key].receitas += amount
        } else if (tx.type === 'EXPENSE') {
          chartDataMap[key].despesas += amount
        }
      }
    })
  }

  // Converter para array com saldo acumulado
  const result: CashFlowDataPoint[] = []
  let saldoAcumulado = 0

  // Ordenar cronologicamente
  Object.keys(chartDataMap)
    .sort()
    .forEach((key) => {
      const data = chartDataMap[key]
      saldoAcumulado += data.receitas - data.despesas

      result.push({
        date: key,
        month: format(data.date, formatLabel, { locale: ptBR }), // "month" aqui é o Label do eixo X
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: saldoAcumulado,
      })
    })

  return result
}
