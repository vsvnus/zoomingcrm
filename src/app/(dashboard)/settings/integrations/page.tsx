'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Check, ExternalLink, Loader2, Unplug, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getGoogleCalendarStatus } from '@/actions/calendar'

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const [isConnected, setIsConnected] = useState(false)
  const [connectedAt, setConnectedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisconnecting, startDisconnect] = useTransition()

  const success = searchParams.get('success')
  const error = searchParams.get('error')

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await getGoogleCalendarStatus()
        setIsConnected(status.connected)
        setConnectedAt(status.connectedAt ?? null)
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }
    checkStatus()
  }, [])

  const handleDisconnect = () => {
    startDisconnect(async () => {
      try {
        const res = await fetch('/api/google-calendar/disconnect', { method: 'POST' })
        if (res.ok) {
          setIsConnected(false)
          setConnectedAt(null)
        }
      } catch {
        // ignore
      }
    })
  }

  const errorMessages: Record<string, string> = {
    access_denied: 'Você negou o acesso ao Google Calendar.',
    no_code: 'Código de autorização não recebido.',
    invalid_state: 'Erro de segurança na autenticação.',
    token_exchange_failed: 'Falha ao conectar com o Google. Tente novamente.',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Configurações
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Integrações
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-zinc-400"
        >
          Conecte serviços externos ao Clapper
        </motion.p>
      </div>

      {/* Success/Error Messages */}
      {success === 'google_calendar_connected' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-400"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Google Calendar conectado com sucesso! Seus eventos do CRM serão sincronizados automaticamente.
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400"
        >
          {errorMessages[error] || 'Erro desconhecido ao conectar.'}
        </motion.div>
      )}

      {/* Google Calendar Integration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Google Calendar Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Google Calendar</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Sincronize eventos do Clapper com seu Google Calendar.
                Quando você cria, edita ou exclui um evento no CRM, ele é
                automaticamente refletido no seu Google Calendar.
              </p>

              {isConnected && connectedAt && (
                <p className="mt-2 text-xs text-zinc-500">
                  Conectado em{' '}
                  {new Date(connectedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {!isLoading && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isConnected
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
              }`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-zinc-500'
                }`}
              />
              {isConnected ? 'Conectado' : 'Desconectado'}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando conexão...
            </div>
          ) : isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unplug className="h-4 w-4" />
              )}
              Desconectar
            </button>
          ) : (
            <a
              href="/api/google-calendar/connect"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Conectar Google Calendar
            </a>
          )}
        </div>

        {/* How it works */}
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h4 className="text-sm font-medium text-zinc-300">Como funciona</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-500">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent-500">•</span>
              Ao criar um evento no CRM, ele aparece no seu Google Calendar
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent-500">•</span>
              Ao editar ou excluir, a mudança reflete automaticamente
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent-500">•</span>
              Eventos do Google Calendar não são importados para o CRM
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent-500">•</span>
              Cada usuário conecta sua própria conta Google
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
