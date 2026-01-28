'use client'

import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion'
import {
  Play,
  CheckCircle2,
  Wallet,
  Camera,
  ArrowRight,
  LayoutTemplate,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRef, useEffect } from 'react'
import { CrmSimulator } from '@/components/landing/CrmSimulator'

export default function Home() {
  const containerRef = useRef(null)

  // Mouse position for spotlight effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-bg-primary text-text-primary selection:bg-emerald-500/30 selection:text-emerald-50 overflow-hidden"
    >
      {/* Dynamic Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Spotlights */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
               radial-gradient(
                 650px circle at ${mouseX}px ${mouseY}px,
                 rgba(16, 185, 129, 0.05),
                 transparent 80%
               )
             `,
          }}
        />

        {/* Aurora / Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse dark:bg-emerald-900/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700 dark:bg-blue-900/10" />

        {/* Grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] dark:[mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm font-medium text-text-tertiary mb-8 hover:bg-card/80 transition-colors cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Sistema Operacional v2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-text-primary via-text-primary to-text-quaternary"
          >
            Sua Produtora, <br />
            <span className="text-text-primary">Finalmente Organizada.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-text-tertiary mb-10 leading-relaxed"
          >
            Do orçamento aprovado à entrega final, o Zooming centraliza
            projetos, equipe e financeiro em um único lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/login"
              className="group relative w-full sm:w-auto px-8 py-4 bg-text-primary text-bg-primary text-base font-bold rounded-xl hover:bg-text-secondary transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Começar Gratuitamente
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-xl ring-2 ring-text-primary/50 ring-offset-2 ring-offset-bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="#demo"
              className="group w-full sm:w-auto px-8 py-4 bg-card border border-border text-text-primary text-base font-medium rounded-xl hover:bg-secondary transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current group-hover:text-emerald-500 transition-colors" />
              Ver Demo
            </Link>
          </motion.div>
        </div>

        {/* Interactive CRM Simulation */}
        <section className="relative z-10 w-full px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <CrmSimulator />
          </motion.div>
        </section>
      </section>

      {/* Social Proof */}
      <section className="border-y border-border bg-card/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-center text-sm font-bold text-text-quaternary mb-10 uppercase tracking-[0.2em]">
            Usado por produtoras que lideram mercado
          </p>
          <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-30 grayscale mix-blend-screen px-4">
            {/* Styled Placeholders */}
            <div className="flex items-center gap-3 font-bold text-2xl tracking-tighter hover:opacity-100 transition-opacity cursor-default"><Camera className="w-6 h-6" /> MOVIE<span className="font-light">MAKER</span></div>
            <div className="flex items-center gap-3 font-bold text-2xl tracking-tighter hover:opacity-100 transition-opacity cursor-default"><Zap className="w-6 h-6" /> FLASH<span className="font-light">CUTS</span></div>
            <div className="flex items-center gap-3 font-bold text-2xl tracking-tighter hover:opacity-100 transition-opacity cursor-default"><LayoutTemplate className="w-6 h-6" /> STUDIO<span className="font-light">ONE</span></div>
          </div>
        </div>
      </section>

      {/* Pain Points (Agitation) */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-8 leading-tight">
            A forma "padrão" de gerenciar <br />
            está <span className="text-red-500 bg-red-500/10 px-2 rounded-lg decoration-red-500/30 underline decoration-4 underline-offset-4">queimando seu lucro.</span>
          </h2>
          <p className="text-text-tertiary text-lg md:text-xl max-w-2xl mx-auto">
            Se você ainda usa 4 ferramentas diferentes para rodar um único projeto,
            você está perdendo horas (e dinheiro) em processos manuais.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <PainCard
            icon={<LayoutTemplate className="w-6 h-6 text-red-400" />}
            title="PDFs Estáticos"
            description="Você envia propostas em PDF e fica no escuro. O cliente abriu? Leu? Encaminhou? Zero dados para fechar a venda."
          />
          <PainCard
            icon={<Wallet className="w-6 h-6 text-red-400" />}
            title="Lucro Invisível"
            description="Você fecha por 10k, mas esquece o Uber da equipe e as taxas do cartão. No final, descobre que pagou para trabalhar."
          />
          <PainCard
            icon={<Camera className="w-6 h-6 text-red-400" />}
            title="Equipamento no Limbo"
            description="'Onde está a lente 50mm?' Perguntas que causam pânico no grupo de WhatsApp horas antes da diária."
          />
        </div>
      </section>

      {/* Solution / Transformation */}
      <section className="py-32 bg-secondary/20 border-t border-border relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none dark:from-emerald-900/10" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none dark:from-blue-900/10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Section 1: Proposal to Project */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-8 border border-emerald-500/20">
                <Zap className="w-3 h-3" /> Vendas & Automação
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">
                A Proposta vira o Projeto. <br />
                <span className="text-text-tertiary">Sem digitar nada.</span>
              </h3>
              <p className="text-text-tertiary text-lg mb-10 leading-relaxed">
                Esqueça o trabalho manual. Quando seu cliente aprova a proposta online,
                o Zooming cria o projeto, lança o financeiro e gera o checklist.
              </p>
              <div className="space-y-6">
                <FeatureItem
                  title="Rastreamento em Tempo Real"
                  text="Saiba exatamente quando (e quantas vezes) o cliente abriu sua proposta."
                />
                <FeatureItem
                  title="Portfólio Integrado"
                  text="Vídeos rodam direto na proposta. Venda pela emoção, não pelo texto."
                />
                <FeatureItem
                  title="Assinatura One-Click"
                  text="Aceite legal com validade jurídica e criação instantânea do projeto."
                />
              </div>
            </div>

            {/* Interactive Proposal Card */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl rotate-y-6 transform transition-transform duration-500 group-hover:rotate-0">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
                  <div>
                    <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">PROPOSTA #882</div>
                    <div className="font-bold text-xl text-text-primary">Fashion Film - Summer 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-500 font-mono font-bold text-lg">R$ 18.500,00</div>
                    <div className="text-xs text-text-tertiary">Válido até 15/03</div>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-6">
                  <div className="bg-secondary rounded-xl p-4 border border-border flex gap-4 items-center">
                    <div className="w-16 h-12 bg-bg-primary/50 rounded flex items-center justify-center">
                      <Play className="w-5 h-5 text-text-tertiary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary">Vídeo Conceito</div>
                      <div className="text-xs text-text-tertiary">Visualizar referência (02:15)</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-border/50">
                      <span className="text-text-secondary">3x Diárias de Gravação</span>
                      <span className="text-text-tertiary">R$ 4.500</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-border/50">
                      <span className="text-text-secondary">Edição e Color Grading</span>
                      <span className="text-text-tertiary">R$ 6.000</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-border/50">
                      <span className="text-text-secondary">Trilha Sonora (Licenciamento)</span>
                      <span className="text-text-tertiary">R$ 800</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Visualizado agora pelo cliente
                  </div>
                  <button className="px-6 py-2 bg-text-primary text-bg-primary text-sm font-bold rounded-lg hover:bg-text-secondary transition-colors shadow-lg shadow-text-primary/10">
                    ACEITAR PROPOSTA
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Intelligence */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative group perspective-1000">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl -rotate-y-6 transform transition-transform duration-500 group-hover:rotate-0">
                {/* Financial Dashboard */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                    <div className="text-xs text-text-tertiary mb-2">Receita Prevista</div>
                    <div className="text-2xl font-bold text-text-primary flex items-center gap-2">
                      R$ 42.500
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                    <div className="text-xs text-text-tertiary mb-2">Margem de Lucro</div>
                    <div className="text-2xl font-bold text-emerald-500">
                      32.5%
                    </div>
                  </div>
                </div>

                {/* Transaction List */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">Últimas Movimentações</div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-tertiary">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">Aluguel Lente 24-70mm</div>
                        <div className="text-xs text-text-tertiary">Locadora XYZ</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-red-500">- R$ 350,00</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-tertiary">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">Editor (João Silva)</div>
                        <div className="text-xs text-text-tertiary">Diária de Edição</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-amber-500 animate-pulse">Pendente</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">Entrada Projeto Nike</div>
                        <div className="text-xs text-text-tertiary">Pagamento confirmado</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-emerald-500">+ R$ 21.000,00</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider mb-8 border border-blue-500/20">
                <Wallet className="w-3 h-3" /> Gestão Financeira
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">
                Margem de Lucro Real <br />
                <span className="text-text-tertiary">em tempo real.</span>
              </h3>
              <p className="text-text-tertiary text-lg mb-10 leading-relaxed">
                Não espere o fim do mês para descobrir o prejuízo. Ao alocar um freelancer ou reservar um equipamento,
                o Zooming atualiza sua margem instantaneamente.
              </p>
              <div className="space-y-6">
                <FeatureItem
                  title="Contas a Pagar Automáticas"
                  text="Escalou um freela? O sistema já lança a previsão de pagamento."
                />
                <FeatureItem
                  title="ROI por Projeto"
                  text="Saiba quais projetos dão lucro e quais dão prejuízo."
                />
                <FeatureItem
                  title="Fluxo de Caixa Previsível"
                  text="Visualize suas entradas e saídas dos próximos meses."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden bg-bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-text-primary mb-8">
              Sua produtora merece <br />
              ser <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">profissional.</span>
            </h2>
            <p className="text-text-tertiary text-xl mb-12 max-w-2xl mx-auto">
              Junte-se a diretores que pararam de perder tempo com planilhas e começaram a escalar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-10 py-5 bg-text-primary text-bg-primary text-lg font-bold rounded-xl hover:bg-text-secondary transition-colors shadow-[0_0_40px_-10px_rgba(23,23,23,0.3)] hover:shadow-[0_0_60px_-15px_rgba(23,23,23,0.4)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)]"
              >
                Criar Conta Grátis
              </Link>
            </div>
            <p className="mt-8 text-sm text-text-quaternary font-medium">
              Sem cartão de crédito necessário • 14 dias de teste grátis
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function FeatureItem({ title, text }: { title: string, text: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
        <CheckCircle2 className="w-3.5 h-3.5 text-text-tertiary" />
      </div>
      <div>
        <h4 className="text-text-primary font-bold mb-1">{title}</h4>
        <p className="text-text-tertiary text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  )
}


function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-text-primary rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-bg-primary fill-bg-primary" />
          </div>
          Zooming
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-text-tertiary">
          <Link href="#features" className="hover:text-text-primary transition-colors">Funcionalidades</Link>
          <Link href="#pricing" className="hover:text-text-primary transition-colors">Planos</Link>
          <a href="/login" className="hover:text-text-primary transition-colors">Login</a>
        </nav>
        <a
          href="/login"
          className="px-5 py-2 bg-text-primary/10 border border-text-primary/5 text-text-primary text-sm font-semibold rounded-lg hover:bg-text-primary hover:text-bg-primary transition-all"
        >
          Entrar
        </a>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-text-primary font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center border border-border">
              <Play className="w-3 h-3 text-text-primary fill-text-primary" />
            </div>
            Zooming
          </div>
          <div className="text-text-tertiary text-sm max-w-xs">
            © 2025 Zooming CRM. <br />
            Feito com <span className="text-red-500">♥</span> por quem entende de set.
          </div>
        </div>
        <div className="flex gap-8 text-text-tertiary">
          <Link href="#" className="hover:text-text-primary transition-colors">Termos</Link>
          <Link href="#" className="hover:text-text-primary transition-colors">Privacidade</Link>
          <Link href="#" className="hover:text-text-primary transition-colors">Suporte</Link>
        </div>
      </div>
    </footer>
  )
}

function PainCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="group bg-card/40 border border-border p-8 rounded-2xl text-left hover:border-red-500/30 hover:bg-card/80 transition-all duration-300">
      <div className="mb-6 p-3 bg-bg-secondary inline-flex rounded-xl border border-border group-hover:border-red-500/30 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-red-500 transition-colors">{title}</h3>
      <p className="text-text-secondary leading-relaxed font-medium">
        {description}
      </p>
    </div>
  )
}
