'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  User,
  Briefcase,
  Camera,
  Users,
  FileText,
  DollarSign,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SearchResult, SearchResultType } from '@/app/api/search/route'

const typeConfig: Record<SearchResultType, {
  icon: React.ElementType
  label: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  client: {
    icon: User,
    label: 'Cliente',
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/20'
  },
  project: {
    icon: Briefcase,
    label: 'Projeto',
    color: 'text-text-secondary',
    bgColor: 'bg-secondary',
    borderColor: 'border-[rgb(var(--border))]'
  },
  equipment: {
    icon: Camera,
    label: 'Equipamento',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20'
  },
  freelancer: {
    icon: Users,
    label: 'Freelancer',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20'
  },
  proposal: {
    icon: FileText,
    label: 'Proposta',
    color: 'text-text-secondary',
    bgColor: 'bg-secondary',
    borderColor: 'border-[rgb(var(--border))]'
  },
  financial: {
    icon: DollarSign,
    label: 'Financeiro',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20'
  }
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Mostrar resultados quando há query e resultados
  const showResults = query.trim().length >= 2

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K para focar no input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // ESC para limpar busca
      if (e.key === 'Escape') {
        setQuery('')
        setResults([])
        inputRef.current?.blur()
      }

      // Navegação com setas (apenas se houver resultados)
      if (showResults && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % results.length)
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
        }
        if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault()
          handleSelectResult(results[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showResults, results, selectedIndex])

  // Auto-scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  const handleSelectResult = useCallback((result: SearchResult) => {
    router.push(result.url as any)
    setQuery('')
    setResults([])
    inputRef.current?.blur()
  }, [router])

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setQuery('')
        setResults([])
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResults])

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar em tudo... (⌘K)"
          className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-secondary pl-10 pr-10 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:border-primary/30 focus:bg-background focus:ring-2 focus:ring-primary/10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4">
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
          )}
          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
              }}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-card shadow-4"
          >
            {/* Content */}
            <div className="relative">
              {results.length === 0 && !isLoading && (
                <div className="p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-text-quaternary" />
                  <p className="mt-4 text-sm text-text-tertiary">
                    Nenhum resultado encontrado
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div
                  ref={resultsRef}
                  className="max-h-[400px] overflow-y-auto custom-scrollbar"
                >
                  {results.map((result, index) => {
                    const config = typeConfig[result.type]
                    const Icon = config.icon
                    const isSelected = index === selectedIndex

                    return (
                      <motion.button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`w-full border-b border-[rgb(var(--border))] p-4 text-left transition-all hover:bg-bg-hover ${
                          isSelected ? 'bg-secondary' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon & Type Badge */}
                          <div className={`flex-shrink-0 rounded-lg border ${config.borderColor} ${config.bgColor} p-2`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-text-primary truncate">
                              {result.title}
                            </h4>
                            <p className="text-xs text-text-tertiary truncate">
                              {result.subtitle}
                            </p>
                            {result.description && (
                              <p className="mt-1 text-xs text-text-quaternary truncate">
                                {result.description}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 text-text-quaternary transition-all ${
                            isSelected ? 'text-text-primary translate-x-1' : ''
                          }`} />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Footer with tips */}
              {results.length > 0 && (
                <div className="border-t border-[rgb(var(--border))] bg-secondary px-4 py-2">
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span>↑↓ Navegar</span>
                    <span>↵ Selecionar</span>
                    <span>ESC Fechar</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
