'use client'

import { useState, useCallback } from 'react'
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
} from 'lucide-react'
import { completeOnboarding } from '@/actions/onboarding'
import { useRouter } from 'next/navigation'

interface TourStep {
  id: string
  icon: typeof LayoutDashboard
  title: string
  description: string
  href: string
  color: string
  features: string[]
}

const tourSteps: TourStep[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    description:
      'Seu painel de controle principal. Aqui você tem uma visão geral de tudo: projetos ativos, receitas, propostas pendentes e métricas importantes do seu negócio.',
    href: '/dashboard',
    color: 'from-blue-500 to-blue-600',
    features: [
      'Resumo financeiro em tempo real',
      'Projetos ativos e próximos prazos',
      'Métricas de performance',
      'Gráficos de receita e despesas',
    ],
  },
  {
    id: 'proposals',
    icon: FileText,
    title: 'Propostas',
    description:
      'Crie propostas profissionais e envie para seus clientes. Eles podem visualizar, aceitar ou recusar diretamente pelo link compartilhado.',
    href: '/proposals',
    color: 'from-violet-500 to-violet-600',
    features: [
      'Editor visual de propostas',
      'Link público para o cliente',
      'Itens e opcionais com preços',
      'Rastreamento de visualização',
    ],
  },
  {
    id: 'projects',
    icon: Film,
    title: 'Projetos',
    description:
      'Gerencie todo o pipeline de produção. Do primeiro contato até a entrega final, acompanhe cada projeto pelo seu estágio.',
    href: '/projects',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Pipeline visual (Kanban)',
      'Datas de gravação e entrega',
      'Alocação de equipe e equipamentos',
      'Controle de revisões do cliente',
    ],
  },
  {
    id: 'clients',
    icon: Users,
    title: 'Clientes',
    description:
      'Sua base de clientes centralizada. Mantenha contatos, histórico de projetos e propostas organizados em um só lugar.',
    href: '/clients',
    color: 'from-emerald-500 to-green-500',
    features: [
      'Cadastro completo de clientes',
      'Histórico de projetos por cliente',
      'Propostas vinculadas',
      'Observações e notas internas',
    ],
  },
  {
    id: 'calendar',
    icon: Calendar,
    title: 'Calendário',
    description:
      'Visualize todas as gravações, entregas e reuniões em um calendário integrado. Sincroniza com Google Calendar automaticamente.',
    href: '/calendar',
    color: 'from-sky-500 to-cyan-500',
    features: [
      'Vista mensal/semanal/diária',
      'Eventos de gravação e entrega',
      'Sincronização com Google Calendar',
      'Compromissos manuais',
    ],
  },
  {
    id: 'financeiro',
    icon: DollarSign,
    title: 'Financeiro',
    description:
      'Controle completo de receitas e despesas. Acompanhe o fluxo de caixa, contas a pagar/receber e a saúde financeira da sua produtora.',
    href: '/financeiro',
    color: 'from-green-500 to-emerald-600',
    features: [
      'Fluxo de caixa em tempo real',
      'Receitas e despesas por projeto',
      'Contas a pagar e receber',
      'Relatórios financeiros',
    ],
  },
  {
    id: 'studio',
    icon: Clapperboard,
    title: 'Clapper Studio',
    description:
      'Use inteligência artificial para gerar roteiros profissionais para seus vídeos. Descreva o projeto e a IA cria o script completo.',
    href: '/studio',
    color: 'from-pink-500 to-rose-500',
    features: [
      'Geração de roteiros com IA',
      'Múltiplos formatos de vídeo',
      'Personalização de tom e estilo',
      'Exportação do roteiro',
    ],
  },
  {
    id: 'budget',
    icon: Calculator,
    title: 'Calculadora de Orçamento',
    description:
      'Calcule orçamentos de produção rapidamente. Defina equipe, equipamentos, locações e tenha o valor total automaticamente.',
    href: '/budget-calculator',
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Cálculo automático de custos',
      'Categorias pré-definidas',
      'Margem de lucro configurável',
      'Exportação para proposta',
    ],
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Equipamentos',
    description:
      'Gerencie todo o inventário da sua produtora. Câmeras, lentes, iluminação — controle disponibilidade, manutenção e reservas.',
    href: '/inventory',
    color: 'from-slate-500 to-gray-600',
    features: [
      'Cadastro detalhado de equipamentos',
      'Controle de disponibilidade',
      'Histórico de manutenção',
      'Reserva por projeto',
    ],
  },
  {
    id: 'freelancers',
    icon: UserCircle,
    title: 'Freelancers',
    description:
      'Seu banco de talentos. Cadastre freelancers com especialidades, valores de diária e avaliações para montar equipes rapidamente.',
    href: '/freelancers',
    color: 'from-teal-500 to-cyan-600',
    features: [
      'Cadastro com especialidades (tags)',
      'Valor de diária por profissional',
      'Avaliação interna (estrelas)',
      'Alocação em projetos',
    ],
  },
]

export function OnboardingTour({ userName }: { userName: string }) {
  const [phase, setPhase] = useState<'welcome' | 'tour' | 'complete'>('welcome')
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const router = useRouter()

  const step = tourSteps[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  const handleComplete = useCallback(async () => {
    setPhase('complete')
    try {
      await completeOnboarding()
    } catch (err) {
      console.error('Erro ao completar onboarding:', err)
    }
  }, [])

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
    setTimeout(() => {
      router.refresh()
    }, 500)
  }, [router])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
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

  const firstName = userName?.split(' ')[0] || 'Usuário'

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* === FASE: WELCOME === */}
          <AnimatePresence mode="wait">
            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 mx-4 w-full max-w-lg"
              >
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-primary shadow-2xl">
                  {/* Header com gradiente */}
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
                      Sua produtora agora tem um CRM completo. Vamos fazer um tour
                      rápido para você conhecer tudo que pode fazer aqui.
                    </motion.p>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-px border-y border-white/5 bg-white/5">
                    {[
                      { label: 'Módulos', value: '10' },
                      { label: 'Tour', value: '~2min' },
                      { label: 'IA Integrada', value: 'Sim' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex flex-col items-center py-4"
                      >
                        <span className="text-lg font-bold text-text-primary">{stat.value}</span>
                        <span className="text-xs text-text-tertiary">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 p-6">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      onClick={() => setPhase('tour')}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      <Rocket className="h-4 w-4" />
                      Começar o Tour
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      onClick={handleSkip}
                      className="text-sm text-text-tertiary transition-colors hover:text-text-secondary"
                    >
                      Pular e explorar por conta própria
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === FASE: TOUR === */}
            {phase === 'tour' && (
              <motion.div
                key="tour"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 mx-4 w-full max-w-2xl"
              >
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-primary shadow-2xl">
                  {/* Skip button */}
                  <button
                    onClick={handleSkip}
                    className="absolute right-4 top-4 z-20 rounded-lg p-2 text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-secondary"
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

                  {/* Step counter */}
                  <div className="flex items-center justify-between px-6 pt-5">
                    <span className="text-xs font-medium text-text-tertiary">
                      {currentStep + 1} de {tourSteps.length}
                    </span>
                    <div className="flex gap-1">
                      {tourSteps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentStep(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === currentStep
                              ? 'w-6 bg-primary'
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
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="px-6 pb-6 pt-4"
                    >
                      {/* Icon + Title */}
                      <div className="mb-4 flex items-start gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-text-primary">{step.title}</h2>
                          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {step.features.map((feature, i) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2.5"
                          >
                            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="text-xs leading-relaxed text-text-secondary">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <button
                      onClick={nextStep}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      {currentStep < tourSteps.length - 1 ? (
                        <>
                          Próximo
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Concluir Tour
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === FASE: COMPLETE === */}
            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 mx-4 w-full max-w-md"
              >
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-primary shadow-2xl">
                  <div className="flex flex-col items-center px-8 py-10 text-center">
                    {/* Animated checkmark */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
                    >
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <CheckCircle2 className="h-10 w-10 text-white" />
                      </motion.div>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold text-text-primary"
                    >
                      Tudo pronto!
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 text-sm leading-relaxed text-text-secondary"
                    >
                      Agora você conhece todas as ferramentas do Clapper.
                      <br />
                      Comece criando seu primeiro cliente ou proposta!
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="mt-6 flex w-full flex-col gap-2"
                    >
                      <button
                        onClick={handleFinish}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                      >
                        <Rocket className="h-4 w-4" />
                        Começar a usar o Clapper
                      </button>
                    </motion.div>
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
