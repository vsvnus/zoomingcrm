import { Suspense } from 'react'
import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { FinancialTabs } from '@/components/financeiro/financial-tabs'

export const metadata = {
  title: 'Financeiro - Zooming CRM',
  description: 'Gestão financeira unificada',
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

async function getFinancialData(organizationId: string) {
  const supabase = await createClient()

  // Buscar todas as transações (exceto canceladas) para cálculo preciso
  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .neq('status', 'CANCELLED')

  // Buscar contas a pagar/receber para as tabelas (mantendo queries originais para garantir relacionamentos)
  const [payablesData, receivablesData] = await Promise.all([
    supabase
      .from('accounts_payable')
      .select(`
        *,
        projects:project_id(title),
        freelancers:freelancer_id(name)
      `)
      .eq('organization_id', organizationId)
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

  if (transactions) {
    transactions.forEach((t) => {
      const amount = Number(t.amount || 0)

      if (t.type === 'INITIAL_CAPITAL') {
        if (t.status === 'PAID') initialCapital += amount
      } else if (t.type === 'INCOME') {
        totalIncome += amount
        if (t.status === 'PAID') paidIncome += amount
        else pendingReceivable += amount
      } else if (t.type === 'EXPENSE') {
        totalExpenses += amount
        if (t.status === 'PAID') paidExpenses += amount
        else pendingPayable += amount
      }
    })
  }

  const netProfit = totalIncome - totalExpenses
  const currentBalance = initialCapital + paidIncome - paidExpenses
  const profitMarginPercent = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

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

async function FinanceiroData({ defaultTab }: { defaultTab?: string }) {
  const organizationId = await getUserOrganization()
  const data = await getFinancialData(organizationId)

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

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const params = await searchParams
  const defaultTab = params.tab || 'overview'

  return (
    <Suspense fallback={<FinanceiroLoading />}>
      <FinanceiroData defaultTab={defaultTab} />
    </Suspense>
  )
}
