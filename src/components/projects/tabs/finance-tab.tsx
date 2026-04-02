'use client'

import {
  DollarSign,
  Users,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertCircle,
  Truck,
  Utensils,
  Package,
  MoreHorizontal,
} from 'lucide-react'
import { type ProjectWithRelations } from '@/types/projects'

export interface FinanceTabProps {
  project: ProjectWithRelations
  expenses: any[]
  equipmentBookings: any[]
  financialSummary: any
  formatCurrency: (value: number) => string
  onDeleteExpense: (expenseId: string) => void
  onAddExpense: () => void
}

export function FinanceTab({
  project,
  expenses,
  equipmentBookings,
  financialSummary,
  formatCurrency,
  onDeleteExpense,
  onAddExpense,
}: FinanceTabProps) {
  // Cálculos financeiros
  const teamCosts = project.project_members?.reduce(
    (acc, member) => acc + (member.agreed_fee || 0),
    0
  ) || 0

  const manualExpensesTotal = expenses?.reduce(
    (acc, expense) => acc + (expense.actual_cost || expense.estimated_cost || 0),
    0
  ) || 0

  const equipmentCosts = equipmentBookings?.reduce((acc, booking) => {
    if (!booking.equipments?.daily_rate || !booking.start_date || !booking.end_date) return acc
    const start = new Date(booking.start_date)
    const end = new Date(booking.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return acc + (Number(booking.equipments.daily_rate) * diffDays)
  }, 0) || 0

  const totalCosts = teamCosts + manualExpensesTotal + equipmentCosts

  // Calcular total do escopo (itens)
  const scopeTotal = project.items?.reduce(
    (acc, item) => acc + Number(item.total_price),
    0
  ) || 0

  // Se houver itens no escopo, usamos a soma deles como valor do projeto
  // Caso contrário, usamos o valor aprovado/budget
  const projectValue = scopeTotal > 0
    ? scopeTotal
    : (financialSummary?.total_revenue || financialSummary?.approved_value || Number(project.budget) || 0)

  const profitMargin = projectValue > 0 ? ((projectValue - totalCosts) / projectValue) * 100 : 0
  const profit = projectValue - totalCosts

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
        {/* Valor do Projeto */}
        <div className="rounded-xl border border-border bg-card p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-text-tertiary">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Valor do Projeto</span>
          </div>


          <p className="mt-2 text-lg md:text-2xl font-bold text-text-primary">
            {formatCurrency(projectValue)}
          </p>
        </div>


        {/* Total de Custos */}
        <div className="rounded-xl border border-border bg-card p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-text-tertiary">
            <Receipt className="h-4 w-4" />
            <span className="text-sm">Total de Custos</span>
          </div>
          <p className="mt-2 text-lg md:text-2xl font-bold text-red-400">
            {formatCurrency(totalCosts)}
          </p>
        </div>

        {/* Lucro */}
        <div className="rounded-xl border border-border bg-card p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-text-tertiary">
            {profit >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm">Lucro</span>
          </div>
          <p
            className={`mt-2 text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
          >
            {formatCurrency(profit)}
          </p>
        </div>

        {/* Margem */}
        <div className="rounded-xl border border-border bg-card p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-text-tertiary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Margem</span>
          </div>
          <p
            className={`mt-2 text-2xl font-bold ${profitMargin >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
          >
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Alerta se não houver valor aprovado definido */}
      {!projectValue && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="font-medium text-yellow-600">
              Valor do projeto não definido
            </p>
            <p className="text-sm text-text-tertiary">
              Configure o valor aprovado na tabela project_finances ou através da proposta aprovada.
            </p>
          </div>
        </div>
      )}

      {/* Custos da Equipe */}
      <div className="rounded-xl border border-border bg-card backdrop-blur-sm">
        <div className="border-b border-border p-4 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Custos da Equipe
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Valores acordados com freelancers
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-text-tertiary">Subtotal</p>
              <p className="text-lg md:text-xl font-bold text-text-primary">
                {formatCurrency(teamCosts)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {project.project_members && project.project_members.length > 0 ? (
            <div className="space-y-3">
              {project.project_members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-lg border border-border bg-card p-3 md:p-4"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {member.freelancers.name}
                      </p>
                      <p className="text-sm text-text-secondary">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right pl-13 md:pl-0">
                    <p className="font-medium text-text-primary">
                      {member.agreed_fee
                        ? formatCurrency(member.agreed_fee)
                        : 'Não definido'}
                    </p>
                    <span
                      className={`text-xs ${member.status === 'CONFIRMED'
                        ? 'text-green-500'
                        : 'text-yellow-500'
                        }`}
                    >
                      {member.status === 'CONFIRMED'
                        ? 'Confirmado'
                        : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
              <p className="text-sm text-text-secondary">
                Nenhum membro na equipe ainda
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Despesas Manuais */}
      <div className="rounded-xl border border-border bg-card backdrop-blur-sm">
        <div className="border-b border-border p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Outras Despesas
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Equipamentos, logística e outros custos
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-left md:text-right">
                <p className="text-sm text-text-tertiary">Subtotal</p>
                <p className="text-lg md:text-xl font-bold text-text-primary">
                  {formatCurrency(manualExpensesTotal)}
                </p>
              </div>
              <button
                onClick={onAddExpense}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 md:px-4 text-sm font-medium text-white transition-all hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Nova Despesa</span>
                <span className="md:hidden">Nova</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {expenses && expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-lg border border-border bg-card p-3 md:p-4"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${expense.category === 'CREW_TALENT'
                        ? 'bg-purple-500/10 text-purple-500'
                        : expense.category === 'EQUIPMENT'
                          ? 'bg-blue-500/10 text-blue-500'
                          : expense.category === 'LOGISTICS'
                            ? 'bg-orange-500/10 text-orange-500'
                            : expense.category === 'FOOD'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-zinc-500/10 text-zinc-500'
                        }`}
                    >
                      {expense.category === 'CREW_TALENT' ? (
                        <Users className="h-5 w-5" />
                      ) : expense.category === 'EQUIPMENT' ? (
                        <Package className="h-5 w-5" />
                      ) : expense.category === 'LOGISTICS' ? (
                        <Truck className="h-5 w-5" />
                      ) : expense.category === 'FOOD' ? (
                        <Utensils className="h-5 w-5" />
                      ) : (
                        <MoreHorizontal className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {expense.description}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {expense.category === 'CREW_TALENT'
                          ? 'Crew & Talents'
                          : expense.category === 'EQUIPMENT'
                            ? 'Equipamento'
                            : expense.category === 'LOGISTICS'
                              ? 'Logística'
                              : expense.category === 'FOOD'
                                ? 'Alimentação'
                                : 'Outros'}
                        {expense.freelancers?.name &&
                          ` \u2022 ${expense.freelancers.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 pl-13 md:pl-0">
                    <div className="text-left md:text-right">
                      <p className="font-medium text-text-primary">
                        {formatCurrency(
                          expense.actual_cost || expense.estimated_cost || 0
                        )}
                      </p>
                      <span
                        className={`text-xs ${expense.payment_status === 'PAID'
                          ? 'text-green-500'
                          : expense.payment_status === 'SCHEDULED'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                          }`}
                      >
                        {expense.payment_status === 'PAID'
                          ? 'Pago'
                          : expense.payment_status === 'SCHEDULED'
                            ? 'Agendado'
                            : 'A Pagar'}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-500 transition-all hover:bg-red-500/20"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Receipt className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
              <p className="mb-2 text-sm text-text-secondary">
                Nenhuma despesa adicional
              </p>
              <button
                onClick={onAddExpense}
                className="text-sm text-green-500 hover:underline"
              >
                Adicionar primeira despesa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card to-secondary p-4 md:p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Resumo do Job Costing
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Valor do Projeto</span>
            <span className="font-medium text-text-primary">
              {formatCurrency(projectValue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">(-) Custos da Equipe</span>
            <span className="font-medium text-red-500">
              {formatCurrency(teamCosts)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">(-) Custos de Equipamento</span>
            <span className="font-medium text-red-500">
              {formatCurrency(equipmentCosts)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">(-) Outras Despesas</span>
            <span className="font-medium text-red-500">
              {formatCurrency(manualExpensesTotal)}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between">
              <span className="font-medium text-text-primary">Lucro Líquido</span>
              <span
                className={`text-xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
              >
                {formatCurrency(profit)}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-text-secondary">Margem de Lucro</span>
              <span
                className={`font-medium ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
              >
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
