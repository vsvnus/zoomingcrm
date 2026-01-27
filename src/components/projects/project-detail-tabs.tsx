'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  LayoutDashboard,
  DollarSign,
  Users,
  Calendar,
  Building2,
  MapPin,
  Video,
  Monitor,
  FileText,
  Link as LinkIcon,
  Package,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import {
  type ProjectWithRelations,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from '@/types/projects'
import { EditProjectModal } from './edit-project-modal'
import { AddTeamMemberModal } from './add-team-member-modal'
import { AddEquipmentModal } from './add-equipment-modal'
import { AddExpenseModal } from '@/components/finances/add-expense-modal'
import { updateProjectMember, removeProjectMember, toggleProjectItemStatus, deleteProjectItem, deleteProject, addProjectTask, toggleProjectTask, deleteProjectTask, updateProjectTask, initializeDefaultTasks } from '@/actions/projects'
import { deleteExpense } from '@/actions/finances'
import { useRouter } from 'next/navigation'
import { ManageProjectItemModal } from './manage-project-item-modal'

interface ProjectDetailTabsProps {
  project: ProjectWithRelations
  financialSummary?: any
  expenses?: any[]
  equipmentBookings?: any[]
}

export function ProjectDetailTabs({
  project,
  financialSummary,
  expenses = [],
  equipmentBookings = [],
}: ProjectDetailTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'scope' | 'team' | 'equipment' | 'financial'
  >('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false)
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isManageItemOpen, setIsManageItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskTitle, setEditingTaskTitle] = useState('')

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'scope', label: 'Escopo', icon: FileText },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'equipment', label: 'Equipamentos', icon: Package },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'Não definida'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleConfirmMember = async (memberId: string) => {
    try {
      await updateProjectMember(memberId, { status: 'CONFIRMED' })
      router.refresh()
    } catch (error) {
      alert('Erro ao confirmar membro')
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Tem certeza que deseja excluir ESTE PROJETO? Esta ação não pode ser desfeita.')) return

    try {
      // Verificar se existe proposta associada
      let shouldDeleteProposal = false
      if (project.proposal_id) {
        shouldDeleteProposal = confirm('Existe uma PROPOSTA associada a este projeto. Deseja excluí-la também?')
      }

      // IMPORTANTE: Passar o flag para deletar a proposta vinculada junto na server action
      if (shouldDeleteProposal && project.proposal_id) {
        await deleteProject(project.id, true)
      } else {
        await deleteProject(project.id, false)
      }

      router.push('/projects')
    } catch (error: any) {
      alert(error?.message || 'Erro ao excluir projeto')
    }
  }


  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return

    try {
      await removeProjectMember(memberId)
      router.refresh()
    } catch (error) {
      alert('Erro ao remover membro')
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja remover esta despesa?')) return

    try {
      await deleteExpense(expenseId)
      router.refresh()
    } catch (error) {
      alert('Erro ao remover despesa')
    }
  }

  const handleToggleItem = async (itemId: string, status: 'PENDING' | 'DONE') => {
    try {
      await toggleProjectItemStatus(itemId, project.id, status)
      router.refresh()
    } catch (error) {
      alert('Erro ao atualizar item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return

    try {
      await deleteProjectItem(itemId, project.id)
      router.refresh()
    } catch (error) {
      alert('Erro ao remover item')
    }
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setIsManageItemOpen(true)
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setIsManageItemOpen(true)
  }

  // Task handlers
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setIsAddingTask(true)
    try {
      await addProjectTask(project.id, newTaskTitle)
      setNewTaskTitle('')
      router.refresh()
    } catch (error) {
      alert('Erro ao adicionar tarefa')
    } finally {
      setIsAddingTask(false)
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleProjectTask(taskId, project.id, completed)
      router.refresh()
    } catch (error) {
      alert('Erro ao atualizar tarefa')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteProjectTask(taskId, project.id)
      router.refresh()
    } catch (error) {
      alert('Erro ao remover tarefa')
    }
  }

  const handleInitDefaultTasks = async () => {
    try {
      await initializeDefaultTasks(project.id)
      router.refresh()
    } catch (error) {
      alert('Erro ao criar tarefas padrão')
    }
  }

  const handleStartEditTask = (task: any) => {
    setEditingTaskId(task.id)
    setEditingTaskTitle(task.title)
  }

  const handleSaveEditTask = async (taskId: string) => {
    if (!editingTaskTitle.trim()) return
    try {
      await updateProjectTask(taskId, project.id, editingTaskTitle)
      setEditingTaskId(null)
      setEditingTaskTitle('')
      router.refresh()
    } catch (error) {
      alert('Erro ao atualizar tarefa')
    }
  }

  const handleCancelEditTask = () => {
    setEditingTaskId(null)
    setEditingTaskTitle('')
  }

  // Cálculos financeiros
  const teamCosts = project.project_members?.reduce(
    (acc, member) => acc + (member.agreed_fee || 0),
    0
  ) || 0

  const manualExpensesTotal = expenses?.reduce(
    (acc, expense) => acc + (expense.actual_cost || expense.estimated_cost || 0),
    0
  ) || 0

  const totalCosts = teamCosts + manualExpensesTotal
  // Usar total_revenue do financialSummary (approved_value + additives)
  const projectValue = financialSummary?.total_revenue || financialSummary?.approved_value || Number(project.budget) || 0
  const profitMargin = projectValue > 0 ? ((projectValue - totalCosts) / projectValue) * 100 : 0
  const profit = projectValue - totalCosts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para projetos
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 text-3xl font-bold text-white"
            >
              {project.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className={`rounded-full border px-3 py-1 text-sm font-medium ${PROJECT_STATUS_COLORS[project.status].bg
                  } ${PROJECT_STATUS_COLORS[project.status].text} ${PROJECT_STATUS_COLORS[project.status].border
                  }`}
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </div>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">
                {project.clients.company || project.clients.name}
              </span>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
              title="Excluir Projeto"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as 'overview' | 'scope' | 'team' | 'equipment' | 'financial'
                )
              }
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${isActive
                ? 'text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeProjectTab"
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Project Info Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Informações Gerais */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Informações Gerais
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-5 w-5 text-zinc-500" />
                    <div className="flex-1">
                      <p className="text-sm text-zinc-500">Cliente</p>
                      <p className="font-medium text-white">
                        {project.clients.company || project.clients.name}
                      </p>
                      {project.clients.email && (
                        <p className="text-xs text-zinc-600">
                          {project.clients.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {project.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-sm text-zinc-500">Localização</p>
                        <p className="font-medium text-white">
                          {project.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {project.users && (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-sm text-zinc-500">Responsável</p>
                        <p className="font-medium text-white">
                          {project.users.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Cronograma
                </h3>
                <div className="space-y-4">
                  {/* Data Principal */}
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500">Data Principal de Gravação</p>
                      <p className="font-medium text-white">
                        {formatDate(project.shooting_date)}
                      </p>
                      {project.shooting_end_date && (
                        <p className="text-xs text-zinc-600">
                          até {formatDate(project.shooting_end_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Múltiplas Datas de Gravação */}
                  {project.shooting_dates && project.shooting_dates.length > 0 && (
                    <div className="border-t border-white/10 pt-3">
                      <p className="mb-2 text-sm font-medium text-blue-400">
                        Datas de Gravação Adicionais
                      </p>
                      <div className="space-y-2">
                        {project.shooting_dates.map((sd) => (
                          <div
                            key={sd.id}
                            className="flex items-start gap-3 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3"
                          >
                            <Calendar className="mt-0.5 h-4 w-4 text-blue-400" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">
                                  {formatDate(sd.date)}
                                </span>
                                {sd.time && (
                                  <span className="flex items-center gap-1 text-xs text-zinc-400">
                                    <Clock className="h-3 w-3" />
                                    {sd.time}
                                  </span>
                                )}
                              </div>
                              {sd.location && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                                  <MapPin className="h-3 w-3" />
                                  {sd.location}
                                </div>
                              )}
                              {sd.notes && (
                                <p className="mt-1 text-xs text-zinc-500">{sd.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prazo Principal */}
                  <div className="flex items-start gap-3 border-t border-white/10 pt-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500">
                        Prazo de Entrega
                      </p>
                      <p className="font-medium text-white">
                        {formatDate(project.deadline_date)}
                      </p>
                    </div>
                  </div>

                  {/* Múltiplas Datas de Entrega */}
                  {project.delivery_dates && project.delivery_dates.length > 0 && (
                    <div className="border-t border-white/10 pt-3">
                      <p className="mb-2 text-sm font-medium text-green-400">
                        Entregáveis
                      </p>
                      <div className="space-y-2">
                        {project.delivery_dates.map((dd) => (
                          <div
                            key={dd.id}
                            className={`flex items-start gap-3 rounded-lg border p-3 ${dd.completed
                              ? 'border-green-500/20 bg-green-500/10'
                              : 'border-white/10 bg-white/5'
                              }`}
                          >
                            {dd.completed ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400" />
                            ) : (
                              <Circle className="mt-0.5 h-4 w-4 text-zinc-400" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`font-medium ${dd.completed ? 'text-green-400' : 'text-white'
                                    }`}
                                >
                                  {dd.description}
                                </span>
                                <span className="text-xs text-zinc-400">
                                  {formatDate(dd.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specs Técnicas */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Especificações de Vídeo */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Especificações Técnicas
                </h3>
                <div className="space-y-3">
                  {project.video_format ? (
                    <div className="flex items-start gap-3">
                      <Video className="mt-0.5 h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-sm text-zinc-500">Formato</p>
                        <p className="font-medium text-white">
                          {project.video_format}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {project.resolution ? (
                    <div className="flex items-start gap-3">
                      <Monitor className="mt-0.5 h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-sm text-zinc-500">Resolução</p>
                        <p className="font-medium text-white">
                          {project.resolution}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {!project.video_format && !project.resolution && (
                    <p className="text-sm text-zinc-500">
                      Nenhuma especificação definida
                    </p>
                  )}
                </div>
              </div>

              {/* Links e Documentos */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Documentos e Links
                </h3>
                <div className="space-y-3">
                  {project.drive_folder_link && (
                    <a
                      href={project.drive_folder_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10"
                    >
                      <LinkIcon className="h-5 w-5 text-zinc-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          Pasta do Drive
                        </p>
                        <p className="text-xs text-zinc-600">Google Drive</p>
                      </div>
                    </a>
                  )}

                  {project.script_link && (
                    <a
                      href={project.script_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10"
                    >
                      <FileText className="h-5 w-5 text-zinc-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          Roteiro
                        </p>
                        <p className="text-xs text-zinc-600">Documento</p>
                      </div>
                    </a>
                  )}

                  {!project.drive_folder_link && !project.script_link && (
                    <p className="text-sm text-zinc-500">
                      Nenhum documento vinculado
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Descrição do Projeto
                </h3>
                <p className="whitespace-pre-wrap text-zinc-300">
                  {project.description}
                </p>
              </div>
            )}

            {/* To-Do List */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Checklist do Projeto
                </h3>
                {(!project.tasks || project.tasks.length === 0) && (
                  <button
                    onClick={handleInitDefaultTasks}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:bg-white/10"
                  >
                    <Plus className="h-3 w-3" />
                    Criar Tarefas Padrão
                  </button>
                )}
              </div>

              {/* Task List */}
              <div className="space-y-2">
                {project.tasks && project.tasks.length > 0 ? (
                  <>
                    {project.tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className={`group flex items-center gap-3 rounded-lg border p-3 transition-all ${task.completed
                          ? 'border-green-500/20 bg-green-500/5'
                          : 'border-white/5 bg-white/5 hover:border-white/10'
                          }`}
                      >
                        <button
                          onClick={() => handleToggleTask(task.id, !task.completed)}
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${task.completed
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-zinc-600 bg-transparent text-transparent hover:border-zinc-400'
                            }`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <span
                          className={`flex-1 text-sm ${task.completed
                            ? 'text-zinc-500 line-through'
                            : 'text-white'
                            }`}
                        >
                          {editingTaskId === task.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingTaskTitle}
                                onChange={(e) => setEditingTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditTask(task.id)
                                  if (e.key === 'Escape') handleCancelEditTask()
                                }}
                                className="flex-1 rounded border border-white/20 bg-white/10 px-2 py-0.5 text-sm text-white focus:outline-none focus:border-white/40"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveEditTask(task.id)}
                                className="rounded p-1 text-green-400 hover:bg-green-500/10"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEditTask}
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-500/10"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            task.title
                          )}
                        </span>
                        {editingTaskId !== task.id && (
                          <>
                            <button
                              onClick={() => handleStartEditTask(task)}
                              className="rounded p-1 text-zinc-600 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="rounded p-1 text-zinc-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Progress */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">Progresso</span>
                        <span className="text-xs font-medium text-zinc-300">
                          {project.tasks.filter((t: any) => t.completed).length} / {project.tasks.length}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                          style={{
                            width: `${(project.tasks.filter((t: any) => t.completed).length / project.tasks.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 text-center py-4">
                    Nenhuma tarefa ainda. Adicione tarefas ou use as padrão.
                  </p>
                )}
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Nova tarefa..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingTask || !newTaskTitle.trim()}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'scope' && (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Escopo do Projeto</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Itens e entregáveis importados da proposta
                  </p>
                </div>
                <button
                  onClick={handleAddItem}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Item
                </button>
              </div>
            </div>

            <div className="p-6">
              {project.items && project.items.length > 0 ? (
                <div className="space-y-3">
                  {project.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${item.status === 'DONE'
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-white/5 bg-white/5'
                        }`}
                    >
                      <button
                        onClick={() =>
                          handleToggleItem(
                            item.id,
                            item.status === 'DONE' ? 'PENDING' : 'DONE'
                          )
                        }
                        className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${item.status === 'DONE'
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-zinc-600 bg-transparent text-transparent hover:border-zinc-400'
                          }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p
                            className={`font-medium ${item.status === 'DONE'
                              ? 'text-zinc-500 line-through'
                              : 'text-white'
                              }`}
                          >
                            {item.description}
                          </p>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(Number(item.total_price))}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                          <span>
                            {item.quantity}x {formatCurrency(Number(item.unit_price))}
                          </span>
                          {item.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex items-start gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
                    <div className="text-right">
                      <p className="text-sm text-zinc-500">Total do Escopo</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(
                          project.items.reduce(
                            (acc, item) => acc + Number(item.total_price),
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                  <p className="mb-2 text-lg font-medium text-white">
                    Nenhum item de escopo
                  </p>
                  <p className="text-sm text-zinc-500">
                    Este projeto não possui itens vinculados da proposta
                  </p>
                </div>
              )}
            </div>
          </div>
        )
        }

        {
          activeTab === 'team' && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Equipe do Projeto
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      Freelancers e membros alocados neste projeto
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddTeamMemberOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Membro
                  </button>
                </div>
              </div>

              <div className="p-6">
                {project.project_members && project.project_members.length > 0 ? (
                  <div className="space-y-3">
                    {project.project_members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                            {member.freelancers.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {member.freelancers.name}
                            </p>
                            <p className="text-sm text-zinc-500">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {member.agreed_fee && (
                            <p className="text-sm font-medium text-white">
                              {formatCurrency(member.agreed_fee)}
                            </p>
                          )}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${member.status === 'CONFIRMED'
                              ? 'bg-green-500/10 text-green-400'
                              : member.status === 'INVITED'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'
                              }`}
                          >
                            {member.status === 'CONFIRMED'
                              ? 'Confirmado'
                              : member.status === 'INVITED'
                                ? 'Convidado'
                                : member.status === 'DECLINED'
                                  ? 'Recusou'
                                  : 'Removido'}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {member.status === 'INVITED' && (
                              <button
                                onClick={() => handleConfirmMember(member.id)}
                                className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-green-400 transition-all hover:bg-green-500/20"
                                title="Confirmar"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20"
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                    <p className="mb-2 text-lg font-medium text-white">
                      Nenhum membro na equipe
                    </p>
                    <p className="text-sm text-zinc-500">
                      Adicione freelancers e membros ao projeto
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {
          activeTab === 'equipment' && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Equipamentos Reservados
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      Lista de equipamentos reservados para este projeto
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddEquipmentOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Equipamento
                  </button>
                </div>
              </div>

              <div className="p-6">
                {equipmentBookings && equipmentBookings.length > 0 ? (
                  <div className="space-y-3">
                    {equipmentBookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {booking.equipments?.name || 'Equipamento'}
                            </p>
                            <p className="text-sm text-zinc-500">
                              {booking.equipments?.category || 'Sem categoria'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">
                            {new Date(booking.start_date).toLocaleDateString(
                              'pt-BR'
                            )}{' '}
                            -{' '}
                            {new Date(booking.end_date).toLocaleDateString(
                              'pt-BR'
                            )}
                          </p>
                          {booking.equipments?.serial_number && (
                            <p className="text-xs text-zinc-600">
                              S/N: {booking.equipments.serial_number}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                    <p className="mb-2 text-lg font-medium text-white">
                      Nenhum equipamento reservado
                    </p>
                    <p className="text-sm text-zinc-500">
                      Reservas de equipamentos aparecerão aqui
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {
          activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                {/* Valor do Projeto */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Valor do Projeto</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatCurrency(projectValue)}
                  </p>
                </div>

                {/* Total de Custos */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Receipt className="h-4 w-4" />
                    <span className="text-sm">Total de Custos</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-400">
                    {formatCurrency(totalCosts)}
                  </p>
                </div>

                {/* Lucro */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    {profit >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm">Lucro</span>
                  </div>
                  <p
                    className={`mt-2 text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                  >
                    {formatCurrency(profit)}
                  </p>
                </div>

                {/* Margem */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
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
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-400">
                      Valor do projeto não definido
                    </p>
                    <p className="text-sm text-zinc-400">
                      Configure o valor aprovado na tabela project_finances ou através da proposta aprovada.
                    </p>
                  </div>
                </div>
              )}

              {/* Custos da Equipe */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="border-b border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Custos da Equipe
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        Valores acordados com freelancers
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Subtotal</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(teamCosts)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {project.project_members && project.project_members.length > 0 ? (
                    <div className="space-y-3">
                      {project.project_members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {member.freelancers.name}
                              </p>
                              <p className="text-sm text-zinc-500">{member.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {member.agreed_fee
                                ? formatCurrency(member.agreed_fee)
                                : 'Não definido'}
                            </p>
                            <span
                              className={`text-xs ${member.status === 'CONFIRMED'
                                ? 'text-green-400'
                                : 'text-yellow-400'
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
                      <Users className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
                      <p className="text-sm text-zinc-500">
                        Nenhum membro na equipe ainda
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Despesas Manuais */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="border-b border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Outras Despesas
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        Equipamentos, logística e outros custos
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">Subtotal</p>
                        <p className="text-xl font-bold text-white">
                          {formatCurrency(manualExpensesTotal)}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                        Nova Despesa
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {expenses && expenses.length > 0 ? (
                    <div className="space-y-3">
                      {expenses.map((expense: any) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${expense.category === 'CREW_TALENT'
                                ? 'bg-purple-500/10 text-purple-400'
                                : expense.category === 'EQUIPMENT'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-orange-500/10 text-orange-400'
                                }`}
                            >
                              {expense.category === 'CREW_TALENT' ? (
                                <Users className="h-5 w-5" />
                              ) : expense.category === 'EQUIPMENT' ? (
                                <Package className="h-5 w-5" />
                              ) : (
                                <Receipt className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {expense.description}
                              </p>
                              <p className="text-sm text-zinc-500">
                                {expense.category === 'CREW_TALENT'
                                  ? 'Crew & Talents'
                                  : expense.category === 'EQUIPMENT'
                                    ? 'Equipamento'
                                    : 'Logística'}
                                {expense.freelancers?.name &&
                                  ` • ${expense.freelancers.name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium text-white">
                                {formatCurrency(
                                  expense.actual_cost || expense.estimated_cost || 0
                                )}
                              </p>
                              <span
                                className={`text-xs ${expense.payment_status === 'PAID'
                                  ? 'text-green-400'
                                  : expense.payment_status === 'SCHEDULED'
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
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
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20"
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
                      <Receipt className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
                      <p className="mb-2 text-sm text-zinc-500">
                        Nenhuma despesa adicional
                      </p>
                      <button
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="text-sm text-green-400 hover:underline"
                      >
                        Adicionar primeira despesa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo Geral */}
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Resumo do Job Costing
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Valor do Projeto</span>
                    <span className="font-medium text-white">
                      {formatCurrency(projectValue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">(-) Custos da Equipe</span>
                    <span className="font-medium text-red-400">
                      {formatCurrency(teamCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">(-) Outras Despesas</span>
                    <span className="font-medium text-red-400">
                      {formatCurrency(manualExpensesTotal)}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-white">Lucro Líquido</span>
                      <span
                        className={`text-xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                      >
                        {formatCurrency(profit)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm">
                      <span className="text-zinc-500">Margem de Lucro</span>
                      <span
                        className={`font-medium ${profitMargin >= 0 ? 'text-green-400' : 'text-red-400'
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
      </motion.div >


      {/* ... rest of JSX ... */}
      {/* Modals */}
      {
        isEditModalOpen && (
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onDelete={handleDeleteProject}
            project={project}
          />
        )
      }

      {
        isAddTeamMemberOpen && (
          <AddTeamMemberModal
            isOpen={isAddTeamMemberOpen}
            onClose={() => setIsAddTeamMemberOpen(false)}
            projectId={project.id}
          />
        )
      }

      {
        isAddEquipmentOpen && (
          <AddEquipmentModal
            isOpen={isAddEquipmentOpen}
            onClose={() => setIsAddEquipmentOpen(false)}
            projectId={project.id}
          />
        )
      }

      {
        isAddExpenseOpen && (
          <AddExpenseModal
            projectId={project.id}
            onClose={() => setIsAddExpenseOpen(false)}
          />
        )
      }

      {
        isManageItemOpen && (
          <ManageProjectItemModal
            isOpen={isManageItemOpen}
            onClose={() => {
              setIsManageItemOpen(false)
              setEditingItem(null)
            }}
            projectId={project.id}
            item={editingItem}
          />
        )
      }
    </div >
  )
}
