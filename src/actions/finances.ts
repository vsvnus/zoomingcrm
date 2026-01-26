'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Buscar resumo financeiro do projeto
export async function getProjectFinancialSummary(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_financial_summary')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()

  if (error) {
    // Silently return null if table doesn't exist or other errors
    return null
  }

  return data
}

// Buscar despesas do projeto
export async function getProjectExpenses(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_expenses')
    .select(`
      *,
      freelancers(id, name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    // Silently return empty array if table doesn't exist or other errors
    return []
  }

  return data || []
}

// Adicionar despesa
export async function addExpense(formData: {
  project_id: string
  category: 'CREW_TALENT' | 'EQUIPMENT' | 'LOGISTICS'
  description: string
  estimated_cost: number
  actual_cost?: number
  freelancer_id?: string
  equipment_id?: string
  payment_status?: 'TO_PAY' | 'SCHEDULED' | 'PAID'
  payment_date?: string
  invoice_number?: string
  notes?: string
}) {
  const supabase = await createClient()

  // Buscar project_finance_id
  let { data: financeData } = await supabase
    .from('project_finances')
    .select('id, organization_id')
    .eq('project_id', formData.project_id)
    .single()

  if (!financeData) {
    // Lazy creation: se ainda no existe financeiro, criar agora
    const { data: project } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', formData.project_id)
      .single()

    if (!project) throw new Error('Projeto no encontrado')

    const { data: newFinance } = await supabase
      .from('project_finances')
      .insert({
        project_id: formData.project_id,
        organization_id: project.organization_id,
        approved_value: 0,
        target_margin_percent: 30,
      })
      .select('id, organization_id')
      .single()

    financeData = newFinance
  }

  if (!financeData) {
    throw new Error('Erro ao inicializar financeiro do projeto')
  }

  const { data, error } = await supabase
    .from('project_expenses')
    .insert([
      {
        project_id: formData.project_id,
        project_finance_id: financeData.id,
        organization_id: financeData.organization_id,
        category: formData.category,
        description: formData.description,
        estimated_cost: formData.estimated_cost,
        actual_cost: formData.actual_cost || 0,
        freelancer_id: formData.freelancer_id,
        equipment_id: formData.equipment_id,
        payment_status: formData.payment_status || 'TO_PAY',
        payment_date: formData.payment_date,
        invoice_number: formData.invoice_number,
        notes: formData.notes,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating expense:', error)
    throw new Error('Erro ao criar despesa')
  }

  revalidatePath(`/projects/${formData.project_id}`)
  return data
}

// Atualizar despesa
export async function updateExpense(
  expenseId: string,
  updates: {
    estimated_cost?: number
    actual_cost?: number
    payment_status?: 'TO_PAY' | 'SCHEDULED' | 'PAID'
    payment_date?: string
    invoice_number?: string
    notes?: string
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_expenses')
    .update(updates)
    .eq('id', expenseId)
    .select()
    .single()

  if (error) {
    console.error('Error updating expense:', error)
    throw new Error('Erro ao atualizar despesa')
  }

  revalidatePath('/projects')
  return data
}

// Deletar despesa
export async function deleteExpense(expenseId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_expenses')
    .delete()
    .eq('id', expenseId)

  if (error) {
    console.error('Error deleting expense:', error)
    throw new Error('Erro ao deletar despesa')
  }

  revalidatePath('/projects')
}

// Atualizar valores de receita
export async function updateProjectRevenue(
  projectId: string,
  updates: {
    approved_value?: number
    additives?: number
    target_margin_percent?: number
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_finances')
    .update(updates)
    .eq('project_id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating revenue:', error)
    throw new Error('Erro ao atualizar receita')
  }

  revalidatePath(`/projects/${projectId}`)
  return data
}
