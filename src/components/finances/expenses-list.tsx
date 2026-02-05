'use client'

import { motion } from 'framer-motion'
import { Users, Box, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react'

type Expense = {
  id: string
  category: 'CREW_TALENT' | 'EQUIPMENT' | 'LOGISTICS'
  description: string
  estimated_cost: number
  actual_cost: number
  payment_status: 'TO_PAY' | 'SCHEDULED' | 'PAID'
  payment_date?: string
  invoice_number?: string
  notes?: string
  freelancers?: { id: string; name: string }
  equipments?: { id: string; name: string }
}

interface ExpensesListProps {
  expenses: Expense[]
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    // If it's a simple date string YYYY-MM-DD, parse manually to avoid timezone issues
    if (date.length === 10 && date.includes('-')) {
      const [y, m, d] = date.split('-')
      return `${d}/${m}/${y}`
    }
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CREW_TALENT':
        return Users
      case 'EQUIPMENT':
        return Box
      case 'LOGISTICS':
        return Truck
      default:
        return Users
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'CREW_TALENT':
        return 'Crew & Talents'
      case 'EQUIPMENT':
        return 'Equipamentos'
      case 'LOGISTICS':
        return 'Logística'
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CREW_TALENT':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'EQUIPMENT':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'LOGISTICS':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return CheckCircle
      case 'SCHEDULED':
        return Clock
      case 'TO_PAY':
        return AlertCircle
      default:
        return AlertCircle
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pago'
      case 'SCHEDULED':
        return 'Agendado'
      case 'TO_PAY':
        return 'A Pagar'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-400'
      case 'SCHEDULED':
        return 'text-yellow-400'
      case 'TO_PAY':
        return 'text-red-400'
      default:
        return 'text-zinc-400'
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">Nenhuma despesa cadastrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => {
        const CategoryIcon = getCategoryIcon(expense.category)
        const StatusIcon = getStatusIcon(expense.payment_status)
        const isOverBudget = expense.actual_cost > expense.estimated_cost

        return (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Category & Description */}
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`rounded-lg border p-2 ${getCategoryColor(
                    expense.category
                  )}`}
                >
                  <CategoryIcon className="h-4 w-4" />
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="font-medium text-white">
                      {expense.description}
                    </h4>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${getCategoryColor(
                        expense.category
                      )}`}
                    >
                      {getCategoryLabel(expense.category)}
                    </span>
                  </div>

                  {(expense.freelancers || expense.equipments) && (
                    <p className="text-sm text-zinc-500">
                      {expense.freelancers?.name || expense.equipments?.name}
                    </p>
                  )}

                  {expense.invoice_number && (
                    <p className="mt-1 text-xs text-zinc-600">
                      NF: {expense.invoice_number}
                    </p>
                  )}

                  {expense.notes && (
                    <p className="mt-1 text-xs text-zinc-600">
                      {expense.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Costs & Status */}
              <div className="flex items-start gap-6">
                {/* Costs */}
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Estimado</p>
                  <p className="font-medium text-orange-400">
                    {formatCurrency(expense.estimated_cost)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">Realizado</p>
                  <p
                    className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-white'
                      }`}
                  >
                    {formatCurrency(expense.actual_cost)}
                  </p>
                  {isOverBudget && (
                    <p className="mt-0.5 text-xs text-red-400">
                      +{formatCurrency(expense.actual_cost - expense.estimated_cost)}
                    </p>
                  )}
                </div>

                {/* Payment Status */}
                <div className="flex flex-col items-end">
                  <div
                    className={`flex items-center gap-1.5 ${getStatusColor(
                      expense.payment_status
                    )}`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {getStatusLabel(expense.payment_status)}
                    </span>
                  </div>
                  {expense.payment_date && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatDate(expense.payment_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
