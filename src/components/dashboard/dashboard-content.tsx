'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Film,
  Clock,
  Calendar,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  MapPin,
  Package,
  Users,
} from 'lucide-react'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { getDashboardStats, type DashboardStats } from '@/actions/dashboard'
import { CashFlowChart } from '@/components/charts/cash-flow-chart'
import { DateRangePicker } from './date-range-picker'

interface DashboardContentProps {
  stats: DashboardStats
}

const stageMap: Record<string, string> = {
  LEAD: 'Lead',
  BRIEFING: 'Briefing',
  PRE_PROD: 'Pré-Produção',
  SHOOTING: 'Gravação',
  POST_PROD: 'Pós-Produção',
  REVIEW: 'Revisão',
  DONE: 'Concluído',
  DELIVERED: 'Entregue',
  ARCHIVED: 'Arquivado',
}

const stageColors: Record<string, string> = {
  LEAD: 'bg-neutral-500',
  BRIEFING: 'bg-warning',
  PRE_PROD: 'bg-info',
  SHOOTING: 'bg-neutral-600',
  POST_PROD: 'bg-warning',
  REVIEW: 'bg-neutral-500',
  DONE: 'bg-success',
  DELIVERED: 'bg-success',
  ARCHIVED: 'bg-neutral-700',
}

export function DashboardContent({ initialStats }: { initialStats?: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initialStats || {
    activeProjects: 0,
    newClients: 0,
    currentBalance: 0,
    projects: [],

    upcomingEvents: [],
    cashFlowData: [],
    pendingReceivables: 0,
    pendingPayables: 0,
  })
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null)
  const [chartVariant, setChartVariant] = useState<'area' | 'bar'>('area')
  const [isLoading, setIsLoading] = useState(false)

  // Atualizar stats quando dateRange mudar
  useEffect(() => {
    async function updateStats() {
      setIsLoading(true)
      try {
        const newStats = await getDashboardStats(dateRange || undefined)
        setStats(newStats)
      } catch (error) {
        console.error('Erro ao atualizar dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (dateRange) {
      updateStats()
    } else {
      // Se limpar o filtro, voltar ao inicial (ou buscar sem filtro)
      // Para simplificar, buscamos sem filtro
      updateStats()
    }
  }, [dateRange])

  const formatCurrency = (value: number) => {
    const formatted = value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `R$ ${formatted}`
  }

  const formatCurrencyCompact = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      const compact = (value / 1000000).toFixed(1).replace('.', ',')
      return `R$ ${compact}M`
    }
    if (Math.abs(value) >= 1000) {
      const compact = (value / 1000).toFixed(1).replace('.', ',')
      return `R$ ${compact}K`
    }
    return formatCurrency(value)
  }

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const daysLeft = differenceInDays(deadlineDate, today)

    if (isPast(deadlineDate) && !isToday(deadlineDate)) {
      return { label: 'Atrasado', color: 'text-error', bg: 'bg-error/10' }
    }
    if (daysLeft <= 3) {
      return { label: `${daysLeft}d`, color: 'text-warning', bg: 'bg-warning/10' }
    }
    if (daysLeft <= 7) {
      return { label: `${daysLeft}d`, color: 'text-warning', bg: 'bg-warning/10' }
    }
    return { label: `${daysLeft}d`, color: 'text-text-tertiary', bg: 'bg-secondary' }
  }

  const statsCards = [
    {
      label: 'Saldo em Caixa',
      value: formatCurrency(stats.currentBalance),
      change: stats.currentBalance >= 0 ? 'positivo' : 'negativo',
      icon: DollarSign,
      color: stats.currentBalance >= 0 ? 'from-neutral-600 to-neutral-800' : 'from-neutral-500 to-neutral-700',
      trend: stats.currentBalance >= 0 ? 'up' : 'down',
      href: '/financeiro',
    },
    {
      label: 'Projetos Ativos',
      value: stats.activeProjects.toString(),
      change: stats.activeProjects === 1 ? 'projeto' : 'projetos',
      icon: Film,
      color: 'from-neutral-500 to-neutral-700',
      href: '/projects',
    },
    {
      label: 'A Receber',
      value: formatCurrencyCompact(stats.pendingReceivables),
      change: 'pendente',
      icon: ArrowUpRight,
      color: 'from-neutral-600 to-neutral-800',
      trend: 'up',
      href: '/financeiro?tab=receivables',
    },
    {
      label: 'A Pagar',
      value: formatCurrencyCompact(stats.pendingPayables),
      change: 'pendente',
      icon: ArrowDownRight,
      color: 'from-neutral-500 to-neutral-700',
      trend: 'down',
      href: '/financeiro?tab=payables',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-text-tertiary"
          >
            Bem-vindo de volta! Aqui está o resumo dos seus projetos.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={stat.href as any}
              className="group block relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-card p-5 transition-all hover:shadow-3 hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-tertiary">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                    {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-error" />}
                    <p className={`text-xs ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-error' : 'text-text-tertiary'}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Cash Flow Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative rounded-2xl border border-[rgb(var(--border))] bg-card p-6"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-[2px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-neutral-600 to-neutral-800 p-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Fluxo de Caixa</h2>
              <p className="text-xs text-text-tertiary">Últimos {dateRange ? differenceInDays(dateRange.end, dateRange.start) + ' dias' : '6 meses'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartVariant('area')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${chartVariant === 'area'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-tertiary hover:text-text-primary'
                }`}
            >
              Área
            </button>
            <button
              onClick={() => setChartVariant('bar')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${chartVariant === 'bar'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-tertiary hover:text-text-primary'
                }`}
            >
              Barras
            </button>
          </div>
        </div>
        <CashFlowChart data={stats.cashFlowData} variant={chartVariant} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projetos em Andamento */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 rounded-2xl border border-[rgb(var(--border))] bg-card p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-neutral-600 to-neutral-800 p-2">
                <Film className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Projetos em Andamento</h2>
                <p className="text-xs text-text-tertiary">Ordenados por prazo de entrega</p>
              </div>
            </div>
            <Link
              href="/projects"
              className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
            >
              Ver todos
            </Link>
          </div>

          {stats.projects.length > 0 ? (
            <div className="space-y-3">
              {stats.projects.map((project, index) => {
                const deadlineStatus = getDeadlineStatus(project.deadline_date)

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      className="group flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-secondary p-4 transition-all hover:bg-bg-hover"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-text-primary truncate group-hover:text-text-secondary transition-colors">
                            {project.title}
                          </h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageColors[project.status]} text-white`}>
                            {stageMap[project.status] || project.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-text-tertiary truncate">
                          {project.clients?.name || 'Cliente não definido'}
                        </p>
                      </div>
                      {deadlineStatus && (
                        <div className={`ml-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${deadlineStatus.bg}`}>
                          <Clock className={`h-3.5 w-3.5 ${deadlineStatus.color}`} />
                          <span className={`text-xs font-medium ${deadlineStatus.color}`}>
                            {deadlineStatus.label}
                          </span>
                        </div>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Film className="h-12 w-12 text-text-quaternary" />
              <p className="mt-4 text-sm text-text-tertiary">Nenhum projeto em andamento</p>
              <Link
                href="/projects/new"
                className="mt-3 text-sm text-text-secondary hover:text-text-primary"
              >
                Criar novo projeto
              </Link>
            </div>
          )}
        </motion.div>

        {/* Próximos Eventos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-[rgb(var(--border))] bg-card p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-neutral-600 to-neutral-800 p-2">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Próximos Eventos</h2>
              <p className="text-xs text-text-tertiary">Agendamentos futuros</p>
            </div>
          </div>

          {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingEvents.map((event, index) => {
                const eventDate = event.date ? new Date(event.date) : null
                const isEventToday = eventDate && isToday(eventDate)

                // Definir ícone e cor por tipo
                let EventIcon = Calendar
                let iconColorClass = 'from-neutral-600 to-neutral-800'

                if (event.type === 'shooting') {
                  EventIcon = Film
                  iconColorClass = 'from-violet-500 to-violet-700'
                } else if (event.type === 'delivery') {
                  EventIcon = Package
                  iconColorClass = 'from-emerald-500 to-emerald-700'
                } else if (event.type === 'meeting') {
                  EventIcon = Users
                  iconColorClass = 'from-blue-500 to-blue-700'
                } else {
                  EventIcon = Calendar
                  iconColorClass = 'from-neutral-500 to-neutral-700'
                }

                // Definir HREF
                const href = event.link_id && event.link_type === 'project'
                  ? `/projects/${event.link_id}`
                  : '/calendar'

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                  >
                    <Link
                      href={href as any}
                      className={`group block rounded-xl border p-4 transition-all hover:bg-bg-hover ${isEventToday
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-[rgb(var(--border))] bg-secondary'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${iconColorClass}`}>
                          <EventIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-text-primary truncate group-hover:text-text-secondary transition-colors">
                            {event.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {eventDate && (
                                event.time
                                  ? format(eventDate, "dd/MM 'às' HH:mm", { locale: ptBR }) // Data fixa, hora do banco
                                  : format(eventDate, "dd/MM", { locale: ptBR })
                              )}
                            </span>
                            {isEventToday && (
                              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                HOJE
                              </span>
                            )}
                          </div>
                          {(event.location) && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-quaternary">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          {(event.client && !event.location) && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-quaternary">
                              <Users className="h-3 w-3" />
                              <span className="truncate">{event.client}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-text-quaternary" />
              <p className="mt-4 text-sm text-text-tertiary">Nenhum evento agendado</p>
              <Link
                href="/calendar"
                className="mt-3 text-sm text-text-secondary hover:text-text-primary"
              >
                Ver calendário
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
