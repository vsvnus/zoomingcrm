'use client'

import { motion } from 'framer-motion'
import {
  Play,
  CheckCircle2,
  Wallet,
  Camera,
  ArrowRight,
  LayoutTemplate,
  Zap,
  Clock,
  TrendingUp,
  Users,
  Film,
  FileText,
  Package,
  Calendar,
  Sparkles,
  Shield,
  BarChart3,
  MousePointer2,
  Clapperboard as ClapperIcon,
  ChevronDown,
  Star,
  Crown,
  X,
  Check,
  MessageSquare,
  Cpu,
  Eye,
  PenTool,
  GitBranch,
  CircleDollarSign,
  Boxes,
  UserCheck,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { CrmSimulator } from '@/components/landing/CrmSimulator'
import { PricingSection } from '@/components/landing/pricing-section'
import { CinematicText } from '@/components/landing/cinematic-text'
import { AnimatedCounter } from '@/components/landing/animated-counter'

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

export default function Home() {
  const containerRef = useRef(null)

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen bg-bg-primary text-text-primary selection:bg-emerald-500/30 selection:text-emerald-50 overflow-hidden"
    >
      <Header />

      {/* ============================================ */}
      {/* HERO — WHITE SPOTLIGHT + CSS DUST           */}
      {/* ============================================ */}
      <section className="relative z-10 min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#09090b]">

        {/* === WHITE SPOTLIGHT CONE (top-down) === */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Cone — triangle clipped, soft gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[70rem] h-[75%]"
            style={{
              clipPath: 'polygon(48% 0%, 52% 0%, 75% 100%, 25% 100%)',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
            }}
          />
          {/* Source glow — small bright spot at top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 -top-6 w-32 h-16 rounded-full bg-white/30 blur-2xl"
          />
          {/* Mid ambient glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute left-1/2 -translate-x-1/2 top-[20%] w-[24rem] h-64 rounded-full bg-white/8 blur-[100px]"
          />
        </div>

        {/* === CSS DUST PARTICLES (white only) === */}
        <div className="absolute inset-0 pointer-events-none z-[5]">
          {Array.from({ length: 20 }).map((_, i) => {
            const left = Math.round((30 + Math.sin(i * 1.7) * 20) * 100) / 100
            const top = Math.round((20 + Math.cos(i * 2.3) * 35) * 100) / 100
            const size = 2 + (i % 3)
            const opacity = Math.round((0.3 + (i % 5) * 0.12) * 100) / 100
            const glowSize = 4 + (i % 4) * 2
            const glowOpacity = Math.round((0.2 + (i % 3) * 0.1) * 100) / 100
            return (
              <div
                key={`f${i}`}
                className="dust-particle dust-particle--float"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `rgba(255, 255, 255, ${opacity})`,
                  boxShadow: `0 0 ${glowSize}px rgba(255, 255, 255, ${glowOpacity})`,
                  '--dust-duration': `${6 + (i % 5) * 2}s`,
                  '--dust-delay': `${Math.round(((i * 0.7) % 8) * 100) / 100}s`,
                } as React.CSSProperties}
              />
            )
          })}
          {Array.from({ length: 14 }).map((_, i) => {
            const left = Math.round((20 + Math.cos(i * 2.1) * 30) * 100) / 100
            const top = Math.round((15 + Math.sin(i * 1.5) * 40) * 100) / 100
            const size = 1.5 + (i % 4) * 0.5
            const opacity = Math.round((0.2 + (i % 4) * 0.1) * 100) / 100
            const glowSize = 3 + (i % 3) * 2
            const glowOpacity = Math.round((0.15 + (i % 3) * 0.05) * 100) / 100
            return (
              <div
                key={`d${i}`}
                className="dust-particle dust-particle--drift"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `rgba(255, 255, 255, ${opacity})`,
                  boxShadow: `0 0 ${glowSize}px rgba(255, 255, 255, ${glowOpacity})`,
                  '--dust-duration': `${8 + (i % 4) * 3}s`,
                  '--dust-delay': `${Math.round(((i * 1.1) % 10) * 100) / 100}s`,
                } as React.CSSProperties}
              />
            )
          })}
          {Array.from({ length: 10 }).map((_, i) => {
            const top = Math.round((15 + Math.sin(i * 3) * 40) * 100) / 100
            const opacity = Math.round((0.15 + (i % 3) * 0.08) * 100) / 100
            return (
              <div
                key={`s${i}`}
                className="dust-particle dust-particle--slow"
                style={{
                  left: `${10 + i * 8}%`,
                  top: `${top}%`,
                  width: `${1 + (i % 2)}px`,
                  height: `${1 + (i % 2)}px`,
                  background: `rgba(255, 255, 255, ${opacity})`,
                  boxShadow: `0 0 6px rgba(255, 255, 255, 0.1)`,
                  '--dust-duration': `${10 + (i % 3) * 4}s`,
                  '--dust-delay': `${Math.round(((i * 1.5) % 12) * 100) / 100}s`,
                } as React.CSSProperties}
              />
            )
          })}
        </div>

        {/* === CONTENT (centered) === */}
        <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center px-6">

          <motion.h1
            initial={{ opacity: 0.5, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
            className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-center text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-transparent"
          >
            Sua Produtora, <br />Finalmente Organizada.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeInOut' }}
            className="max-w-2xl text-center text-base md:text-lg text-white/40 mt-6 mb-4 leading-relaxed"
          >
            Do orçamento aprovado à entrega final, o Clapper centraliza
            projetos, equipe e financeiro em um único lugar.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-sm text-white/20 mb-10"
          >
            7 dias grátis &bull; Sem cartão de crédito &bull; Setup em 2 minutos
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/login"
              className="group relative w-full sm:w-auto px-8 py-4 bg-white text-black text-base font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Começar Gratuitamente
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="group w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white/70 text-base font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current group-hover:text-white transition-colors" />
              Ver Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16 flex flex-col items-center gap-2 text-white/15"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

        {/* ============================================ */}
        {/* METRICS BAR */}
        {/* ============================================ */}
        <section className="relative z-10 border-y border-border bg-card/[0.03]">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <MetricItem value={2000000} prefix="R$ " suffix="+" label="Gerenciados na plataforma" />
              <MetricItem value={500} suffix="+" label="Projetos entregues" />
              <MetricItem value={98} suffix="%" label="Taxa de aprovação" />
              <MetricItem value={15} suffix="min" label="Tempo médio de proposta" />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* INTERACTIVE CRM SIMULATOR */}
        {/* ============================================ */}
        <section id="demo" className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Demo Interativa</p>
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Veja o Clapper em ação
            </h2>
            <p className="text-text-tertiary text-lg max-w-2xl mx-auto">
              Navegue pelas abas e explore as funcionalidades reais do sistema.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <CrmSimulator />
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* PAIN POINTS */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-6 relative">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-4xl mx-auto text-center mb-16 md:mb-24"
          >
            <motion.p variants={itemVariants} className="text-sm font-bold text-red-500 uppercase tracking-[0.2em] mb-4">
              O problema
            </motion.p>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-text-primary mb-8 leading-tight">
              A forma &ldquo;padrão&rdquo; de gerenciar <br />
              está <span className="text-red-500 bg-red-500/10 px-2 rounded-lg decoration-red-500/30 underline decoration-4 underline-offset-4">queimando seu lucro.</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-text-tertiary text-lg md:text-xl max-w-2xl mx-auto">
              Se você ainda usa 4 ferramentas diferentes para rodar um único projeto,
              você está perdendo horas (e dinheiro) em processos manuais.
            </motion.p>
          </motion.div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 md:gap-8"
          >
            <PainCard
              icon={<LayoutTemplate className="w-6 h-6 text-red-400" />}
              title="PDFs Estáticos"
              description="Você envia propostas em PDF e fica no escuro. O cliente abriu? Leu? Encaminhou? Zero dados para fechar a venda."
              stat="73% dos clientes ignoram PDFs em anexo"
            />
            <PainCard
              icon={<Wallet className="w-6 h-6 text-red-400" />}
              title="Lucro Invisível"
              description="Você fecha por 10k, mas esquece o Uber da equipe e as taxas do cartão. No final, descobre que pagou para trabalhar."
              stat="42% das produtoras não sabem sua margem real"
            />
            <PainCard
              icon={<Camera className="w-6 h-6 text-red-400" />}
              title="Equipamento no Limbo"
              description="'Onde está a lente 50mm?' Perguntas que causam pânico no grupo de WhatsApp horas antes da diária."
              stat="R$ 8k/mês em aluguéis duplicados evitáveis"
            />
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* SOLUTION OVERVIEW */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 bg-secondary/20 border-t border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* Feature 1: Propostas */}
            <FeatureSection
              badge="Vendas & Automação"
              badgeIcon={<Zap className="w-3 h-3" />}
              badgeColor="emerald"
              title={<>A Proposta vira o Projeto. <br /><span className="text-text-tertiary">Sem digitar nada.</span></>}
              description="Esqueça o trabalho manual. Quando seu cliente aprova a proposta online, o Clapper cria o projeto, lança o financeiro e gera o checklist automaticamente."
              features={[
                { title: 'Rastreamento em Tempo Real', text: 'Saiba exatamente quando (e quantas vezes) o cliente abriu sua proposta. Receba alertas.' },
                { title: 'Portfólio Integrado', text: 'Vídeos do YouTube e Vimeo rodam direto na proposta. Venda pela emoção, não pelo texto.' },
                { title: 'Assinatura One-Click', text: 'Aceite legal com validade jurídica e criação instantânea do projeto. Zero burocracia.' },
              ]}
              mockup={<ProposalMockup />}
              reverse={false}
            />

            {/* Feature 2: Projetos */}
            <FeatureSection
              badge="Gestão de Projetos"
              badgeIcon={<Film className="w-3 h-3" />}
              badgeColor="blue"
              title={<>Pipeline feito para <br /><span className="text-text-tertiary">quem vive de set.</span></>}
              description="Kanban com estágios que fazem sentido para audiovisual: Lead, Briefing, Pré-Produção, Shooting, Pós, Revisão e Entrega. Arraste e pronto."
              features={[
                { title: 'Kanban Audiovisual', text: 'Pipeline de 8 estágios pensado para o fluxo real de uma produtora. Do lead ao arquivo.' },
                { title: 'Escopo e Checklist', text: 'Deliverables com checklist. Saiba exatamente o que falta para entregar cada projeto.' },
                { title: 'Equipe e Freelancers', text: 'Aloque sua equipe e freelancers em cada projeto. Veja quem está disponível no calendário.' },
              ]}
              mockup={<KanbanMockup />}
              reverse={true}
            />

            {/* Feature 3: Financeiro */}
            <FeatureSection
              badge="Gestão Financeira"
              badgeIcon={<Wallet className="w-3 h-3" />}
              badgeColor="blue"
              title={<>Margem de Lucro Real <br /><span className="text-text-tertiary">em tempo real.</span></>}
              description="Não espere o fim do mês para descobrir o prejuízo. Ao alocar um freelancer ou reservar um equipamento, o Clapper atualiza sua margem instantaneamente."
              features={[
                { title: 'Contas a Pagar Automáticas', text: 'Escalou um freela? O sistema já lança a previsão de pagamento. Zero trabalho manual.' },
                { title: 'ROI por Projeto', text: 'Saiba quais projetos dão lucro e quais dão prejuízo. Tome decisões com dados, não achismo.' },
                { title: 'Fluxo de Caixa Previsível', text: 'Visualize suas entradas e saídas dos próximos meses. Antecipe problemas antes que aconteçam.' },
              ]}
              mockup={<FinanceMockup />}
              reverse={false}
            />

            {/* Feature 4: Studio IA */}
            <FeatureSection
              badge="Inteligência Artificial"
              badgeIcon={<Sparkles className="w-3 h-3" />}
              badgeColor="purple"
              title={<>Seu assistente de IA <br /><span className="text-text-tertiary">que entende de produção.</span></>}
              description="O Clapper Studio usa IA para criar roteiros, gerar storyboards e sugerir cenas. O Assistente de IA responde perguntas sobre seus dados em tempo real."
              features={[
                { title: 'Roteiros com IA', text: 'Crie roteiros profissionais com assistência de IA. Defina formato, plataforma, tom e público.' },
                { title: 'Assistente Inteligente', text: '"Qual projeto deu mais lucro esse mês?" Pergunte e receba respostas instantâneas dos seus dados.' },
                { title: 'Calculadora de Orçamento', text: 'Calcule custos de equipe, equipamento e logística automaticamente. Defina margem e exporte PDF.' },
              ]}
              mockup={<AIMockup />}
              reverse={true}
            />

            {/* Feature 5: Equipamentos & Freelancers */}
            <FeatureSection
              badge="Recursos & Logística"
              badgeIcon={<Package className="w-3 h-3" />}
              badgeColor="amber"
              title={<>Equipamentos e freelancers <br /><span className="text-text-tertiary">sob controle total.</span></>}
              description="Inventário com prevenção de conflitos, QR codes, manutenção, e calendário de freelancers com disponibilidade em tempo real."
              features={[
                { title: 'Anti-Conflito Automático', text: 'O sistema impede reservar o mesmo equipamento para dois projetos no mesmo dia. Acabou o pânico.' },
                { title: 'QR Code de Rastreamento', text: 'Gere QR codes para cada equipamento. Escaneie e veja status, histórico e próxima reserva.' },
                { title: 'Calendário de Disponibilidade', text: 'Veja quem e o que está disponível em qualquer data. Aloque com um clique.' },
              ]}
              mockup={<ResourcesMockup />}
              reverse={false}
            />
          </div>
        </section>

        {/* ============================================ */}
        {/* BEFORE vs AFTER */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-6 relative">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Transformação</p>
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                Antes vs Depois do Clapper
              </h2>
              <p className="text-text-tertiary text-lg max-w-2xl mx-auto">
                Veja como produtoras reais transformaram sua operação.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-red-500 uppercase text-sm tracking-wider">Antes</span>
                </div>
                <ul className="space-y-4">
                  {[
                    'Propostas em PDF sem rastreamento',
                    '4+ ferramentas para gerenciar 1 projeto',
                    'Margem de lucro calculada no feeling',
                    'Equipamento perdido no grupo do WhatsApp',
                    'Freelancers agendados em planilha',
                    'Roteiros em Google Docs desorganizados',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <X className="w-4 h-4 text-red-500/60 mt-0.5 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* After */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-emerald-500 uppercase text-sm tracking-wider">Depois</span>
                </div>
                <ul className="space-y-4">
                  {[
                    'Propostas interativas com aceite online',
                    'Tudo centralizado em 1 única plataforma',
                    'Margem real atualizada a cada transação',
                    'Inventário com QR code e anti-conflito',
                    'Calendário integrado com disponibilidade',
                    'Studio com IA para roteiros e storyboards',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500/80 mt-0.5 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* TESTIMONIALS */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-6 border-t border-border bg-secondary/10">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Depoimentos</p>
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                Quem usa, recomenda
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard
                quote="Paramos de perder dinheiro por não saber a margem real de cada projeto. Agora, antes de fechar, já sei se vale a pena."
                name="Lucas Mendes"
                role="Diretor, LM Produções"
                stars={5}
              />
              <TestimonialCard
                quote="O aceite de proposta online mudou nosso jogo. A taxa de conversão subiu 40% desde que paramos de enviar PDF."
                name="Ana Beatriz"
                role="Produtora Executiva, Studio AB"
                stars={5}
              />
              <TestimonialCard
                quote="O inventário de equipamentos salvou nossa vida. Antes era pânico toda vez que tinha duas gravações no mesmo dia."
                name="Rafael Costa"
                role="Sócio, Costa Films"
                stars={5}
              />
            </div>
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* ALL FEATURES GRID */}
        {/* ============================================ */}
        <section id="features" className="py-24 md:py-32 px-6">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Funcionalidades</p>
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                Tudo que sua produtora precisa
              </h2>
              <p className="text-text-tertiary text-lg max-w-2xl mx-auto">
                17 módulos integrados, zero gambiarra. Cada funcionalidade foi desenhada para o fluxo real de uma produtora.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="Dashboard" desc="Visão geral com KPIs em tempo real" />
              <FeatureCard icon={<FileText className="w-5 h-5" />} title="Propostas" desc="Interativas com rastreamento e aceite" />
              <FeatureCard icon={<Film className="w-5 h-5" />} title="Projetos" desc="Kanban com pipeline audiovisual" />
              <FeatureCard icon={<CircleDollarSign className="w-5 h-5" />} title="Financeiro" desc="Fluxo de caixa e margem automática" />
              <FeatureCard icon={<Users className="w-5 h-5" />} title="Clientes" desc="CRM completo com histórico" />
              <FeatureCard icon={<UserCheck className="w-5 h-5" />} title="Freelancers" desc="Banco de talentos e disponibilidade" />
              <FeatureCard icon={<Boxes className="w-5 h-5" />} title="Equipamentos" desc="Inventário com QR code e anti-conflito" />
              <FeatureCard icon={<Calendar className="w-5 h-5" />} title="Calendário" desc="Integração com Google Calendar" />
              <FeatureCard icon={<PenTool className="w-5 h-5" />} title="Studio (IA)" desc="Roteiros e storyboards com IA" badge="MAX" />
              <FeatureCard icon={<Cpu className="w-5 h-5" />} title="Assistente IA" desc="Pergunte sobre seus dados" badge="MAX" />
              <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="Calculadora" desc="Orçamento profissional com margem" badge="MAX" />
              <FeatureCard icon={<Shield className="w-5 h-5" />} title="Auditoria" desc="Histórico completo de alterações" />
              <FeatureCard icon={<Eye className="w-5 h-5" />} title="Busca Global" desc="Encontre qualquer coisa, instantâneo" />
              <FeatureCard icon={<GitBranch className="w-5 h-5" />} title="Automações" desc="Proposta → Projeto automático" />
              <FeatureCard icon={<MousePointer2 className="w-5 h-5" />} title="Onboarding" desc="Tour guiado para novos usuários" />
              <FeatureCard icon={<MessageSquare className="w-5 h-5" />} title="Notificações" desc="Alertas de transações e prazos" />
            </div>
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* FAQ */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-6 border-t border-border">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                Perguntas frequentes
              </h2>
            </motion.div>

            <div className="space-y-4">
              <FaqItem
                q="Preciso de cartão de crédito para testar?"
                a="Não. O trial de 7 dias é 100% gratuito com acesso completo ao plano Max. Sem cartão, sem compromisso."
              />
              <FaqItem
                q="Quanto tempo leva para configurar?"
                a="Menos de 2 minutos. Basta criar sua conta, dar um nome à sua produtora e começar. O onboarding guia você por cada módulo."
              />
              <FaqItem
                q="Funciona para produtoras pequenas?"
                a="Sim. O Clapper foi feito para produtoras de 1 a 50 pessoas. O plano Pro (R$ 49,90/mês) cabe no bolso de quem está começando."
              />
              <FaqItem
                q="Posso cancelar a qualquer momento?"
                a="Sim. Sem fidelidade, sem multa. Cancele quando quiser e seu acesso continua até o fim do período pago."
              />
              <FaqItem
                q="Meus dados ficam seguros?"
                a="Sim. Usamos Supabase com Row-Level Security, criptografia AES-256 e auditoria completa. Seus dados são só seus."
              />
              <FaqItem
                q="Qual a diferença entre Pro e Max?"
                a="O Pro tem o CRM completo (clientes, projetos, propostas, financeiro, calendário, equipamentos, freelancers). O Max adiciona IA: Studio, Assistente e Calculadora de Orçamento."
              />
              <FaqItem
                q="Integra com Google Calendar?"
                a="Sim. Sincronização bidirecional com Google Calendar. Gravações, entregas e reuniões aparecem automaticamente."
              />
            </div>
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* PRICING */}
        {/* ============================================ */}
        <PricingSection />

        {/* ============================================ */}
        {/* FINAL CTA */}
        {/* ============================================ */}
        <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-bg-primary">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-card/50 border border-border flex items-center justify-center opacity-60">
              <Film className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-text-primary mb-8">
              Sua produtora merece <br />
              ser <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">profissional.</span>
            </h2>
            <p className="text-text-tertiary text-xl mb-12 max-w-2xl mx-auto">
              Junte-se a diretores que pararam de improvisar e começaram a escalar com dados, automação e inteligência artificial.
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
              Sem cartão de crédito necessário &bull; 7 dias de teste grátis &bull; Cancele quando quiser
            </p>
          </motion.div>
        </section>

        <Footer />
      </main>
  )
}

// ==========================================
// COMPONENT: Header
// ==========================================
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-bold text-xl tracking-tight">
          <img src="/logo-icon.svg" alt="Clapper" className="w-8 h-8" />
          Clapper
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-text-tertiary">
          <Link href="#demo" className="hover:text-text-primary transition-colors">Demo</Link>
          <Link href="#features" className="hover:text-text-primary transition-colors">Funcionalidades</Link>
          <Link href="#pricing" className="hover:text-text-primary transition-colors">Planos</Link>
          <a href="/login" className="hover:text-text-primary transition-colors">Login</a>
        </nav>
        <a
          href="/login"
          className="px-5 py-2 bg-text-primary text-bg-primary text-sm font-bold rounded-lg hover:bg-text-secondary transition-all"
        >
          Começar Grátis
        </a>
      </div>
    </header>
  )
}

// ==========================================
// COMPONENT: Footer
// ==========================================
function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-text-primary font-bold text-xl tracking-tight mb-4">
              <img src="/logo-icon.svg" alt="Clapper" className="w-6 h-6" />
              Clapper
            </div>
            <p className="text-text-tertiary text-sm max-w-xs leading-relaxed">
              O CRM que produtoras audiovisuais usam para parar de improvisar e começar a escalar.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-sm mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li><Link href="#features" className="hover:text-text-primary transition-colors">Funcionalidades</Link></li>
              <li><Link href="#pricing" className="hover:text-text-primary transition-colors">Planos</Link></li>
              <li><Link href="#demo" className="hover:text-text-primary transition-colors">Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-sm mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li><a href="/termos" className="hover:text-text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="/privacidade" className="hover:text-text-primary transition-colors">Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-sm mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li><a href="mailto:contato@clappercrm.com.br" className="hover:text-text-primary transition-colors">contato@clappercrm.com.br</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-text-quaternary text-sm">
            &copy; 2025 Clapper. Feito com <span className="text-red-500">&hearts;</span> por quem entende de set.
          </div>
        </div>
      </div>
    </footer>
  )
}

// ==========================================
// COMPONENT: MetricItem
// ==========================================
function MetricItem({ value, prefix = '', suffix = '', label }: { value: number; prefix?: string; suffix?: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-text-primary mb-1">
        <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="text-xs md:text-sm text-text-tertiary">{label}</div>
    </div>
  )
}

// ==========================================
// COMPONENT: PainCard
// ==========================================
function PainCard({ icon, title, description, stat }: { icon: React.ReactNode; title: string; description: string; stat: string }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group bg-card/40 border border-border p-8 rounded-2xl text-left hover:border-red-500/30 hover:bg-card/80 transition-all duration-300"
    >
      <div className="mb-6 p-3 bg-bg-secondary inline-flex rounded-xl border border-border group-hover:border-red-500/30 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-red-500 transition-colors">{title}</h3>
      <p className="text-text-secondary leading-relaxed font-medium mb-4">{description}</p>
      <p className="text-xs text-red-400/70 font-mono">{stat}</p>
    </motion.div>
  )
}

// ==========================================
// COMPONENT: FeatureSection
// ==========================================
function FeatureSection({
  badge, badgeIcon, badgeColor, title, description, features, mockup, reverse,
}: {
  badge: string
  badgeIcon: React.ReactNode
  badgeColor: string
  title: React.ReactNode
  description: string
  features: { title: string; text: string }[]
  mockup: React.ReactNode
  reverse: boolean
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  }

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-40`}
    >
      <motion.div variants={itemVariants} className={reverse ? 'order-1 lg:order-2' : ''}>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border ${colorMap[badgeColor]}`}>
          {badgeIcon} {badge}
        </div>
        <h3 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">{title}</h3>
        <p className="text-text-tertiary text-lg mb-10 leading-relaxed">{description}</p>
        <div className="space-y-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                <CheckCircle2 className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div>
                <h4 className="text-text-primary font-bold mb-1">{f.title}</h4>
                <p className="text-text-tertiary text-sm leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className={reverse ? 'order-2 lg:order-1' : ''}
      >
        {mockup}
      </motion.div>
    </motion.div>
  )
}

// ==========================================
// COMPONENT: FeatureCard
// ==========================================
function FeatureCard({ icon, title, desc, badge }: { icon: React.ReactNode; title: string; desc: string; badge?: string }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group bg-card/40 border border-border p-5 rounded-xl hover:border-emerald-500/30 hover:bg-card/80 transition-all duration-300 relative"
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase tracking-wider border border-emerald-500/30">
          {badge}
        </span>
      )}
      <div className="mb-3 text-text-tertiary group-hover:text-emerald-500 transition-colors">
        {icon}
      </div>
      <h4 className="font-bold text-text-primary text-sm mb-1">{title}</h4>
      <p className="text-text-quaternary text-xs leading-relaxed">{desc}</p>
    </motion.div>
  )
}

// ==========================================
// COMPONENT: TestimonialCard
// ==========================================
function TestimonialCard({ quote, name, role, stars }: { quote: string; name: string; role: string; stars: number }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-card/40 border border-border p-8 rounded-2xl hover:border-emerald-500/20 transition-all"
    >
      <div className="flex gap-0.5 mb-4">
        {[...Array(stars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-text-secondary text-sm leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-text-primary font-bold text-sm border border-border">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="text-sm font-bold text-text-primary">{name}</div>
          <div className="text-xs text-text-tertiary">{role}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ==========================================
// COMPONENT: FaqItem
// ==========================================
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-card/50 transition-colors"
      >
        <span className="font-semibold text-text-primary text-sm md:text-base">{q}</span>
        <ChevronRight className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5 text-text-tertiary text-sm leading-relaxed">
          {a}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==========================================
// MOCKUPS
// ==========================================

function ProposalMockup() {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-emerald-500/15 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <div>
            <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">PROPOSTA #882</div>
            <div className="font-bold text-lg text-text-primary">Fashion Film - Summer 2025</div>
          </div>
          <div className="text-right">
            <div className="text-emerald-500 font-mono font-bold text-lg">R$ 18.500</div>
            <div className="text-xs text-text-tertiary">Válido até 15/03</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-secondary rounded-xl p-4 border border-border flex gap-4 items-center">
            <div className="w-14 h-10 bg-bg-primary/50 rounded flex items-center justify-center">
              <Play className="w-4 h-4 text-text-tertiary" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary">Vídeo Conceito</div>
              <div className="text-xs text-text-tertiary">Referência (02:15)</div>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              ['3x Diárias de Gravação', 'R$ 4.500'],
              ['Edição e Color Grading', 'R$ 6.000'],
              ['Trilha Sonora (Licenciamento)', 'R$ 800'],
            ].map(([name, price], i) => (
              <div key={i} className="flex justify-between text-sm py-2 border-b border-border/50">
                <span className="text-text-secondary">{name}</span>
                <span className="text-text-tertiary font-mono">{price}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Visualizado agora
          </div>
          <div className="px-5 py-2 bg-text-primary text-bg-primary text-sm font-bold rounded-lg">
            ACEITAR PROPOSTA
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanMockup() {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-blue-500/15 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="grid grid-cols-3 gap-3">
          {/* Column 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-text-quaternary" />
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Pré-Prod</span>
            </div>
            <div className="space-y-2">
              <MiniCard title="Briefing Nike" color="blue" />
              <MiniCard title="Locação" color="amber" />
            </div>
          </div>
          {/* Column 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Shooting</span>
            </div>
            <div className="space-y-2">
              <MiniCard title="Dia 1 - Parque" color="amber" highlight />
            </div>
          </div>
          {/* Column 3 */}
          <div className="opacity-60">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Entregue</span>
            </div>
            <div className="space-y-2">
              <MiniCard title="Color Grading" color="emerald" done />
              <MiniCard title="Sound Mix" color="emerald" done />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniCard({ title, color, highlight, done }: { title: string; color: string; highlight?: boolean; done?: boolean }) {
  const colors: Record<string, string> = {
    blue: 'border-l-blue-500',
    amber: 'border-l-amber-500',
    emerald: 'border-l-emerald-500',
  }
  return (
    <div className={`bg-secondary/80 p-2.5 rounded-lg border border-border border-l-2 ${colors[color]} ${highlight ? 'ring-1 ring-amber-500/20' : ''}`}>
      <p className={`text-xs font-medium ${done ? 'text-text-quaternary line-through' : 'text-text-secondary'}`}>{title}</p>
    </div>
  )
}

function FinanceMockup() {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-emerald-500/15 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-secondary/50 p-4 rounded-xl border border-border">
            <div className="text-xs text-text-tertiary mb-1">Receita Prevista</div>
            <div className="text-xl font-bold text-text-primary flex items-center gap-2">
              R$ 42.500
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="bg-secondary/50 p-4 rounded-xl border border-border">
            <div className="text-xs text-text-tertiary mb-1">Margem de Lucro</div>
            <div className="text-xl font-bold text-emerald-500">32.5%</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Movimentações</div>
          {[
            { name: 'Entrada Projeto Nike', value: '+ R$ 21.000', color: 'text-emerald-500', icon: Wallet },
            { name: 'Aluguel Lente 24-70mm', value: '- R$ 350', color: 'text-red-500', icon: Camera },
            { name: 'Editor (João Silva)', value: 'Pendente', color: 'text-amber-500 animate-pulse', icon: Users },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  <tx.icon className="w-3.5 h-3.5 text-text-tertiary" />
                </div>
                <span className="text-xs font-medium text-text-secondary">{tx.name}</span>
              </div>
              <span className={`text-xs font-bold ${tx.color}`}>{tx.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AIMockup() {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-purple-500/15 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-bold text-text-primary">Clapper Studio</span>
          <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold ml-auto">IA</span>
        </div>
        <div className="space-y-3">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-text-primary text-bg-primary text-xs px-3 py-2 rounded-xl rounded-tr-sm max-w-[70%]">
              Qual projeto deu mais lucro esse mês?
            </div>
          </div>
          {/* AI response */}
          <div className="flex justify-start">
            <div className="bg-secondary text-text-secondary text-xs px-3 py-2 rounded-xl rounded-tl-sm max-w-[80%] leading-relaxed">
              O projeto <span className="text-emerald-500 font-bold">Nike Summer Run</span> teve a maior margem: <span className="font-bold">32.5%</span> (R$ 42.500 receita, R$ 12.450 custos).
              O segundo foi <span className="text-blue-400 font-bold">Fashion Film</span> com 28%.
            </div>
          </div>
          {/* Typing indicator */}
          <div className="flex gap-1 px-3 py-2">
            <div className="w-1.5 h-1.5 bg-purple-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-purple-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-purple-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ResourcesMockup() {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-amber-500/15 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <span className="text-sm font-bold text-text-primary">Inventário</span>
          <span className="text-[10px] text-text-tertiary">5 itens</span>
        </div>
        <div className="space-y-2.5">
          {[
            { name: 'Sony A7S III', cat: 'Câmera', status: 'Disponível', color: 'emerald' },
            { name: 'Lente 24-70mm', cat: 'Lente', status: 'Em Uso', color: 'amber' },
            { name: 'Drone Mavic 3', cat: 'Drone', status: 'Manutenção', color: 'red' },
          ].map((item, i) => {
            const statusColors: Record<string, string> = {
              emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
              red: 'bg-red-500/10 text-red-500 border-red-500/20',
            }
            return (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <div className="text-xs font-bold text-text-primary">{item.name}</div>
                    <div className="text-[10px] text-text-quaternary">{item.cat}</div>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${statusColors[item.color]}`}>
                  {item.status}
                </span>
              </div>
            )
          })}
        </div>
        {/* Calendar preview */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Disponibilidade</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-[8px] text-center text-text-quaternary font-mono">{d}</div>
            ))}
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-5 rounded text-[9px] flex items-center justify-center font-mono ${
                  i === 2 || i === 4
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    : i === 6
                    ? 'bg-secondary text-text-quaternary'
                    : 'bg-emerald-500/10 text-emerald-500/70'
                }`}
              >
                {i + 14}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
