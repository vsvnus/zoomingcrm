'use client'

import { motion } from 'framer-motion'
import { Camera, Mic, Video, Edit, Music, Star, ExternalLink, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { AddFreelancerDialog } from './add-freelancer-dialog'
import { updateFreelancerRate } from '@/actions/freelancers'

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
  'Diretor': Video,
  'Diretor de Fotografia': Camera,
  'Operador de Câmera': Camera,
  'Técnico de Som': Mic,
  'Editor de Vídeo': Edit,
  'Colorista': Video,
  'Motion Designer': Music,
  'Produtor': Star,
  'Fotógrafo': Camera,
}

const specialtyColors: Record<string, string> = {
  'Direção': 'bg-purple-500/10 text-purple-500',
  'Câmera': 'bg-blue-500/10 text-blue-500',
  'Luz': 'bg-yellow-500/10 text-yellow-500',
  'Som': 'bg-green-500/10 text-green-500',
  'Arte': 'bg-pink-500/10 text-pink-500',
  'Produção': 'bg-orange-500/10 text-orange-500',
  'Pós-Produção': 'bg-indigo-500/10 text-indigo-500',
  'Roteiro': 'bg-teal-500/10 text-teal-500',
  'Fotografia': 'bg-cyan-500/10 text-cyan-500',
  'Beleza': 'bg-rose-500/10 text-rose-500',
}

interface FreelancersGridProps {
  initialFreelancers: Freelancer[]
}

function FreelancerRateEditor({
  id,
  initialRate,
  onUpdate
}: {
  id: string
  initialRate: number
  onUpdate: (newRateValue: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [rate, setRate] = useState(initialRate?.toString() || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const numericRate = parseFloat(rate.toString().replace(/[^0-9.]/g, ''))

    if (isNaN(numericRate)) return

    setIsLoading(true)
    try {
      await updateFreelancerRate(id, numericRate)
      onUpdate(numericRate)
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar valor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(false)
    setRate(initialRate?.toString() || '')
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
    setRate(initialRate?.toString() || '')
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <div className="relative">
          <span className="absolute left-2 top-1.5 text-xs text-text-tertiary">R$</span>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-24 rounded-lg border border-[rgb(var(--border))] bg-secondary pl-7 py-1 text-sm font-medium text-text-primary focus:border-primary/30 focus:outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-lg bg-green-500/10 p-1.5 text-green-500 hover:bg-green-500/20"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="rounded-lg bg-red-500/10 p-1.5 text-red-500 hover:bg-red-500/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group/rate relative z-20">
      <span className="text-lg font-bold text-text-primary">
        R$ {initialRate?.toLocaleString('pt-BR') ?? '0'}
      </span>
      <button
        onClick={handleEditClick}
        className="opacity-0 group-hover/rate:opacity-100 rounded-lg p-1.5 text-text-tertiary hover:bg-secondary hover:text-text-primary transition-all"
      >
        <Edit className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function FreelancersGrid({ initialFreelancers }: FreelancersGridProps) {
  const [freelancers, setFreelancers] = useState(initialFreelancers)
  const [searchTerm, setSearchTerm] = useState('')

  // Callback para atualizar lista quando novo freelancer é criado
  const handleFreelancerCreated = useCallback((newFreelancer: Freelancer) => {
    setFreelancers((prev) => [newFreelancer, ...prev])
  }, [])

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
          <AddFreelancerDialog onSuccess={handleFreelancerCreated} />
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
              <Link href={`/freelancers/${freelancer.id}` as any} key={freelancer.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-card p-6 transition-all hover:shadow-3 hover-lift cursor-pointer"
                >
                  {/* Status Badge */}
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${freelancer.status === 'AVAILABLE'
                        ? 'bg-success/10 text-success'
                        : 'bg-secondary text-text-tertiary'
                        }`}
                    >
                      {freelancer.status === 'AVAILABLE' ? 'Disponível' : 'Ocupado'}
                    </span>
                    <ExternalLink className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-400 transition-colors">
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
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${specialtyColors[spec] || 'bg-secondary text-text-tertiary'
                          }`}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Daily Rate */}
                  <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--border))] pt-4">
                    <span className="text-sm text-text-tertiary">Diária</span>
                    <FreelancerRateEditor
                      id={freelancer.id}
                      initialRate={freelancer.daily_rate}
                      onUpdate={(newRate) => {
                        setFreelancers(prev => prev.map(f => f.id === freelancer.id ? { ...f, daily_rate: newRate } : f))
                      }}
                    />
                  </div>
                </motion.div>
              </Link>
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
