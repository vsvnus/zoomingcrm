'use client'

import {
  Building2,
  MapPin,
  Users,
  Calendar,
  Video,
  Monitor,
  FileText,
  Link as LinkIcon,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { type ProjectWithRelations } from '@/types/projects'

export interface OverviewTabProps {
  project: ProjectWithRelations
  formatCurrency: (value: number) => string
  formatDate: (date?: string) => string
  onToggleTask: (taskId: string, completed: boolean) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (e: React.FormEvent) => void
  onStartEditTask: (task: any) => void
  onSaveEditTask: (taskId: string) => void
  onCancelEditTask: () => void
  onInitDefaultTasks: () => void
  newTaskTitle: string
  setNewTaskTitle: (title: string) => void
  isAddingTask: boolean
  editingTaskId: string | null
  editingTaskTitle: string
  setEditingTaskTitle: (title: string) => void
}

export function OverviewTab({
  project,
  formatDate,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onStartEditTask,
  onSaveEditTask,
  onCancelEditTask,
  onInitDefaultTasks,
  newTaskTitle,
  setNewTaskTitle,
  isAddingTask,
  editingTaskId,
  editingTaskTitle,
  setEditingTaskTitle,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Project Info Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informações Gerais */}
        <div className="rounded-xl border border-border bg-card p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Informações Gerais
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 text-text-tertiary" />
              <div className="flex-1">
                <p className="text-sm text-text-secondary">Cliente</p>
                <p className="font-medium text-text-primary">
                  {project.clients.company || project.clients.name}
                </p>
                {project.clients.email && (
                  <p className="text-xs text-text-tertiary">
                    {project.clients.email}
                  </p>
                )}
              </div>
            </div>

            {project.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-text-tertiary" />
                <div>
                  <p className="text-sm text-text-secondary">Localização</p>
                  <p className="font-medium text-text-primary">
                    {project.location}
                  </p>
                </div>
              </div>
            )}

            {project.users && (
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-text-tertiary" />
                <div>
                  <p className="text-sm text-text-secondary">Responsável</p>
                  <p className="font-medium text-text-primary">
                    {project.users.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-border bg-card p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Cronograma
          </h3>
          <div className="space-y-4">
            {/* Data Principal */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-text-tertiary" />
              <div>
                <p className="text-sm text-text-secondary">Data Principal de Gravação</p>
                <p className="font-medium text-text-primary">
                  {formatDate(project.shooting_date)}
                </p>
                {project.shooting_end_date && (
                  <p className="text-xs text-text-tertiary">
                    até {formatDate(project.shooting_end_date)}
                  </p>
                )}
              </div>
            </div>

            {/* Múltiplas Datas de Gravação */}
            {project.shooting_dates && project.shooting_dates.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-sm font-medium text-blue-500">
                  Datas de Gravação Adicionais
                </p>
                <div className="space-y-2">
                  {project.shooting_dates.map((sd) => (
                    <div
                      key={sd.id}
                      className="flex items-start gap-3 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3"
                    >
                      <Calendar className="mt-0.5 h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">
                            {formatDate(sd.date)}
                          </span>
                          {sd.time && (
                            <span className="flex items-center gap-1 text-xs text-text-tertiary">
                              <Clock className="h-3 w-3" />
                              {sd.time}
                            </span>
                          )}
                        </div>
                        {sd.location && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-text-tertiary">
                            <MapPin className="h-3 w-3" />
                            {sd.location}
                          </div>
                        )}
                        {sd.notes && (
                          <p className="mt-1 text-xs text-text-secondary">{sd.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prazo Principal */}
            <div className="flex items-start gap-3 border-t border-border pt-3">
              <Calendar className="mt-0.5 h-5 w-5 text-text-tertiary" />
              <div>
                <p className="text-sm text-text-secondary">
                  Prazo de Entrega
                </p>
                <p className="font-medium text-text-primary">
                  {formatDate(project.deadline_date)}
                </p>
              </div>
            </div>

            {/* Múltiplas Datas de Entrega */}
            {project.delivery_dates && project.delivery_dates.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-sm font-medium text-green-500">
                  Entregáveis
                </p>
                <div className="space-y-2">
                  {project.delivery_dates.map((dd) => (
                    <div
                      key={dd.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${dd.completed
                        ? 'border-green-500/20 bg-green-500/10'
                        : 'border-border bg-secondary'
                        }`}
                    >
                      {dd.completed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 text-text-tertiary" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-medium ${dd.completed ? 'text-green-500' : 'text-text-primary'
                              }`}
                          >
                            {dd.description}
                          </span>
                          <span className="text-xs text-text-tertiary">
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
        <div className="rounded-xl border border-border bg-card p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Especificações Técnicas
          </h3>
          <div className="space-y-3">
            {project.video_format ? (
              <div className="flex items-start gap-3">
                <Video className="mt-0.5 h-5 w-5 text-text-tertiary" />
                <div>
                  <p className="text-sm text-text-secondary">Formato</p>
                  <p className="font-medium text-text-primary">
                    {project.video_format}
                  </p>
                </div>
              </div>
            ) : null}

            {project.resolution ? (
              <div className="flex items-start gap-3">
                <Monitor className="mt-0.5 h-5 w-5 text-text-tertiary" />
                <div>
                  <p className="text-sm text-text-secondary">Resolução</p>
                  <p className="font-medium text-text-primary">
                    {project.resolution}
                  </p>
                </div>
              </div>
            ) : null}

            {!project.video_format && !project.resolution && (
              <p className="text-sm text-text-tertiary">
                Nenhuma especificação definida
              </p>
            )}
          </div>
        </div>

        {/* Links e Documentos */}
        <div className="rounded-xl border border-border bg-card p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Documentos e Links
          </h3>
          <div className="space-y-3">
            {project.drive_folder_link && (
              <a
                href={project.drive_folder_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 transition-all hover:bg-bg-hover"
              >
                <LinkIcon className="h-5 w-5 text-text-tertiary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    Pasta do Drive
                  </p>
                  <p className="text-xs text-text-tertiary">Google Drive</p>
                </div>
              </a>
            )}

            {project.script_link && (
              <a
                href={project.script_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 transition-all hover:bg-bg-hover"
              >
                <FileText className="h-5 w-5 text-text-tertiary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    Roteiro
                  </p>
                  <p className="text-xs text-text-tertiary">Documento</p>
                </div>
              </a>
            )}

            {!project.drive_folder_link && !project.script_link && (
              <p className="text-sm text-text-tertiary">
                Nenhum documento vinculado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="rounded-xl border border-border bg-card p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Descrição do Projeto
          </h3>
          <p className="whitespace-pre-wrap text-text-secondary">
            {project.description}
          </p>
        </div>
      )}

      {/* To-Do List */}
      <div className="rounded-xl border border-border bg-card p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Checklist do Projeto
          </h3>
          {(!project.tasks || project.tasks.length === 0) && (
            <button
              onClick={onInitDefaultTasks}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:bg-bg-hover"
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
                    : 'border-border bg-secondary hover:border-text-tertiary'
                    }`}
                >
                  <button
                    onClick={() => onToggleTask(task.id, !task.completed)}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${task.completed
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-text-tertiary bg-transparent text-transparent hover:border-text-primary'
                      }`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <span
                    className={`flex-1 text-sm ${task.completed
                      ? 'text-text-tertiary line-through'
                      : 'text-text-primary'
                      }`}
                  >
                    {editingTaskId === task.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingTaskTitle}
                          onChange={(e) => setEditingTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') onSaveEditTask(task.id)
                            if (e.key === 'Escape') onCancelEditTask()
                          }}
                          className="flex-1 rounded border border-border bg-secondary px-2 py-0.5 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                          autoFocus
                        />
                        <button
                          onClick={() => onSaveEditTask(task.id)}
                          className="rounded p-1 text-green-500 hover:bg-green-500/10"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={onCancelEditTask}
                          className="rounded p-1 text-text-tertiary hover:bg-bg-hover"
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
                        onClick={() => onStartEditTask(task)}
                        className="rounded p-1 text-text-tertiary opacity-0 transition-all hover:bg-bg-hover hover:text-text-primary group-hover:opacity-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="rounded p-1 text-text-tertiary opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Progress */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-secondary">Progresso</span>
                  <span className="text-xs font-medium text-text-primary">
                    {project.tasks.filter((t: any) => t.completed).length} / {project.tasks.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
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
            <p className="text-sm text-text-tertiary text-center py-4">
              Nenhuma tarefa ainda. Adicione tarefas ou use as padrão.
            </p>
          )}
        </div>

        {/* Add Task Form */}
        <form onSubmit={onAddTask} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Nova tarefa..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAddingTask || !newTaskTitle.trim()}
            className="flex items-center gap-2 rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-bg-primary transition-all hover:bg-text-secondary disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </form>
      </div>
    </div>
  )
}
