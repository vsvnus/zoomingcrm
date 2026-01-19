'use client'

import { motion } from 'framer-motion'
import { Plus, Clock, Calendar, AlertCircle, Eye } from 'lucide-react'
import { useState } from 'react'
import { updateProjectStatus } from '@/actions/projects'
import { ProjectFormModal } from './project-form-modal'
import Link from 'next/link'
import type {
  ProjectWithClient,
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from '@/types/projects'

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

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter((p) => p.status === status)
  }

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    // Atualizar localmente primeiro (optimistic update)
    setProjects(projects.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)))

    try {
      await updateProjectStatus(projectId, newStatus)
    } catch (error) {
      // Reverter se der erro
      setProjects(initialProjects)
      alert('Erro ao atualizar projeto')
    }
  }

  const handleProjectAdded = (newProject: ProjectWithClient) => {
    // Adicionar o novo projeto ao estado local imediatamente
    setProjects([newProject, ...projects])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Projetos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-zinc-400"
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
          className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-zinc-200"
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
              className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${status.color}`} />
                <p className="text-xs text-zinc-400">{status.label}</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{count}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STATUSES.map((status, index) => {
            const statusProjects = getProjectsByStatus(status.id)

            return (
              <motion.div
                key={status.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-80"
              >
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${status.color}`} />
                    <h3 className="font-semibold text-white">{status.label}</h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                      {statusProjects.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[200px] rounded-xl border border-white/5 bg-white/5 p-3">
                  {statusProjects.length > 0 ? (
                    statusProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onStatusChange={handleStatusChange}
                        statuses={STATUSES}
                      />
                    ))
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-zinc-600">
                      Nenhum projeto
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* SPRINT 2: Lista de Projetos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-white">Todos os Projetos</h2>
        <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Projeto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Gravação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Prazo
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.length > 0 ? (
                  projects.map((project) => {
                    const statusConfig = STATUSES.find((s) => s.id === project.status)
                    const isOverdue =
                      project.deadline_date && new Date(project.deadline_date) < new Date()

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                            >
                              {project.title}
                            </Link>
                            {project.description && (
                              <p className="mt-1 text-xs text-zinc-500 line-clamp-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-300">
                            {project.clients?.company || project.clients?.name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white ${statusConfig?.color || 'bg-zinc-500'
                              }`}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            {statusConfig?.label || project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {project.shooting_date ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(project.shooting_date).toLocaleDateString('pt-BR')}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {project.deadline_date ? (
                            <div
                              className={`flex items-center gap-2 ${isOverdue ? 'text-red-400' : ''
                                }`}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(project.deadline_date).toLocaleDateString('pt-BR')}
                              {isOverdue && (
                                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                          >
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
                        <div className="rounded-full bg-white/5 p-3">
                          <AlertCircle className="h-6 w-6 text-zinc-500" />
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

function ProjectCard({
  project,
  onStatusChange,
  statuses,
}: {
  project: ProjectWithClient
  onStatusChange: (id: string, status: ProjectStatus) => void
  statuses: typeof STATUSES
}) {
  const isShootingSoon =
    project.shooting_date &&
    new Date(project.shooting_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const isOverdue =
    project.deadline_date &&
    new Date(project.deadline_date) < new Date() &&
    project.status !== 'DONE'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group rounded-xl border border-white/5 bg-black/40 p-4 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/10"
    >
      {/* Alerts */}
      {(isShootingSoon || isOverdue) && (
        <div className="mb-3 space-y-2">
          {isShootingSoon && (
            <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-2 py-1.5 text-xs text-purple-400">
              <Calendar className="h-3 w-3" />
              <span>Gravação próxima</span>
            </div>
          )}
          {isOverdue && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-2 py-1.5 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>Atrasado</span>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="font-semibold text-white line-clamp-2">{project.title}</h4>

      {/* Client */}
      {project.clients && (
        <p className="mt-2 text-sm text-zinc-400">
          {project.clients.company || project.clients.name}
        </p>
      )}

      {/* Description */}
      {project.description && (
        <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{project.description}</p>
      )}

      {/* Dates */}
      <div className="mt-3 space-y-1">
        {project.shooting_date && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="h-3 w-3" />
            <span>
              Gravação:{' '}
              {new Date(project.shooting_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </div>
        )}
        {project.deadline_date && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            <span>
              Entrega:{' '}
              {new Date(project.deadline_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-white transition-all hover:bg-white/10 hover:border-white/10"
        >
          <Eye className="h-3 w-3" />
          Ver
        </Link>
        <select
          value={project.status}
          onChange={(e) => onStatusChange(project.id, e.target.value as ProjectStatus)}
          className="flex-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5 text-xs text-white outline-none transition-all hover:bg-white/10 focus:border-white/10 focus:ring-1 focus:ring-white/10"
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id} className="bg-zinc-900">
              Mover para {status.label}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  )
}
