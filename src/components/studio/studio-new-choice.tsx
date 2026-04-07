'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function StudioNewChoice() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link
          href="/studio"
          className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Studio
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm font-semibold text-text-primary">Novo Roteiro</span>
      </div>

      {/* Choice Cards */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
          {/* AI Option */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/studio/new?mode=ai"
              className="group block rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-8 hover:border-violet-500/40 hover:from-violet-500/10 hover:to-purple-500/10 transition-all"
            >
              <div className="bg-gradient-to-tr from-violet-600 to-purple-500 p-3 rounded-xl w-fit shadow-lg shadow-violet-500/20 mb-5">
                <Sparkles className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Criar com IA
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed mb-5">
                Converse com a IA, descreva seu vídeo e ela cria o roteiro completo
                com cenas, diálogos, câmera e tudo mais.
              </p>

              <div className="flex items-center gap-2 text-sm font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
                Começar
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>

          {/* Manual Option */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/studio/new?mode=manual"
              className="group block rounded-2xl border border-border bg-card p-8 hover:border-text-tertiary/30 hover:bg-bg-hover/50 transition-all"
            >
              <div className="bg-bg-secondary p-3 rounded-xl w-fit border border-border mb-5">
                <FileText className="h-6 w-6 text-text-tertiary" />
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Criar Manualmente
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed mb-5">
                Preencha o formulário com os dados do roteiro e adicione as cenas
                uma a uma no editor.
              </p>

              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                Começar
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
