'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  X,
  Film,
  Package,
  Users,
  MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { useMobile } from '@/hooks/use-mobile'
import type { CalendarEvent, CalendarEventType } from '@/actions/calendar'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

interface CalendarViewProps {
  events: CalendarEvent[]
  onCreateEvent: () => void
  onEventClick: (event: CalendarEvent) => void
  onRangeChange?: (range: Date[] | { start: Date; end: Date }) => void
}

const eventTypeLabels: Record<CalendarEventType, string> = {
  shooting: 'Gravação',
  delivery: 'Entrega',
  meeting: 'Reunião',
  other: 'Outro',
}

const eventTypeIcons: Record<CalendarEventType, any> = {
  shooting: Film,
  delivery: Package,
  meeting: Users,
  other: CalendarIcon,
}

const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+${total} mais`,
}

export function CalendarView({ events, onCreateEvent, onEventClick, onRangeChange }: CalendarViewProps) {
  const isMobile = useMobile()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.MONTH)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [hasMobileInitialized, setHasMobileInitialized] = useState(false)

  // Switch to agenda view on mobile after hydration
  useEffect(() => {
    if (isMobile && !hasMobileInitialized) {
      setView(Views.AGENDA)
      setHasMobileInitialized(true)
    }
  }, [isMobile, hasMobileInitialized])

  const calendarEvents = useMemo(() => {
    // Helper: parse date string as LOCAL date (avoids UTC timezone shift)
    const parseLocalDate = (dateStr: string): Date => {
      const dateOnly = dateStr.toString().split('T')[0]
      const [year, month, day] = dateOnly.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    return events.map((event) => {
      // Always parse as local date to avoid timezone issues
      let start = parseLocalDate(event.start)
      let end = parseLocalDate(event.end)

      if (event.allDay) {
        // react-big-calendar expects EXCLUSIVE end for allDay events
        // Single-day event: start=Jan15, end=Jan16 (shows only on Jan 15)
        if (end.getTime() <= start.getTime()) {
          end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
        } else {
          // Multi-day: add 1 day to end for exclusive boundary
          end = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
        }
      }

      return {
        ...event,
        start,
        end,
        resource: event,
      }
    })
  }, [events])

  const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate: Date
    if (action === 'PREV') {
      newDate = subMonths(currentDate, 1)
    } else if (action === 'NEXT') {
      newDate = addMonths(currentDate, 1)
    } else {
      newDate = new Date()
    }
    setCurrentDate(newDate)

    // Trigger range change to fetch events for the new visible period
    if (onRangeChange) {
      const rangeStart = subMonths(startOfMonth(newDate), 1)
      const rangeEnd = addMonths(endOfMonth(newDate), 1)
      onRangeChange({ start: rangeStart, end: rangeEnd })
    }
  }, [currentDate, onRangeChange])

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event.resource)
  }, [])

  const handleCloseEventDetails = useCallback(() => {
    setSelectedEvent(null)
  }, [])

  const eventStyleGetter = useCallback((event: any) => {
    const backgroundColor = event.color || '#6b7280'
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 6px',
      },
    }
  }, [])

  const CustomToolbar = () => (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between md:justify-start gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNavigate('PREV')}
            className="rounded-lg p-2 hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleNavigate('NEXT')}
            className="rounded-lg p-2 hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-base md:text-xl font-semibold text-text-primary capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('TODAY')}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={onCreateEvent}
            className="flex md:hidden items-center gap-2 rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-600 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-bg-secondary/50">
          {[
            { key: Views.MONTH, label: 'Mês' },
            { key: Views.WEEK, label: 'Semana' },
            { key: Views.DAY, label: 'Dia' },
            { key: Views.AGENDA, label: 'Agenda' },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${view === v.key
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover'
                }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          onClick={onCreateEvent}
          className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Novo Evento</span>
        </button>
      </div>
    </div>
  )

  const EventIcon = selectedEvent ? eventTypeIcons[selectedEvent.type] : CalendarIcon

  return (
    <div className="h-full">
      <CustomToolbar />

      <div className="rounded-2xl border border-border bg-bg-secondary/50 p-4 backdrop-blur-xl calendar-container shadow-2">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: isMobile ? 'calc(100vh - 220px)' : 'calc(100vh - 280px)' }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onRangeChange={onRangeChange}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          culture="pt-BR"
          toolbar={false}
          popup
          selectable
          onSelectSlot={(slotInfo) => {
            // Could open create modal with date pre-filled
            onCreateEvent()
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 md:gap-6">
        {Object.entries(eventTypeLabels).map(([type, label]) => {
          const Icon = eventTypeIcons[type as CalendarEventType]
          const colors: Record<string, string> = {
            shooting: '#8b5cf6',
            delivery: '#22c55e',
            meeting: '#3b82f6',
            other: '#6b7280',
          }
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[type] }}
              />
              <span className="text-sm text-text-tertiary">{label}</span>
            </div>
          )
        })}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseEventDetails}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100vw-2rem)] md:max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg-secondary p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg shadow-sm"
                    style={{ backgroundColor: selectedEvent.color }}
                  >
                    <EventIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-text-tertiary">
                      {eventTypeLabels[selectedEvent.type]}
                    </span>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {selectedEvent.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleCloseEventDetails}
                  className="rounded-lg p-2 hover:bg-bg-hover text-text-quaternary hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="h-4 w-4 text-text-tertiary" />
                  <span className="text-text-secondary">
                    {format(new Date(selectedEvent.start), "EEEE, dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                {!selectedEvent.allDay && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-text-tertiary" />
                    <span className="text-text-secondary">
                      {format(new Date(selectedEvent.start), 'HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-text-tertiary" />
                    <span className="text-text-secondary">{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.clientName && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-text-tertiary" />
                    <span className="text-text-secondary">{selectedEvent.clientName}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="mt-4 rounded-lg bg-bg-tertiary p-3 border border-border">
                    <p className="text-sm text-text-secondary">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                {selectedEvent.projectId && (
                  <Link
                    href={`/projects/${selectedEvent.projectId}`}
                    className="flex-1 rounded-lg bg-accent-500 py-2.5 text-center text-sm font-medium text-white hover:bg-accent-600 transition-colors shadow-sm"
                  >
                    Ver Projeto
                  </Link>
                )}
                {selectedEvent.id.startsWith('manual-') && (
                  <button
                    onClick={() => onEventClick(selectedEvent)}
                    className="flex-1 rounded-lg border border-border py-2.5 text-center text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .calendar-container .rbc-calendar {
          background: transparent;
          color: rgb(var(--text-secondary));
        }
        .calendar-container .rbc-header {
          padding: 12px 0;
          font-weight: 500;
          color: rgb(var(--text-tertiary));
          border-bottom: 1px solid rgb(var(--border));
        }
        .calendar-container .rbc-month-view {
          border: none;
        }
        .calendar-container .rbc-month-row {
          border: none;
        }
        .calendar-container .rbc-day-bg {
          border-left: 1px solid rgb(var(--border));
        }
        .calendar-container .rbc-day-bg:first-child {
          border-left: none;
        }
        .calendar-container .rbc-off-range-bg {
          background: rgb(var(--bg-tertiary));
          opacity: 0.5;
        }
        .calendar-container .rbc-today {
          background: rgb(var(--accent-500) / 0.1);
        }
        .calendar-container .rbc-date-cell {
          padding: 8px;
          text-align: right;
          font-size: 14px;
        }
        .calendar-container .rbc-date-cell.rbc-now {
          font-weight: 600;
        }
        .calendar-container .rbc-date-cell.rbc-now .rbc-button-link {
          background: rgb(var(--accent-500));
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .calendar-container .rbc-off-range {
          color: rgb(var(--text-quaternary));
        }
        .calendar-container .rbc-event {
          padding: 2px 6px;
        }
        .calendar-container .rbc-event:focus {
          outline: none;
        }
        .calendar-container .rbc-event-label {
          display: none;
        }
        .calendar-container .rbc-event-content {
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .calendar-container .rbc-show-more {
          color: rgb(var(--accent-500));
          font-size: 12px;
          font-weight: 500;
        }
        .calendar-container .rbc-row-segment {
          padding: 0 2px 2px 2px;
        }
        .calendar-container .rbc-time-view {
          border: none;
        }
        .calendar-container .rbc-time-header {
          border-bottom: 1px solid rgb(var(--border));
        }
        .calendar-container .rbc-time-content {
          border-top: none;
        }
        .calendar-container .rbc-timeslot-group {
          border-bottom: 1px solid rgb(var(--border));
        }
        .calendar-container .rbc-time-slot {
          border-top: 1px solid rgb(var(--border));
        }
        .calendar-container .rbc-label {
          color: rgb(var(--text-tertiary));
          font-size: 12px;
        }
        .calendar-container .rbc-day-slot .rbc-time-slot {
          border-top: none;
        }
        .calendar-container .rbc-current-time-indicator {
          background-color: rgb(var(--error));
        }
        .calendar-container .rbc-agenda-view table.rbc-agenda-table {
          border: none;
        }
        .calendar-container .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
          border-bottom: 1px solid rgb(var(--border));
          padding: 12px 8px;
        }
        .calendar-container .rbc-agenda-date-cell,
        .calendar-container .rbc-agenda-time-cell {
          color: rgb(var(--text-secondary));
        }
        .calendar-container .rbc-agenda-event-cell {
          color: white; // Keep white as event background is likely dark/colored
        }
      `}</style>
    </div>
  )
}
