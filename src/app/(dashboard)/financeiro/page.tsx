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

  // Buscar dados das views criadas no schema COM filtro por organização
  const [overviewData, payablesData, receivablesData] = await Promise.all([
    supabase
      .from('financial_overview')
      .select('*')
      .eq('organization_id', organizationId)
      .single(),
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

  return {
    overview: overviewData.data || {
      total_income: 0,
      total_expenses: 0,
      net_profit: 0,
      pending_receivable: 0,
      pending_payable: 0,
      profit_margin_percent: 0,
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
