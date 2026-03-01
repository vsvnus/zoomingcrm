'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon } from 'lucide-react'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CreateEventModal } from '@/components/calendar/create-event-modal'
import { EventDetailsModal } from '@/components/calendar/event-details-modal'
import { getCalendarEvents, type CalendarEvent } from '@/actions/calendar'

interface CalendarContentProps {
  initialEvents: CalendarEvent[]
}

export function CalendarContent({ initialEvents }: CalendarContentProps) {
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleCreateEvent = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
  }, [])

  const handleCreateSuccess = useCallback(async () => {
    setIsCreateModalOpen(false)
    // Recarregar eventos do servidor ao invés de reload completo (evita duplicatas)
    try {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const newEvents = await getCalendarEvents(start, end)
      setEvents(newEvents)
    } catch {
      router.refresh()
    }
  }, [router])

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  const handleCloseDetailsModal = useCallback(() => {
    setSelectedEvent(null)
  }, [])

  const handleRangeChange = useCallback(async (range: Date[] | { start: Date; end: Date }) => {
    let startDate: Date
    let endDate: Date

    if (Array.isArray(range)) {
      if (range.length === 0) return
      startDate = range[0]
      endDate = range[range.length - 1]
    } else {
      startDate = range.start
      endDate = range.end
    }

    try {
      // Fetch events for the new range
      const newEvents = await getCalendarEvents(startDate, endDate)
      setEvents(newEvents)
    } catch (error) {
      console.error("Failed to fetch calendar events", error)
    }
  }, [])

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
            <CalendarIcon className="h-6 w-6 text-white" />
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
          onRangeChange={handleRangeChange}
        />
      </motion.div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseDetailsModal}
      />
    </div>
  )
}
