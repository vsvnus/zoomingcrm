'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    User,
    LayoutDashboard,
    DollarSign,
    Calendar,
    Briefcase,
    Mail,
    Phone,
    Star,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    FileText,
    ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import type { FreelancerWithDetails } from '@/types/assignments'
import {
    ASSIGNMENT_STATUS_LABELS,
    ASSIGNMENT_STATUS_COLORS,
} from '@/types/assignments'

interface FreelancerDetailTabsProps {
    freelancer: FreelancerWithDetails
}

export function FreelancerDetailTabs({ freelancer }: FreelancerDetailTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'financial' | 'schedule'>('overview')

    const tabs = [
        { id: 'overview', label: 'Resumo', icon: LayoutDashboard },
        { id: 'history', label: 'Histórico', icon: Briefcase },
        { id: 'financial', label: 'Financeiro', icon: DollarSign },
        { id: 'schedule', label: 'Agenda', icon: Calendar },
    ]

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value)
    }

    const formatDate = (date?: string) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const summary = freelancer.financial_summary

    // Calcular métricas
    const totalPaid = summary?.total_paid || 0
    const projectsCount = summary?.projects_count || 0
    const completedAssignments = summary?.completed_assignments || 0
    const totalAssignments = summary?.total_assignments || 0
    const completionRate = totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0
    const pendingWork = summary?.pending_assignments || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/freelancers"
                    className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para freelancers
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-3xl font-bold text-white"
                        >
                            {freelancer.name.charAt(0).toUpperCase()}
                        </motion.div>

                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold text-white"
                            >
                                {freelancer.name}
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mt-1 flex items-center gap-4"
                            >
                                {freelancer.email && (
                                    <span className="flex items-center gap-1 text-sm text-zinc-400">
                                        <Mail className="h-4 w-4" />
                                        {freelancer.email}
                                    </span>
                                )}
                                {freelancer.phone && (
                                    <span className="flex items-center gap-1 text-sm text-zinc-400">
                                        <Phone className="h-4 w-4" />
                                        {freelancer.phone}
                                    </span>
                                )}
                                {freelancer.rating && (
                                    <span className="flex items-center gap-1 text-sm text-yellow-400">
                                        <Star className="h-4 w-4 fill-current" />
                                        {freelancer.rating.toFixed(1)}
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Diária padrão */}
                    {freelancer.daily_rate && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right"
                        >
                            <p className="text-xs text-zinc-500">Diária Padrão</p>
                            <p className="text-lg font-bold text-white">
                                {formatCurrency(freelancer.daily_rate)}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Métricas Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            >
                {/* Total Recebido */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-green-500/10 p-2">
                            <DollarSign className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Total Recebido</p>
                            <p className="text-xl font-bold text-white">
                                {formatCurrency(totalPaid)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Projetos */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                            <Briefcase className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Projetos</p>
                            <p className="text-xl font-bold text-white">{projectsCount}</p>
                        </div>
                    </div>
                </div>

                {/* Taxa de Entrega */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-2 ${completionRate >= 80 ? 'bg-green-500/10' : completionRate >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                            {completionRate >= 80 ? (
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-yellow-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Taxa de Conclusão</p>
                            <p className="text-xl font-bold text-white">{completionRate}%</p>
                        </div>
                    </div>
                </div>

                {/* Trabalhos Pendentes */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-orange-500/10 p-2">
                            <Clock className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Pendentes</p>
                            <p className="text-xl font-bold text-white">{pendingWork}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm"
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${isActive
                                ? 'text-white'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeFreelancerTab"
                                    className="absolute inset-0 rounded-lg bg-white/10"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                            <Icon className="relative h-4 w-4" />
                            <span className="relative">{tab.label}</span>
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
                        {/* Dados Pessoais */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                <User className="h-5 w-5" />
                                Dados Pessoais
                            </h3>
                            <div className="space-y-3">
                                {freelancer.email && (
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-sm text-zinc-500">Email</span>
                                        <span className="text-sm text-white">{freelancer.email}</span>
                                    </div>
                                )}
                                {freelancer.phone && (
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-sm text-zinc-500">Telefone</span>
                                        <span className="text-sm text-white">{freelancer.phone}</span>
                                    </div>
                                )}
                                {freelancer.cpf && (
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-sm text-zinc-500">CPF</span>
                                        <span className="text-sm text-white">{freelancer.cpf}</span>
                                    </div>
                                )}
                                {freelancer.pix_key && (
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-sm text-zinc-500">Chave PIX</span>
                                        <span className="text-sm text-white">{freelancer.pix_key}</span>
                                    </div>
                                )}
                                {freelancer.daily_rate && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-500">Diária Padrão</span>
                                        <span className="text-sm font-medium text-white">
                                            {formatCurrency(freelancer.daily_rate)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                <Briefcase className="h-5 w-5" />
                                Habilidades
                            </h3>
                            {freelancer.skills ? (
                                <div className="flex flex-wrap gap-2">
                                    {freelancer.skills.split(',').map((skill, index) => (
                                        <span
                                            key={index}
                                            className="rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-sm text-accent-300"
                                        >
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500">Nenhuma habilidade cadastrada</p>
                            )}

                            {freelancer.notes && (
                                <div className="mt-4 border-t border-white/10 pt-4">
                                    <p className="text-xs text-zinc-500">Observações</p>
                                    <p className="mt-1 text-sm text-zinc-300">{freelancer.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Últimos Trabalhos */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:col-span-2">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                <FileText className="h-5 w-5" />
                                Últimos Trabalhos
                            </h3>
                            {freelancer.work_history && freelancer.work_history.length > 0 ? (
                                <div className="space-y-3">
                                    {freelancer.work_history.slice(0, 5).map((work) => (
                                        <div
                                            key={work.assignment_id}
                                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`rounded-lg p-2 ${work.source_type === 'project'
                                                        ? 'bg-blue-500/10'
                                                        : 'bg-purple-500/10'
                                                        }`}
                                                >
                                                    {work.source_type === 'project' ? (
                                                        <Briefcase className="h-4 w-4 text-blue-400" />
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-purple-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {work.item_description}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {work.source_title} • {work.client_name || 'Sem cliente'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {work.agreed_fee && (
                                                    <span className="text-sm font-medium text-white">
                                                        {formatCurrency(work.agreed_fee)}
                                                    </span>
                                                )}
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${ASSIGNMENT_STATUS_COLORS[work.status].bg
                                                        } ${ASSIGNMENT_STATUS_COLORS[work.status].text}`}
                                                >
                                                    {ASSIGNMENT_STATUS_LABELS[work.status]}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500">Nenhum trabalho registrado</p>
                            )}
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h3 className="mb-4 text-lg font-semibold text-white">
                            Histórico Completo de Trabalhos
                        </h3>
                        {freelancer.work_history && freelancer.work_history.length > 0 ? (
                            <div className="space-y-3">
                                {freelancer.work_history.map((work) => (
                                    <div
                                        key={work.assignment_id}
                                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`rounded-lg p-2 ${work.source_type === 'project'
                                                    ? 'bg-blue-500/10'
                                                    : 'bg-purple-500/10'
                                                    }`}
                                            >
                                                {work.source_type === 'project' ? (
                                                    <Briefcase className="h-5 w-5 text-blue-400" />
                                                ) : (
                                                    <FileText className="h-5 w-5 text-purple-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {work.item_description}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <span>{work.source_title}</span>
                                                    <span>•</span>
                                                    <span>{work.client_name || 'Sem cliente'}</span>
                                                    {work.role && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-accent-400">{work.role}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {work.agreed_fee && (
                                                    <p className="font-medium text-white">
                                                        {formatCurrency(work.agreed_fee)}
                                                    </p>
                                                )}
                                                <p className="text-xs text-zinc-500">
                                                    {formatDate(work.created_at)}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${ASSIGNMENT_STATUS_COLORS[work.status].bg
                                                    } ${ASSIGNMENT_STATUS_COLORS[work.status].text}`}
                                            >
                                                {ASSIGNMENT_STATUS_LABELS[work.status]}
                                            </span>
                                            <Link
                                                href={work.source_type === 'project' ? `/projects/${work.source_id}` : `/proposals/${work.source_id}` as any}
                                                className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Briefcase className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                                <p className="text-lg font-medium text-white">Nenhum trabalho registrado</p>
                                <p className="text-sm text-zinc-500">
                                    Este freelancer ainda não tem trabalhos vinculados
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
                            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                                <p className="text-sm text-zinc-500">Total Combinado</p>
                                <p className="mt-1 text-2xl font-bold text-white">
                                    {formatCurrency(summary?.total_agreed_fees || 0)}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Soma de todos os cachês combinados
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                                <p className="text-sm text-zinc-500">Já Pago</p>
                                <p className="mt-1 text-2xl font-bold text-green-400">
                                    {formatCurrency(summary?.total_paid || 0)}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Pagamentos confirmados
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                                <p className="text-sm text-zinc-500">Pendente</p>
                                <p className="mt-1 text-2xl font-bold text-orange-400">
                                    {formatCurrency(summary?.pending_payment || 0)}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Aguardando pagamento
                                </p>
                            </div>
                        </div>

                        {/* Gráfico de Ganhos Mensais (simplificado) */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-lg font-semibold text-white">
                                Ganhos Mensais (Últimos 12 meses)
                            </h3>
                            {freelancer.monthly_earnings && freelancer.monthly_earnings.length > 0 ? (
                                <div className="space-y-2">
                                    {freelancer.monthly_earnings.map((earning) => {
                                        const maxAmount = Math.max(
                                            ...freelancer.monthly_earnings!.map((e) => e.amount)
                                        )
                                        const percentage = maxAmount > 0 ? (earning.amount / maxAmount) * 100 : 0

                                        return (
                                            <div key={earning.month} className="flex items-center gap-4">
                                                <span className="w-20 text-sm text-zinc-500">
                                                    {earning.month}
                                                </span>
                                                <div className="flex-1">
                                                    <div className="h-6 overflow-hidden rounded-full bg-white/5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ duration: 0.5, delay: 0.1 }}
                                                            className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
                                                        />
                                                    </div>
                                                </div>
                                                <span className="w-24 text-right text-sm font-medium text-white">
                                                    {formatCurrency(earning.amount)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    Nenhum pagamento registrado nos últimos 12 meses
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <h3 className="mb-4 text-lg font-semibold text-white">
                            Próximos Trabalhos Agendados
                        </h3>
                        {freelancer.upcoming_assignments && freelancer.upcoming_assignments.length > 0 ? (
                            <div className="space-y-3">
                                {freelancer.upcoming_assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-lg bg-accent-500/10 p-2">
                                                <Calendar className="h-5 w-5 text-accent-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {assignment.role || 'Trabalho'}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {formatDate(assignment.scheduled_date)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {assignment.agreed_fee && (
                                                <span className="font-medium text-white">
                                                    {formatCurrency(assignment.agreed_fee)}
                                                </span>
                                            )}
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${ASSIGNMENT_STATUS_COLORS[assignment.status].bg
                                                    } ${ASSIGNMENT_STATUS_COLORS[assignment.status].text}`}
                                            >
                                                {ASSIGNMENT_STATUS_LABELS[assignment.status]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                                <p className="text-lg font-medium text-white">
                                    Nenhum trabalho agendado
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Não há trabalhos futuros com data definida
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
