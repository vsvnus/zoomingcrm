'use client'

import { motion } from 'framer-motion'
import { Play, Zap, Calendar, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black">
      {/* Background gradiente animado */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />

      {/* Grid pattern sutil */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center justify-between px-8 py-6"
        >
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-400 flex items-center justify-center">
              <Play className="h-5 w-5 text-black" fill="black" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white leading-tight">
                Zooming
              </span>
              <span className="text-[8px] font-light tracking-wider text-zinc-500 uppercase -mt-1">
                By Trip Labz
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Funcionalidades
            </a>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Preços
            </a>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sobre
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Entrar
            </a>
            <a href="/login" className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all hover:scale-105">
              Começar Grátis
            </a>
          </div>
        </motion.header>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-8 py-32 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass-effect px-4 py-2 text-sm text-zinc-300"
          >
            <Zap className="h-4 w-4" />
            <span>CRM Especializado para Produtoras Audiovisuais</span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
            className="max-w-4xl text-6xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Propostas que
            <br />
            <span className="bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              realmente vendem
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.6 }}
            className="mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl"
          >
            Crie landing pages interativas com vídeos, gerencie equipamentos sem conflitos
            e aprove vídeos direto no sistema.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.8 }}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <a href="/login" className="group relative px-8 py-4 rounded-2xl bg-white text-black text-base font-medium overflow-hidden hover:scale-105 transition-transform">
              <span className="relative z-10">Começar Gratuitamente</span>
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="/login" className="px-8 py-4 rounded-2xl glass-effect text-white text-base font-medium hover:bg-white/10 transition-all">
              Ver Demo
            </a>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 1 }}
            className="mt-32 grid gap-6 md:grid-cols-3 max-w-5xl w-full"
          >
            <FeatureCard
              icon={<Play className="h-6 w-6" />}
              title="Propostas Interativas"
              description="Landing pages com vídeos e cálculo de opcionais em tempo real"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Anti-Conflito"
              description="Sistema inteligente que evita dupla reserva de equipamentos"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Banco de Talentos"
              description="Gerencie freelancers com calendário de disponibilidade"
            />
          </motion.div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group relative rounded-3xl glass-effect-card p-8 hover:bg-white/10 transition-all hover-lift">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  )
}
