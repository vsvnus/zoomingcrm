'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface OverviewTabProps {
  data: {
    total_income: number
    total_expenses: number
    net_profit: number
    pending_receivable: number
    pending_payable: number
    profit_margin_percent: number
  }
}

const safeNumber = (val: any) => {
  if (val === null || val === undefined) return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function formatCurrency(value: any) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safeNumber(value))
}

export function OverviewTab({ data }: OverviewTabProps) {
  const isProfit = data.net_profit >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Faturamento Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Faturamento Total
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.total_income)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Receitas consolidadas
          </p>
        </CardContent>
      </Card>

      {/* Custos Totais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(data.total_expenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Despesas consolidadas
          </p>
        </CardContent>
      </Card>

      {/* Lucro Líquido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <DollarSign
            className={`h-4 w-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatCurrency(data.net_profit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Margem: {safeNumber(data.profit_margin_percent).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Pendente a Receber */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.pending_receivable)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Valores pendentes</p>
        </CardContent>
      </Card>

      {/* Pendente a Pagar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(data.pending_payable)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Valores pendentes</p>
        </CardContent>
      </Card>

      {/* Fluxo de Caixa Projetado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fluxo Projetado</CardTitle>
          <CheckCircle className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(data.pending_receivable - data.pending_payable)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Diferença entre receber e pagar
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
