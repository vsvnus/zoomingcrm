'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data || []
}

export async function addClient(formData: {
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
}) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        ...formData,
        organization_id: organizationId,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    throw new Error('Erro ao criar cliente')
  }

  revalidatePath('/dashboard/clients')
  return data
}

export async function deleteClient(id: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // SEGURANÇA: Filtrar por organization_id para garantir isolamento multi-tenant
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting client:', error)
    throw new Error('Erro ao deletar cliente')
  }

  revalidatePath('/dashboard/clients')
}
