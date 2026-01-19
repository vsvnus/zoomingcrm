'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
} from 'lucide-react'

type FinancialSummary = {
  total_revenue: number
  total_estimated_cost: number
  total_actual_cost: number
  estimated_profit: number
  actual_profit: number
  estimated_margin_percent: number
  actual_margin_percent: number
  target_margin_percent: number
  margin_alert: boolean
  estimated_crew_cost: number
  estimated_equipment_cost: number
  estimated_logistics_cost: number
  actual_crew_cost: number
  actual_equipment_cost: number
  actual_logistics_cost: number
}

interface ProfitabilityPanelProps {
  summary: FinancialSummary
}

export function ProfitabilityPanel({ summary }: ProfitabilityPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const isHealthy = summary.actual_margin_percent >= summary.target_margin_percent
  const profitColor = isHealthy ? 'text-green-400' : 'text-red-400'
  const profitBg = isHealthy ? 'bg-green-500/10' : 'bg-red-500/10'
  const profitBorder = isHealthy ? 'border-green-500/20' : 'border-red-500/20'

  return (
    <div className="space-y-6">
      {/* Alerta de margem */}
      {summary.margin_alert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-400">
              Margem abaixo da meta!
            </p>
            <p className="text-xs text-red-400/70">
              Margem atual: {formatPercent(summary.actual_margin_percent)} |
              Meta: {formatPercent(summary.target_margin_percent)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Faturamento */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Faturamento</p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatCurrency(summary.total_revenue)}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Custo Estimado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Custo Estimado</p>
              <p className="mt-1 text-xl font-bold text-orange-400">
                {formatCurrency(summary.total_estimated_cost)}
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/20 p-2">
              <Target className="h-5 w-5 text-orange-400" />
            </div>
          </div>
        </motion.div>

        {/* Custo Realizado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Custo Realizado</p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatCurrency(summary.total_actual_cost)}
              </p>
              {summary.total_actual_cost > summary.total_estimated_cost && (
                <p className="mt-1 text-xs text-red-400">
                  +{formatCurrency(summary.total_actual_cost - summary.total_estimated_cost)} acima
                </p>
              )}
            </div>
            <div className="rounded-lg bg-purple-500/20 p-2">
              <TrendingDown className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </motion.div>

        {/* Margem de Lucro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl border ${profitBorder} ${profitBg} p-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Margem de Lucro</p>
              <p className={`mt-1 text-2xl font-bold ${profitColor}`}>
                {formatPercent(summary.actual_margin_percent)}
              </p>
              <p className={`text-lg font-bold ${profitColor}`}>
                {formatCurrency(summary.actual_profit)}
              </p>
            </div>
            <div className={`rounded-lg ${isHealthy ? 'bg-green-500/20' : 'bg-red-500/20'} p-2`}>
              {isHealthy ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Breakdown de custos */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Crew & Talents */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-3 text-sm font-medium text-zinc-400">
            Crew & Talents
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Estimado</span>
              <span className="font-medium text-orange-400">
                {formatCurrency(summary.estimated_crew_cost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Realizado</span>
              <span className="font-medium text-white">
                {formatCurrency(summary.actual_crew_cost)}
              </span>
            </div>
          </div>
        </div>

        {/* Equipamentos */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-3 text-sm font-medium text-zinc-400">
            Equipamentos
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Estimado</span>
              <span className="font-medium text-orange-400">
                {formatCurrency(summary.estimated_equipment_cost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Realizado</span>
              <span className="font-medium text-white">
                {formatCurrency(summary.actual_equipment_cost)}
              </span>
            </div>
          </div>
        </div>

        {/* Logística */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-3 text-sm font-medium text-zinc-400">
            Logística & Diversos
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Estimado</span>
              <span className="font-medium text-orange-400">
                {formatCurrency(summary.estimated_logistics_cost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Realizado</span>
              <span className="font-medium text-white">
                {formatCurrency(summary.actual_logistics_cost)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
