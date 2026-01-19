'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'

export type CalendarEventType = 'shooting' | 'delivery' | 'meeting' | 'other'

export type CalendarEvent = {
  id: string
  title: string
  description?: string | null
  start: string
  end: string
  allDay: boolean
  type: CalendarEventType
  color: string
  projectId?: string | null
  projectTitle?: string | null
  clientName?: string | null
  location?: string | null
}

export type ManualEvent = {
  id?: string
  organization_id: string
  title: string
  description?: string | null
  start_date: string
  end_date: string
  all_day: boolean
  type: CalendarEventType
  location?: string | null
  created_by?: string | null
}

const eventColors: Record<CalendarEventType, string> = {
  shooting: '#8b5cf6', // purple
  delivery: '#22c55e', // green
  meeting: '#3b82f6', // blue
  other: '#6b7280', // gray
}

export async function getCalendarEvents(
  startDate?: Date,
  endDate?: Date
): Promise<CalendarEvent[]> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Default to current month +/- 1 month
  const start = startDate || subMonths(startOfMonth(new Date()), 1)
  const end = endDate || addMonths(endOfMonth(new Date()), 1)

  const events: CalendarEvent[] = []

  // 1. Buscar datas de gravação dos projetos (shooting_date principal)
  const { data: projectsWithShooting } = await supabase
    .from('projects')
    .select('id, title, shooting_date, shooting_time, location, clients(name)')
    .eq('organization_id', organizationId)
    .not('shooting_date', 'is', null)
    .gte('shooting_date', start.toISOString())
    .lte('shooting_date', end.toISOString())

  if (projectsWithShooting) {
    projectsWithShooting.forEach((project) => {
      if (project.shooting_date) {
        const shootingDate = new Date(project.shooting_date)
        events.push({
          id: `shooting-${project.id}`,
          title: `Gravação: ${project.title}`,
          description: project.location || null,
          start: project.shooting_date,
          end: project.shooting_date,
          allDay: !project.shooting_time,
          type: 'shooting',
          color: eventColors.shooting,
          projectId: project.id,
          projectTitle: project.title,
          clientName: (project.clients as any)?.name || null,
          location: project.location,
        })
      }
    })
  }

  // 2. Buscar múltiplas datas de gravação (shooting_dates)
  const { data: shootingDates } = await supabase
    .from('shooting_dates')
    .select('id, date, time, location, notes, project_id, projects(id, title, clients(name))')
    .eq('projects.organization_id', organizationId)
    .gte('date', start.toISOString())
    .lte('date', end.toISOString())

  if (shootingDates) {
    shootingDates.forEach((sd) => {
      const project = sd.projects as any
      if (project) {
        events.push({
          id: `shooting-date-${sd.id}`,
          title: `Gravação: ${project.title}`,
          description: sd.notes || null,
          start: sd.date,
          end: sd.date,
          allDay: !sd.time,
          type: 'shooting',
          color: eventColors.shooting,
          projectId: project.id,
          projectTitle: project.title,
          clientName: project.clients?.name || null,
          location: sd.location,
        })
      }
    })
  }

  // 3. Buscar deadlines dos projetos
  const { data: projectsWithDeadline } = await supabase
    .from('projects')
    .select('id, title, deadline, clients(name)')
    .eq('organization_id', organizationId)
    .not('deadline', 'is', null)
    .gte('deadline', start.toISOString())
    .lte('deadline', end.toISOString())

  if (projectsWithDeadline) {
    projectsWithDeadline.forEach((project) => {
      if (project.deadline) {
        events.push({
          id: `deadline-${project.id}`,
          title: `Entrega: ${project.title}`,
          description: null,
          start: project.deadline,
          end: project.deadline,
          allDay: true,
          type: 'delivery',
          color: eventColors.delivery,
          projectId: project.id,
          projectTitle: project.title,
          clientName: (project.clients as any)?.name || null,
          location: null,
        })
      }
    })
  }

  // 4. Buscar múltiplas datas de entrega (delivery_dates)
  const { data: deliveryDates } = await supabase
    .from('delivery_dates')
    .select('id, date, description, completed, project_id, projects(id, title, clients(name))')
    .eq('projects.organization_id', organizationId)
    .gte('date', start.toISOString())
    .lte('date', end.toISOString())

  if (deliveryDates) {
    deliveryDates.forEach((dd) => {
      const project = dd.projects as any
      if (project) {
        events.push({
          id: `delivery-date-${dd.id}`,
          title: `Entrega: ${dd.description || project.title}`,
          description: dd.description || null,
          start: dd.date,
          end: dd.date,
          allDay: true,
          type: 'delivery',
          color: dd.completed ? '#4ade80' : eventColors.delivery,
          projectId: project.id,
          projectTitle: project.title,
          clientName: project.clients?.name || null,
          location: null,
        })
      }
    })
  }

  // 5. Buscar eventos manuais (calendar_events table)
  const { data: manualEvents } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('start_date', start.toISOString())
    .lte('start_date', end.toISOString())

  if (manualEvents) {
    manualEvents.forEach((event) => {
      events.push({
        id: `manual-${event.id}`,
        title: event.title,
        description: event.description,
        start: event.start_date,
        end: event.end_date || event.start_date,
        allDay: event.all_day,
        type: event.type || 'other',
        color: eventColors[event.type as CalendarEventType] || eventColors.other,
        projectId: null,
        projectTitle: null,
        clientName: null,
        location: event.location,
      })
    })
  }

  return events
}

export async function createCalendarEvent(event: {
  title: string
  description?: string
  startDate: string
  endDate?: string
  allDay: boolean
  type: CalendarEventType
  location?: string
}) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('calendar_events')
    .insert([
      {
        organization_id: organizationId,
        title: event.title,
        description: event.description || null,
        start_date: event.startDate,
        end_date: event.endDate || event.startDate,
        all_day: event.allDay,
        type: event.type,
        location: event.location || null,
        created_by: user?.id || null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating calendar event:', error)
    throw new Error('Erro ao criar evento: ' + error.message)
  }

  revalidatePath('/calendar')
  return data
}

export async function updateCalendarEvent(
  id: string,
  updates: {
    title?: string
    description?: string
    startDate?: string
    endDate?: string
    allDay?: boolean
    type?: CalendarEventType
    location?: string
  }
) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const updateData: any = {}
  if (updates.title) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.startDate) updateData.start_date = updates.startDate
  if (updates.endDate) updateData.end_date = updates.endDate
  if (updates.allDay !== undefined) updateData.all_day = updates.allDay
  if (updates.type) updateData.type = updates.type
  if (updates.location !== undefined) updateData.location = updates.location

  const { data, error } = await supabase
    .from('calendar_events')
    .update(updateData)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating calendar event:', error)
    throw new Error('Erro ao atualizar evento: ' + error.message)
  }

  revalidatePath('/calendar')
  return data
}

export async function deleteCalendarEvent(id: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting calendar event:', error)
    throw new Error('Erro ao deletar evento: ' + error.message)
  }

  revalidatePath('/calendar')
}
