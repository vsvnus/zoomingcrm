'use client'

import { useState } from 'react'
import { Plus, X, Calendar, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface ShootingDate {
  id?: string
  date: string
  time?: string
  location?: string
  notes?: string
}

interface DeliveryDate {
  id?: string
  date: string
  description: string
  completed?: boolean
}

interface DatesManagerProps {
  shootingDates: ShootingDate[]
  deliveryDates: DeliveryDate[]
  onShootingDatesChange: (dates: ShootingDate[]) => void
  onDeliveryDatesChange: (dates: DeliveryDate[]) => void
}

export function DatesManager({
  shootingDates,
  deliveryDates,
  onShootingDatesChange,
  onDeliveryDatesChange,
}: DatesManagerProps) {
  const [showShootingForm, setShowShootingForm] = useState(false)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)

  const [newShooting, setNewShooting] = useState<ShootingDate>({
    date: '',
    time: '',
    location: '',
    notes: '',
  })

  const [newDelivery, setNewDelivery] = useState<DeliveryDate>({
    date: '',
    description: '',
  })

  const addShootingDate = () => {
    if (newShooting.date) {
      onShootingDatesChange([...shootingDates, { ...newShooting }])
      setNewShooting({ date: '', time: '', location: '', notes: '' })
      setShowShootingForm(false)
    }
  }

  const removeShootingDate = (index: number) => {
    onShootingDatesChange(shootingDates.filter((_, i) => i !== index))
  }

  const addDeliveryDate = () => {
    if (newDelivery.date && newDelivery.description) {
      onDeliveryDatesChange([...deliveryDates, { ...newDelivery }])
      setNewDelivery({ date: '', description: '' })
      setShowDeliveryForm(false)
    }
  }

  const removeDeliveryDate = (index: number) => {
    onDeliveryDatesChange(deliveryDates.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Datas de Gravação */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-300">
            Datas de Gravação
          </label>
          <Button
            type="button"
            onClick={() => setShowShootingForm(!showShootingForm)}
            className="h-8 gap-1 rounded-lg bg-blue-600 px-3 text-xs hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Data
          </Button>
        </div>

        <AnimatePresence>
          {showShootingForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-3 overflow-hidden rounded-lg border border-blue-500/20 bg-blue-500/5 p-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={newShooting.date}
                    onChange={(e) =>
                      setNewShooting({ ...newShooting, date: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={newShooting.time}
                    onChange={(e) =>
                      setNewShooting({ ...newShooting, time: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Local
                </label>
                <input
                  type="text"
                  value={newShooting.location}
                  onChange={(e) =>
                    setNewShooting({ ...newShooting, location: e.target.value })
                  }
                  placeholder="Ex: Estúdio XYZ, Rua ABC..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Observações
                </label>
                <textarea
                  value={newShooting.notes}
                  onChange={(e) =>
                    setNewShooting({ ...newShooting, notes: e.target.value })
                  }
                  rows={2}
                  placeholder="Ex: Trazer roteiro impresso"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addShootingDate}
                  disabled={!newShooting.date}
                  className="flex-1 h-9 rounded-lg bg-blue-600 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Adicionar
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowShootingForm(false)}
                  className="h-9 rounded-lg bg-white/5 px-4 text-sm hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {shootingDates.map((shooting, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">
                    {new Date(shooting.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                  {shooting.time && (
                    <>
                      <Clock className="ml-2 h-4 w-4 text-zinc-400" />
                      <span className="text-zinc-400">{shooting.time}</span>
                    </>
                  )}
                </div>
                {shooting.location && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{shooting.location}</span>
                  </div>
                )}
                {shooting.notes && (
                  <p className="text-xs text-zinc-500">{shooting.notes}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeShootingDate(index)}
                className="ml-3 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Datas de Entrega */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-300">
            Datas de Entrega
          </label>
          <Button
            type="button"
            onClick={() => setShowDeliveryForm(!showDeliveryForm)}
            className="h-8 gap-1 rounded-lg bg-green-600 px-3 text-xs hover:bg-green-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Entrega
          </Button>
        </div>

        <AnimatePresence>
          {showDeliveryForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-3 overflow-hidden rounded-lg border border-green-500/20 bg-green-500/5 p-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Data de Entrega *
                </label>
                <input
                  type="date"
                  value={newDelivery.date}
                  onChange={(e) =>
                    setNewDelivery({ ...newDelivery, date: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Descrição do Entregável *
                </label>
                <input
                  type="text"
                  value={newDelivery.description}
                  onChange={(e) =>
                    setNewDelivery({ ...newDelivery, description: e.target.value })
                  }
                  placeholder="Ex: Vídeo 30s Instagram, Banner 1920x1080"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addDeliveryDate}
                  disabled={!newDelivery.date || !newDelivery.description}
                  className="flex-1 h-9 rounded-lg bg-green-600 text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Adicionar
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDeliveryForm(false)}
                  className="h-9 rounded-lg bg-white/5 px-4 text-sm hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {deliveryDates.map((delivery, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="font-medium">
                    {new Date(delivery.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{delivery.description}</p>
              </div>
              <button
                type="button"
                onClick={() => removeDeliveryDate(index)}
                className="ml-3 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
