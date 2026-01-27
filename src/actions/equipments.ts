'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// TIPOS
// ============================================

export type EquipmentCategory =
  | 'CAMERA'
  | 'LENS'
  | 'AUDIO'
  | 'LIGHTING'
  | 'GRIP'
  | 'DRONE'
  | 'ACCESSORY'
  | 'OTHER'

export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED' | 'LOST'

export type MaintenanceStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Equipment {
  id?: string
  name: string
  brand?: string | null
  model?: string | null
  category: EquipmentCategory
  serial_number?: string | null
  status?: EquipmentStatus
  notes?: string | null
  purchase_date?: string | null
  purchase_price?: number | null
  daily_rate?: number | null
  qr_code_hash?: string | null
  photo_url?: string | null
  organization_id: string
}

export interface MaintenanceLog {
  id?: string
  equipmentId: string
  organizationId: string
  description: string
  cost?: number
  dateStart: string
  dateEnd?: string
  status?: MaintenanceStatus
  technicianName?: string
  externalService?: boolean
  notes?: string
  invoiceNumber?: string
}

export interface EquipmentBooking {
  id?: string
  projectId: string
  equipmentId?: string
  kitId?: string
  startDate: string
  endDate: string
  returnDate?: string
  notes?: string
}

// ============================================
// EQUIPMENTS - CRUD
// ============================================

/**
 * Listar todos os equipamentos
 */
export async function getEquipments() {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching equipments:', error)
    return []
  }

  return data
}

/**
 * Buscar equipamento por ID
 */
export async function getEquipmentById(id: string) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching equipment:', error)
    return null
  }

  return data
}

/**
 * Buscar disponibilidade de um equipamento
 */
export async function getEquipmentAvailability(id: string) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_availability')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching equipment availability:', error)
    return null
  }

  return data
}

/**
 * Adicionar novo equipamento
 */
export async function addEquipment(equipment: Equipment) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipments')
    .insert([{ ...equipment, organization_id: organizationId }])
    .select()
    .single()

  if (error) {
    console.error('Error adding equipment:', error)
    throw new Error('Erro ao adicionar equipamento: ' + error.message)
  }

  revalidatePath('/inventory')
  return data
}

/**
 * Atualizar equipamento
 */
export async function updateEquipment(id: string, updates: Partial<Equipment>) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipments')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating equipment:', error)
    throw new Error('Erro ao atualizar equipamento: ' + error.message)
  }

  revalidatePath('/inventory')
  return data
}

/**
 * Deletar equipamento
 */
export async function deleteEquipment(id: string) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { error } = await supabase
    .from('equipments')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting equipment:', error)
    throw new Error('Erro ao deletar equipamento: ' + error.message)
  }

  revalidatePath('/inventory')
}

// ============================================
// AVAILABILITY & ROI
// ============================================

/**
 * Buscar todos os equipamentos com disponibilidade e ROI
 */
export async function getEquipmentsWithAvailability() {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_availability')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching equipment availability:', error)
    return []
  }

  return data
}

/**
 * Buscar análise completa de ROI de equipamentos
 * Usa a view equipment_roi_analysis que considera receita REAL de projetos
 * e desconta custos de manutenção
 */
export async function getEquipmentROIAnalysis() {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_roi_analysis')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching equipment ROI analysis:', error)
    return []
  }

  return data
}

/**
 * Buscar ROI de um equipamento específico
 */
export async function getEquipmentROI(equipmentId: string) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_roi_analysis')
    .select('*')
    .eq('equipment_id', equipmentId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching equipment ROI:', error)
    return null
  }

  return data
}

/**
 * Buscar histórico de projetos de um equipamento
 */
export async function getEquipmentProjectHistory(equipmentId: string) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_project_history')
    .select('*')
    .eq('equipment_id', equipmentId)
    .eq('organization_id', organizationId)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching equipment project history:', error)
    return []
  }

  return data
}

/**
 * Buscar resumo de ROI por categoria
 */
export async function getEquipmentROISummary() {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_roi_summary')
    .select('*')
    .eq('organization_id', organizationId)
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching equipment ROI summary:', error)
    return []
  }

  return data
}

// ============================================
// BOOKINGS
// ============================================

/**
 * Verificar conflito de reserva
 */
export async function checkBookingConflict(
  equipmentId: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string
) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('check_booking_conflict', {
    p_equipment_id: equipmentId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_exclude_booking_id: excludeBookingId || null,
  })

  if (error) {
    console.error('Error checking booking conflict:', error)
    throw new Error('Erro ao verificar conflito: ' + error.message)
  }

  return data && data.length > 0 ? data[0] : { has_conflict: false }
}

/**
 * Criar nova reserva de equipamento
 */
export async function addEquipmentBooking(booking: EquipmentBooking) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  // Verificar conflito primeiro (se for equipamento individual)
  if (booking.equipmentId) {
    const conflict = await checkBookingConflict(
      booking.equipmentId,
      booking.startDate,
      booking.endDate
    )

    if (conflict.has_conflict) {
      throw new Error(
        `Equipamento já reservado para o projeto "${conflict.conflicting_project_title}" de ${conflict.conflict_start} a ${conflict.conflict_end}`
      )
    }
  }

  const { data, error } = await supabase
    .from('equipment_bookings')
    .insert([{
      project_id: booking.projectId,
      equipment_id: booking.equipmentId,
      kit_id: booking.kitId,
      start_date: booking.startDate,
      end_date: booking.endDate,
      return_date: booking.returnDate,
      notes: booking.notes
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding equipment booking:', error)
    throw new Error('Erro ao criar reserva: ' + error.message)
  }

  revalidatePath('/inventory')
  revalidatePath('/projects')
  return data
}

/**
 * Buscar reservas de um equipamento
 */
export async function getEquipmentBookings(equipmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_bookings')
    .select(
      `
      *,
      projects:project_id(id, title, stage)
    `
    )
    .eq('equipment_id', equipmentId)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching equipment bookings:', error)
    return []
  }

  return data
}

/**
 * Buscar equipamentos reservados para um projeto
 */
export async function getProjectEquipmentBookings(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_bookings')
    .select(
      `
      *,
      equipments:equipment_id(id, name, category, status, serial_number, daily_rate)
    `
    )
    .eq('project_id', projectId)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching project equipment bookings:', error)
    return []
  }

  return data
}

/**
 * Atualizar reserva (ex: registrar devolução)
 */
export async function updateEquipmentBooking(id: string, updates: Partial<EquipmentBooking>) {
  const supabase = await createClient()


  const updatePayload: any = {}
  if (updates.projectId) updatePayload.project_id = updates.projectId
  if (updates.equipmentId) updatePayload.equipment_id = updates.equipmentId
  if (updates.kitId) updatePayload.kit_id = updates.kitId
  if (updates.startDate) updatePayload.start_date = updates.startDate
  if (updates.endDate) updatePayload.end_date = updates.endDate
  if (updates.returnDate) updatePayload.return_date = updates.returnDate
  if (updates.notes) updatePayload.notes = updates.notes

  const { data, error } = await supabase
    .from('equipment_bookings')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating equipment booking:', error)
    throw new Error('Erro ao atualizar reserva: ' + error.message)
  }

  revalidatePath('/inventory')
  revalidatePath('/projects')
  return data
}

// ============================================
// MAINTENANCE LOGS
// ============================================

/**
 * Buscar logs de manutenção de um equipamento
 */
export async function getMaintenanceLogs(equipmentId: string) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('equipment_id', equipmentId)
    .eq('organization_id', organizationId)
    .order('date_start', { ascending: false })

  if (error) {
    console.error('Error fetching maintenance logs:', error)
    return []
  }

  return data
}

/**
 * Buscar equipamentos em manutenção
 */
export async function getEquipmentsInMaintenance() {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_maintenance_status')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date_start', { ascending: false })

  if (error) {
    console.error('Error fetching equipments in maintenance:', error)
    return []
  }

  return data
}

/**
 * Adicionar log de manutenção
 */
export async function addMaintenanceLog(log: MaintenanceLog) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('maintenance_logs')
    .insert([{ ...log, organization_id: organizationId }])
    .select()
    .single()

  if (error) {
    console.error('Error adding maintenance log:', error)
    throw new Error('Erro ao registrar manutenção: ' + error.message)
  }

  // Atualizar status do equipamento para MAINTENANCE
  if (log.status === 'IN_PROGRESS') {
    await updateEquipment(log.equipmentId, { status: 'MAINTENANCE' })
  }

  revalidatePath('/inventory')
  return data
}

/**
 * Atualizar log de manutenção
 */
export async function updateMaintenanceLog(id: string, updates: Partial<MaintenanceLog>) {
  const organizationId = await getUserOrganization()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('maintenance_logs')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating maintenance log:', error)
    throw new Error('Erro ao atualizar manutenção: ' + error.message)
  }

  // Se manutenção foi concluída, atualizar status do equipamento para AVAILABLE
  if (updates.status === 'COMPLETED' && data) {
    await updateEquipment(data.equipment_id, { status: 'AVAILABLE' })
  }

  revalidatePath('/inventory')
  return data
}

/**
 * Concluir manutenção
 */
export async function completeMaintenanceLog(id: string, dateEnd: string) {
  return updateMaintenanceLog(id, {
    status: 'COMPLETED',
    dateEnd,
  })
}
