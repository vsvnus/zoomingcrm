import { Suspense } from 'react'
import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { FinancialTabs } from '@/components/financeiro/financial-tabs'

export const metadata = {
  title: 'Financeiro - Clapper',
  description: 'Gestão financeira unificada',
}



async function getFinancialData(organizationId: string, from: Date, to: Date) {
  const supabase = await createClient()

  // Buscar todas as transações (exceto canceladas) para cálculo preciso
  const { data: transactions, error: transactionsError } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .neq('status', 'CANCELLED')

  if (transactionsError) {
    console.error('Error fetching transactions:', transactionsError)
  }

  // Buscar contas a pagar/receber para as tabelas
  // Filtrar contas que vencem DENTRO do período selecionado [from, to]
  // Usar .gte + .lte para o range, com .or para incluir due_date IS NULL
  const fromISO = from.toISOString()
  const toISO = to.toISOString()
  const [payablesData, receivablesData] = await Promise.all([
    supabase
      .from('accounts_payable')
      .select(`
        *,
        projects:project_id(title),
        freelancers:freelancer_id(name)
      `)
      .eq('organization_id', organizationId)
      .or(`due_date.gte.${fromISO},due_date.is.null`)
      .or(`due_date.lte.${toISO},due_date.is.null`)
      .order('due_date', { ascending: true }),
    supabase
      .from('accounts_receivable')
      .select(`
        *,
        projects:project_id(title),
        clients:client_id(name),
        proposals:proposal_id(title)
      `)
      .eq('organization_id', organizationId)
      .or(`due_date.gte.${fromISO},due_date.is.null`)
      .or(`due_date.lte.${toISO},due_date.is.null`)
      .order('due_date', { ascending: true }),
  ])

  if (payablesData.error) {
    console.error('Error fetching payables:', payablesData.error)
  }
  if (receivablesData.error) {
    console.error('Error fetching receivables:', receivablesData.error)
  }

  // Calcular métricas usando SEMPRE due_date como referência de período
  // due_date = data de vencimento selecionada na conta (a pagar ou a receber)
  // Nunca usar payment_date para determinar o período - ela indica apenas quando foi pago
  let initialCapital = 0
  let totalIncome = 0
  let totalExpenses = 0
  let pendingReceivable = 0
  let pendingPayable = 0
  let currentBalance = 0
  let monthlyRevenue = 0
  let monthlyCost = 0
  let openingBalance = 0
  // Resumo mensal: sempre do dia 1 do mês até o último dia selecionado
  const monthStart = startOfDay(startOfMonth(to))

  // Helper: parse date string as LOCAL date to avoid UTC timezone shift
  // "2025-01-15" deve ser 15/Jan local, não 14/Jan (que ocorre com new Date("2025-01-15") em UTC-3)
  const parseLocalDate = (dateStr: string): Date => {
    const dateOnly = dateStr.toString().split('T')[0]
    const [year, month, day] = dateOnly.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  if (transactions) {
    transactions.forEach((t) => {
      const amount = Number(t.amount || 0)
      // REGRA: sempre usar due_date para posicionar no período. Fallback: created_at
      const dateStr = t.due_date || t.created_at
      const tDate = dateStr ? parseLocalDate(dateStr) : new Date()

      // Saldo de abertura: todas as transações PAID com due_date anterior ao dia 1 do mês
      if (t.status === 'PAID' && tDate < monthStart) {
        if (t.type === 'INITIAL_CAPITAL' || t.type === 'INCOME') {
          openingBalance += amount
        } else if (t.type === 'EXPENSE') {
          openingBalance -= amount
        }
      }

      // Faturamento Mensal / Custo Mensal: TODAS as transações (exceto CANCELLED, já filtrado na query)
      // com due_date dentro de [from, to], independente de status (assume tudo será pago/recebido)
      if (tDate >= from && tDate <= to) {
        if (t.type === 'INCOME') {
          monthlyRevenue += amount
        } else if (t.type === 'EXPENSE') {
          monthlyCost += amount
        }
      }

      // Projeção: considerar tudo com due_date <= último dia selecionado
      if (tDate <= to) {
        if (t.type === 'INITIAL_CAPITAL') {
          if (t.status === 'PAID') {
            currentBalance += amount
            initialCapital += amount
          }
        } else if (t.type === 'INCOME') {
          if (t.status === 'PAID') {
            currentBalance += amount
            // Entradas: apenas transações PAID com due_date dentro de [from, to]
            if (tDate >= from) {
              totalIncome += amount
            }
          } else {
            pendingReceivable += amount
          }
        } else if (t.type === 'EXPENSE') {
          if (t.status === 'PAID') {
            currentBalance -= amount
            // Saídas: apenas transações PAID com due_date dentro de [from, to]
            if (tDate >= from) {
              totalExpenses += amount
            }
          } else {
            pendingPayable += amount
          }
        }
      }
    })
  }

  // Recalculate pending from the accounts tables as they are the source of truth for "A Pagar/A Receber" typically
  // But original code summed transactions. Let's observe the prompt: "Valores a receber (até fim do período)"
  // The original code used transaction loop to sum pending. 
  // However, usually detailed lists come from accounts_*. 
  // Let's refine the "Pending" calc.
  // Original logic was summing pending transactions. 
  // New requirement: "Valores a receber (até fim do período)" -> This usually implies all open items due <= end date.
  // If we rely on transactions, we might miss items that don't have a transaction yet? Or are transactions created for all?
  // Assuming transactions are the source of truth for flow.

  // Refined Logic for Pending based on implementation plan:
  // Pending Receivable: All unpaid receivables due <= to
  // Pending Payable: All unpaid payables due <= to
  // We can sum the fetched `receivablesData` and `payablesData` (which we filtered by date) that are not PAID.

  // Override pending calculation using the fetched lists, as they are explicitly filtered by due_date <= to
  // And we should filter out 'PAID' ones if the query included them (the query fetches all status for list).

  const calculatedPendingReceivable = (receivablesData.data || [])
    .filter(r => r.status !== 'PAID' && r.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  const calculatedPendingPayable = (payablesData.data || [])
    .filter(p => p.status !== 'PAID' && p.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  // Use these calculated values for the cards
  pendingReceivable = calculatedPendingReceivable
  pendingPayable = calculatedPendingPayable

  const netProfit = totalIncome - totalExpenses // Profit within period
  const profitMarginPercent = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

  // Current Balance is: Initial Capital (total paid) + Total Income (all time paid up to 'to') - Total Expenses (all time paid up to 'to')
  // My loop above calculated `currentBalance` correctly as "Accumulated Balance up to End Date".

  const realProfit = monthlyRevenue - monthlyCost

  return {
    overview: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      pending_receivable: pendingReceivable,
      pending_payable: pendingPayable,
      profit_margin_percent: profitMarginPercent,
      current_balance: currentBalance,
      monthly_revenue: monthlyRevenue,
      monthly_cost: monthlyCost,
      opening_balance: openingBalance,
      real_profit: realProfit,
    },
    payables: payablesData.data || [],
    receivables: receivablesData.data || [],
  }
}

import { startOfMonth, endOfMonth, endOfDay, startOfDay } from 'date-fns'

interface FinanceiroDataProps {
  defaultTab?: string
  from: Date
  to: Date
}

async function FinanceiroData({ defaultTab, from, to }: FinanceiroDataProps) {
  const organizationId = await getUserOrganization()

  const emptyData = {
    overview: {
      total_income: 0,
      total_expenses: 0,
      net_profit: 0,
      pending_receivable: 0,
      pending_payable: 0,
      profit_margin_percent: 0,
      current_balance: 0,
      monthly_revenue: 0,
      monthly_cost: 0,
      opening_balance: 0,
      real_profit: 0,
    },
    payables: [],
    receivables: [],
  }

  let data: Awaited<ReturnType<typeof getFinancialData>> = emptyData
  try {
    data = await getFinancialData(organizationId, from, to)
  } catch (error) {
    console.error('Error loading financial data:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gestão financeira unificada - Contas a pagar e receber
          </p>
        </div>
      </div>
      <FinancialTabs initialData={data} organizationId={organizationId} defaultTab={defaultTab} />
    </div>
  )
}

function FinanceiroLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{
    tab?: string
    from?: string
    to?: string
  }>
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const params = await searchParams
  const defaultTab = params.tab || 'overview'

  // Helper para parsing manual de data (YYYY-MM-DD) para evitar timezone shifts
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const from = params.from ? startOfDay(parseDate(params.from)) : startOfMonth(new Date())
  const to = params.to ? endOfDay(parseDate(params.to)) : endOfMonth(new Date())

  return (
    <Suspense fallback={<FinanceiroLoading />}>
      <FinanceiroData defaultTab={defaultTab} from={from} to={to} />
    </Suspense>
  )
}
