'use client'

import { Crown, Check, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { useSubscriptionStore } from '@/stores/subscription-store'

const FEATURE_LABELS: Record<string, string> = {
  studio: 'Clapper Studio',
  budgetCalculator: 'Calculadora de Orcamento',
  aiChat: 'Assistente de IA',
  proposals: 'Propostas',
  projects: 'Projetos',
  clients: 'Clientes',
  calendar: 'Calendario',
  financeiro: 'Financeiro',
  freelancers: 'Freelancers',
  inventory: 'Equipamentos',
}

export function UpgradeModal() {
  const { showUpgradeModal, blockedFeature, closeUpgradeModal, effectivePlan } =
    useSubscriptionStore()

  if (!showUpgradeModal) return null

  const featureLabel = blockedFeature ? FEATURE_LABELS[blockedFeature] || blockedFeature : ''
  const isMaxOnly = ['studio', 'budgetCalculator', 'aiChat'].includes(blockedFeature || '')
  const needsPlan = effectivePlan === 'EXPIRED'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-2xl">
        <button
          onClick={closeUpgradeModal}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Crown className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {needsPlan ? 'Assine para continuar' : 'Upgrade necessario'}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {featureLabel && (
              <>
                <span className="font-medium text-white">{featureLabel}</span> requer{' '}
              </>
            )}
            {isMaxOnly
              ? 'o plano Clapper Max.'
              : needsPlan
                ? 'um plano ativo para acessar esta funcionalidade.'
                : 'um plano superior.'}
          </p>
        </div>

        <div className="grid gap-3">
          {/* Pro option */}
          {needsPlan && !isMaxOnly && (
            <Link
              href={"/settings/billing/checkout?plan=PRO" as any}
              onClick={closeUpgradeModal}
              className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Clapper Pro</p>
                <p className="text-sm text-zinc-400">R$49,90/mes</p>
              </div>
              <Check className="h-5 w-5 text-blue-400" />
            </Link>
          )}

          {/* Max option */}
          <Link
            href={"/settings/billing/checkout?plan=MAX" as any}
            onClick={closeUpgradeModal}
            className="flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:border-amber-500/40 hover:bg-amber-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Crown className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Clapper Max</p>
              <p className="text-sm text-zinc-400">R$79,90/mes — Tudo incluso + IA</p>
            </div>
            <Check className="h-5 w-5 text-amber-400" />
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href={"/settings/billing" as any}
            onClick={closeUpgradeModal}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Comparar planos
          </Link>
        </div>
      </div>
    </div>
  )
}
