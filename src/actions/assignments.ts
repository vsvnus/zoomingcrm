'use server'

/**
 * ============================================
 * ITEM ASSIGNMENTS - Server Actions
 * Vincula freelancers a itens de propostas e projetos
 * ============================================
 */

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
    ItemAssignment,
    ItemAssignmentWithFreelancer,
    CreateItemAssignmentData,
    UpdateItemAssignmentData,
    FreelancerWorkHistoryItem,
    FreelancerFinancialSummary,
    ItemAssignmentStatus,
} from '@/types/assignments'

// ============================================
// CRUD - ITEM ASSIGNMENTS
// ============================================

/**
 * Buscar assignments de um item (proposta ou projeto)
 */
export async function getItemAssignments(
    itemId: string,
    itemType: 'proposal' | 'project'
): Promise<ItemAssignmentWithFreelancer[]> {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const column = itemType === 'proposal' ? 'proposal_item_id' : 'project_item_id'

    const { data, error } = await supabase
        .from('item_assignments')
        .select(`
      *,
      freelancers (id, name, email, phone, daily_rate)
    `)
        .eq(column, itemId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching item assignments:', error)
        return []
    }

    return data || []
}

/**
 * Adicionar freelancer a um item
 */
export async function addItemAssignment(data: CreateItemAssignmentData) {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { data: assignment, error } = await supabase
        .from('item_assignments')
        .insert({
            ...data,
            organization_id: organizationId,
            status: 'PENDING',
        })
        .select(`
      *,
      freelancers (id, name, email, phone, daily_rate)
    `)
        .single()

    if (error) {
        console.error('Error adding item assignment:', error)
        throw new Error('Erro ao adicionar freelancer: ' + error.message)
    }

    // Revalidar paths relevantes
    if (data.proposal_item_id) {
        revalidatePath('/proposals')
    }
    if (data.project_item_id) {
        revalidatePath('/projects')
    }
    revalidatePath('/freelancers')

    return assignment
}

/**
 * Atualizar assignment
 */
export async function updateItemAssignment(
    assignmentId: string,
    data: UpdateItemAssignmentData
) {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { data: assignment, error } = await supabase
        .from('item_assignments')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', assignmentId)
        .eq('organization_id', organizationId)
        .select(`
      *,
      freelancers (id, name, email, phone, daily_rate)
    `)
        .single()

    if (error) {
        console.error('Error updating item assignment:', error)
        throw new Error('Erro ao atualizar assignment: ' + error.message)
    }

    revalidatePath('/proposals')
    revalidatePath('/projects')
    revalidatePath('/freelancers')

    return assignment
}

/**
 * Remover assignment
 */
export async function removeItemAssignment(assignmentId: string) {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { error } = await supabase
        .from('item_assignments')
        .delete()
        .eq('id', assignmentId)
        .eq('organization_id', organizationId)

    if (error) {
        console.error('Error removing item assignment:', error)
        throw new Error('Erro ao remover assignment: ' + error.message)
    }

    revalidatePath('/proposals')
    revalidatePath('/projects')
    revalidatePath('/freelancers')
}

/**
 * Atualizar status do assignment
 */
export async function updateAssignmentStatus(
    assignmentId: string,
    status: ItemAssignmentStatus
) {
    return updateItemAssignment(assignmentId, { status })
}

// ============================================
// COPIAR ASSIGNMENTS (Proposta -> Projeto)
// ============================================

/**
 * Copiar assignments de proposal_items para project_items
 * Chamado quando uma proposta é aprovada
 */
export async function copyAssignmentsToProject(
    proposalItemsMap: Array<{ proposalItemId: string; projectItemId: string }>
) {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    for (const mapping of proposalItemsMap) {
        // Buscar assignments do item da proposta
        const { data: proposalAssignments } = await supabase
            .from('item_assignments')
            .select('*')
            .eq('proposal_item_id', mapping.proposalItemId)
            .eq('organization_id', organizationId)

        if (!proposalAssignments || proposalAssignments.length === 0) continue

        // Criar assignments para o item do projeto
        const projectAssignments = proposalAssignments.map((assignment) => ({
            freelancer_id: assignment.freelancer_id,
            proposal_item_id: assignment.proposal_item_id, // Manter referência original
            project_item_id: mapping.projectItemId, // Novo vínculo
            role: assignment.role,
            agreed_fee: assignment.agreed_fee,
            estimated_hours: assignment.estimated_hours,
            scheduled_date: assignment.scheduled_date,
            status: 'PENDING' as const,
            notes: assignment.notes,
            organization_id: organizationId,
        }))

        const { error } = await supabase
            .from('item_assignments')
            .insert(projectAssignments)

        if (error) {
            console.error('Error copying assignments to project:', error)
        }
    }
}

// ============================================
// FREELANCER - HISTÓRICO E FINANCEIRO
// ============================================

/**
 * Buscar histórico de trabalhos de um freelancer
 */
export async function getFreelancerWorkHistory(
    freelancerId: string
): Promise<FreelancerWorkHistoryItem[]> {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { data, error } = await supabase
        .from('freelancer_work_history')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching freelancer work history:', error)
        return []
    }

    return data || []
}

/**
 * Buscar resumo financeiro de um freelancer
 */
export async function getFreelancerFinancialSummary(
    freelancerId: string
): Promise<FreelancerFinancialSummary | null> {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { data, error } = await supabase
        .from('freelancer_financial_summary')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .eq('organization_id', organizationId)
        .single()

    if (error) {
        console.error('Error fetching freelancer financial summary:', error)
        return null
    }

    return data
}

/**
 * Buscar próximos trabalhos agendados de um freelancer
 */
export async function getFreelancerUpcomingAssignments(
    freelancerId: string
): Promise<ItemAssignment[]> {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const today = new Date().toISOString()

    const { data, error } = await supabase
        .from('item_assignments')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .eq('organization_id', organizationId)
        .neq('status', 'DONE')
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(10)

    if (error) {
        console.error('Error fetching upcoming assignments:', error)
        return []
    }

    return data || []
}

/**
 * Buscar ganhos mensais de um freelancer (últimos 12 meses)
 */
export async function getFreelancerMonthlyEarnings(
    freelancerId: string
): Promise<Array<{ month: string; amount: number }>> {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    // Buscar transações pagas nos últimos 12 meses
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const { data, error } = await supabase
        .from('financial_transactions')
        .select('amount, payment_date')
        .eq('freelancer_id', freelancerId)
        .eq('organization_id', organizationId)
        .eq('type', 'EXPENSE')
        .eq('status', 'PAID')
        .gte('payment_date', twelveMonthsAgo.toISOString())
        .order('payment_date', { ascending: true })

    if (error) {
        console.error('Error fetching monthly earnings:', error)
        return []
    }

    // Agrupar por mês
    const monthlyMap = new Map<string, number>()

    data?.forEach((transaction) => {
        if (transaction.payment_date) {
            const date = new Date(transaction.payment_date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const current = monthlyMap.get(monthKey) || 0
            monthlyMap.set(monthKey, current + Number(transaction.amount))
        }
    })

    // Converter para array ordenado
    return Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Buscar freelancer com todos os detalhes
 */
export async function getFreelancerWithDetails(freelancerId: string) {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    // Buscar dados básicos
    const { data: freelancer, error } = await supabase
        .from('freelancers')
        .select('*')
        .eq('id', freelancerId)
        .eq('organization_id', organizationId)
        .single()

    if (error || !freelancer) {
        console.error('Error fetching freelancer:', error)
        return null
    }

    // Buscar dados agregados em paralelo
    const [workHistory, financialSummary, upcomingAssignments, monthlyEarnings] =
        await Promise.all([
            getFreelancerWorkHistory(freelancerId),
            getFreelancerFinancialSummary(freelancerId),
            getFreelancerUpcomingAssignments(freelancerId),
            getFreelancerMonthlyEarnings(freelancerId),
        ])

    return {
        ...freelancer,
        work_history: workHistory,
        financial_summary: financialSummary,
        upcoming_assignments: upcomingAssignments,
        monthly_earnings: monthlyEarnings,
    }
}
