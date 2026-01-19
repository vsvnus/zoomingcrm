'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CreateEventModal } from '@/components/calendar/create-event-modal'
import type { CalendarEvent } from '@/actions/calendar'

interface CalendarContentProps {
  initialEvents: CalendarEvent[]
}

export function CalendarContent({ initialEvents }: CalendarContentProps) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleCreateEvent = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    // Could open edit modal here for manual events
  }, [])

  const handleCreateSuccess = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <div className="h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-accent-500 to-purple-600 p-3">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Calendário</h1>
            <p className="text-sm text-zinc-400">
              Gravações, entregas e compromissos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CalendarView
          events={events}
          onCreateEvent={handleCreateEvent}
          onEventClick={handleEventClick}
        />
      </motion.div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
