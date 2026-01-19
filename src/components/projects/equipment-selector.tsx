'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Package, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface Equipment {
  id: string
  name: string
  category: string
  status: string
  dailyRate?: number
}

interface EquipmentBooking {
  id?: string
  equipmentId: string
  equipmentName?: string
  startDate: string
  endDate: string
  notes?: string
}

interface EquipmentSelectorProps {
  projectId?: string
  availableEquipments: Equipment[]
  selectedBookings: EquipmentBooking[]
  onBookingsChange: (bookings: EquipmentBooking[]) => void
}

export function EquipmentSelector({
  projectId,
  availableEquipments,
  selectedBookings,
  onBookingsChange,
}: EquipmentSelectorProps) {
  const [showForm, setShowForm] = useState(false)
  const [newBooking, setNewBooking] = useState<EquipmentBooking>({
    equipmentId: '',
    startDate: '',
    endDate: '',
    notes: '',
  })

  const addBooking = () => {
    if (newBooking.equipmentId && newBooking.startDate && newBooking.endDate) {
      const equipment = availableEquipments.find((e) => e.id === newBooking.equipmentId)
      onBookingsChange([
        ...selectedBookings,
        {
          ...newBooking,
          equipmentName: equipment?.name,
        },
      ])
      setNewBooking({
        equipmentId: '',
        startDate: '',
        endDate: '',
        notes: '',
      })
      setShowForm(false)
    }
  }

  const removeBooking = (index: number) => {
    onBookingsChange(selectedBookings.filter((_, i) => i !== index))
  }

  const availableToBook = availableEquipments.filter(
    (e) => e.status === 'AVAILABLE' || e.status === 'IN_USE'
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">
          Equipamentos Reservados
        </label>
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="h-8 gap-1 rounded-lg bg-purple-600 px-3 text-xs hover:bg-purple-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar Equipamento
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden rounded-lg border border-purple-500/20 bg-purple-500/5 p-4"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Equipamento *
              </label>
              <select
                value={newBooking.equipmentId}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, equipmentId: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">Selecione um equipamento</option>
                {availableToBook.map((equipment) => (
                  <option key={equipment.id} value={equipment.id} className="bg-zinc-900">
                    {equipment.name} ({equipment.category})
                    {equipment.dailyRate && ` - R$ ${equipment.dailyRate}/dia`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Data Início *
                </label>
                <input
                  type="date"
                  value={newBooking.startDate}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, startDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Data Fim *
                </label>
                <input
                  type="date"
                  value={newBooking.endDate}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, endDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Observações
              </label>
              <textarea
                value={newBooking.notes}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, notes: e.target.value })
                }
                rows={2}
                placeholder="Ex: Cuidado com lente sensível"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={addBooking}
                disabled={!newBooking.equipmentId || !newBooking.startDate || !newBooking.endDate}
                className="flex-1 h-9 rounded-lg bg-purple-600 text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                Adicionar
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 rounded-lg bg-white/5 px-4 text-sm hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {selectedBookings.length > 0 ? (
          selectedBookings.map((booking, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Package className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">
                    {booking.equipmentName ||
                      availableEquipments.find((e) => e.id === booking.equipmentId)?.name ||
                      'Equipamento'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(booking.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} até{' '}
                    {new Date(booking.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {booking.notes && <p className="text-xs text-zinc-500">{booking.notes}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeBooking(index)}
                className="ml-3 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-6 text-center">
            <Package className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-500">Nenhum equipamento reservado</p>
          </div>
        )}
      </div>
    </div>
  )
}
