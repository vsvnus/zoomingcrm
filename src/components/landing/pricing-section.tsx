'use client'

import { motion } from 'framer-motion'
import { Check, X, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

const features = [
  { name: 'Dashboard completo', pro: true, max: true },
  { name: 'Clientes ilimitados', pro: true, max: true },
  { name: 'Propostas ilimitadas', pro: true, max: true },
  { name: 'Projetos ilimitados', pro: true, max: true },
  { name: 'Financeiro completo', pro: true, max: true },
  { name: 'Calendario integrado', pro: true, max: true },
  { name: 'Gestao de freelancers', pro: true, max: true },
  { name: 'Inventario de equipamentos', pro: true, max: true },
  { name: 'Clapper Studio (IA)', pro: false, max: true },
  { name: 'Calculadora de Orcamento', pro: false, max: true },
  { name: 'Assistente de IA', pro: false, max: true },
  { name: 'Acesso antecipado a novidades', pro: false, max: true },
  { name: 'Suporte prioritario', pro: false, max: true },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-6 relative bg-bg-primary">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Planos simples, sem surpresas
          </h2>
          <p className="text-text-tertiary text-lg max-w-2xl mx-auto">
            Comece com 7 dias gratis no plano Max. Sem cartao de credito.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-sm"
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-bold text-text-primary">Clapper Pro</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-text-primary">R$49</span>
                <span className="text-xl text-text-tertiary">,90</span>
                <span className="text-text-tertiary ml-1">/mes</span>
              </div>
              <p className="text-text-tertiary text-sm">CRM completo para sua produtora</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f.name} className="flex items-center gap-3 text-sm">
                  {f.pro ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-text-quaternary" />
                  )}
                  <span className={f.pro ? 'text-text-secondary' : 'text-text-quaternary'}>
                    {f.name}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block w-full rounded-xl border border-text-primary/20 bg-text-primary/5 py-3.5 text-center text-sm font-semibold text-text-primary transition-all hover:bg-text-primary hover:text-bg-primary"
            >
              Comecar gratis
            </Link>
          </motion.div>

          {/* Max Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative rounded-2xl border-2 border-emerald-500/30 bg-card/60 p-8 backdrop-blur-sm shadow-[0_0_60px_-15px_rgba(16,185,129,0.15)]"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1 text-xs font-bold text-white">
              Mais popular
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-xl font-bold text-text-primary">Clapper Max</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-text-primary">R$79</span>
                <span className="text-xl text-text-tertiary">,90</span>
                <span className="text-text-tertiary ml-1">/mes</span>
              </div>
              <p className="text-text-tertiary text-sm">Tudo do Pro + inteligencia artificial</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f.name} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-text-secondary">{f.name}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block w-full rounded-xl bg-text-primary py-3.5 text-center text-sm font-bold text-bg-primary transition-colors hover:bg-text-secondary shadow-[0_0_30px_-10px_rgba(23,23,23,0.3)] dark:shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
            >
              Comecar gratis
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-center text-sm text-text-quaternary"
        >
          7 dias gratis com acesso completo ao Clapper Max. Cancele quando quiser.
        </motion.p>
      </div>
    </section>
  )
}
