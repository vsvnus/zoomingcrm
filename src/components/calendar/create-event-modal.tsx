'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin, AlignLeft, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { createCalendarEvent, type CalendarEventType } from '@/actions/calendar'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialDate?: Date
}

const eventTypes: { value: CalendarEventType; label: string; color: string }[] = [
  { value: 'meeting', label: 'Reunião', color: '#3b82f6' },
  { value: 'shooting', label: 'Gravação', color: '#8b5cf6' },
  { value: 'delivery', label: 'Entrega', color: '#22c55e' },
  { value: 'other', label: 'Outro', color: '#6b7280' },
]

export function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}: CreateEventModalProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    time: '',
    endDate: '',
    endTime: '',
    allDay: true,
    type: 'meeting' as CalendarEventType,
    location: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('Título é obrigatório')
      return
    }

    startTransition(async () => {
      try {
        let startDate = formData.date
        let endDate = formData.endDate || formData.date

        if (!formData.allDay && formData.time) {
          startDate = `${formData.date}T${formData.time}:00`
          if (formData.endTime) {
            endDate = `${formData.endDate || formData.date}T${formData.endTime}:00`
          }
        }

        await createCalendarEvent({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          startDate,
          endDate,
          allDay: formData.allDay,
          type: formData.type,
          location: formData.location.trim() || undefined,
        })

        onSuccess()
        onClose()
        setFormData({
          title: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '',
          endDate: '',
          endTime: '',
          allDay: true,
          type: 'meeting',
          location: '',
        })
      } catch (err: any) {
        setError(err.message || 'Erro ao criar evento')
      }
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Novo Evento</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-zinc-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome do evento"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Tipo
              </label>
              <div className="flex gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      formData.type === type.value
                        ? 'bg-white/10 text-white ring-1 ring-white/20'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, allDay: !formData.allDay })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  formData.allDay ? 'bg-accent-500' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    formData.allDay ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
              <span className="text-sm text-zinc-300">Dia inteiro</span>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Calendar className="h-4 w-4" />
                  Data início
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Clock className="h-4 w-4" />
                    Hora início
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
              )}
            </div>

            {/* End Date (optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Calendar className="h-4 w-4" />
                  Data fim (opcional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.date}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Clock className="h-4 w-4" />
                    Hora fim
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <MapPin className="h-4 w-4" />
                Local (opcional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Endereço ou link da reunião"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <AlignLeft className="h-4 w-4" />
                Descrição (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes do evento..."
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 resize-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-lg bg-accent-500 py-2.5 text-sm font-medium text-white hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Criando...' : 'Criar Evento'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
