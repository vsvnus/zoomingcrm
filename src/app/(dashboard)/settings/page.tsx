'use client'

import { motion } from 'framer-motion'
import { Building2, User, CreditCard, Bell, Shield, Palette } from 'lucide-react'

const settingsSections = [
  {
    id: 'organization',
    title: 'Organização',
    description: 'Configurações da empresa e branding',
    icon: Building2,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Informações pessoais e preferências',
    icon: User,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'billing',
    title: 'Assinatura',
    description: 'Planos, pagamentos e faturas',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Gerencie suas preferências de notificações',
    icon: Bell,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Senha, 2FA e sessões ativas',
    icon: Shield,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'appearance',
    title: 'Aparência',
    description: 'Tema e personalização da interface',
    icon: Palette,
    color: 'from-pink-500 to-rose-600',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Configurações
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-zinc-400"
        >
          Gerencie as configurações da sua conta e organização
        </motion.p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section, index) => {
          const Icon = section.icon

          return (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 text-left backdrop-blur-xl transition-all hover:bg-white/10 hover-lift"
            >
              {/* Icon */}
              <div
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${section.color}`}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white">{section.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                {section.description}
              </p>

              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          )
        })}
      </div>

      {/* Quick Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h2 className="text-xl font-bold text-white">Configurações Rápidas</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Ajustes rápidos para melhorar sua experiência
        </p>

        <div className="mt-6 space-y-4">
          {/* Toggle Example */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Tema Escuro</p>
              <p className="text-sm text-zinc-500">Interface com fundo escuro</p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-white/20 transition-colors">
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-lg transition-transform translate-x-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Notificações por Email</p>
              <p className="text-sm text-zinc-500">Receba atualizações importantes</p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-white/20 transition-colors">
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-lg transition-transform translate-x-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Sons da Interface</p>
              <p className="text-sm text-zinc-500">Feedback sonoro nas ações</p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-white/20 transition-colors">
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white/20 shadow-lg transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
