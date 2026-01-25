
import { SupabaseClient } from '@supabase/supabase-js';

// Definições de tools compatíveis com OpenAI Standard (JSON Schema)
// Isso substitui o uso de 'tool()' do SDK AI novo que requer versão 4+
export const getToolsDefinitions = () => [
    {
        name: 'search_projects',
        description: 'Busca projetos por nome, status ou cliente.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Termo de busca (nome do projeto ou cliente)' },
                status: {
                    type: 'string',
                    enum: ['BRIEFING', 'PRE_PROD', 'SHOOTING', 'POST_PROD', 'REVIEW', 'DONE', 'ARCHIVED'],
                    description: 'Filtrar por status'
                },
                limit: { type: 'number', description: 'Limite de resultados', default: 10 }
            },
        },
    },
    {
        name: 'get_financial_summary',
        description: 'Obtém o resumo financeiro (fluxo de caixa, entradas, saídas) de um período.',
        parameters: {
            type: 'object',
            properties: {
                startDate: { type: 'string', description: 'Data inicial (YYYY-MM-DD)' },
                endDate: { type: 'string', description: 'Data final (YYYY-MM-DD)' },
                view: { type: 'string', enum: ['summary', 'transactions'], description: 'Se quer apenas o resumo ou a lista' }
            },
            required: ['startDate', 'endDate']
        },
    },
    {
        name: 'list_freelancers',
        description: 'Lista freelancers cadastrados, opcionalmente filtrando por disponibilidade ou habilidade.',
        parameters: {
            type: 'object',
            properties: {
                role: { type: 'string', description: 'Habilidade ou tag (ex: Camera, Editor)' },
                available_date: { type: 'string', description: 'Data (YYYY-MM-DD)' }
            },
        },
    },
    {
        name: 'get_project_details',
        description: 'Busca detalhes completos de um projeto específico.',
        parameters: {
            type: 'object',
            properties: {
                projectId: { type: 'string', description: 'ID do projeto' },
            },
            required: ['projectId']
        },
    },
    {
        name: 'check_equipment_availability',
        description: 'Verifica disponibilidade de equipamentos ou busca conflitos de agenda.',
        parameters: {
            type: 'object',
            properties: {
                equipmentName: { type: 'string', description: 'Nome do equipamento (ex: RED Komodo)' },
                date: { type: 'string', description: 'Data para verificação (YYYY-MM-DD)' }
            },
            required: ['date']
        },
    },
    {
        name: 'list_proposals',
        description: 'Lista propostas comerciais enviadas, aceitas ou em rascunho.',
        parameters: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'], description: 'Status da proposta' },
                clientName: { type: 'string', description: 'Nome do cliente' }
            },
        },
    },
    {
        name: 'get_client_info',
        description: 'Busca informações de contato e histórico de um cliente.',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Nome do cliente ou empresa' },
            },
            required: ['name']
        },
    },
];

// Implementação das Tools (Execução)
export const executeTool = async (
    toolName: string,
    args: any,
    supabase: SupabaseClient,
    organizationId: string
) => {
    try {
        switch (toolName) {
            case 'search_projects':
                return await searchProjects(args, supabase, organizationId);
            case 'get_financial_summary':
                return await getFinancialSummary(args, supabase, organizationId);
            case 'list_freelancers':
                return await listFreelancers(args, supabase, organizationId);
            case 'get_project_details':
                return await getProjectDetails(args, supabase, organizationId);
            case 'check_equipment_availability':
                return await checkEquipmentAvailability(args, supabase, organizationId);
            case 'list_proposals':
                return await listProposals(args, supabase, organizationId);
            case 'get_client_info':
                return await getClientInfo(args, supabase, organizationId);
            default:
                return 'Ferramenta não encontrada.';
        }
    } catch (err: any) {
        return `Erro ao executar ferramenta: ${err.message}`;
    }
};

// --- Funções Internas ---

async function searchProjects({ query, status, limit = 10 }: any, supabase: SupabaseClient, organizationId: string) {
    let dbQuery = supabase
        .from('projects')
        .select('id, title, status, deadline:deadline_date, budget, clients(name)')
        .eq('organization_id', organizationId)
        .limit(limit);

    if (status) dbQuery = dbQuery.eq('status', status);
    if (query) dbQuery = dbQuery.ilike('title', `%${query}%`);

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data.length > 0 ? JSON.stringify(data) : 'Nenhum projeto encontrado.';
}

async function getFinancialSummary({ startDate, endDate, view }: any, supabase: SupabaseClient, organizationId: string) {
    const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('id, type, amount, category, description, date:due_date, status')
        .eq('organization_id', organizationId)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .order('due_date', { ascending: false });

    if (error) throw error;
    if (!transactions || transactions.length === 0) return 'Nenhuma transação no período.';

    const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = income - expenses;

    if (view === 'summary') {
        return JSON.stringify({ period: `${startDate} a ${endDate}`, total_income: income, total_expenses: expenses, net_balance: balance });
    }
    return JSON.stringify({ summary: { total_income: income, total_expenses: expenses, net_balance: balance }, transactions: transactions.slice(0, 15) });
}

async function listFreelancers({ role, available_date }: any, supabase: SupabaseClient, organizationId: string) {
    let { data: freelancers, error } = await supabase
        .from('freelancers')
        .select(`id, name, email, daily_rate, status, tags:freelancer_tags(name)`)
        .eq('organization_id', organizationId)
        .eq('status', 'ACTIVE');

    if (error) throw error;
    let results = freelancers || [];

    if (role) {
        results = results.filter(f =>
            f.tags && Array.isArray(f.tags) && f.tags.some((t: any) => t.name.toLowerCase().includes(role.toLowerCase()))
        );
    }
    return results.length > 0 ? JSON.stringify(results) : 'Nenhum freelancer encontrado.';
}

async function getProjectDetails({ projectId }: any, supabase: SupabaseClient, organizationId: string) {
    const { data, error } = await supabase
        .from('projects')
        .select(`*, clients(name), items:project_items(*), team:project_members(role, status, freelancer:freelancers(name))`)
        .eq('id', projectId)
        .eq('organization_id', organizationId)
        .single();

    if (error) throw error;
    return JSON.stringify(data);
}

async function checkEquipmentAvailability({ equipmentName, date }: any, supabase: SupabaseClient, organizationId: string) {
    // 1. Buscar equipamentos
    let query = supabase.from('equipments').select('id, name, status').eq('organization_id', organizationId);
    if (equipmentName) query = query.ilike('name', `%${equipmentName}%`);

    const { data: equipments } = await query;
    if (!equipments?.length) return 'Equipamento não encontrado no inventário.';

    // 2. Checar reservas para a data
    const equipmentIds = equipments.map(e => e.id);
    const { data: bookings } = await supabase
        .from('equipment_bookings')
        .select('equipment_id, start_date, end_date, projects(title)')
        .in('equipment_id', equipmentIds)
        .lte('start_date', date)
        .gte('end_date', date);

    const results = equipments.map(eq => {
        const booking = bookings?.find(b => b.equipment_id === eq.id);
        return {
            name: eq.name,
            status: booking ? `OCUPADO (Projeto: ${(booking.projects as any)?.[0]?.title || (booking.projects as any)?.title})` : (eq.status === 'AVAILABLE' ? 'DISPONÍVEL' : eq.status)
        };
    });

    return JSON.stringify(results);
}

async function listProposals({ status, clientName }: any, supabase: SupabaseClient, organizationId: string) {
    let query = supabase
        .from('proposals')
        .select('id, title, total_value, status, created_at, clients!inner(name)')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (status) query = query.eq('status', status);
    if (clientName) query = query.ilike('clients.name', `%${clientName}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data.length > 0 ? JSON.stringify(data) : 'Nenhuma proposta encontrada.';
}

async function getClientInfo({ name }: any, supabase: SupabaseClient, organizationId: string) {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organizationId)
        .ilike('name', `%${name}%`)
        .limit(3);

    if (error) throw error;
    if (!data || data.length === 0) return 'Cliente não encontrado.';

    // Ocultar dados sensíveis se necessário, mas em CRM interno geralmente mostra tudo
    return JSON.stringify(data);
}
