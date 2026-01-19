'use client'

import { motion } from 'framer-motion'
import { Camera, Mic, Video, Edit, Music, Star } from 'lucide-react'
import { useState } from 'react'
import { AddFreelancerDialog } from './add-freelancer-dialog'

type Freelancer = {
  id: string
  name: string
  email: string
  role: string
  specialty: string[]
  daily_rate: number
  rating: number
  status: string
}

const roleIcons: Record<string, any> = {
  'Camera Operator': Camera,
  'Sound Engineer': Mic,
  'Video Editor': Edit,
  'Colorist': Video,
  'Motion Designer': Music,
}

const specialtyColors: Record<string, string> = {
  'Camera': 'bg-info/10 text-info',
  'Sound': 'bg-success/10 text-success',
  'Editing': 'bg-secondary text-text-secondary',
  'Color': 'bg-warning/10 text-warning',
  'Motion': 'bg-secondary text-text-secondary',
}

interface FreelancersGridProps {
  initialFreelancers: Freelancer[]
}

export function FreelancersGrid({ initialFreelancers }: FreelancersGridProps) {
  const [freelancers] = useState(initialFreelancers)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFreelancers = freelancers.filter((freelancer) =>
    freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const getAvatarColor = (id: string) => {
    const colors = [
      'from-neutral-600 to-neutral-800',
      'from-neutral-500 to-neutral-700',
      'from-neutral-700 to-neutral-900',
      'from-neutral-400 to-neutral-600',
      'from-neutral-600 to-neutral-800',
    ]
    const index = parseInt(id.slice(-1), 16) % colors.length
    return colors[index]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary"
          >
            Freelancers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-text-tertiary"
          >
            {filteredFreelancers.length} talentos disponíveis
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AddFreelancerDialog />
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          placeholder="Buscar freelancers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </motion.div>

      {/* Freelancers Grid */}
      {filteredFreelancers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFreelancers.map((freelancer, index) => {
            const Icon = roleIcons[freelancer.role] || Camera

            return (
              <motion.div
                key={freelancer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-card p-6 transition-all hover:shadow-3 hover-lift"
              >
                {/* Status Badge */}
                <div className="absolute right-4 top-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      freelancer.status === 'AVAILABLE'
                        ? 'bg-success/10 text-success'
                        : 'bg-secondary text-text-tertiary'
                    }`}
                  >
                    {freelancer.status === 'AVAILABLE' ? 'Disponível' : 'Ocupado'}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarColor(
                      freelancer.id
                    )} text-xl font-bold text-white shadow-lg`}
                  >
                    {getInitials(freelancer.name)}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-primary">
                      {freelancer.name}
                    </h3>
                    <p className="mt-1 text-sm text-text-tertiary">{freelancer.role}</p>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium text-warning">
                        {freelancer.rating?.toFixed(1) ?? '0.0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {freelancer.specialty.map((spec) => (
                    <span
                      key={spec}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        specialtyColors[spec] || 'bg-secondary text-text-tertiary'
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Daily Rate */}
                <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--border))] pt-4">
                  <span className="text-sm text-text-tertiary">Diária</span>
                  <span className="text-lg font-bold text-text-primary">
                    R$ {freelancer.daily_rate?.toLocaleString('pt-BR') ?? '0'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-card py-16 text-center"
        >
          <Camera className="h-12 w-12 text-text-quaternary" />
          <p className="mt-4 text-lg font-medium text-text-primary">
            Nenhum freelancer encontrado
          </p>
          <p className="mt-1 text-sm text-text-tertiary">
            Comece adicionando talentos ao seu banco
          </p>
        </motion.div>
      )}
    </div>
  )
}
