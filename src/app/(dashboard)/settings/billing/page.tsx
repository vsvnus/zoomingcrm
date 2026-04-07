'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Crown,
  Sparkles,
  CreditCard,
  Clock,
  AlertTriangle,
  Zap,
  PartyPopper,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSubscriptionData, cancelSubscriptionAction, changePlan } from '@/actions/subscription'
import { PLAN_LABELS } from '@/lib/subscription/plans'
import type { PlanKey } from '@/lib/subscription/plans'
import { getEffectivePlan } from '@/lib/subscription/access'

const PRO_FEATURES = [
  'Dashboard completo',
  'Gerenciamento de clientes',
  'Propostas ilimitadas',
  'Projetos ilimitados',
  'Financeiro completo',
  'Calendario integrado',
  'Gestao de freelancers',
  'Inventario de equipamentos',
]

const MAX_FEATURES = [
  'Tudo do Pro',
  'Clapper Studio (IA)',
  'Calculadora de Orcamento',
  'Assistente de IA',
  'Acesso antecipado a novidades',
  'Suporte prioritario',
]

interface SubscriptionData {
  organizationId: string
  name: string
  email: string
  cnpj: string | null
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  trialStartedAt: string | null
  trialEndsAt: string | null
  subscriptionStartedAt: string | null
  subscriptionEndsAt: string | null
  canceledAt: string | null
  asaasCustomerId: string | null
  asaasSubscriptionId: string | null
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>}>
      <BillingContent />
    </Suspense>
  )
}

function BillingContent() {
  const searchParams = useSearchParams()
  const blockedFeature = searchParams.get('blocked')
  const isSuccess = searchParams.get('success') === 'true'

  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)
  const [showSuccess, setShowSuccess] = useState(isSuccess)

  useEffect(() => {
    getSubscriptionData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Auto-dismiss success after 8 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const effectivePlan: PlanKey = data
    ? getEffectivePlan({
        subscriptionPlan: data.subscriptionPlan,
        subscriptionStatus: data.subscriptionStatus,
        trialEndsAt: data.trialEndsAt,
        subscriptionEndsAt: data.subscriptionEndsAt,
        canceledAt: data.canceledAt,
      })
    : 'EXPIRED'

  const daysLeft = data?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(data.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0

  const refreshData = async () => {
    const refreshed = await getSubscriptionData()
    setData(refreshed)
  }

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Voce mantera o acesso ate o fim do periodo atual.')) return
    setCanceling(true)
    try {
      const result = await cancelSubscriptionAction()
      if (!result.success) {
        alert(result.error || 'Erro ao cancelar assinatura.')
        return
      }
      await refreshData()
    } catch (error) {
      console.error(error)
      alert('Erro ao cancelar assinatura. Tente novamente.')
    } finally {
      setCanceling(false)
    }
  }

  const handleChangePlan = async (plan: 'PRO' | 'MAX') => {
    setChangingPlan(true)
    try {
      const result = await changePlan(plan)
      if (!result.success) {
        alert(result.error || 'Erro ao alterar plano.')
        return
      }
      await refreshData()
      setShowSuccess(true)
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Erro ao alterar plano.')
    } finally {
      setChangingPlan(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Assinatura
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-zinc-400"
          >
            Gerencie seu plano e pagamentos
          </motion.p>
        </div>
      </div>

      {/* Success Celebration */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 backdrop-blur-xl"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <PartyPopper className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Assinatura ativada com sucesso!</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Parabens! Agora voce tem acesso completo ao{' '}
                <span className="font-semibold text-emerald-400">
                  {data?.subscriptionPlan === 'MAX' ? 'Clapper Max' : 'Clapper Pro'}
                </span>
                . Todas as funcionalidades estao desbloqueadas.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-emerald-300">Sua primeira cobranca sera processada em breve</span>
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="shrink-0 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Blocked Feature Alert */}
      {blockedFeature && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3"
        >
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <p className="text-sm text-amber-200">
            A funcionalidade que voce tentou acessar requer um plano ativo. Escolha um plano abaixo para continuar.
          </p>
        </motion.div>
      )}

      {/* Current Plan Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                effectivePlan === 'EXPIRED'
                  ? 'bg-red-500/20'
                  : effectivePlan === 'TRIAL'
                    ? 'bg-accent-500/20'
                    : effectivePlan === 'MAX'
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                      : 'bg-blue-500/20'
              }`}
            >
              {effectivePlan === 'MAX' ? (
                <Crown className="h-6 w-6 text-amber-400" />
              ) : effectivePlan === 'PRO' ? (
                <Zap className="h-6 w-6 text-blue-400" />
              ) : effectivePlan === 'TRIAL' ? (
                <Sparkles className="h-6 w-6 text-accent-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {PLAN_LABELS[effectivePlan]}
              </h2>
              <p className="text-sm text-zinc-400">
                {effectivePlan === 'TRIAL'
                  ? `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''} de teste`
                  : effectivePlan === 'EXPIRED'
                    ? 'Seu acesso esta limitado ao dashboard'
                    : data?.subscriptionStatus === 'CANCELED'
                      ? `Acesso ate ${data?.subscriptionEndsAt ? new Date(data.subscriptionEndsAt).toLocaleDateString('pt-BR') : 'fim do periodo'}`
                      : data?.subscriptionEndsAt
                        ? `Proxima cobranca: ${new Date(data.subscriptionEndsAt).toLocaleDateString('pt-BR')}`
                        : 'Assinatura ativa'}
              </p>
            </div>
          </div>
          {data?.subscriptionStatus === 'ACTIVE' && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {canceling ? 'Cancelando...' : 'Cancelar assinatura'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`relative rounded-2xl border p-6 backdrop-blur-xl transition-all ${
            effectivePlan === 'PRO'
              ? 'border-blue-500/30 bg-blue-500/5'
              : 'border-white/5 bg-white/5 hover:border-white/10'
          }`}
        >
          {effectivePlan === 'PRO' && (
            <div className="absolute -top-3 left-4 rounded-full bg-blue-500 px-3 py-0.5 text-xs font-semibold text-white">
              Plano atual
            </div>
          )}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Clapper Pro</h3>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">R$49</span>
              <span className="text-lg text-zinc-400">,90/mes</span>
            </div>
          </div>
          <ul className="mb-6 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-blue-400" />
                {feature}
              </li>
            ))}
          </ul>
          {effectivePlan !== 'PRO' && (
            <Link
              href={"/settings/billing/checkout?plan=PRO" as any}
              className="block w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              {effectivePlan === 'MAX' ? 'Fazer downgrade' : 'Assinar Pro'}
            </Link>
          )}
          {effectivePlan === 'MAX' && data?.subscriptionStatus === 'ACTIVE' && (
            <button
              onClick={() => handleChangePlan('PRO')}
              disabled={changingPlan}
              className="mt-2 block w-full rounded-xl border border-blue-500/20 py-3 text-center text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/10 disabled:opacity-50"
            >
              {changingPlan ? 'Alterando...' : 'Alterar para Pro'}
            </button>
          )}
        </motion.div>

        {/* Max Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`relative rounded-2xl border p-6 backdrop-blur-xl transition-all ${
            effectivePlan === 'MAX'
              ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-accent-500/20 bg-accent-500/5 hover:border-accent-500/30'
          }`}
        >
          {effectivePlan === 'MAX' ? (
            <div className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
              Plano atual
            </div>
          ) : (
            <div className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 px-3 py-0.5 text-xs font-semibold text-white">
              Mais popular
            </div>
          )}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <h3 className="text-xl font-bold text-white">Clapper Max</h3>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">R$79</span>
              <span className="text-lg text-zinc-400">,90/mes</span>
            </div>
          </div>
          <ul className="mb-6 space-y-3">
            {MAX_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-amber-400" />
                {feature}
              </li>
            ))}
          </ul>
          {effectivePlan !== 'MAX' && (
            <Link
              href={"/settings/billing/checkout?plan=MAX" as any}
              className="block w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:from-amber-600 hover:to-orange-600"
            >
              {effectivePlan === 'PRO' ? 'Fazer upgrade' : 'Assinar Max'}
            </Link>
          )}
          {effectivePlan === 'PRO' && data?.subscriptionStatus === 'ACTIVE' && (
            <button
              onClick={() => handleChangePlan('MAX')}
              disabled={changingPlan}
              className="mt-2 block w-full rounded-xl border border-amber-500/20 py-3 text-center text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
            >
              {changingPlan ? 'Alterando...' : 'Upgrade para Max'}
            </button>
          )}
        </motion.div>
      </div>

      {/* Payment Info */}
      {data?.asaasSubscriptionId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-white">Informacoes de pagamento</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Plano</p>
              <p className="font-medium text-white">{PLAN_LABELS[(data.subscriptionPlan as PlanKey) || 'EXPIRED']}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Status</p>
              <p className="font-medium text-white">
                {data.subscriptionStatus === 'ACTIVE' && 'Ativo'}
                {data.subscriptionStatus === 'TRIALING' && 'Periodo de teste'}
                {data.subscriptionStatus === 'PAST_DUE' && 'Pagamento pendente'}
                {data.subscriptionStatus === 'CANCELED' && 'Cancelado'}
                {data.subscriptionStatus === 'EXPIRED' && 'Expirado'}
              </p>
            </div>
            {data.subscriptionStartedAt && (
              <div>
                <p className="text-sm text-zinc-500">Assinante desde</p>
                <p className="font-medium text-white">
                  {new Date(data.subscriptionStartedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            {data.subscriptionEndsAt && (
              <div>
                <p className="text-sm text-zinc-500">Proxima cobranca</p>
                <p className="font-medium text-white">
                  {new Date(data.subscriptionEndsAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
