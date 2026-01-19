'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFreelancers() {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('freelancers')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching freelancers:', error)
    return []
  }

  return data || []
}

/**
 * Buscar freelancers com estatísticas completas
 * Inclui média diária REAL baseada em projetos executados
 */
export async function getFreelancersWithStatistics() {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('freelancer_statistics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching freelancer statistics:', error)
    return []
  }

  return data || []
}

export type CreateFreelancerData = {
  name: string
  email: string
  phone?: string
  role: string
  specialty: string[]
  portfolio?: string
  notes?: string
  status?: string
}

export async function createFreelancer(data: CreateFreelancerData) {
  const supabase = await createClient()

  const organizationId = await getUserOrganization()

  const { data: freelancer, error } = await supabase
    .from('freelancers')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      specialty: data.specialty,
      portfolio: data.portfolio,
      notes: data.notes,
      status: data.status || 'AVAILABLE',
      rating: 0,
      organization_id: organizationId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating freelancer:', error)
    throw new Error('Erro ao criar freelancer')
  }

  revalidatePath('/freelancers')
  return freelancer
}
