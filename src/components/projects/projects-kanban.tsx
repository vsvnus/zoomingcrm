'use client'

import { motion } from 'framer-motion'
import { Plus, Clock, Calendar, AlertCircle, Eye, GripVertical } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { updateProjectStatus } from '@/actions/projects'
import { ProjectFormModal } from './project-form-modal'
import Link from 'next/link'
import type {
  ProjectWithClient,
  ProjectStatus,
} from '@/types/projects'

// DnD Imports
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { createPortal } from 'react-dom'

const STATUSES: Array<{
  id: ProjectStatus
  label: string
  color: string
}> = [
    { id: 'BRIEFING', label: 'Briefing', color: 'bg-slate-500' },
    { id: 'PRE_PROD', label: 'Pré-Produção', color: 'bg-blue-500' },
    { id: 'SHOOTING', label: 'Gravação', color: 'bg-purple-500' },
    { id: 'POST_PROD', label: 'Pós-Produção', color: 'bg-yellow-500' },
    { id: 'REVIEW', label: 'Revisão', color: 'bg-orange-500' },
    { id: 'DONE', label: 'Concluído', color: 'bg-green-500' },
  ]

interface ProjectsKanbanProps {
  initialProjects: ProjectWithClient[]
}

export function ProjectsKanban({ initialProjects }: ProjectsKanbanProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter((p) => p.status === status)
  }

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    setProjects(projects.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)))

    try {
      await updateProjectStatus(projectId, newStatus)
    } catch (error) {
      setProjects(initialProjects)
      alert('Erro ao atualizar projeto')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const projectId = active.id as string
    const newStatus = over.id as ProjectStatus // Column IDs are statuses

    // Encontrar o projeto original para verificar se o status mudou
    const project = projects.find((p) => p.id === projectId)

    if (project && project.status !== newStatus) {
      // Se soltou em uma coluna diferente, atualiza
      await handleStatusChange(projectId, newStatus)
    }
  }

  const handleProjectAdded = (newProject: ProjectWithClient) => {
    setProjects([newProject, ...projects])
  }

  // Objeto do projeto sendo arrastado para o Overlay
  const activeProject = useMemo(() =>
    projects.find((p) => p.id === activeId),
    [activeId, projects])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary"
          >
            Projetos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-text-tertiary"
          >
            Pipeline de produção audiovisual
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 shadow-md"
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </motion.button>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-6"
      >
        {STATUSES.map((status) => {
          const count = getProjectsByStatus(status.id).length
          return (
            <div
              key={status.id}
              className="rounded-xl border border-[rgb(var(--border))] bg-card p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${status.color}`} />
                <p className="text-xs text-text-tertiary">{status.label}</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-text-primary">{count}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Kanban Board (DnD) */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-max">
            {STATUSES.map((status, index) => {
              const statusProjects = getProjectsByStatus(status.id)

              return (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  projects={statusProjects}
                  index={index}
                />
              )
            })}
          </div>
        </div>

        {/* Overlay para o card sendo arrastado */}
        {isMounted && createPortal(
          <DragOverlay>
            {activeProject ? (
              <ProjectCard project={activeProject} isOverlay />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Tabela de Projetos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 pt-8 border-t border-[rgb(var(--border))]"
      >
        <h2 className="text-xl font-semibold text-text-primary">Todos os Projetos</h2>
        <div className="rounded-xl border border-[rgb(var(--border))] bg-card backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-secondary/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase">Projeto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-text-tertiary uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {projects.length > 0 ? (
                  projects.map((project) => {
                    const statusConfig = STATUSES.find((s) => s.id === project.status)
                    return (
                      <tr key={project.id} className="hover:bg-bg-hover transition-colors">
                        <td className="px-6 py-4 text-text-primary font-medium">{project.title}</td>
                        <td className="px-6 py-4 text-text-secondary">{project.clients?.name || '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white ${statusConfig?.color || 'bg-zinc-500'
                              }`}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            {statusConfig?.label || project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:bg-bg-hover hover:text-text-primary hover:border-text-tertiary">
                            <Eye className="h-3.5 w-3.5" />
                            Ver Detalhes
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-bg-secondary p-3 border border-border">
                          <AlertCircle className="h-6 w-6 text-text-tertiary" />
                        </div>
                        <p className="text-sm text-zinc-500">Nenhum projeto criado ainda</p>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Criar primeiro projeto
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectAdded}
      />
    </div>
  )
}

// --- Subcomponentes ---

function KanbanColumn({ status, projects, index }: { status: typeof STATUSES[number], projects: ProjectWithClient[], index: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-80"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${status.color}`} />
          <h3 className="font-semibold text-text-primary">{status.label}</h3>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-text-secondary">
            {projects.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[400px] rounded-xl border border-[rgb(var(--border))] bg-secondary/30 p-3 transition-colors ${isOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
          }`}
      >
        {projects.length > 0 ? (
          projects.map((project) => (
            <DraggableCard key={project.id} project={project} />
          ))
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-text-quaternary border-2 border-dashed border-[rgb(var(--border))] rounded-lg">
            Solte aqui
          </div>
        )}
      </div>
    </motion.div>
  )
}

function DraggableCard({ project }: { project: ProjectWithClient }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 grayscale"
      >
        <ProjectCard project={project} />
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <ProjectCard project={project} />
    </div>
  )
}

function ProjectCard({
  project,
  isOverlay = false
}: {
  project: ProjectWithClient & { next_shooting?: string | null }
  isOverlay?: boolean
}) {
  const nextShootingDate = project.next_shooting || project.shooting_date

  const isShootingSoon =
    nextShootingDate &&
    new Date(nextShootingDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const isOverdue =
    project.deadline_date &&
    new Date(project.deadline_date) < new Date() &&
    project.status !== 'DONE'

  return (
    <div
      className={`group flex flex-col justify-between rounded-xl border border-[rgb(var(--border))] bg-card p-4 shadow-sm transition-all ${isOverlay ? 'scale-105 shadow-2xl ring-2 ring-primary rotate-2 cursor-grabbing' : 'hover:border-primary/50'
        }`}
    >
      <div>
        {/* Next Event Badge */}
        {nextShootingDate && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-accent-500/10 px-3 py-2 text-xs font-semibold text-accent-500 border border-accent-500/10">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white shrink-0">
              <Calendar className="h-3 w-3" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] opacity-70 uppercase tracking-wider">Próxima Gravação</span>
              <span className="text-sm">
                {new Date(nextShootingDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', weekday: 'short' })}
              </span>
            </div>
          </div>
        )}

        {/* Overdue Badge */}
        {isOverdue && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 border border-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <span>Atrasado!</span>
          </div>
        )}

        <div className="mb-3">
          <h4 className="font-semibold text-text-primary line-clamp-2 leading-tight">{project.title}</h4>
          {project.clients && (
            <p className="mt-1 text-xs text-text-tertiary font-medium">
              {project.clients.company || project.clients.name}
            </p>
          )}
        </div>

        {!isOverdue && project.deadline_date && (
          <div className="mb-4 flex items-center gap-2 text-xs text-text-tertiary">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Entrega: {new Date(project.deadline_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        )}

        {/* Task Progress - Show next task */}
        {(project as any).tasks_total > 0 && (
          <div className="mb-2 rounded-lg bg-secondary/50 p-2 border border-[rgb(var(--border))]">
            {(project as any).next_task ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-xs font-medium text-text-primary truncate">
                  {(project as any).next_task}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
                <span className="text-xs font-medium text-green-400">
                  Todas concluídas!
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                  style={{
                    width: `${((project as any).tasks_completed / (project as any).tasks_total) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-text-quaternary font-medium">
                {(project as any).tasks_completed}/{(project as any).tasks_total}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-3 border-t border-[rgb(var(--border))] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isOverlay && (
            <GripVertical className="h-4 w-4 text-text-quaternary cursor-grab" />
          )}
          <span className="text-[10px] font-mono text-text-quaternary">
            {project.status}
          </span>
        </div>
        {/* Botão Ver só aparece se não estiver arrastando (para evitar clique acidental) */}
        <Link
          href={`/projects/${project.id}`}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-text-secondary"
          title="Ver Detalhes"
        >
          <Eye className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
