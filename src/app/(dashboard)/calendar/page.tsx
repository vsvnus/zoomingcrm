import { Suspense } from 'react'
import { getCalendarEvents } from '@/actions/calendar'
import { CalendarContent } from './calendar-content'

async function CalendarData() {
  const events = await getCalendarEvents()
  return <CalendarContent initialEvents={events} />
}

function CalendarLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarData />
    </Suspense>
  )
}
