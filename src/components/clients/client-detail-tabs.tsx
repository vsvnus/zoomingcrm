'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  LayoutDashboard,
  DollarSign,
  FileText,
  Briefcase,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { ClientEditModal } from './client-edit-modal'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, type ProjectStatus } from '@/types/projects'

type Client = {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
}

type Project = {
  id: string
  title: string
  status: ProjectStatus
  budget?: number | null
  deadline?: string | null
  created_at: string
}

type Proposal = {
  id: string
  title: string
  status: string
  total_value?: number | null
  created_at: string
}

type Financial = {
  id: string
  description: string
  type: 'INCOME' | 'EXPENSE' | 'INITIAL_CAPITAL'
  amount: number
  due_date?: string | null
  payment_date?: string | null
  status?: string
}

interface ClientDetailTabsProps {
  client: Client
  projects: Project[]
  proposals: Proposal[]
  financials: Financial[]
}

const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviada',
  VIEWED: 'Visualizada',
  ACCEPTED: 'Aceita',
  REJECTED: 'Rejeitada',
  EXPIRED: 'Expirada',
}

const PROPOSAL_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
  SENT: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  VIEWED: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  ACCEPTED: { bg: 'bg-green-500/10', text: 'text-green-400' },
  REJECTED: { bg: 'bg-red-500/10', text: 'text-red-400' },
  EXPIRED: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
}

export function ClientDetailTabs({
  client,
  projects,
  proposals,
  financials,
}: ClientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'proposals' | 'financial'>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Resumo', icon: LayoutDashboard },
    { id: 'projects', label: 'Projetos', icon: Briefcase, count: projects.length },
    { id: 'proposals', label: 'Propostas', icon: FileText, count: proposals.length },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date?: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Calcular metricas
  const totalRevenue = financials
    .filter((f) => f.type === 'INCOME')
    .reduce((acc, f) => acc + Number(f.amount || 0), 0)

  const totalExpenses = financials
    .filter((f) => f.type === 'EXPENSE')
    .reduce((acc, f) => acc + Number(f.amount || 0), 0)

  const activeProjects = projects.filter((p) => p.status !== 'DONE').length
  const completedProjects = projects.filter((p) => p.status === 'DONE').length
  const acceptedProposals = proposals.filter((p) => p.status === 'ACCEPTED').length

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={"/clients" as any}
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para clientes
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-500 to-neutral-700 text-3xl font-bold text-white"
            >
              {getInitials(client.name)}
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-text-primary"
              >
                {client.name}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-1 flex items-center gap-4"
              >
                {client.company && (
                  <span className="flex items-center gap-1 text-sm text-text-tertiary">
                    <Building className="h-4 w-4" />
                    {client.company}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-text-tertiary">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1 text-sm text-text-tertiary">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Edit Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-secondary px-4 py-2 text-sm font-medium text-text-primary transition-all hover:bg-bg-hover"
          >
            <Edit className="h-4 w-4" />
            Editar
          </motion.button>
        </div>
      </div>

      {/* Metricas Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {/* Projetos Ativos */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Briefcase className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Projetos Ativos</p>
              <p className="text-xl font-bold text-text-primary">{activeProjects}</p>
            </div>
          </div>
        </div>

        {/* Projetos Concluidos */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Concluidos</p>
              <p className="text-xl font-bold text-text-primary">{completedProjects}</p>
            </div>
          </div>
        </div>

        {/* Total Receita */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Receita Total</p>
              <p className="text-xl font-bold text-text-primary">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Propostas Aceitas */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Propostas Aceitas</p>
              <p className="text-xl font-bold text-text-primary">{acceptedProposals}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 rounded-xl border border-[rgb(var(--border))] bg-card p-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeClientTab"
                  className="absolute inset-0 rounded-lg bg-secondary"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="relative rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Dados do Cliente */}
            <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <User className="h-5 w-5" />
                Dados do Cliente
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-2">
                  <span className="text-sm text-text-tertiary">Nome</span>
                  <span className="text-sm text-text-primary">{client.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-2">
                  <span className="text-sm text-text-tertiary">Email</span>
                  <a href={`mailto:${client.email}`} className="text-sm text-primary hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.phone && (
                  <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-2">
                    <span className="text-sm text-text-tertiary">Telefone</span>
                    <a href={`tel:${client.phone}`} className="text-sm text-text-primary hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-2">
                    <span className="text-sm text-text-tertiary">Empresa</span>
                    <span className="text-sm text-text-primary">{client.company}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-tertiary">Cliente desde</span>
                  <span className="text-sm text-text-primary">{formatDate(client.created_at)}</span>
                </div>
              </div>

              {client.notes && (
                <div className="mt-4 border-t border-[rgb(var(--border))] pt-4">
                  <p className="text-xs text-text-tertiary">Observacoes</p>
                  <p className="mt-1 text-sm text-text-secondary">{client.notes}</p>
                </div>
              )}
            </div>

            {/* Ultimos Projetos */}
            <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <Briefcase className="h-5 w-5" />
                Ultimos Projetos
              </h3>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}` as any}
                      className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-secondary p-3 transition-all hover:bg-bg-hover"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{project.title}</p>
                        <p className="text-xs text-text-tertiary">{formatDate(project.created_at)}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          PROJECT_STATUS_COLORS[project.status]?.bg || 'bg-slate-100'
                        } ${PROJECT_STATUS_COLORS[project.status]?.text || 'text-slate-700'}`}
                      >
                        {PROJECT_STATUS_LABELS[project.status] || project.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">Nenhum projeto cadastrado</p>
              )}
            </div>

            {/* Ultimas Propostas */}
            <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6 lg:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <FileText className="h-5 w-5" />
                Ultimas Propostas
              </h3>
              {proposals.length > 0 ? (
                <div className="space-y-3">
                  {proposals.slice(0, 5).map((proposal) => (
                    <Link
                      key={proposal.id}
                      href={`/proposals/${proposal.id}/edit` as any}
                      className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-secondary p-3 transition-all hover:bg-bg-hover"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-purple-500/10 p-2">
                          <FileText className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{proposal.title}</p>
                          <p className="text-xs text-text-tertiary">{formatDate(proposal.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {proposal.total_value && (
                          <span className="text-sm font-medium text-text-primary">
                            {formatCurrency(proposal.total_value)}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            PROPOSAL_STATUS_COLORS[proposal.status]?.bg || 'bg-slate-500/10'
                          } ${PROPOSAL_STATUS_COLORS[proposal.status]?.text || 'text-slate-400'}`}
                        >
                          {PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">Nenhuma proposta cadastrada</p>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Todos os Projetos</h3>
              <Link
                href={"/projects" as any}
                className="text-sm text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}` as any}
                    className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-secondary p-4 transition-all hover:bg-bg-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-blue-500/10 p-2">
                        <Briefcase className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{project.title}</p>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <span>Criado em {formatDate(project.created_at)}</span>
                          {project.deadline && (
                            <>
                              <span>|</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Prazo: {formatDate(project.deadline)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {project.budget && (
                        <span className="text-sm font-medium text-text-primary">
                          {formatCurrency(project.budget)}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          PROJECT_STATUS_COLORS[project.status]?.bg || 'bg-slate-100'
                        } ${PROJECT_STATUS_COLORS[project.status]?.text || 'text-slate-700'}`}
                      >
                        {PROJECT_STATUS_LABELS[project.status] || project.status}
                      </span>
                      <ExternalLink className="h-4 w-4 text-text-tertiary" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-text-quaternary" />
                <p className="text-lg font-medium text-text-primary">Nenhum projeto</p>
                <p className="text-sm text-text-tertiary">
                  Este cliente ainda nao tem projetos vinculados
                </p>
              </div>
            )}
          </div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Todas as Propostas</h3>
              <Link
                href={"/proposals" as any}
                className="text-sm text-primary hover:underline"
              >
                Ver todas
              </Link>
            </div>
            {proposals.length > 0 ? (
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/proposals/${proposal.id}/edit` as any}
                    className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-secondary p-4 transition-all hover:bg-bg-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-purple-500/10 p-2">
                        <FileText className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{proposal.title}</p>
                        <p className="text-xs text-text-tertiary">
                          Criada em {formatDate(proposal.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {proposal.total_value && (
                        <span className="text-sm font-medium text-text-primary">
                          {formatCurrency(proposal.total_value)}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          PROPOSAL_STATUS_COLORS[proposal.status]?.bg || 'bg-slate-500/10'
                        } ${PROPOSAL_STATUS_COLORS[proposal.status]?.text || 'text-slate-400'}`}
                      >
                        {PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status}
                      </span>
                      <ExternalLink className="h-4 w-4 text-text-tertiary" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-text-quaternary" />
                <p className="text-lg font-medium text-text-primary">Nenhuma proposta</p>
                <p className="text-sm text-text-tertiary">
                  Este cliente ainda nao tem propostas vinculadas
                </p>
              </div>
            )}
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Resumo */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
                <p className="text-sm text-text-tertiary">Receita Total</p>
                <p className="mt-1 text-2xl font-bold text-green-500">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Total de entradas deste cliente
                </p>
              </div>

              <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
                <p className="text-sm text-text-tertiary">Despesas</p>
                <p className="mt-1 text-2xl font-bold text-red-500">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Total de saidas deste cliente
                </p>
              </div>

              <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
                <p className="text-sm text-text-tertiary">Saldo</p>
                <p className={`mt-1 text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(totalRevenue - totalExpenses)}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Receitas - Despesas
                </p>
              </div>
            </div>

            {/* Transacoes */}
            <div className="rounded-xl border border-[rgb(var(--border))] bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-text-primary">
                Historico de Transacoes
              </h3>
              {financials.length > 0 ? (
                <div className="space-y-3">
                  {financials.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-secondary p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-lg p-2 ${
                            transaction.type === 'INCOME'
                              ? 'bg-green-500/10'
                              : 'bg-red-500/10'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {formatDate(transaction.payment_date || transaction.due_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === 'INCOME'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <DollarSign className="mx-auto mb-4 h-12 w-12 text-text-quaternary" />
                  <p className="text-lg font-medium text-text-primary">
                    Nenhuma transacao
                  </p>
                  <p className="text-sm text-text-tertiary">
                    Este cliente ainda nao tem transacoes financeiras
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <ClientEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
      />
    </div>
  )
}
