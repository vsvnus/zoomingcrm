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
    current_balance: number
    monthly_revenue: number
    monthly_cost: number
    opening_balance: number
    real_profit: number
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
  const isBalancePositive = data.current_balance >= 0

  // Calculation for projection: Current Balance + (Receivable - Payable)
  const projection =
    data.current_balance + data.pending_receivable - data.pending_payable
  const isProjectionPositive = projection >= 0

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Saldo Atual - Destaque Especial */}
      <div className="rounded-xl border bg-card p-4 md:p-6 shadow-sm">
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Saldo Atual Disponível
          </span>
          <div className="flex items-center justify-between">
            <div
              className={`text-2xl md:text-4xl font-bold ${isBalancePositive ? 'text-purple-600' : 'text-red-600'}`}
            >
              {formatCurrency(data.current_balance)}
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Caixa disponível (Capital + Lucro)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Entradas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entradas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">
              {formatCurrency(data.total_income)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entradas confirmadas no período
            </p>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">
              {formatCurrency(data.total_expenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saídas confirmadas no período
            </p>
          </CardContent>
        </Card>

        {/* Diferença */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diferença</CardTitle>
            <DollarSign
              className={`h-4 w-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg md:text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(data.net_profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Diferença entre entradas e saídas
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
            <div className="text-lg md:text-2xl font-bold text-blue-600">
              {formatCurrency(data.pending_receivable)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valores pendentes
            </p>
          </CardContent>
        </Card>

        {/* Pendente a Pagar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-orange-600">
              {formatCurrency(data.pending_payable)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valores pendentes
            </p>
          </CardContent>
        </Card>

        {/* Projeção (Novo) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projeção</CardTitle>
            <CheckCircle
              className={`h-4 w-4 ${isProjectionPositive ? 'text-emerald-600' : 'text-rose-600'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg md:text-2xl font-bold ${isProjectionPositive ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {formatCurrency(projection)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Final do período (Saldo + A Receber - A Pagar)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha: Faturamento Mensal, Custo Mensal, Lucro Real */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-3">
        {/* Faturamento Mensal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-emerald-600">
              {formatCurrency(data.monthly_revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Previsão total de receitas no período
            </p>
          </CardContent>
        </Card>

        {/* Custo Mensal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-rose-600">
              {formatCurrency(data.monthly_cost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Previsão total de despesas no período
            </p>
          </CardContent>
        </Card>

        {/* Lucro Real */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Real</CardTitle>
            <DollarSign
              className={`h-4 w-4 ${data.real_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg md:text-2xl font-bold ${data.real_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {formatCurrency(data.real_profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Faturamento Mensal - Custo Mensal
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
