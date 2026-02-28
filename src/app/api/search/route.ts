import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUserOrganization } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // --- Auth guard ---
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // --- Org isolation ---
    let organizationId: string
    try {
      organizationId = await getUserOrganization()
    } catch {
      return NextResponse.json(
        { error: 'No organization context' },
        { status: 403 },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = `%${query.trim()}%`
    const results: SearchResult[] = []

    // Buscar em Clients (org-isolated)
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, email, phone, company')
      .eq('organization_id', organizationId)
      .or(
        `name.ilike.${searchTerm},email.ilike.${searchTerm},company.ilike.${searchTerm}`,
      )
      .limit(5)

    if (clients) {
      results.push(
        ...clients.map((client) => ({
          id: client.id,
          type: 'client' as const,
          title: client.name,
          subtitle: client.company || client.email,
          description: client.phone,
          url: `/clients?id=${client.id}`,
        })),
      )
    }

    // Buscar em Projects (org-isolated)
    const { data: projects } = await supabase
      .from('projects')
      .select(
        `
        id,
        title,
        description,
        status,
        client:clients!inner(name)
      `,
      )
      .eq('organization_id', organizationId)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)

    if (projects) {
      results.push(
        ...projects.map((project: any) => ({
          id: project.id,
          type: 'project' as const,
          title: project.title,
          subtitle: project.client?.name || '',
          description: project.description || project.status,
          url: `/projects/${project.id}`,
        })),
      )
    }

    // Buscar em Equipments (org-isolated)
    const { data: equipments } = await supabase
      .from('equipments')
      .select('id, name, brand, model, category, serial_number, status')
      .eq('organization_id', organizationId)
      .or(
        `name.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},serial_number.ilike.${searchTerm}`,
      )
      .limit(5)

    if (equipments) {
      results.push(
        ...equipments.map((equipment) => ({
          id: equipment.id,
          type: 'equipment' as const,
          title: equipment.name,
          subtitle:
            `${equipment.brand || ''} ${equipment.model || ''}`.trim(),
          description: `${equipment.category} - ${equipment.status}`,
          url: `/inventory?id=${equipment.id}`,
        })),
      )
    }

    // Buscar em Freelancers (org-isolated)
    const { data: freelancers } = await supabase
      .from('freelancers')
      .select('id, name, email, phone, specialties')
      .eq('organization_id', organizationId)
      .or(
        `name.ilike.${searchTerm},email.ilike.${searchTerm},specialties.ilike.${searchTerm}`,
      )
      .limit(5)

    if (freelancers) {
      results.push(
        ...freelancers.map((freelancer) => ({
          id: freelancer.id,
          type: 'freelancer' as const,
          title: freelancer.name,
          subtitle: freelancer.email,
          description: freelancer.specialties,
          url: `/freelancers?id=${freelancer.id}`,
        })),
      )
    }

    // Buscar em Proposals (org-isolated)
    const { data: proposals } = await supabase
      .from('proposals')
      .select(
        `
        id,
        title,
        status,
        total_value,
        client:clients!inner(name)
      `,
      )
      .eq('organization_id', organizationId)
      .ilike('title', searchTerm)
      .limit(5)

    if (proposals) {
      results.push(
        ...proposals.map((proposal: any) => ({
          id: proposal.id,
          type: 'proposal' as const,
          title: proposal.title,
          subtitle: proposal.client?.name || '',
          description: `R$ ${proposal.total_value?.toFixed(2) || '0.00'} - ${proposal.status}`,
          url: `/proposals?id=${proposal.id}`,
        })),
      )
    }

    // Buscar em Financial Entries (org-isolated)
    const { data: financialEntries } = await supabase
      .from('financial_entries')
      .select('id, description, amount, type, category, due_date')
      .eq('organization_id', organizationId)
      .ilike('description', searchTerm)
      .limit(5)

    if (financialEntries) {
      results.push(
        ...financialEntries.map((entry) => ({
          id: entry.id,
          type: 'financial' as const,
          title: entry.description,
          subtitle: `${entry.type === 'INCOME' ? 'Receita' : 'Despesa'} - ${entry.category}`,
          description: `R$ ${entry.amount?.toFixed(2) || '0.00'}`,
          url: `/financeiro?id=${entry.id}`,
        })),
      )
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar busca' },
      { status: 500 },
    )
  }
}

export type SearchResultType =
  | 'client'
  | 'project'
  | 'equipment'
  | 'freelancer'
  | 'proposal'
  | 'financial'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  description?: string
  url: string
}
