'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  ArrowLeft,
  Monitor,
  Tv,
  Palette,
  Users,
  FolderOpen,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createScript } from '@/actions/scripts'
import {
  VIDEO_FORMATS_SCRIPT,
  TARGET_PLATFORMS,
  SCRIPT_TONES,
} from '@/types/scripts'

interface StudioNewScriptProps {
  projects: { id: string; title: string; status: string }[]
  preselectedProjectId?: string
}

export function StudioNewScript({ projects, preselectedProjectId }: StudioNewScriptProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [projectId, setProjectId] = useState(preselectedProjectId || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFormat, setVideoFormat] = useState('')
  const [targetPlatform, setTargetPlatform] = useState('')
  const [tone, setTone] = useState('')
  const [customTone, setCustomTone] = useState('')
  const [targetAudience, setTargetAudience] = useState('')

  const selectedProject = projects.find((p) => p.id === projectId)

  // Auto-fill title when project changes
  const handleProjectChange = (id: string) => {
    setProjectId(id)
    const proj = projects.find((p) => p.id === id)
    if (proj && !title) {
      setTitle(`Roteiro - ${proj.title}`)
    }
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Informe um título para o roteiro')
      return
    }

    setIsCreating(true)
    try {
      const script = await createScript({
        project_id: projectId || undefined,
        title: title.trim(),
        description: description || undefined,
        video_format: videoFormat || undefined,
        target_platform: targetPlatform || undefined,
        target_audience: targetAudience || undefined,
        tone: (tone === '__CUSTOM__' ? customTone.trim() : tone) || undefined,
      })

      router.push(`/studio/${script.id}` as any)
    } catch (error: any) {
      alert(error?.message || 'Erro ao criar roteiro')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={"/studio" as any}
        className="mb-8 inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o Studio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500/10 border border-accent-500/20">
            <FileText className="h-8 w-8 text-accent-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Novo Roteiro
          </h1>
          <p className="text-text-secondary">
            {selectedProject
              ? <>Roteiro para <span className="font-medium text-text-primary">{selectedProject.title}</span></>
              : 'Selecione um projeto e configure os detalhes do roteiro'
            }
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Project Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-text-tertiary" />
              Projeto (Opcional)
            </label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/25"
            >
              <option value="">Selecionar projeto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">
              Título do Roteiro *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Roteiro - Vídeo Institucional"
              className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/25"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do objetivo do vídeo..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/25"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Video Format */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Monitor className="h-4 w-4 text-text-tertiary" />
                Formato
              </label>
              <select
                value={videoFormat}
                onChange={(e) => setVideoFormat(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
              >
                <option value="">Selecionar...</option>
                {VIDEO_FORMATS_SCRIPT.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Target Platform */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Tv className="h-4 w-4 text-text-tertiary" />
                Plataforma
              </label>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
              >
                <option value="">Selecionar...</option>
                {TARGET_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Palette className="h-4 w-4 text-text-tertiary" />
                Tom
              </label>
              <select
                value={tone}
                onChange={(e) => {
                  setTone(e.target.value)
                  if (e.target.value !== '__CUSTOM__') setCustomTone('')
                }}
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
              >
                <option value="">Selecionar...</option>
                {SCRIPT_TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
                <option value="__CUSTOM__">Outro (Personalizado)</option>
              </select>
              {tone === '__CUSTOM__' && (
                <input
                  type="text"
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  placeholder="Digite o tom personalizado..."
                  autoFocus
                  className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/25"
                />
              )}
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Users className="h-4 w-4 text-text-tertiary" />
                Público-alvo
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ex: Empresários, 25-45 anos"
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href={"/studio" as any}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Criando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Criar Roteiro
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
