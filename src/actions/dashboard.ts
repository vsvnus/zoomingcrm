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
  upcomingEvents: any[]
  cashFlowData: CashFlowDataPoint[]
  pendingReceivables: number
  pendingPayables: number
}


export async function getDashboardStats(dateRange?: { start: Date; end: Date }): Promise<DashboardStats> {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  // Definir filtros de data para contagens
  // Se houver dateRange, aplicamos ele para filtrar "novos" projetos/clientes no período
  // Se não houver, mantemos o comportamento padrão (ativos no momento)

  // Buscar próximos eventos (unificando lógica do calendário)
  const today = startOfDay(new Date())

  // Se tiver dateRange, usa ele, senão pega de hoje pra frente
  const eventsStart = dateRange ? dateRange.start : today
  const eventsEnd = dateRange ? dateRange.end : undefined

  // Build all query objects (these are lazy - no network call until awaited)

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

  // Contar total de projetos ativos (snapshot)
  let activeProjectsQuery = supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .neq('status', 'DELIVERED')
    .neq('status', 'ARCHIVED')

  // Contar novos clientes
  const newClientsQuery = supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange ? dateRange.start.toISOString() : startOfMonth(new Date()).toISOString())
    .lte('created_at', dateRange ? dateRange.end.toISOString() : new Date().toISOString())

  // 1. Projetos com Shooting Date
  let projectShootsQuery = supabase
    .from('projects')
    .select('id, title, shooting_date, shooting_time, location, clients(name)')
    .eq('organization_id', organizationId)
    .not('shooting_date', 'is', null)
    .gte('shooting_date', eventsStart.toISOString())
    .order('shooting_date', { ascending: true })

  if (eventsEnd) {
    projectShootsQuery = projectShootsQuery.lte('shooting_date', eventsEnd.toISOString())
  }

  // 2. Shooting Dates (multiplas datas)
  let shootingDatesQuery = supabase
    .from('shooting_dates')
    .select('id, date, time, location, notes, project_id, projects(id, title, clients(name))')
    .eq('projects.organization_id', organizationId)
    .gte('date', eventsStart.toISOString())
    .order('date', { ascending: true })

  if (eventsEnd) {
    shootingDatesQuery = shootingDatesQuery.lte('date', eventsEnd.toISOString())
  }

  // 3. Prazos de Entrega (Projects Deadline)
  let deadlineQuery = supabase
    .from('projects')
    .select('id, title, deadline, clients(name)')
    .eq('organization_id', organizationId)
    .not('deadline', 'is', null)
    .gte('deadline', eventsStart.toISOString())
    .order('deadline', { ascending: true })

  if (eventsEnd) {
    deadlineQuery = deadlineQuery.lte('deadline', eventsEnd.toISOString())
  }

  // 4. Delivery Dates (multiplas entregas)
  let deliveryDatesQuery = supabase
    .from('delivery_dates')
    .select('id, date, description, project_id, projects(id, title, clients(name))')
    .eq('projects.organization_id', organizationId)
    .gte('date', eventsStart.toISOString())
    .order('date', { ascending: true })

  if (eventsEnd) {
    deliveryDatesQuery = deliveryDatesQuery.lte('date', eventsEnd.toISOString())
  }

  // 5. Eventos Manuais (Calendar Events)
  let manualEventsQuery = supabase
    .from('calendar_events')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('start_date', eventsStart.toISOString())
    .order('start_date', { ascending: true })

  if (eventsEnd) {
    manualEventsQuery = manualEventsQuery.lte('start_date', eventsEnd.toISOString())
  }

  // Pendentes (a receber e a pagar) filtrados por due_date ate o fim do periodo
  let receivablesQuery = supabase
    .from('financial_transactions')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('type', 'INCOME')
    .in('status', ['PENDING', 'SCHEDULED'])

  let payablesQuery = supabase
    .from('financial_transactions')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('type', 'EXPENSE')
    .in('status', ['PENDING', 'SCHEDULED'])

  if (dateRange) {
    receivablesQuery = receivablesQuery.or(`due_date.lte.${dateRange.end.toISOString()},due_date.is.null`)
    payablesQuery = payablesQuery.or(`due_date.lte.${dateRange.end.toISOString()},due_date.is.null`)
  }

  // Execute ALL independent queries in parallel
  const [
    currentBalance,
    { data: projects },
    { count: activeProjectsCount },
    { count: newClientsCount },
    { data: projectShoots },
    { data: shootingDates },
    { data: deadlines },
    { data: deliveryDates },
    { data: manualEvents },
    cashFlowData,
    { data: pendingReceivablesData },
    { data: pendingPayablesData },
  ] = await Promise.all([
    getCurrentBalance(organizationId),
    projectsQuery,
    activeProjectsQuery,
    newClientsQuery,
    projectShootsQuery.limit(10),
    shootingDatesQuery.limit(10),
    deadlineQuery.limit(10),
    deliveryDatesQuery.limit(10),
    manualEventsQuery.limit(10),
    getCashFlowData(organizationId, dateRange),
    receivablesQuery,
    payablesQuery,
  ])

  // Assemble upcoming events from all sources
  const upcomingEvents: any[] = []

  if (projectShoots) {
    projectShoots.forEach((project) => {
      upcomingEvents.push({
        id: `project-${project.id}`,
        title: project.title,
        date: project.shooting_date,
        time: project.shooting_time,
        location: project.location,
        client: (project.clients as any)?.name,
        type: 'shooting',
        link_id: project.id,
        link_type: 'project'
      })
    })
  }

  if (shootingDates) {
    shootingDates.forEach((sd) => {
      const project = sd.projects as any
      if (project) {
        upcomingEvents.push({
          id: `shooting-date-${sd.id}`,
          title: `Gravação: ${project.title}`,
          date: sd.date,
          time: sd.time,
          location: sd.location,
          client: project.clients?.name,
          type: 'shooting',
          link_id: project.id,
          link_type: 'project'
        })
      }
    })
  }

  if (deadlines) {
    deadlines.forEach((project) => {
      upcomingEvents.push({
        id: `deadline-${project.id}`,
        title: `Entrega: ${project.title}`,
        date: project.deadline,
        time: null,
        location: null,
        client: (project.clients as any)?.name,
        type: 'delivery',
        link_id: project.id,
        link_type: 'project'
      })
    })
  }

  if (deliveryDates) {
    deliveryDates.forEach((dd) => {
      const project = dd.projects as any
      if (project) {
        upcomingEvents.push({
          id: `delivery-date-${dd.id}`,
          title: `Entrega: ${dd.description || project.title}`,
          date: dd.date,
          time: null,
          location: null,
          client: project.clients?.name,
          type: 'delivery',
          link_id: project.id,
          link_type: 'project'
        })
      }
    })
  }

  if (manualEvents) {
    manualEvents.forEach((ev) => {
      upcomingEvents.push({
        id: `manual-${ev.id}`,
        title: ev.title,
        date: ev.start_date,
        time: !ev.all_day ? format(new Date(ev.start_date), 'HH:mm') : null,
        location: ev.location,
        client: null,
        type: ev.type || 'other',
        link_id: null,
        link_type: 'manual'
      })
    })
  }

  // Ordenar todos por data e pegar os 6 mais proximos
  upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const finalUpcomingEvents = upcomingEvents.slice(0, 6)

  const pendingReceivables = pendingReceivablesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const pendingPayables = pendingPayablesData?.reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0) || 0

  return {
    activeProjects: activeProjectsCount || 0,
    newClients: newClientsCount || 0,
    currentBalance,
    projects: projects || [],
    upcomingEvents: finalUpcomingEvents || [],
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
