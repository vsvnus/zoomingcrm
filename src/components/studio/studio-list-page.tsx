'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Clapperboard,
  Plus,
  Clock,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Image as ImageIcon,
  FolderOpen,
} from 'lucide-react'
import type { ScriptWithProject } from '@/actions/scripts'
import {
  SCRIPT_STATUS_LABELS,
  SCRIPT_STATUS_COLORS,
  type ScriptStatus,
} from '@/types/scripts'

interface StudioListPageProps {
  scripts: ScriptWithProject[]
  projects: { id: string; title: string; status: string }[]
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0s'
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  if (min === 0) return `${sec}s`
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function StudioListPage({ scripts, projects }: StudioListPageProps) {
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = scripts.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.project_title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterProject !== 'all' && s.project_id !== filterProject) return false
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 border border-accent-500/20">
            <Clapperboard className="h-5 w-5 text-accent-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Clapper Studio</h1>
            <p className="text-sm text-text-tertiary">
              {scripts.length} {scripts.length === 1 ? 'roteiro' : 'roteiros'}
            </p>
          </div>
        </div>
        <Link
          href={"/studio/new" as any}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Roteiro
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar roteiros..."
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/25"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-tertiary" />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
          >
            <option value="all">Todos os projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
          >
            <option value="all">Todos os status</option>
            {(Object.keys(SCRIPT_STATUS_LABELS) as ScriptStatus[]).map((key) => (
              <option key={key} value={key}>{SCRIPT_STATUS_LABELS[key]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scripts Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((script, index) => {
            const statusColors = SCRIPT_STATUS_COLORS[script.status as ScriptStatus] || SCRIPT_STATUS_COLORS.DRAFT
            const statusLabel = SCRIPT_STATUS_LABELS[script.status as ScriptStatus] || script.status

            return (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={`/studio/${script.id}` as any}
                  className="group block rounded-xl border border-border bg-card hover:border-accent-500/30 hover:shadow-lg hover:shadow-accent-500/5 transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative h-36 rounded-t-xl bg-bg-secondary overflow-hidden">
                    {script.first_storyboard_url ? (
                      <img
                        src={script.first_storyboard_url}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-text-tertiary/30" />
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                      {statusLabel}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-text-primary truncate group-hover:text-accent-500 transition-colors">
                        {script.title}
                      </h3>
                      <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                        <FolderOpen className="h-3 w-3" />
                        {script.project_title}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {script.scenes_count} {script.scenes_count === 1 ? 'cena' : 'cenas'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(script.total_duration ?? undefined)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-text-tertiary">
                        {formatRelativeDate(script.updated_at)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-accent-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      ) : scripts.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-text-tertiary/30 mb-3" />
          <p className="text-text-secondary">Nenhum roteiro encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-500/10 border border-accent-500/20">
            <Clapperboard className="h-10 w-10 text-accent-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">
              Nenhum roteiro ainda
            </h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Crie seu primeiro roteiro para começar a usar o Clapper Studio.
              Você pode criar roteiros livres ou vinculados a projetos.
            </p>
          </div>
          <Link
            href={"/studio/new" as any}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Criar Primeiro Roteiro
          </Link>
        </div>
      )}
    </div>
  )
}
