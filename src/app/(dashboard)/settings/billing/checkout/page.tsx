'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  FileText,
  Crown,
  Zap,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { startSubscription } from '@/actions/subscription'
import type { AsaasBillingType } from '@/lib/asaas'

type PaymentMethod = 'CREDIT_CARD' | 'UNDEFINED' | 'BOLETO'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = (searchParams.get('plan') as 'PRO' | 'MAX') || 'MAX'

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UNDEFINED')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const price = plan === 'PRO' ? 'R$49,90' : 'R$79,90'
  const planLabel = plan === 'PRO' ? 'Clapper Pro' : 'Clapper Max'

  const handleSubscribe = async () => {
    if (!cpfCnpj.trim()) {
      setError('Informe seu CPF ou CNPJ')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await startSubscription(plan, paymentMethod as AsaasBillingType, cpfCnpj)
      if (!result.success) {
        setError(result.error || 'Erro ao processar assinatura. Tente novamente.')
        return
      }
      router.refresh()
      router.push('/settings/billing?success=true' as any)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar assinatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={"/settings/billing" as any}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            Assinar {planLabel}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-zinc-400"
          >
            {price}/mes
          </motion.p>
        </div>
      </div>

      {/* Plan Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`flex items-center gap-4 rounded-2xl border p-5 backdrop-blur-xl ${
          plan === 'MAX'
            ? 'border-amber-500/20 bg-amber-500/5'
            : 'border-blue-500/20 bg-blue-500/5'
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            plan === 'MAX' ? 'bg-amber-500/20' : 'bg-blue-500/20'
          }`}
        >
          {plan === 'MAX' ? (
            <Crown className="h-6 w-6 text-amber-400" />
          ) : (
            <Zap className="h-6 w-6 text-blue-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{planLabel}</h3>
          <p className="text-sm text-zinc-400">Cobranca mensal recorrente</p>
        </div>
        <p className="text-2xl font-bold text-white">{price}</p>
      </motion.div>

      {/* CPF/CNPJ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h3 className="mb-4 text-lg font-bold text-white">Dados de cobranca</h3>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            CPF ou CNPJ
          </label>
          <input
            type="text"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder="000.000.000-00 ou 00.000.000/0001-00"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20"
          />
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h3 className="mb-4 text-lg font-bold text-white">Forma de pagamento</h3>
        <div className="grid gap-3">
          {[
            { id: 'UNDEFINED' as const, label: 'PIX', desc: 'Cobranca mensal via PIX', icon: QrCode },
            { id: 'CREDIT_CARD' as const, label: 'Cartao de Credito', desc: 'Cobranca automatica mensal', icon: CreditCard },
            { id: 'BOLETO' as const, label: 'Boleto Bancario', desc: 'Vencimento em 3 dias uteis', icon: FileText },
          ].map((method) => {
            const Icon = method.icon
            const isSelected = paymentMethod === method.id
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-accent-500/40 bg-accent-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-accent-500/20' : 'bg-white/5'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-accent-400' : 'text-zinc-500'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {method.label}
                  </p>
                  <p className="text-xs text-zinc-500">{method.desc}</p>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    isSelected
                      ? 'border-accent-500 bg-accent-500'
                      : 'border-zinc-600'
                  }`}
                >
                  {isSelected && (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full rounded-xl py-4 text-center text-sm font-bold text-white transition-all disabled:opacity-50 ${
            plan === 'MAX'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Processando...' : `Assinar ${planLabel} — ${price}/mes`}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Shield className="h-3.5 w-3.5" />
          <span>Pagamento seguro processado via Asaas. Cancele quando quiser.</span>
        </div>
      </motion.div>
    </div>
  )
}
