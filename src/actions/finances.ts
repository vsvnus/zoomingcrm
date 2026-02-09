'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Mapear categorias de project_expenses para financial_transactions
function mapExpenseCategoryToFinancial(category: string): string {
  const map: Record<string, string> = {
    CREW_TALENT: 'CREW_TALENT',
    EQUIPMENT: 'EQUIPMENT_RENTAL',
    LOGISTICS: 'LOGISTICS',
    FOOD: 'OTHER_EXPENSE',
    OTHER: 'OTHER_EXPENSE',
  }
  return map[category] || 'OTHER_EXPENSE'
}

// Mapear payment_status de project_expenses para financial_transactions
function mapPaymentStatus(status: string): string {
  if (status === 'TO_PAY') return 'PENDING'
  return status // SCHEDULED e PAID são iguais
}

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
  category: 'CREW_TALENT' | 'EQUIPMENT' | 'LOGISTICS' | 'FOOD' | 'OTHER'
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

  // 1. Criar financial_transaction correspondente (Contas a Pagar)
  const expenseStatus = formData.payment_status || 'TO_PAY'
  const expenseAmount = formData.actual_cost || formData.estimated_cost

  const { data: ftData, error: ftError } = await supabase
    .from('financial_transactions')
    .insert({
      organization_id: financeData.organization_id,
      type: 'EXPENSE',
      category: mapExpenseCategoryToFinancial(formData.category),
      description: formData.description,
      amount: expenseAmount,
      status: mapPaymentStatus(expenseStatus),
      due_date: formData.payment_date || null,
      payment_date: expenseStatus === 'PAID' ? (formData.payment_date || new Date().toISOString().split('T')[0]) : null,
      project_id: formData.project_id,
      freelancer_id: formData.freelancer_id || null,
      invoice_number: formData.invoice_number || null,
      notes: formData.notes || null,
    })
    .select('id')
    .single()

  if (ftError) {
    console.error('Error creating financial transaction for expense:', ftError)
    // Não bloqueia a criação da despesa, mas loga o erro
  }

  // 2. Criar project_expense com link para financial_transaction
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
        financial_transaction_id: ftData?.id || null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating expense:', error)
    throw new Error('Erro ao criar despesa')
  }

  revalidatePath(`/projects/${formData.project_id}`)
  revalidatePath('/financeiro')
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

  // Sync com financial_transaction vinculada
  if (data?.financial_transaction_id) {
    const ftUpdates: Record<string, any> = {}
    if (updates.actual_cost !== undefined || updates.estimated_cost !== undefined) {
      ftUpdates.amount = updates.actual_cost || updates.estimated_cost || data.actual_cost || data.estimated_cost
    }
    if (updates.payment_status) {
      ftUpdates.status = mapPaymentStatus(updates.payment_status)
    }
    if (updates.payment_date !== undefined) {
      ftUpdates.due_date = updates.payment_date || null
      if (updates.payment_status === 'PAID') {
        ftUpdates.payment_date = updates.payment_date || new Date().toISOString().split('T')[0]
      }
    }
    if (updates.invoice_number !== undefined) {
      ftUpdates.invoice_number = updates.invoice_number || null
    }
    if (updates.notes !== undefined) {
      ftUpdates.notes = updates.notes || null
    }

    if (Object.keys(ftUpdates).length > 0) {
      await supabase
        .from('financial_transactions')
        .update(ftUpdates)
        .eq('id', data.financial_transaction_id)
    }
  }

  revalidatePath('/projects')
  revalidatePath('/financeiro')
  return data
}

// Deletar despesa
export async function deleteExpense(expenseId: string) {
  const supabase = await createClient()

  // Buscar a despesa antes de deletar para pegar o financial_transaction_id
  const { data: expense } = await supabase
    .from('project_expenses')
    .select('financial_transaction_id')
    .eq('id', expenseId)
    .single()

  const { error } = await supabase
    .from('project_expenses')
    .delete()
    .eq('id', expenseId)

  if (error) {
    console.error('Error deleting expense:', error)
    throw new Error('Erro ao deletar despesa')
  }

  // Deletar financial_transaction vinculada
  if (expense?.financial_transaction_id) {
    await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', expense.financial_transaction_id)
  }

  revalidatePath('/projects')
  revalidatePath('/financeiro')
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
