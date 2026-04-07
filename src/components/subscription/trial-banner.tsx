'use client'

import { Clock, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface TrialBannerProps {
  trialEndsAt: string | null
  subscriptionStatus: string | null
}

export function TrialBanner({ trialEndsAt, subscriptionStatus }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  const daysLeft = useMemo(() => {
    if (!trialEndsAt) return 0
    const now = new Date()
    const end = new Date(trialEndsAt)
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [trialEndsAt])

  // Só mostrar para trials ativos
  if (subscriptionStatus !== 'TRIALING' || dismissed) return null

  const isUrgent = daysLeft <= 2

  return (
    <div
      className={`relative flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
        isUrgent
          ? 'border-red-500/20 bg-red-500/10 text-red-200'
          : 'border-accent-500/20 bg-accent-500/10 text-accent-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isUrgent ? 'bg-red-500/20' : 'bg-accent-500/20'
          }`}
        >
          {isUrgent ? (
            <Clock className="h-4 w-4 text-red-400" />
          ) : (
            <Sparkles className="h-4 w-4 text-accent-400" />
          )}
        </div>
        <p className="text-sm font-medium">
          {daysLeft === 0
            ? 'Seu teste gratuito expira hoje!'
            : daysLeft === 1
              ? 'Seu teste gratuito expira amanha!'
              : `Seu teste gratuito expira em ${daysLeft} dias.`}{' '}
          <span className="text-zinc-400">
            Assine para continuar usando todas as funcionalidades.
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={"/settings/billing" as any}
          className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            isUrgent
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-accent-500 text-white hover:bg-accent-600'
          }`}
        >
          Assinar agora
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
