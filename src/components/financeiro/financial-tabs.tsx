'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './overview-tab'
import { PayablesTab } from './payables-tab'
import { ReceivablesTab } from './receivables-tab'
import { InitialCapitalDialog } from './initial-capital-dialog'
import { FinancialDateFilter } from './financial-date-filter'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FinancialTabsProps {
  initialData: {
    overview: {
      total_income: number
      total_expenses: number
      net_profit: number
      pending_receivable: number
      pending_payable: number
      profit_margin_percent: number
      current_balance: number
      monthly_revenue: number
      monthly_cost: number
      opening_balance: number
      real_profit: number
    }
    payables: any[]
    receivables: any[]
  }
  organizationId: string
  defaultTab?: string
}

export function FinancialTabs({ initialData, organizationId, defaultTab = 'overview' }: FinancialTabsProps) {
  const [data, setData] = useState(initialData)

  // Sync local state with server data when it changes (e.g. after router.refresh())
  // This is crucial because the parent component re-fetches data on router.refresh()
  // but this component won't re-initialize state without this effect.
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview" className="text-xs md:text-sm px-2 md:px-3">Visão Geral</TabsTrigger>
          <TabsTrigger value="payables" className="text-xs md:text-sm px-2 md:px-3">
            <span className="hidden md:inline">Contas a </span>Pagar
            {data.payables.length > 0 && (
              <span className="ml-1 md:ml-2 rounded-full bg-red-100 px-1.5 md:px-2 py-0.5 text-xs font-medium text-red-800">
                {data.payables.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="receivables" className="text-xs md:text-sm px-2 md:px-3">
            <span className="hidden md:inline">Contas a </span>Receber
            {data.receivables.length > 0 && (
              <span className="ml-1 md:ml-2 rounded-full bg-green-100 px-1.5 md:px-2 py-0.5 text-xs font-medium text-green-800">
                {data.receivables.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <FinancialDateFilter />
          <InitialCapitalDialog organizationId={organizationId}>
            <Button variant="secondary" size="sm">
              <Wallet className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Capital Inicial</span>
              <span className="md:hidden">Capital</span>
            </Button>
          </InitialCapitalDialog>
        </div>
      </div>

      <TabsContent value="overview" className="space-y-4">
        <OverviewTab data={data.overview} />
      </TabsContent>

      <TabsContent value="payables" className="space-y-4">
        <PayablesTab data={data.payables} onUpdate={setData} organizationId={organizationId} />
      </TabsContent>

      <TabsContent value="receivables" className="space-y-4">
        <ReceivablesTab data={data.receivables} onUpdate={setData} organizationId={organizationId} />
      </TabsContent>
    </Tabs>
  )
}
