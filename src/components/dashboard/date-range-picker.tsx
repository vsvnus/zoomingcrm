'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  startOfYear,
  endOfYear,
  subYears,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

type DateRange = {
  start: Date
  end: Date
}

type PresetRange = {
  label: string
  getValue: () => DateRange
}

interface DateRangePickerProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
}

const presetRanges: PresetRange[] = [
  {
    label: 'Este mês',
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Último mês',
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 1)),
      end: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: 'Últimos 3 meses',
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 2)),
      end: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Últimos 6 meses',
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Este ano',
    getValue: () => ({
      start: startOfYear(new Date()),
      end: endOfYear(new Date()),
    }),
  },
  {
    label: 'Ano anterior',
    getValue: () => ({
      start: startOfYear(subYears(new Date(), 1)),
      end: endOfYear(subYears(new Date(), 1)),
    }),
  },
]

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const [tempRange, setTempRange] = useState<Partial<DateRange>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetClick = (preset: PresetRange) => {
    const range = preset.getValue()
    onChange(range)
    setIsOpen(false)
  }

  const handleDayClick = (day: Date) => {
    if (selecting === 'start') {
      setTempRange({ start: day })
      setSelecting('end')
    } else {
      if (tempRange.start && day < tempRange.start) {
        setTempRange({ start: day, end: tempRange.start })
      } else {
        setTempRange({ ...tempRange, end: day })
      }

      if (tempRange.start) {
        const finalRange = day < tempRange.start
          ? { start: day, end: tempRange.start }
          : { start: tempRange.start, end: day }
        onChange(finalRange)
        setIsOpen(false)
        setSelecting('start')
        setTempRange({})
      }
    }
  }

  const handleClear = () => {
    onChange(null)
    setTempRange({})
    setSelecting('start')
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg p-2 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <span className="text-sm font-medium text-white">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg p-2 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-zinc-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected =
              (value && isSameDay(day, value.start)) ||
              (value && isSameDay(day, value.end)) ||
              (tempRange.start && isSameDay(day, tempRange.start))
            const isInRange =
              value &&
              isWithinInterval(day, { start: value.start, end: value.end })
            const isToday = isSameDay(day, new Date())

            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                disabled={!isCurrentMonth}
                className={`
                  relative h-8 w-8 text-sm rounded-lg transition-all
                  ${!isCurrentMonth ? 'text-zinc-700 cursor-not-allowed' : 'text-white hover:bg-white/10'}
                  ${isSelected ? 'bg-accent-500 text-white font-medium' : ''}
                  ${isInRange && !isSelected ? 'bg-accent-500/20' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-accent-500' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const displayValue = value
    ? `${format(value.start, 'dd/MM/yy')} - ${format(value.end, 'dd/MM/yy')}`
    : 'Últimos 6 meses'

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
      >
        <Calendar className="h-4 w-4" />
        <span>{displayValue}</span>
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="ml-1 rounded p-0.5 hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Presets */}
            <div className="w-40 border-r border-white/10 p-2">
              <p className="mb-2 px-2 text-xs font-medium text-zinc-500">Atalhos</p>
              {presetRanges.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div className="w-72">
              {renderCalendar()}

              {selecting === 'end' && tempRange.start && (
                <div className="border-t border-white/10 px-4 py-2">
                  <p className="text-xs text-zinc-400">
                    Início: {format(tempRange.start, 'dd/MM/yyyy')}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Selecione a data final
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
