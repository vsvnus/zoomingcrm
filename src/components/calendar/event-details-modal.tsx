'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin, AlignLeft, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CalendarEvent } from '@/actions/calendar'

interface EventDetailsModalProps {
    event: CalendarEvent | null
    isOpen: boolean
    onClose: () => void
}

export function EventDetailsModal({
    event,
    isOpen,
    onClose,
}: EventDetailsModalProps) {
    if (!isOpen || !event) return null

    // Format date display
    const dateDisplay = event.allDay
        ? format(new Date(event.start), "d 'de' MMMM, yyyy", { locale: ptBR })
        : `${format(new Date(event.start), "d 'de' MMMM", { locale: ptBR })} • ${format(
            new Date(event.start),
            'HH:mm'
        )} - ${format(new Date(event.end), 'HH:mm')}`

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
                        <h2 className="text-xl font-semibold text-white">Detalhes do Evento</h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5 text-zinc-400" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Title & Type */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize text-white`} style={{ backgroundColor: event.color || '#6b7280' }}>
                                    {event.type}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-3 text-zinc-300">
                            <Calendar className="h-5 w-5 mt-0.5 text-zinc-400" />
                            <div>
                                <p className="font-medium text-white">Data e Hora</p>
                                <p className="text-sm">{dateDisplay}</p>
                                {event.allDay && <p className="text-xs text-zinc-500 mt-0.5">Dia inteiro</p>}
                            </div>
                        </div>

                        {/* Location */}
                        {event.location && (
                            <div className="flex items-start gap-3 text-zinc-300">
                                <MapPin className="h-5 w-5 mt-0.5 text-zinc-400" />
                                <div>
                                    <p className="font-medium text-white">Local</p>
                                    <p className="text-sm">{event.location}</p>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {event.description && (
                            <div className="flex items-start gap-3 text-zinc-300">
                                <AlignLeft className="h-5 w-5 mt-0.5 text-zinc-400" />
                                <div>
                                    <p className="font-medium text-white">Descrição</p>
                                    <p className="text-sm whitespace-pre-wrap">{event.description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex justify-end gap-3">
                        {/* Future: Add Edit/Delete buttons here */}
                        <button
                            onClick={onClose}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
