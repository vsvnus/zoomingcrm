'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  LayoutDashboard,
  DollarSign,
  Users,
  FileText,
  Film,
  Package,
  Edit,
  Trash2,
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
import { OverviewTab } from './tabs/overview-tab'
import { ScopeTab } from './tabs/scope-tab'
import { TeamTab } from './tabs/team-tab'
import { EquipmentTab } from './tabs/equipment-tab'
import { FinanceTab } from './tabs/finance-tab'

interface ProjectDetailTabsProps {
  project: ProjectWithRelations
  financialSummary?: any
  expenses?: any[]
  equipmentBookings?: any[]
  scriptId?: string
}

export function ProjectDetailTabs({
  project,
  financialSummary,
  expenses = [],
  equipmentBookings = [],
  scriptId,
}: ProjectDetailTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'scope' | 'script' | 'team' | 'equipment' | 'financial'
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
    { id: 'script', label: 'Roteiro', icon: Film },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para projetos
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 text-3xl font-bold text-text-primary"
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
              <span className="text-text-tertiary">&bull;</span>
              <span className="text-text-tertiary">
                {project.clients.company || project.clients.name}
              </span>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-text-primary transition-all hover:bg-bg-hover"
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
        className="flex gap-2 rounded-xl border border-border bg-card p-2 backdrop-blur-sm"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as 'overview' | 'scope' | 'script' | 'team' | 'equipment' | 'financial'
                )
              }
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${isActive
                ? 'text-primary'
                : 'text-text-tertiary hover:text-text-primary hover:bg-secondary'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeProjectTab"
                  className="absolute inset-0 rounded-lg bg-secondary border border-border"
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
          <OverviewTab
            project={project}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onStartEditTask={handleStartEditTask}
            onSaveEditTask={handleSaveEditTask}
            onCancelEditTask={handleCancelEditTask}
            onInitDefaultTasks={handleInitDefaultTasks}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            isAddingTask={isAddingTask}
            editingTaskId={editingTaskId}
            editingTaskTitle={editingTaskTitle}
            setEditingTaskTitle={setEditingTaskTitle}
          />
        )}

        {activeTab === 'scope' && (
          <ScopeTab
            project={project}
            formatCurrency={formatCurrency}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onAddItem={handleAddItem}
          />
        )}

        {activeTab === 'script' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500/10 border border-accent-500/20">
                <Film className="h-8 w-8 text-accent-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text-primary">
                  Roteiro & Storyboard
                </h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  {scriptId
                    ? 'Edite o roteiro do projeto no Zooming Studio com editor visual, storyboard, timeline e campos completos de produção.'
                    : 'Crie o roteiro do projeto no Zooming Studio com editor visual, storyboard, timeline e campos completos de produção.'
                  }
                </p>
              </div>
              <Link
                href={scriptId ? `/studio/${scriptId}` as any : `/studio/new?project=${project.id}` as any}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Film className="h-4 w-4" />
                {scriptId ? 'Abrir no Zooming Studio' : 'Criar Roteiro no Studio'}
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <TeamTab
            project={project}
            formatCurrency={formatCurrency}
            onConfirmMember={handleConfirmMember}
            onRemoveMember={handleRemoveMember}
            onAddTeamMember={() => setIsAddTeamMemberOpen(true)}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentTab
            equipmentBookings={equipmentBookings}
            onAddEquipment={() => setIsAddEquipmentOpen(true)}
          />
        )}

        {activeTab === 'financial' && (
          <FinanceTab
            project={project}
            expenses={expenses}
            equipmentBookings={equipmentBookings}
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
            onDeleteExpense={handleDeleteExpense}
            onAddExpense={() => setIsAddExpenseOpen(true)}
          />
        )}
      </motion.div>


      {/* Modals */}
      {isEditModalOpen && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onDelete={handleDeleteProject}
          project={project}
        />
      )}

      {isAddTeamMemberOpen && (
        <AddTeamMemberModal
          isOpen={isAddTeamMemberOpen}
          onClose={() => setIsAddTeamMemberOpen(false)}
          projectId={project.id}
        />
      )}

      {isAddEquipmentOpen && (
        <AddEquipmentModal
          isOpen={isAddEquipmentOpen}
          onClose={() => setIsAddEquipmentOpen(false)}
          projectId={project.id}
        />
      )}

      {isAddExpenseOpen && (
        <AddExpenseModal
          projectId={project.id}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      )}

      {isManageItemOpen && (
        <ManageProjectItemModal
          isOpen={isManageItemOpen}
          onClose={() => {
            setIsManageItemOpen(false)
            setEditingItem(null)
          }}
          projectId={project.id}
          item={editingItem}
        />
      )}
    </div>
  )
}
