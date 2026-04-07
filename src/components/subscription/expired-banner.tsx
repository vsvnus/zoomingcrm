'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ExpiredBannerProps {
  subscriptionStatus: string | null
}

export function ExpiredBanner({ subscriptionStatus }: ExpiredBannerProps) {
  if (subscriptionStatus !== 'EXPIRED') return null

  return (
    <div className="relative flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-200">
          Seu acesso esta limitado ao dashboard.{' '}
          <span className="text-zinc-400">
            Assine um plano para desbloquear todas as funcionalidades do Clapper.
          </span>
        </p>
      </div>
      <Link
        href={"/settings/billing" as any}
        className="whitespace-nowrap rounded-lg bg-red-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
      >
        Ver planos
      </Link>
    </div>
  )
}
