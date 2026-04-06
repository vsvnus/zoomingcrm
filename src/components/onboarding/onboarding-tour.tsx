'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Film,
  Users,
  Calendar,
  DollarSign,
  Clapperboard,
  Calculator,
  Package,
  UserCircle,
  ChevronRight,
  ChevronLeft,
  Rocket,
  X,
  Sparkles,
  Play,
  CheckCircle2,
  ArrowRight,
  Zap,
  Link2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { completeOnboarding } from '@/actions/onboarding'
import { useRouter, usePathname } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────

interface TourStep {
  id: string
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  href: string
  color: string
  highlights: string[]
  integrationNote?: string
}

// ─── Tour Steps ──────────────────────────────────────────────────────

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    subtitle: 'Seu centro de comando',
    description:
      'Tudo que importa em um só lugar. Saldo em caixa, projetos ativos, contas a pagar e receber — tudo atualizado automaticamente conforme você trabalha.',
    href: '/dashboard',
    color: 'from-blue-500 to-blue-600',
    highlights: [
      'Saldo em caixa atualizado em tempo real',
      'Projetos com contagem regressiva de prazo',
      'Gráfico de fluxo de caixa interativo',
      'Próximos eventos e gravações do mês',
    ],
  },
  {
    id: 'proposals',
    icon: FileText,
    title: 'Propostas',
    subtitle: 'Onde tudo começa',
    description:
      'Crie propostas profissionais e envie um link para o cliente. Quando ele aceitar, o sistema cria tudo automaticamente: projeto, transações financeiras e eventos no calendário.',
    href: '/proposals',
    color: 'from-violet-500 to-violet-600',
    highlights: [
      'Link público para o cliente visualizar e aceitar',
      'Itens, opcionais e cronograma de pagamento',
      'Rastreamento: saiba quando o cliente visualizou',
      'Aceite gera projeto + financeiro + calendário',
    ],
    integrationNote: 'Cliente aceitou? → Projeto + Financeiro + Calendário criados automaticamente',
  },
  {
    id: 'projects',
    icon: Film,
    title: 'Projetos',
    subtitle: 'Pipeline visual de produção',
    description:
      'Gerencie cada produção do briefing à entrega. O Kanban mostra o status de tudo. Projetos criados a partir de propostas já vêm com itens, equipe e datas preenchidas.',
    href: '/projects',
    color: 'from-amber-500 to-orange-500',
    highlights: [
      'Kanban com drag-and-drop entre status',
      'Datas de gravação e entrega rastreadas',
      'Itens do escopo copiados da proposta',
      'Freelancers alocados geram despesas automáticas',
    ],
    integrationNote: 'Alocou freelancer? → Despesa criada automaticamente no Financeiro',
  },
  {
    id: 'clients',
    icon: Users,
    title: 'Clientes',
    subtitle: 'Sua carteira centralizada',
    description:
      'Todos os clientes em um só lugar. Ao criar uma proposta, selecione o cliente e todo o histórico fica vinculado: projetos, propostas e pagamentos.',
    href: '/clients',
    color: 'from-emerald-500 to-green-500',
    highlights: [
      'Cadastro com empresa, email e telefone',
      'Histórico completo de projetos e propostas',
      'Busca rápida por nome ou empresa',
      'Tudo vinculado: proposta → projeto → financeiro',
    ],
  },
  {
    id: 'calendar',
    icon: Calendar,
    title: 'Calendário',
    subtitle: 'Todas as datas, uma única visão',
    description:
      'Gravações, entregas e reuniões aparecem automaticamente quando propostas são aceitas. Sincroniza com Google Calendar para você não perder nada.',
    href: '/calendar',
    color: 'from-sky-500 to-cyan-500',
    highlights: [
      'Gravações e entregas aparecem automaticamente',
      'Sincronização com Google Calendar',
      'Eventos coloridos por tipo (gravação, entrega, reunião)',
      'Compromissos manuais para reuniões extras',
    ],
    integrationNote: 'Proposta aceita com datas? → Eventos criados automaticamente aqui',
  },
  {
    id: 'financeiro',
    icon: DollarSign,
    title: 'Financeiro',
    subtitle: 'Receitas e despesas sob controle',
    description:
      'Quando uma proposta é aceita, as parcelas de recebimento são criadas automaticamente. Quando um freelancer é alocado, a despesa aparece aqui. Tudo integrado.',
    href: '/financeiro',
    color: 'from-green-500 to-emerald-600',
    highlights: [
      'Receitas geradas automaticamente das propostas',
      'Despesas criadas ao alocar freelancers',
      'Contas a pagar e receber separadas',
      'Parcelas e recorrência automática',
    ],
    integrationNote: 'Tudo automático: aceite → parcelas de receita, alocação → despesas',
  },
  {
    id: 'studio',
    icon: Clapperboard,
    title: 'Clapper Studio',
    subtitle: 'Roteiros com IA',
    description:
      'Descreva seu projeto e a inteligência artificial gera roteiros profissionais. Ideal para pré-produção de vídeos institucionais, reels e comerciais.',
    href: '/studio',
    color: 'from-pink-500 to-rose-500',
    highlights: [
      'Geração de roteiros com inteligência artificial',
      'Múltiplos formatos: institucional, reels, comercial',
      'Personalização de tom e estilo',
      'Vinculação com projetos existentes',
    ],
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Equipamentos',
    subtitle: 'Inventário da produtora',
    description:
      'Câmeras, lentes, iluminação — cadastre tudo e controle disponibilidade, manutenção e valor de diária. Reserve equipamentos para projetos específicos.',
    href: '/inventory',
    color: 'from-slate-500 to-gray-600',
    highlights: [
      'Cadastro com marca, modelo e número de série',
      'Status: disponível, em uso, manutenção',
      'Valor de diária para cálculo de custo',
      'Reserva por projeto com controle de conflito',
    ],
  },
  {
    id: 'freelancers',
    icon: UserCircle,
    title: 'Freelancers',
    subtitle: 'Seu banco de talentos',
    description:
      'Cadastre profissionais com especialidade e diária. Ao alocar um freelancer em um projeto, o sistema cria a despesa automaticamente no financeiro.',
    href: '/freelancers',
    color: 'from-teal-500 to-cyan-600',
    highlights: [
      'Especialidades: câmera, drone, editor, som...',
      'Valor de diária editável inline',
      'Avaliação com estrelas para referência rápida',
      'Alocação em projeto gera despesa automática',
    ],
    integrationNote: 'Freelancer alocado em projeto → Despesa gerada automaticamente',
  },
]

// ─── Integration Flow Data ───────────────────────────────────────────

const INTEGRATION_FLOW = [
  { icon: FileText, label: 'Proposta', color: 'text-violet-400' },
  { icon: ArrowRight, label: '', color: 'text-white/20' },
  { icon: Film, label: 'Projeto', color: 'text-amber-400' },
  { icon: ArrowRight, label: '', color: 'text-white/20' },
  { icon: DollarSign, label: 'Financeiro', color: 'text-green-400' },
  { icon: ArrowRight, label: '', color: 'text-white/20' },
  { icon: Calendar, label: 'Calendário', color: 'text-cyan-400' },
]

// ─── Component ───────────────────────────────────────────────────────

export function OnboardingTour({ userName }: { userName: string }) {
  const [phase, setPhase] = useState<'welcome' | 'tour' | 'complete'>('welcome')
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const step = TOUR_STEPS[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  // Navigate to the correct page when step changes during tour
  useEffect(() => {
    if (phase === 'tour' && step.href !== pathname) {
      setIsNavigating(true)
      router.push(step.href as any)
      const timer = setTimeout(() => setIsNavigating(false), 600)
      return () => clearTimeout(timer)
    }
  }, [phase, currentStep, step.href, pathname, router])

  const handleComplete = useCallback(async () => {
    setPhase('complete')
    router.push('/dashboard' as any)
    try {
      await completeOnboarding()
    } catch (err) {
      console.error('Erro ao completar onboarding:', err)
    }
  }, [router])

  const handleFinish = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      router.refresh()
    }, 500)
  }, [router])

  const handleSkip = useCallback(async () => {
    setIsExiting(true)
    try {
      await completeOnboarding()
    } catch (err) {
      console.error('Erro ao pular onboarding:', err)
    }
    router.push('/dashboard' as any)
    setTimeout(() => {
      router.refresh()
    }, 500)
  }, [router])

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const startTour = () => {
    setPhase('tour')
    router.push(TOUR_STEPS[0].href as any)
  }

  const firstName = userName?.split(' ')[0] || 'Usuário'

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999]"
        >
          {/* Backdrop — semi-transparent so user sees the real page behind */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

          {/* ═══ WELCOME PHASE ═══ */}
          <AnimatePresence mode="wait">
            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center px-4"
              >
                <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-bg-primary shadow-2xl">
                  {/* Header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent-500/10 to-transparent px-8 pb-2 pt-10">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-accent-500/10 blur-3xl" />

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30"
                    >
                      <Play className="h-7 w-7 text-primary-foreground" fill="currentColor" />
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold text-text-primary"
                    >
                      Bem-vindo ao Clapper, {firstName}!
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 pb-6 text-sm leading-relaxed text-text-secondary"
                    >
                      O CRM feito para produtoras audiovisuais. Vamos fazer um tour rápido
                      — vou te levar por cada página explicando como tudo funciona integrado.
                    </motion.p>
                  </div>

                  {/* Integration flow visual */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="border-y border-white/5 bg-white/[0.02] px-6 py-5"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Tudo automático e integrado
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-2">
                      {INTEGRATION_FLOW.map((item, i) => {
                        const FlowIcon = item.icon
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + i * 0.08 }}
                            className="flex flex-col items-center gap-1"
                          >
                            <FlowIcon className={`h-5 w-5 ${item.color}`} />
                            {item.label && (
                              <span className="text-[10px] font-medium text-text-tertiary">
                                {item.label}
                              </span>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="mt-2 text-center text-xs text-text-quaternary"
                    >
                      Cliente aceita proposta → projeto, parcelas e eventos são criados automaticamente
                    </motion.p>
                  </motion.div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 p-6">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 }}
                      onClick={startTour}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      <Rocket className="h-4 w-4" />
                      Começar o Tour Guiado
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      onClick={handleSkip}
                      className="text-sm text-text-tertiary transition-colors hover:text-text-secondary"
                    >
                      Pular e explorar por conta própria
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ TOUR PHASE ═══ */}
            {phase === 'tour' && (
              <motion.div
                key="tour"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 md:items-end md:justify-end md:p-6"
              >
                <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-bg-primary/95 shadow-2xl backdrop-blur-xl">
                  {/* Skip button */}
                  <button
                    onClick={handleSkip}
                    className="absolute right-3 top-3 z-20 rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Progress bar */}
                  <div className="h-1 w-full bg-white/5">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Step dots + counter */}
                  <div className="flex items-center justify-between px-5 pt-4">
                    <span className="text-xs font-medium text-text-tertiary">
                      {currentStep + 1}/{TOUR_STEPS.length}
                    </span>
                    <div className="flex gap-1">
                      {TOUR_STEPS.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentStep(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === currentStep
                              ? 'w-5 bg-primary'
                              : i < currentStep
                                ? 'w-1.5 bg-primary/40'
                                : 'w-1.5 bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: isNavigating ? 0.5 : 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="px-5 pb-4 pt-3"
                    >
                      {/* Icon + Title */}
                      <div className="mb-3 flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold leading-tight text-text-primary">
                            {step.title}
                          </h2>
                          <p className="text-xs font-medium text-text-tertiary">{step.subtitle}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mb-3 text-[13px] leading-relaxed text-text-secondary">
                        {step.description}
                      </p>

                      {/* Highlights */}
                      <div className="mb-3 space-y-1.5">
                        {step.highlights.map((highlight, i) => (
                          <motion.div
                            key={highlight}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary/70" />
                            <span className="text-xs leading-relaxed text-text-secondary/80">
                              {highlight}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Integration note */}
                      {step.integrationNote && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex items-start gap-2 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2"
                        >
                          <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="text-[11px] font-medium leading-relaxed text-primary/80">
                            {step.integrationNote}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <button
                      onClick={nextStep}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      {currentStep < TOUR_STEPS.length - 1 ? (
                        <>
                          Próximo
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Concluir
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ COMPLETE PHASE ═══ */}
            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center px-4"
              >
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-bg-primary shadow-2xl">
                  <div className="flex flex-col items-center px-8 py-10 text-center">
                    {/* Checkmark */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold text-text-primary"
                    >
                      Tudo pronto, {firstName}!
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 text-sm leading-relaxed text-text-secondary"
                    >
                      Agora você conhece o Clapper. Lembre-se: tudo é integrado.
                    </motion.p>

                    {/* Quick recap */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-4 w-full rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Dica para começar
                      </p>
                      <div className="space-y-2 text-left">
                        <div className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">
                            1
                          </span>
                          <span className="text-xs text-text-secondary">
                            Cadastre seu primeiro <strong className="text-text-primary">cliente</strong>
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                            2
                          </span>
                          <span className="text-xs text-text-secondary">
                            Crie uma <strong className="text-text-primary">proposta</strong> e envie o link
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-[10px] font-bold text-green-400">
                            3
                          </span>
                          <span className="text-xs text-text-secondary">
                            O resto é <strong className="text-text-primary">automático</strong> — projeto, financeiro e calendário
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      onClick={handleFinish}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      <Rocket className="h-4 w-4" />
                      Começar a usar o Clapper
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
