'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './overview-tab'
import { PayablesTab } from './payables-tab'
import { ReceivablesTab } from './receivables-tab'

interface FinancialTabsProps {
  initialData: {
    overview: {
      total_income: number
      total_expenses: number
      net_profit: number
      pending_receivable: number
      pending_payable: number
      profit_margin_percent: number
    }
    payables: any[]
    receivables: any[]
  }
  organizationId: string
}

export function FinancialTabs({ initialData, organizationId }: FinancialTabsProps) {
  const [data, setData] = useState(initialData)

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="payables">
          Contas a Pagar
          {data.payables.length > 0 && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
              {data.payables.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="receivables">
          Contas a Receber
          {data.receivables.length > 0 && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              {data.receivables.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <OverviewTab data={data.overview} />
      </TabsContent>

      <TabsContent value="payables" className="space-y-4">
        <PayablesTab data={data.payables} onUpdate={setData} organizationId={organizationId} />
      </TabsContent>

      <TabsContent value="receivables" className="space-y-4">
        <ReceivablesTab data={data.receivables} onUpdate={setData} />
      </TabsContent>
    </Tabs>
  )
}
