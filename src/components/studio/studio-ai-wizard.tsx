'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import type { Message } from 'ai'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  Play,
  Film,
  Tv,
  Monitor,
  GraduationCap,
  Megaphone,
  Clapperboard,
  FileText,
  CheckCircle2,
  FileVideo,
  Layers,
  ExternalLink,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type WizardPhase = 'chat' | 'creating' | 'done'

interface CreationProgress {
  scriptCreated: boolean
  scenesCreated: boolean
  scenesCount: number
  scriptTitle: string
  scriptId: string | null
}

export function StudioAIWizard() {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<WizardPhase>('chat')
  const [progress, setProgress] = useState<CreationProgress>({
    scriptCreated: false,
    scenesCreated: false,
    scenesCount: 0,
    scriptTitle: '',
    scriptId: null,
  })

  const { messages, append, isLoading } = useChat({
    api: '/api/studio-chat',
    body: {
      context: {},
    },
    onFinish: (message) => {
      const content = message.content

      // Extrair script_id da resposta
      const idMatch = content.match(/script_id["\s:]+([a-f0-9-]{36})/i)
      const scriptId = idMatch ? idMatch[1] : null

      // Detectar criação do roteiro
      if (content.includes('criado com sucesso') || content.includes('roteiro criado')) {
        const titleMatch = content.match(/["""]([^"""]+)["""]\s*criado/i)
        setProgress((prev) => ({
          ...prev,
          scriptCreated: true,
          scriptTitle: titleMatch ? titleMatch[1] : prev.scriptTitle,
          scriptId: scriptId || prev.scriptId,
        }))

        if (phase === 'chat') {
          setPhase('creating')
        }
      }

      // Detectar cenas criadas
      if (content.includes('cenas criadas') || content.includes('cenas com sucesso')) {
        const countMatch = content.match(/(\d+)\s*cenas?\s*criadas?/i)
        setProgress((prev) => ({
          ...prev,
          scenesCreated: true,
          scenesCount: countMatch ? parseInt(countMatch[1]) : prev.scenesCount,
          scriptId: scriptId || prev.scriptId,
        }))
      }

      // Se tudo foi criado, ir para a fase "done"
      if (scriptId || progress.scriptId) {
        const finalId = scriptId || progress.scriptId
        setProgress((prev) => ({ ...prev, scriptId: finalId }))
        // Pequeno delay para a animação de progresso ser visível
        setTimeout(() => {
          setPhase('done')
        }, 1500)
      }
    },
  })

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && phase === 'chat') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading, phase])

  // Redirect automático após "done" com delay para o user ver
  useEffect(() => {
    if (phase === 'done' && progress.scriptId) {
      const timer = setTimeout(() => {
        router.push(`/studio/${progress.scriptId}`)
        router.refresh()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [phase, progress.scriptId, router])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    const value = inputValue
    setInputValue('')

    await append({
      role: 'user',
      content: value,
    })
  }

  const handleQuickStart = (text: string) => {
    setInputValue('')
    append({
      role: 'user',
      content: text,
    })
  }

  const handleGoToScript = () => {
    if (progress.scriptId) {
      router.push(`/studio/${progress.scriptId}`)
      router.refresh()
    }
  }

  const quickStarts = [
    {
      icon: Tv,
      label: 'Video Institucional',
      prompt: 'Quero criar um vídeo institucional para minha empresa',
    },
    {
      icon: Megaphone,
      label: 'Reels Publicitário',
      prompt: 'Quero criar um Reels publicitário de 30 segundos para Instagram',
    },
    {
      icon: GraduationCap,
      label: 'Tutorial Educativo',
      prompt: 'Quero criar um tutorial educativo para YouTube',
    },
    {
      icon: Film,
      label: 'Documentário',
      prompt: 'Quero criar um mini documentário de 3-5 minutos',
    },
    {
      icon: Clapperboard,
      label: 'Comercial de TV',
      prompt: 'Quero criar um comercial de TV de 30 segundos',
    },
    {
      icon: Monitor,
      label: 'Vídeo para Website',
      prompt: 'Quero criar um vídeo hero para a homepage do meu site',
    },
  ]

  // ========================================
  // Tela de progresso (criando roteiro)
  // ========================================
  if (phase === 'creating' || phase === 'done') {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-violet-600 to-purple-500 p-1.5 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-text-primary">
              Criando Roteiro com IA
            </span>
          </div>
        </div>

        {/* Progress area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mb-8"
              >
                {phase === 'done' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 mx-auto"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </motion.div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-tr from-violet-600/20 to-purple-500/20 rounded-3xl flex items-center justify-center border border-violet-500/20 mx-auto relative">
                    <Film className="h-10 w-10 text-violet-400" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-violet-500/50"
                    />
                  </div>
                )}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold text-text-primary mb-2"
              >
                {phase === 'done' ? 'Roteiro criado!' : 'Criando seu roteiro...'}
              </motion.h2>

              {progress.scriptTitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-text-tertiary mb-8"
                >
                  &ldquo;{progress.scriptTitle}&rdquo;
                </motion.p>
              )}

              {/* Steps */}
              <div className="space-y-3 text-left mb-8">
                {/* Step 1: Script metadata */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    progress.scriptCreated
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-bg-secondary/50 border-border'
                  )}
                >
                  {progress.scriptCreated ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-violet-500 animate-spin shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary">Criando roteiro</p>
                    <p className="text-xs text-text-tertiary">Metadados, formato e configurações</p>
                  </div>
                  {progress.scriptCreated && (
                    <FileVideo className="h-4 w-4 text-emerald-400 ml-auto" />
                  )}
                </motion.div>

                {/* Step 2: Scenes */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    progress.scenesCreated
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : progress.scriptCreated
                        ? 'bg-bg-secondary/50 border-violet-500/20'
                        : 'bg-bg-secondary/30 border-border opacity-50'
                  )}
                >
                  {progress.scenesCreated ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : progress.scriptCreated ? (
                    <Loader2 className="h-5 w-5 text-violet-500 animate-spin shrink-0" />
                  ) : (
                    <Layers className="h-5 w-5 text-text-tertiary shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary">Gerando cenas</p>
                    <p className="text-xs text-text-tertiary">
                      {progress.scenesCreated
                        ? `${progress.scenesCount} cenas criadas`
                        : 'Diálogos, câmera, transições e mais'}
                    </p>
                  </div>
                  {progress.scenesCreated && (
                    <Layers className="h-4 w-4 text-emerald-400 ml-auto" />
                  )}
                </motion.div>
              </div>

              {/* CTA when done */}
              <AnimatePresence>
                {phase === 'done' && progress.scriptId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={handleGoToScript}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                      Abrir Roteiro
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-text-tertiary mt-3 animate-pulse">
                      Redirecionando automaticamente...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // ========================================
  // Tela de chat (fase normal)
  // ========================================
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link
          href="/studio/new"
          className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-violet-600 to-purple-500 p-1.5 rounded-lg">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Criar Roteiro com IA
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex justify-center">
        <div className="w-full max-w-3xl flex flex-col">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scroll-smooth"
          >
            {/* Empty state with quick starts */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-tr from-violet-600/20 to-purple-500/20 rounded-3xl flex items-center justify-center border border-violet-500/20 mx-auto mb-5">
                    <Film className="h-10 w-10 text-violet-400" />
                  </div>

                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    Vamos criar seu roteiro!
                  </h2>
                  <p className="text-sm text-text-tertiary max-w-md leading-relaxed">
                    Me conte sobre o vídeo que você quer produzir. Vou fazer algumas perguntas
                    e criar um roteiro profissional completo com cenas, diálogos, câmera e mais.
                  </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg">
                  {quickStarts.map((item, i) => {
                    const Icon = item.icon
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        onClick={() => handleQuickStart(item.prompt)}
                        className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-secondary/50 hover:bg-bg-hover border border-border hover:border-violet-500/30 transition-all"
                      >
                        <Icon className="h-6 w-6 text-text-tertiary group-hover:text-violet-400 transition-colors" />
                        <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                          {item.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((m: Message) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex w-full',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-5 py-3.5 text-sm',
                    m.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-bg-secondary text-text-primary rounded-bl-sm border border-border'
                  )}
                >
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert max-w-none text-text-primary">
                      {m.content.length > 0 ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ node, ...props }) => (
                              <div className="my-3 w-full overflow-hidden rounded-lg border border-border bg-bg-primary">
                                <table className="w-full text-xs text-left" {...props} />
                              </div>
                            ),
                            thead: ({ node, ...props }) => (
                              <thead className="bg-bg-secondary text-[10px] uppercase tracking-wider text-text-tertiary font-medium" {...props} />
                            ),
                            th: ({ node, ...props }) => (
                              <th className="px-3 py-2 border-b border-border" {...props} />
                            ),
                            tr: ({ node, ...props }) => (
                              <tr className="border-b border-border last:border-0" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                              <td className="px-3 py-2 align-top text-text-secondary" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="font-bold text-text-primary" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="leading-relaxed mb-2 last:mb-0" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc pl-4 space-y-1 mb-3 text-text-secondary" {...props} />
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-2 text-text-tertiary">
                          <Loader2 className="h-3 w-3 animate-spin text-violet-500" />
                          <span className="text-xs animate-pulse">Pensando...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-medium">{m.content}</div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Loading */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 border border-border flex items-center gap-2.5">
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-violet-300 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 bg-bg-primary border border-border p-2 rounded-xl focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/30 transition-all max-w-3xl mx-auto"
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Descreva o vídeo que quer criar..."
                className="flex-1 min-h-[44px] bg-transparent border-0 text-sm text-text-primary placeholder:text-text-tertiary/50 px-4 py-2 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center transition-all shrink-0',
                  inputValue.trim()
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'bg-bg-secondary text-text-tertiary'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
