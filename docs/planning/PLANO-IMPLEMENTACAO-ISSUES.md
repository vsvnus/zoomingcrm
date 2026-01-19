# 🎯 PLANO DE IMPLEMENTAÇÃO - RESOLUÇÃO DE ISSUES
## CRM Zoomer - Melhorias e Correções

**Data:** 13 de Janeiro de 2026
**Status Atual:** Sprints 0, 1, 2 e 3 completos
**Objetivo:** Organizar e implementar melhorias por fases, evitando redundâncias

---

## 📊 ANÁLISE DO ESTADO ATUAL

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO

#### Sprint 0 - Fundação (100% Completo)
- ✅ Capital inicial no cadastro de usuário
- ✅ Sistema de transações financeiras (`financial_transactions`)
- ✅ Cálculo de saldo (Capital Inicial + Receitas - Despesas)
- ✅ Autenticação e multi-tenancy

#### Sprint 1 - Financeiro Core (100% Completo)
- ✅ Dashboard financeiro com KPIs
- ✅ Modal "Nova Despesa" com categorias (Fixas e Variáveis)
- ✅ Listagem de transações com filtros
- ✅ Toggle de senha no cadastro

#### Sprint 2 - Gestão de Recursos (100% Completo)
- ✅ Múltiplas datas de gravação por projeto
- ✅ Múltiplas datas de entrega por projeto
- ✅ Alocação de freelancers com valores customizados
- ✅ Integração automática Freelancer → Contas a Pagar
- ✅ Seletor de equipamentos
- ✅ Lista de projetos abaixo do Kanban

#### Sprint 3 - Orçamentos (100% Completo)
- ✅ ProposalBuilder com 3 abas (Itens, Cronograma, Opcionais)
- ✅ Sistema de cronograma de pagamento
- ✅ Integração automática Proposta → Contas a Receber (ao aceitar)
- ✅ Cálculo de desconto e valor total

### ❌ O QUE NÃO ESTÁ IMPLEMENTADO / PROBLEMAS IDENTIFICADOS

#### 1. Sistema de Contas (Multi-tenant)
- ❌ Sistema usa `org_demo` hardcoded para todos os usuários
- ❌ Cadastro não cria organização isolada por usuário
- ❌ Usuários diferentes veem mesmos dados
- ❌ Aviso de next redirect após criar conta

#### 2. Dashboard
- ❌ Dashboard usa dados mockados (hardcoded)
- ❌ Saldo inicial não aparece nos números corretamente
- ❌ Métricas não refletem dados reais do banco

#### 3. Financeiro
- ❌ Botão "Nova Despesa" não funciona consistentemente
- ❌ Não permite editar status de transações (PENDENTE → PAGO)
- ❌ Não tem seleção livre de datas (date picker)
- ❌ Links de origem (projeto/proposta) dão erro 404
- ❌ Falta marcar se despesa está paga ou não

#### 4. Projetos
- ❌ Página de detalhes do projeto incompleta:
  - Sem aba "Visão Geral" (resumo de todas as informações)
  - Sem botão para adicionar equipamentos na aba equipamentos
  - Sem botão para adicionar custos extras na aba financeiro
  - Custos de freelancers não aparecem na aba financeiro
- ❌ Edição de valor de freelancer não está disponível após alocação
- ❌ Financeiro do projeto não reflete os custos já imputados

#### 5. Propostas
- ❌ Criação de proposta extremamente sucinta
- ❌ Falta detalhamento completo para orçamento profissional
- ❌ Falta página pública bonita para cliente visualizar
- ❌ Botão "Editar Proposta" dá tela preta
- ❌ Campos insuficientes para orçamento completo

#### 6. Calendário
- ❌ Não existe aba de calendário
- ❌ Não sincroniza datas de gravação e entregas
- ❌ Não permite adicionar compromissos extras

---

## 🎯 PLANO DE IMPLEMENTAÇÃO POR FASES

---

## 📦 FASE 1: CORREÇÕES CRÍTICAS (Issues Bloqueadores)
**Prioridade:** 🔴 ALTA
**Tempo Estimado:** Completar primeiro
**Objetivo:** Resolver problemas que impedem o uso básico do sistema

### 1.1 - Sistema de Organizações (Multi-tenant Real)

**Problema:**
- Todos os usuários compartilham mesma organização (`org_demo`)
- Novo cadastro não cria organização isolada
- Dados não são segregados por usuário/empresa

**Solução:**
```typescript
// Modificar src/actions/auth.ts - signUp()
export async function signUp(
  email: string,
  password: string,
  name: string,
  whatsapp: string,
  companyName: string, // NOVO CAMPO
  capitalInicial?: number
) {
  // 1. Criar auth user
  const { data: authUser } = await supabase.auth.signUp({ email, password })

  // 2. Criar organização única
  const orgSlug = `org_${authUser.user.id.slice(0, 8)}`
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      id: orgSlug,
      name: companyName,
      created_at: new Date(),
    })
    .select()
    .single()

  // 3. Criar user vinculado à org
  await supabase.from('users').insert({
    id: authUser.user.id,
    organization_id: org.id,
    name,
    email,
    whatsapp,
    role: 'ADMIN',
  })

  // 4. Criar capital inicial vinculado à org
  if (capitalInicial && capitalInicial > 0) {
    await createInitialCapitalTransaction(org.id, capitalInicial)
  }

  return org.id
}
```

**Arquivos a Modificar:**
- `src/actions/auth.ts` - função `signUp()`
- `src/app/login/page.tsx` - adicionar campo "Nome da Empresa"
- `src/lib/supabase/server.ts` - criar helper `getUserOrganization()`
- Substituir TODOS `'org_demo'` hardcoded por `getUserOrganization()`

**Arquivos a Buscar e Substituir:**
```bash
# Buscar todas as ocorrências de org_demo
grep -r "org_demo" src/
```

**Tarefas:**
- [ ] Adicionar campo "Nome da Empresa" no formulário de cadastro
- [ ] Modificar `signUp()` para criar org única
- [ ] Criar helper `getUserOrganization()` no server.ts
- [ ] Substituir todos `org_demo` por chamada dinâmica
- [ ] Testar: dois usuários devem ter dados completamente isolados

---

### 1.2 - Remover Aviso de Next Redirect

**Problema:**
- Aparece aviso/alert após criar conta

**Solução:**
```typescript
// src/actions/auth.ts
export async function signUp(...) {
  // ... lógica de criação ...

  // REMOVER: return { success: true, message: "Conta criada!" }

  // CORRETO: usar redirect() do Next.js
  redirect('/dashboard')
}
```

**Arquivos a Modificar:**
- `src/actions/auth.ts`
- `src/app/login/page.tsx` - remover tratamento de mensagem de sucesso

**Tarefas:**
- [ ] Remover alert/toast de "Conta criada"
- [ ] Usar apenas `redirect('/dashboard')`
- [ ] Testar: deve redirecionar diretamente sem mensagens

---

### 1.3 - Dashboard com Dados Reais (Não Mockados)

**Problema:**
- Dashboard mostra dados hardcoded
- Saldo inicial não aparece corretamente
- Métricas não refletem banco de dados

**Solução:**
```typescript
// src/app/(dashboard)/dashboard/page.tsx

export default async function DashboardPage() {
  const organizationId = await getUserOrganization()

  // Buscar dados reais
  const summary = await getFinancialSummary(organizationId)
  const recentProjects = await getProjects({ limit: 5 })
  const pendingProposals = await getProposals({ status: 'SENT' })

  return (
    <div>
      {/* Card 1: Saldo */}
      <Card>
        <h3>Saldo em Caixa</h3>
        <p className="text-3xl font-bold">
          {formatCurrency(summary.currentBalance)}
        </p>
        <p className="text-sm text-muted-foreground">
          Capital Inicial: {formatCurrency(summary.initialCapital)}
        </p>
      </Card>

      {/* Card 2: Receitas */}
      <Card>
        <h3>Receitas (Mês)</h3>
        <p className="text-3xl">{formatCurrency(summary.monthlyIncome)}</p>
      </Card>

      {/* Card 3: Despesas */}
      <Card>
        <h3>Despesas (Mês)</h3>
        <p className="text-3xl">{formatCurrency(summary.monthlyExpenses)}</p>
      </Card>

      {/* Card 4: Lucro */}
      <Card>
        <h3>Lucro (Mês)</h3>
        <p className="text-3xl">
          {formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}
        </p>
      </Card>

      {/* Projetos recentes - dados reais */}
      <RecentProjectsList projects={recentProjects} />

      {/* Propostas pendentes - dados reais */}
      <PendingProposalsList proposals={pendingProposals} />
    </div>
  )
}
```

**Arquivos a Criar/Modificar:**
- `src/actions/financeiro.ts` - criar `getFinancialSummary(orgId)`
- `src/app/(dashboard)/dashboard/page.tsx` - reescrever completamente
- `src/components/dashboard/` - criar componentes específicos

**Tarefas:**
- [ ] Criar `getFinancialSummary()` server action
- [ ] Buscar dados reais do banco (saldo, receitas, despesas)
- [ ] Substituir cards mockados por dados dinâmicos
- [ ] Adicionar gráfico de fluxo de caixa mensal
- [ ] Testar: criar despesa e ver refletir no dashboard

---

### 1.4 - Fix Botão "Nova Despesa"

**Problema:**
- Botão não funciona consistentemente

**Investigação Necessária:**
```typescript
// Verificar em src/app/(dashboard)/financeiro/page.tsx
// O dialog está sendo aberto?
// O organizationId está sendo passado?
```

**Solução Provável:**
```typescript
// Garantir que o Dialog tenha trigger correto
<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Nova Despesa
    </Button>
  </DialogTrigger>
  <DialogContent>
    <AddExpenseForm organizationId={organizationId} />
  </DialogContent>
</Dialog>
```

**Tarefas:**
- [ ] Debugar por que botão não abre dialog
- [ ] Verificar se `organizationId` está disponível
- [ ] Testar em produção
- [ ] Adicionar error boundary

---

### 1.5 - Fix Links de Origem (404)

**Problema:**
- Clicar em link de projeto/proposta na aba financeiro dá erro 404

**Solução:**
```typescript
// Em src/components/financeiro/transactions-table.tsx

function TransactionOriginLink({ transaction }) {
  if (transaction.project_id) {
    return (
      <Link href={`/projects/${transaction.project_id}`}>
        Ver Projeto
      </Link>
    )
  }

  if (transaction.proposal_id) {
    return (
      <Link href={`/proposals/${transaction.proposal_id}`}>
        Ver Proposta
      </Link>
    )
  }

  if (transaction.origin === 'CADASTRO') {
    return <span>Capital Inicial</span>
  }

  return <span>Manual</span>
}
```

**Tarefas:**
- [ ] Verificar rotas existentes (/projects/[id], /proposals/[id])
- [ ] Corrigir links com IDs corretos
- [ ] Testar navegação de transação → origem
- [ ] Adicionar fallback se origem não existir

---

## 📦 FASE 2: MELHORIAS FINANCEIRAS
**Prioridade:** 🟡 MÉDIA-ALTA
**Objetivo:** Completar funcionalidades do módulo financeiro

### 2.1 - Editar Status de Transações

**Implementação:**
```typescript
// src/actions/financeiro.ts

export async function updateTransactionStatus(
  transactionId: string,
  newStatus: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('financial_transactions')
    .update({
      status: newStatus,
      updated_at: new Date(),
    })
    .eq('id', transactionId)

  if (error) throw error

  revalidatePath('/financeiro')
  return { success: true }
}
```

**UI - Dropdown de Status:**
```typescript
// src/components/financeiro/transaction-status-dropdown.tsx

<DropdownMenu>
  <DropdownMenuTrigger>
    <Badge variant={statusVariant}>{status}</Badge>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => updateStatus('PENDENTE')}>
      ⏳ Marcar como Pendente
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => updateStatus('CONFIRMADO')}>
      ✅ Marcar como Pago/Recebido
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => updateStatus('CANCELADO')}>
      ❌ Cancelar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Tarefas:**
- [ ] Criar `updateTransactionStatus()` server action
- [ ] Criar componente `TransactionStatusDropdown`
- [ ] Integrar na tabela de Contas a Pagar
- [ ] Integrar na tabela de Contas a Receber
- [ ] Adicionar filtro por status (Todas, Pendentes, Pagas, Canceladas)

---

### 2.2 - Seleção Livre de Datas

**Implementação:**
```typescript
// Usar shadcn/ui DatePicker

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
      <CalendarIcon className="ml-2 h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      locale={ptBR}
    />
  </PopoverContent>
</Popover>
```

**Aplicar em:**
- Modal "Nova Despesa" - campo de vencimento
- Modal "Nova Receita" - campo de vencimento
- Filtros de data na página financeiro

**Tarefas:**
- [ ] Instalar `date-fns` e locale pt-BR
- [ ] Criar componente reutilizável `DatePicker`
- [ ] Substituir inputs de data por DatePicker
- [ ] Adicionar range de datas para filtros

---

### 2.3 - Adicionar Campo "Pago/Recebido"

**Schema já existe:**
- Status: PENDENTE, CONFIRMADO, CANCELADO
- Usar CONFIRMADO como "Pago/Recebido"

**UI Melhorada:**
```typescript
// Adicionar checkbox rápido na tabela

<Checkbox
  checked={transaction.status === 'CONFIRMADO'}
  onCheckedChange={(checked) => {
    updateTransactionStatus(
      transaction.id,
      checked ? 'CONFIRMADO' : 'PENDENTE'
    )
  }}
/>
```

**Tarefas:**
- [ ] Adicionar coluna "Pago" com checkbox na tabela
- [ ] Checkbox sincronizado com status
- [ ] Visual diferente (verde para pago, amarelo para pendente)

---

## 📦 FASE 3: MELHORIAS EM PROJETOS
**Prioridade:** 🟡 MÉDIA
**Objetivo:** Completar gestão de projetos com todas as funcionalidades

### 3.1 - Criar Aba "Visão Geral" no Projeto

**Estrutura da Página:**
```typescript
// src/app/(dashboard)/projects/[id]/page.tsx

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
    <TabsTrigger value="dates">Datas</TabsTrigger>
    <TabsTrigger value="team">Equipe</TabsTrigger>
    <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
    <TabsTrigger value="financial">Financeiro</TabsTrigger>
    <TabsTrigger value="config">Configurações</TabsTrigger>
  </TabsList>

  {/* ABA NOVA: Visão Geral */}
  <TabsContent value="overview">
    <ProjectOverviewTab project={project} />
  </TabsContent>

  {/* ... outras abas ... */}
</Tabs>
```

**Conteúdo da Visão Geral:**
```typescript
// src/components/projects/project-overview-tab.tsx

export function ProjectOverviewTab({ project }) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium">Cliente</dt>
              <dd>{project.client.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Status</dt>
              <dd><StatusBadge status={project.stage} /></dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Responsável</dt>
              <dd>{project.assignedTo?.name || 'Não atribuído'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Orçamento</dt>
              <dd>{formatCurrency(project.budget)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Resumo de Datas de Gravação */}
      <Card>
        <CardHeader>
          <CardTitle>Datas de Gravação ({project.shootingDates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {project.shootingDates.map(date => (
              <li key={date.id} className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(date.date, 'dd/MM/yyyy')} - {date.time}
                {date.location && `- ${date.location}`}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Resumo de Entregas */}
      <Card>
        <CardHeader>
          <CardTitle>Entregas ({project.deliveryDates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {project.deliveryDates.map(delivery => (
              <li key={delivery.id} className="flex items-center gap-2">
                <Checkbox checked={delivery.completed} disabled />
                {format(delivery.date, 'dd/MM/yyyy')} - {delivery.description}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>Orçamento do Projeto:</dt>
              <dd className="font-bold">{formatCurrency(project.budget)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Custos com Equipe:</dt>
              <dd>{formatCurrency(calculateTeamCosts(project))}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Custos com Equipamentos:</dt>
              <dd>{formatCurrency(calculateEquipmentCosts(project))}</dd>
            </div>
            <div className="flex justify-between border-t pt-2">
              <dt className="font-bold">Margem Prevista:</dt>
              <dd className="font-bold text-green-600">
                {formatCurrency(project.budget - totalCosts)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Resumo de Equipe */}
      <Card>
        <CardHeader>
          <CardTitle>Equipe Alocada ({project.freelancerAllocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {project.freelancerAllocations.map(alloc => (
              <li key={alloc.id} className="flex justify-between">
                <span>{alloc.freelancer.name}</span>
                <span className="font-mono">{formatCurrency(alloc.customRate || alloc.freelancer.dailyRate)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Entregáveis Detalhados */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição dos Entregáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{project.deliverables_description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tarefas:**
- [ ] Criar componente `ProjectOverviewTab`
- [ ] Implementar cálculos de custos (equipe + equipamentos)
- [ ] Adicionar aba "Visão Geral" como primeira aba
- [ ] Estilizar com cards organizados
- [ ] Testar com projeto completo (com datas, equipe, equipamentos)

---

### 3.2 - Adicionar Botão "Novo Equipamento" na Aba Equipamentos

**Implementação:**
```typescript
// Na aba Equipamentos do projeto

<TabsContent value="equipment">
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Equipamentos Reservados</h3>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Equipamento
          </Button>
        </DialogTrigger>
        <DialogContent>
          <EquipmentSelector
            projectId={project.id}
            onSuccess={() => {
              // Refresh da lista
            }}
          />
        </DialogContent>
      </Dialog>
    </div>

    {/* Lista de equipamentos já alocados */}
    <EquipmentBookingsList bookings={project.equipmentBookings} />
  </div>
</TabsContent>
```

**Tarefas:**
- [ ] Adicionar botão na aba equipamentos
- [ ] Reutilizar `EquipmentSelector` existente
- [ ] Atualizar lista após adicionar
- [ ] Permitir remover equipamento

---

### 3.3 - Adicionar Botão "Novo Custo" na Aba Financeiro do Projeto

**Implementação:**
```typescript
// Na aba Financeiro do projeto

<TabsContent value="financial">
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Custos do Projeto</h3>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Custo Extra
          </Button>
        </DialogTrigger>
        <DialogContent>
          <ProjectExpenseForm
            projectId={project.id}
            onSuccess={handleExpenseAdded}
          />
        </DialogContent>
      </Dialog>
    </div>

    {/* Tabela de custos */}
    <ProjectCostsTable projectId={project.id} />
  </div>
</TabsContent>
```

**Componente de Formulário:**
```typescript
// src/components/projects/project-expense-form.tsx

export function ProjectExpenseForm({ projectId, onSuccess }) {
  const handleSubmit = async (data) => {
    await addFinancialTransaction({
      organization_id: orgId,
      project_id: projectId,
      type: 'DESPESA',
      origin: 'PROJETO',
      status: 'PENDENTE',
      category: data.category, // LOCATION, POST_PRODUCTION, etc
      description: data.description,
      valor: data.amount,
      transaction_date: new Date(),
      due_date: data.dueDate,
    })

    onSuccess()
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Select name="category">
        <option value="LOCATION">Locação</option>
        <option value="POST_PRODUCTION">Pós-Produção</option>
        <option value="EQUIPMENT_RENTAL">Aluguel de Equipamento Externo</option>
        <option value="LOGISTICS">Logística</option>
        <option value="PRODUCTION">Produção</option>
        <option value="OTHER_EXPENSE">Outro</option>
      </Select>

      <Input name="description" placeholder="Descrição do custo" />
      <Input type="number" name="amount" placeholder="Valor" />
      <DatePicker name="dueDate" />

      <Button type="submit">Adicionar Custo</Button>
    </Form>
  )
}
```

**Tarefas:**
- [ ] Criar `ProjectExpenseForm` component
- [ ] Adicionar botão na aba financeiro
- [ ] Criar transaction vinculada ao projeto
- [ ] Exibir todos os custos do projeto em tabela
- [ ] Incluir custos de freelancers automaticamente

---

### 3.4 - Mostrar Custos de Freelancers na Aba Financeiro do Projeto

**Query para Buscar Todos os Custos:**
```typescript
// src/actions/projects.ts

export async function getProjectFinancialSummary(projectId: string) {
  const supabase = await createClient()

  // Buscar todas as transações vinculadas ao projeto
  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('project_id', projectId)
    .eq('type', 'DESPESA')
    .order('transaction_date', { ascending: false })

  // Calcular totais
  const total = transactions.reduce((sum, t) => sum + t.valor, 0)
  const paid = transactions
    .filter(t => t.status === 'CONFIRMADO')
    .reduce((sum, t) => sum + t.valor, 0)
  const pending = total - paid

  // Agrupar por categoria
  const byCategory = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0
    acc[t.category] += t.valor
    return acc
  }, {})

  return {
    transactions,
    total,
    paid,
    pending,
    byCategory,
  }
}
```

**UI da Aba Financeiro:**
```typescript
// src/components/projects/project-financial-tab.tsx

export function ProjectFinancialTab({ projectId }) {
  const summary = await getProjectFinancialSummary(projectId)

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.total)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.paid)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pending)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Custos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBreakdownChart data={summary.byCategory} />
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detalhamento de Custos</CardTitle>
            <Button onClick={openAddExpenseDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Custo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(transaction.transaction_date, 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={transaction.category} />
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(transaction.valor)}
                  </TableCell>
                  <TableCell>
                    <StatusDropdown
                      transactionId={transaction.id}
                      currentStatus={transaction.status}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => editTransaction(transaction)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tarefas:**
- [ ] Criar `getProjectFinancialSummary()` server action
- [ ] Criar componente `ProjectFinancialTab`
- [ ] Incluir custos de freelancers automaticamente
- [ ] Incluir custos manuais adicionados
- [ ] Permitir editar/marcar como pago
- [ ] Adicionar gráfico de categorias

---

### 3.5 - Permitir Editar Valor de Freelancer Após Alocação

**Já existe no Sprint 2!**
- ✅ Componente `FreelancerSelector` tem edição inline
- ✅ Callback `onPayableUpdate` atualiza financeiro
- ✅ Funcionalidade implementada

**Verificação:**
```typescript
// Em src/components/projects/freelancer-selector.tsx
// Deve existir botão de editar (✏️) ao lado do valor
// Ao editar, deve chamar upsertFreelancerPayable()
```

**Se não estiver funcionando:**
- [ ] Verificar se botão de editar está visível
- [ ] Testar fluxo: alocar → editar valor → verificar em financeiro
- [ ] Debug: ver se `onPayableUpdate` está sendo chamado

---

## 📦 FASE 4: MELHORIAS EM PROPOSTAS
**Prioridade:** 🟡 MÉDIA
**Objetivo:** Transformar propostas em orçamentos profissionais completos

### 4.1 - Expandir Campos da Proposta

**Schema Atual (já está bom):**
- ✅ Título, descrição
- ✅ Itens com descrição, qtd, preço
- ✅ Opcionais
- ✅ Cronograma de pagamento
- ✅ Vídeos portfolio

**Campos Adicionais Sugeridos:**
```typescript
// Adicionar ao ProposalItem (já existe descrição, qty, price)
// Considerar adicionar:
- data_inicio: Date (quando este item será feito)
- data_fim: Date (quando será entregue)
- responsavel: string (quem fará)
```

**Modificação no ProposalBuilder:**
```typescript
// Aba 1: Itens - expandir formulário

<div className="grid grid-cols-2 gap-4">
  <div className="col-span-2">
    <Label>Descrição do Item *</Label>
    <Textarea
      placeholder="Ex: Roteiro e storyboard completo do vídeo institucional"
      rows={3}
    />
  </div>

  <div>
    <Label>Quantidade *</Label>
    <Input type="number" min="1" />
  </div>

  <div>
    <Label>Valor Unitário (R$) *</Label>
    <Input type="number" min="0" step="0.01" />
  </div>

  <div>
    <Label>Data de Início</Label>
    <DatePicker />
  </div>

  <div>
    <Label>Data de Entrega</Label>
    <DatePicker />
  </div>

  <div className="col-span-2">
    <Label>Observações</Label>
    <Input placeholder="Informações adicionais sobre este item" />
  </div>
</div>
```

**Schema da Tabela (Migration):**
```sql
-- Migration: adicionar campos de data em proposal_items
ALTER TABLE proposal_items
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN notes TEXT;
```

**Tarefas:**
- [ ] Criar migration para adicionar campos em `proposal_items`
- [ ] Atualizar `ProposalBuilder` - Aba Itens com campos extras
- [ ] Atualizar tipos TypeScript (`src/types/proposal.ts`)
- [ ] Atualizar server actions para salvar campos novos
- [ ] Exibir na visualização da proposta

---

### 4.2 - Fix Botão "Editar Proposta" (Tela Preta)

**Diagnóstico:**
- Rota `/proposals/[id]/edit` pode não existir ou ter erro

**Verificar:**
```bash
# Ver se existe o arquivo
ls -la src/app/(dashboard)/proposals/[id]/edit/page.tsx
```

**Criar Página de Edição:**
```typescript
// src/app/(dashboard)/proposals/[id]/edit/page.tsx

export default async function EditProposalPage({
  params,
}: {
  params: { id: string }
}) {
  const proposal = await getProposal(params.id)

  if (!proposal) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Proposta</h1>
        <p className="text-muted-foreground">
          Proposta #{proposal.id} - {proposal.title}
        </p>
      </div>

      <ProposalBuilder
        mode="edit"
        proposalId={proposal.id}
        initialData={proposal}
      />
    </div>
  )
}
```

**Atualizar ProposalBuilder para modo Edição:**
```typescript
// src/components/proposals/proposal-builder.tsx

interface ProposalBuilderProps {
  mode?: 'create' | 'edit'
  proposalId?: string
  initialData?: ProposalFormData
  clientId?: string
}

export function ProposalBuilder({
  mode = 'create',
  proposalId,
  initialData,
  clientId,
}: ProposalBuilderProps) {
  // Se mode === 'edit', popular formulário com initialData
  const [formData, setFormData] = useState(initialData || defaultFormData)

  const handleSave = async () => {
    if (mode === 'edit' && proposalId) {
      await updateProposal(proposalId, formData)
    } else {
      await createProposal(formData)
    }
  }

  // ... resto do componente
}
```

**Tarefas:**
- [ ] Criar página `/proposals/[id]/edit/page.tsx`
- [ ] Atualizar `ProposalBuilder` para suportar modo edição
- [ ] Popular formulário com dados existentes
- [ ] Testar: editar proposta e salvar alterações
- [ ] Adicionar botão "Voltar" para lista de propostas

---

### 4.3 - Criar Página Pública da Proposta (Cliente)

**Rota:** `/p/[token]` (já existe na especificação)

**Criar Página:**
```typescript
// src/app/(public)/p/[token]/page.tsx

export default async function PublicProposalPage({
  params,
}: {
  params: { token: string }
}) {
  const proposal = await getProposalByToken(params.token)

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Proposta não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>O link pode estar incorreto ou a proposta foi removida.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Marcar como VIEWED se ainda estiver SENT
  if (proposal.status === 'SENT') {
    await updateProposal(proposal.id, { status: 'VIEWED' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header da Empresa */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-6 px-4">
          {proposal.organization.logo && (
            <img
              src={proposal.organization.logo}
              alt={proposal.organization.name}
              className="h-12"
            />
          )}
          <h2 className="text-xl font-semibold mt-2">
            {proposal.organization.name}
          </h2>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Título e Descrição */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{proposal.title}</CardTitle>
            {proposal.description && (
              <p className="text-muted-foreground mt-2">
                {proposal.description}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Vídeos Portfolio */}
        {proposal.videos && proposal.videos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nosso Portfólio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposal.videos.map(video => (
                  <div key={video.id}>
                    <h4 className="font-medium mb-2">{video.title}</h4>
                    <div className="aspect-video">
                      <iframe
                        src={video.videoUrl}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Itens da Proposta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Itens Inclusos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposal.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Opcionais */}
        {proposal.optionals && proposal.optionals.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Serviços Opcionais</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione os serviços extras que deseja adicionar:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.optionals.map(optional => (
                  <div
                    key={optional.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`optional-${optional.id}`}
                      checked={optional.isSelected}
                      onCheckedChange={(checked) =>
                        toggleProposalOptional(proposal.id, optional.id, checked)
                      }
                    />
                    <label
                      htmlFor={`optional-${optional.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{optional.title}</div>
                      {optional.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {optional.description}
                        </p>
                      )}
                      <div className="mt-2 font-mono font-bold text-green-600">
                        + {formatCurrency(optional.price)}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cronograma de Pagamento */}
        {proposal.paymentSchedule && proposal.paymentSchedule.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cronograma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proposal.paymentSchedule.map((payment, index) => (
                  <li key={payment.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">Parcela {index + 1}:</span>{' '}
                      {payment.description}
                      <div className="text-sm text-muted-foreground">
                        Vencimento: {format(payment.dueDate, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-lg">
                      {formatCurrency(payment.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Resumo de Valores */}
        <Card className="mb-6 border-2 border-primary">
          <CardHeader>
            <CardTitle>Resumo de Investimento</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>Valor Base:</dt>
                <dd className="font-mono">{formatCurrency(proposal.baseValue)}</dd>
              </div>

              {proposal.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Desconto ({proposal.discount}%):</dt>
                  <dd className="font-mono">
                    - {formatCurrency(proposal.baseValue * (proposal.discount / 100))}
                  </dd>
                </div>
              )}

              {selectedOptionalsTotal > 0 && (
                <div className="flex justify-between text-blue-600">
                  <dt>Opcionais Selecionados:</dt>
                  <dd className="font-mono">
                    + {formatCurrency(selectedOptionalsTotal)}
                  </dd>
                </div>
              )}

              <div className="flex justify-between text-2xl font-bold border-t pt-3">
                <dt>VALOR TOTAL:</dt>
                <dd className="font-mono text-green-600">
                  {formatCurrency(proposal.totalValue + selectedOptionalsTotal)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Botão de Aceitar */}
        {proposal.status !== 'ACCEPTED' && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <Button
                size="lg"
                className="w-full"
                onClick={() => handleAcceptProposal(proposal.token)}
              >
                <Check className="mr-2 h-5 w-5" />
                Aceitar Proposta
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Ao aceitar, você concorda com os termos desta proposta.
              </p>
            </CardContent>
          </Card>
        )}

        {proposal.status === 'ACCEPTED' && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700">
                Proposta Aceita!
              </h3>
              <p className="text-muted-foreground mt-2">
                Obrigado pela confiança. Entraremos em contato em breve!
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{proposal.organization.name}</p>
          {proposal.organization.email && (
            <p>{proposal.organization.email}</p>
          )}
          {proposal.organization.phone && (
            <p>{proposal.organization.phone}</p>
          )}
        </div>
      </footer>
    </div>
  )
}
```

**Client-Side para Aceitar:**
```typescript
// src/app/(public)/p/[token]/accept-button.tsx
'use client'

export function AcceptProposalButton({ token }: { token: string }) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)

  const handleAccept = async () => {
    setIsAccepting(true)

    try {
      await acceptProposalPublic(token)
      setIsAccepted(true)
      confetti() // Animação de comemoração
    } catch (error) {
      toast.error('Erro ao aceitar proposta')
    } finally {
      setIsAccepting(false)
    }
  }

  if (isAccepted) {
    return (
      <Card className="bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          <h3 className="text-xl font-bold">Proposta Aceita!</h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleAccept}
      disabled={isAccepting}
    >
      {isAccepting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Aceitando...
        </>
      ) : (
        <>
          <Check className="mr-2 h-5 w-5" />
          Aceitar Proposta
        </>
      )}
    </Button>
  )
}
```

**Tarefas:**
- [ ] Criar layout `(public)` separado do dashboard
- [ ] Criar página `/p/[token]/page.tsx`
- [ ] Implementar visualização completa da proposta
- [ ] Adicionar seleção de opcionais (client-side)
- [ ] Botão de aceitar proposta
- [ ] Animação de confetti ao aceitar
- [ ] Design mobile-first (responsivo)
- [ ] Testar fluxo completo: enviar → visualizar → aceitar → verificar financeiro

---

## 📦 FASE 5: CALENDÁRIO E SINCRONIZAÇÃO
**Prioridade:** 🟢 BAIXA (Futuro)
**Objetivo:** Criar sistema de calendário unificado

### 5.1 - Criar Aba Calendário

**Estrutura:**
```typescript
// src/app/(dashboard)/calendar/page.tsx

export default async function CalendarPage() {
  const organizationId = await getUserOrganization()
  const events = await getCalendarEvents(organizationId)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendário</h1>
        <p className="text-muted-foreground">
          Datas de gravação, entregas e compromissos
        </p>
      </div>

      <Calendar
        events={events}
        onEventClick={handleEventClick}
        onDateClick={handleAddEvent}
      />
    </div>
  )
}
```

**Server Action:**
```typescript
// src/actions/calendar.ts

export async function getCalendarEvents(organizationId: string) {
  const supabase = await createClient()

  // Buscar todas as datas de gravação
  const { data: shootingDates } = await supabase
    .from('shooting_dates')
    .select('*, project:projects(title)')
    .eq('projects.organization_id', organizationId)

  // Buscar todas as datas de entrega
  const { data: deliveryDates } = await supabase
    .from('delivery_dates')
    .select('*, project:projects(title)')
    .eq('projects.organization_id', organizationId)

  // Converter para formato do calendário
  const events = [
    ...shootingDates.map(date => ({
      id: date.id,
      title: `🎬 ${date.project.title}`,
      date: date.date,
      type: 'shooting',
      location: date.location,
      projectId: date.project_id,
    })),
    ...deliveryDates.map(date => ({
      id: date.id,
      title: `📦 ${date.description}`,
      date: date.date,
      type: 'delivery',
      completed: date.completed,
      projectId: date.project_id,
    })),
  ]

  return events
}
```

**Componente de Calendário:**
```typescript
// Usar biblioteca: react-big-calendar ou @fullcalendar/react

import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'

export function Calendar({ events, onEventClick, onDateClick }) {
  return (
    <BigCalendar
      localizer={localizer}
      events={events}
      startAccessor="date"
      endAccessor="date"
      style={{ height: 600 }}
      onSelectEvent={onEventClick}
      onSelectSlot={onDateClick}
      selectable
      views={['month', 'week', 'day']}
      messages={{
        next: "Próximo",
        previous: "Anterior",
        today: "Hoje",
        month: "Mês",
        week: "Semana",
        day: "Dia",
      }}
      eventPropGetter={(event) => {
        let backgroundColor = '#3b82f6' // azul padrão
        if (event.type === 'shooting') backgroundColor = '#6366f1' // roxo
        if (event.type === 'delivery') backgroundColor = '#10b981' // verde
        if (event.type === 'custom') backgroundColor = '#f59e0b' // laranja

        return { style: { backgroundColor } }
      }}
    />
  )
}
```

**Tarefas:**
- [ ] Instalar `react-big-calendar`
- [ ] Criar página `/calendar`
- [ ] Criar `getCalendarEvents()` server action
- [ ] Integrar datas de shooting e delivery
- [ ] Adicionar modelo `CustomEvent` para compromissos extras
- [ ] Permitir criar eventos personalizados
- [ ] Filtros por tipo de evento
- [ ] Sincronizar com datas do projeto

---

## 📦 FASE 6: MELHORIAS UX/UI (Polimento)
**Prioridade:** 🟢 BAIXA (Polimento Final)

### Melhorias Gerais

**6.1 - Configurações de Projeto Completas**
- Seção para adicionar múltiplos vídeos de gravação
- Banners do projeto
- Datas de cada gravação
- Observações e notas

**6.2 - Sistema de Perfis de Usuário**
- Foto de perfil
- Dados pessoais
- Preferências
- Histórico de atividades

**6.3 - Sistema de Times**
- Criar equipes/times
- Atribuir usuários a times
- Permissões por time

**6.4 - Comunicação Interna**
- Chat ou comentários em projetos
- Notificações de mudanças
- @mentions

---

## 📋 RESUMO EXECUTIVO DO PLANO

### Ordem de Implementação Recomendada

```
FASE 1 (CRÍTICO - Fazer Primeiro)
├── 1.1 - Sistema de Organizações Real (multi-tenant)
├── 1.2 - Remover aviso de redirect
├── 1.3 - Dashboard com dados reais
├── 1.4 - Fix botão "Nova Despesa"
└── 1.5 - Fix links de origem (404)

FASE 2 (FINANCEIRO)
├── 2.1 - Editar status de transações
├── 2.2 - Seleção livre de datas
└── 2.3 - Campo pago/recebido

FASE 3 (PROJETOS)
├── 3.1 - Aba Visão Geral
├── 3.2 - Botão adicionar equipamento
├── 3.3 - Botão adicionar custo extra
├── 3.4 - Mostrar custos de freelancers
└── 3.5 - Editar valor de freelancer (verificar)

FASE 4 (PROPOSTAS)
├── 4.1 - Expandir campos da proposta
├── 4.2 - Fix botão editar proposta
└── 4.3 - Página pública da proposta

FASE 5 (CALENDÁRIO - Futuro)
└── 5.1 - Criar aba calendário

FASE 6 (POLIMENTO - Futuro)
└── Melhorias gerais de UX/UI
```

### Métricas de Progresso

| Fase | Total de Tarefas | Estimativa | Prioridade |
|------|------------------|------------|------------|
| Fase 1 | 15 tarefas | 2-3 dias | 🔴 ALTA |
| Fase 2 | 8 tarefas | 1-2 dias | 🟡 MÉDIA |
| Fase 3 | 12 tarefas | 2-3 dias | 🟡 MÉDIA |
| Fase 4 | 10 tarefas | 2-3 dias | 🟡 MÉDIA |
| Fase 5 | 7 tarefas | 1-2 dias | 🟢 BAIXA |
| Fase 6 | Variável | Variável | 🟢 BAIXA |

### O Que Foi Evitado (Redundâncias)

✅ **JÁ EXISTE - NÃO REFAZER:**
- Capital inicial no cadastro
- Sistema de transações financeiras
- Integração freelancer → financeiro
- Integração proposta → financeiro
- Múltiplas datas de gravação/entrega
- Cronograma de pagamento
- Toggle de senha
- Lista de projetos abaixo do Kanban

❌ **NÃO EXISTE - PRECISA FAZER:**
- Multi-tenancy real (problema crítico!)
- Dashboard com dados reais
- Edição de status de transações
- Página pública de proposta
- Aba visão geral do projeto
- Calendário unificado

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### Para Começar Agora:

1. **Confirmar Prioridades:**
   - Qual fase você quer implementar primeiro?
   - Alguma funcionalidade é mais urgente que outras?

2. **Setup Inicial:**
   - Fazer backup do código atual
   - Criar branch para desenvolvimento: `git checkout -b melhorias-fase-1`

3. **Começar Fase 1:**
   - Tarefa 1.1 é CRÍTICA (multi-tenant)
   - Sem isso, múltiplos usuários compartilham dados

4. **Testar Progressivamente:**
   - Após cada funcionalidade, testar isoladamente
   - Não acumular muitas mudanças sem teste

---

**Documento criado em:** 13/01/2026
**Autor:** Claude (Sonnet 4.5)
**Versão:** 1.0
**Status:** Pronto para Implementação
