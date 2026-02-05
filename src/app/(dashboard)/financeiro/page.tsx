import { Suspense } from 'react'
import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { FinancialTabs } from '@/components/financeiro/financial-tabs'

export const metadata = {
  title: 'Financeiro - Zooming CRM',
  description: 'Gestão financeira unificada',
}



async function getFinancialData(organizationId: string, from: Date, to: Date) {
  const supabase = await createClient()

  // Buscar todas as transações (exceto canceladas) para cálculo preciso
  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .neq('status', 'CANCELLED')

  // Buscar contas a pagar/receber para as tabelas
  // Filtrar contas que vencem até o final do período selecionado
  // Modificado para usar filtro OR: mostrar se data <= selecionada OU se data é nula (sem vencimento)
  // Supabase JS usa sintaxe específica para OR: .or('due_date.lte.XY,due_date.is.null')
  const [payablesData, receivablesData] = await Promise.all([
    supabase
      .from('accounts_payable')
      .select(`
        *,
        projects:project_id(title),
        freelancers:freelancer_id(name)
      `)
      .eq('organization_id', organizationId)
      .or(`due_date.lte.${to.toISOString()},due_date.is.null`)
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
      .or(`due_date.lte.${to.toISOString()},due_date.is.null`)
      .order('due_date', { ascending: true }),
  ])

  // Calcular métricas manualmente para garantir precisão
  let initialCapital = 0
  let totalIncome = 0
  let totalExpenses = 0
  let pendingReceivable = 0
  let pendingPayable = 0
  let paidIncome = 0
  let paidExpenses = 0
  let currentBalance = 0

  if (transactions) {
    transactions.forEach((t) => {
      const amount = Number(t.amount || 0)
      // Fix: 'date' column doesn't exist. Use payment_date (if paid), due_date (if pending), or fallback to created_at
      const dateStr = t.payment_date || t.due_date || t.created_at
      const tDate = dateStr ? new Date(dateStr) : new Date()

      // Para saldo atual: considerar todas as transações até a data final selecionada
      // Isso reflete o "Saldo ao final do período"
      if (tDate <= to) {
        if (t.type === 'INITIAL_CAPITAL') {
          if (t.status === 'PAID') currentBalance += amount
          // Initial capital also counts towards initialCapital var if paid? The original code had:
          // if (t.status === 'PAID') initialCapital += amount
          // Let's keep logic consistent with original but scoped to date
          if (t.status === 'PAID') initialCapital += amount
        } else if (t.type === 'INCOME') {
          if (t.status === 'PAID') {
            currentBalance += amount

            // Faturamento Total no CARD: Apenas dentro do período selecionado
            if (tDate >= from) {
              totalIncome += amount
              paidIncome += amount
            }
          } else {
            // Pending items generally come from accounts receivable/payable, but transactions might be pending too?
            // If transaction is pending, check if it falls in period for visibility? 
            // Original logic: if (t.status === 'PAID') paidIncome += amount else pendingReceivable += amount
            // We should stick to the requirement: "Valores a receber (até fim do período)"
            // If it's pure transaction pending, we sum it if <= to
            pendingReceivable += amount
          }
        } else if (t.type === 'EXPENSE') {
          if (t.status === 'PAID') {
            currentBalance -= amount

            // Despesas Totais no CARD: Apenas dentro do período selecionado
            if (tDate >= from) {
              totalExpenses += amount
              paidExpenses += amount
            }
          } else {
            // Pending Payables
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

  return {
    overview: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      pending_receivable: pendingReceivable,
      pending_payable: pendingPayable,
      profit_margin_percent: profitMarginPercent,
      current_balance: currentBalance,
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
  const data = await getFinancialData(organizationId, from, to)

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
