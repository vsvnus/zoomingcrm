import { getAuthenticatedCalendar } from './client'

type EventInput = {
  title: string
  description?: string | null
  startDate: string
  endDate?: string | null
  allDay: boolean
  location?: string | null
  type?: string
}

function buildGoogleEvent(event: EventInput) {
  const typeLabels: Record<string, string> = {
    shooting: '[Gravação]',
    delivery: '[Entrega]',
    meeting: '[Reunião]',
    other: '[Evento]',
  }

  const prefix = typeLabels[event.type || 'other'] || ''
  const summary = `${prefix} ${event.title}`.trim()

  const body: Record<string, unknown> = {
    summary,
    description: event.description || undefined,
    location: event.location || undefined,
  }

  if (event.allDay) {
    // All-day events use 'date' (YYYY-MM-DD format)
    const startDate = event.startDate.split('T')[0]
    const endDate = event.endDate?.split('T')[0] || startDate

    // Google Calendar all-day end date is exclusive, so add 1 day
    const endDateObj = new Date(endDate)
    endDateObj.setDate(endDateObj.getDate() + 1)
    const exclusiveEnd = endDateObj.toISOString().split('T')[0]

    body.start = { date: startDate }
    body.end = { date: exclusiveEnd }
  } else {
    // Timed events use 'dateTime'
    body.start = {
      dateTime: event.startDate,
      timeZone: 'America/Sao_Paulo',
    }
    body.end = {
      dateTime: event.endDate || event.startDate,
      timeZone: 'America/Sao_Paulo',
    }
  }

  return body
}

export async function createGoogleEvent(
  userId: string,
  event: EventInput
): Promise<string | null> {
  try {
    const auth = await getAuthenticatedCalendar(userId)
    if (!auth) return null

    const { calendar, calendarId } = auth
    const requestBody = buildGoogleEvent(event)

    const response = await calendar.events.insert({
      calendarId,
      requestBody: requestBody as any,
    })

    return response.data.id || null
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error)
    return null
  }
}

export async function updateGoogleEvent(
  userId: string,
  googleEventId: string,
  event: EventInput
): Promise<boolean> {
  try {
    const auth = await getAuthenticatedCalendar(userId)
    if (!auth) return false

    const { calendar, calendarId } = auth
    const requestBody = buildGoogleEvent(event)

    await calendar.events.patch({
      calendarId,
      eventId: googleEventId,
      requestBody: requestBody as any,
    })

    return true
  } catch (error) {
    console.error('Erro ao atualizar evento no Google Calendar:', error)
    return false
  }
}

export async function deleteGoogleEvent(
  userId: string,
  googleEventId: string
): Promise<boolean> {
  try {
    const auth = await getAuthenticatedCalendar(userId)
    if (!auth) return false

    const { calendar, calendarId } = auth

    await calendar.events.delete({
      calendarId,
      eventId: googleEventId,
    })

    return true
  } catch (error) {
    console.error('Erro ao deletar evento no Google Calendar:', error)
    return false
  }
}
