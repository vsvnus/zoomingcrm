'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import type { Message } from 'ai'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Send,
  Sparkles,
  Eraser,
  Loader2,
  Play,
  Bot,
  Film,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface StudioAIPanelProps {
  scriptId?: string
  scriptTitle?: string
  scenesCount?: number
  isOpen: boolean
  onClose: () => void
  onScriptCreated?: (scriptId: string) => void
  onScenesUpdated?: () => void
}

export function StudioAIPanel({
  scriptId,
  scriptTitle,
  scenesCount,
  isOpen,
  onClose,
  onScriptCreated,
  onScenesUpdated,
}: StudioAIPanelProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/studio-chat',
    body: {
      context: {
        scriptId,
        scriptTitle,
        scenesCount,
      },
    },
    onFinish: (message) => {
      // Check if the AI response mentions script/scene creation to trigger refresh
      const content = message.content.toLowerCase()
      if (
        content.includes('criado com sucesso') ||
        content.includes('cenas criadas') ||
        content.includes('roteiro criado') ||
        content.includes('cena atualizada') ||
        content.includes('cenas removidas') ||
        content.includes('roteiro atualizado')
      ) {
        onScenesUpdated?.()
      }
    },
  })

  // Check for script creation in messages (to redirect)
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'assistant') {
        // Look for pattern indicating a new script was created
        const match = lastMessage.content.match(/script_id["\s:]+([a-f0-9-]{36})/i)
        if (match && !scriptId) {
          onScriptCreated?.(match[1])
        }
      }
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages, scriptId, onScriptCreated])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleClear = () => {
    setMessages([])
  }

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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue('')
    append({
      role: 'user',
      content: suggestion,
    })
  }

  const suggestions = scriptId
    ? [
        '📝 Analise o roteiro e sugira melhorias',
        '🎬 Adicione uma cena de encerramento com CTA',
        '🔄 Melhore as transições entre as cenas',
      ]
    : [
        '🎥 Vídeo institucional para empresa de tecnologia',
        '📱 Reels publicitário de 30 segundos',
        '🎓 Tutorial educativo para YouTube',
      ]

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="shrink-0 border-l border-border bg-card flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-secondary/50">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="bg-gradient-to-tr from-violet-600 to-purple-500 p-2 rounded-lg shadow-lg shadow-violet-500/20">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Studio AI</h3>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
              Assistente de Roteiros
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Limpar conversa"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-violet-600/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-violet-500/20 mb-4">
              <Film className="h-7 w-7 text-violet-400" />
            </div>

            <h3 className="text-sm font-medium text-text-primary mb-1">
              {scriptId ? 'Como posso melhorar o roteiro?' : 'Vamos criar um roteiro!'}
            </h3>
            <p className="text-xs text-text-tertiary max-w-[250px] leading-relaxed mb-6">
              {scriptId
                ? 'Posso editar cenas, sugerir melhorias de narrativa, câmera e ritmo.'
                : 'Me conte sobre o vídeo que você quer produzir e eu crio o roteiro completo.'}
            </p>

            <div className="grid grid-cols-1 gap-2 w-full">
              {suggestions.map((text, i) => (
                <button
                  key={i}
                  onClick={() =>
                    handleSuggestionClick(text.replace(/^[^\wÀ-ú]+/, ''))
                  }
                  className="group flex items-center gap-2.5 w-full p-2.5 rounded-lg bg-bg-secondary/50 hover:bg-bg-hover border border-border hover:border-text-tertiary/30 transition-all text-xs text-text-secondary text-left"
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {text.split(' ')[0]}
                  </span>
                  <span className="font-medium flex-1">
                    {text.substring(text.indexOf(' ') + 1)}
                  </span>
                  <Play
                    className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400"
                    fill="currentColor"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

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
                'max-w-[90%] rounded-2xl px-4 py-3 text-sm',
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
                            <table
                              className="w-full text-xs text-left"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead
                            className="bg-bg-secondary text-[10px] uppercase tracking-wider text-text-tertiary font-medium"
                            {...props}
                          />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="px-3 py-2 border-b border-border"
                            {...props}
                          />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr
                            className="border-b border-border last:border-0"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className="px-3 py-2 align-top text-text-secondary"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-text-primary"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="leading-relaxed mb-2 last:mb-0"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc pl-4 space-y-1 mb-3 text-text-secondary"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <Loader2 className="h-3 w-3 animate-spin text-violet-500" />
                      <span className="text-xs animate-pulse">
                        Pensando...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-medium">
                  {m.content}
                </div>
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
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-violet-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-violet-300 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-bg-secondary/30">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 bg-bg-primary border border-border p-1.5 rounded-xl focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/30 transition-all"
        >
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              scriptId
                ? 'Peça melhorias ou edições...'
                : 'Descreva o vídeo que quer criar...'
            }
            className="flex-1 min-h-[40px] bg-transparent border-0 text-sm text-text-primary placeholder:text-text-tertiary/50 px-3 py-2 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center transition-all shrink-0',
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
    </motion.div>
  )
}
