'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import type { Message } from 'ai'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function StudioAIWizard() {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [redirecting, setRedirecting] = useState(false)

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/studio-chat',
    body: {
      context: {},
    },
    onFinish: (message) => {
      // Detect script creation and redirect
      const content = message.content
      if (content.includes('criado com sucesso') || content.includes('cenas criadas')) {
        // Small delay to let user read the confirmation
        setTimeout(() => {
          // Try to extract script ID from tool results
          // The AI response mentions it was created, so we refresh to studio list
          setRedirecting(true)
          router.push('/studio')
          router.refresh()
        }, 2000)
      }
    },
  })

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

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
        {redirecting && (
          <div className="ml-auto flex items-center gap-2 text-xs text-violet-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Redirecionando para o Studio...
          </div>
        )}
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
                disabled={redirecting}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim() || redirecting}
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
