# 📂 Módulo de Projetos - RecFlow

## 🎯 Visão Geral

O módulo de Projetos é o núcleo do RecFlow, orquestrando todo o pipeline de produção audiovisual desde o briefing até a entrega final. Ele se integra nativamente com os módulos de Financeiro, Equipamentos e Freelancers.

---

## 🗄️ Estrutura do Banco de Dados

### 1. Tabela `projects` (Aprimorada)

**Campos Existentes:**
- `id`, `title`, `description`
- `client_id` (FK → clients)
- `assigned_to_id` (FK → users)
- `organization_id` (FK → organizations)
- `created_at`, `updated_at`

**Novos Campos Adicionados:**
- `status` (ENUM) - Substitui `stage`, novos valores:
  - `BRIEFING` - Coleta de requisitos
  - `PRE_PROD` - Pré-produção
  - `SHOOTING` - Gravação
  - `POST_PROD` - Pós-produção
  - `REVIEW` - Revisão com cliente
  - `DONE` - Concluído

- `deadline_date` (TIMESTAMP) - Data de entrega final ao cliente
- `shooting_date` (TIMESTAMP) - Início da gravação
- `shooting_end_date` (TIMESTAMP) - Fim da gravação (para shoots multi-dia)
- `shooting_time` (TEXT) - Horário da gravação

**Metadados Técnicos:**
- `video_format` (TEXT) - Formato: 16:9, 9:16, 1:1, 4:5
- `resolution` (TEXT) - Resolução: 1080p, 4K, 8K
- `drive_folder_link` (TEXT) - Link da pasta do Google Drive
- `script_link` (TEXT) - Link do roteiro

---

### 2. Tabela `project_members` (NOVA - Pivot Table)

Gerencia a equipe de freelancers alocada em cada projeto.

**Campos:**
- `id` (PK)
- `project_id` (FK → projects) CASCADE
- `freelancer_id` (FK → freelancers) CASCADE
- `role` (TEXT) - Ex: "Diretor", "Câmera", "Editor"
- `agreed_fee` (DECIMAL) - Cachê combinado para ESTE projeto
- `status` (TEXT) - Status do convite:
  - `INVITED` - Convidado, aguardando resposta
  - `CONFIRMED` - Confirmado
  - `DECLINED` - Recusou
  - `REMOVED` - Removido da equipe
- `invited_at`, `confirmed_at` (TIMESTAMP)
- `notes` (TEXT) - Observações
- `organization_id` (FK)
- `created_at`, `updated_at`

**Constraints:**
- UNIQUE(project_id, freelancer_id) - Um freelancer não pode ter roles duplicadas no mesmo projeto

**Índices:**
- idx_project_members_project
- idx_project_members_freelancer
- idx_project_members_status

---

### 3. Trigger Automático: Criação de Transação Financeira

Quando um membro é adicionado ao projeto com `agreed_fee` definido:

```sql
CREATE TRIGGER trigger_create_transaction_for_project_member
  AFTER INSERT ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION create_transaction_for_project_member();
```

**O que faz:**
1. Verifica se `agreed_fee` > 0
2. Cria automaticamente um registro em `financial_transactions`:
   - `type` = 'EXPENSE'
   - `category` = 'CREW_TALENT'
   - `status` = 'PENDING'
   - Vinculado ao `project_id` e `freelancer_id`

**Resultado:** Job costing automático - custos de equipe aparecem instantaneamente no financeiro do projeto.

---

### 4. View: `project_team_summary`

Agregação em tempo real da equipe e custos:

```sql
CREATE VIEW project_team_summary AS
SELECT
  p.id AS project_id,
  p.title AS project_title,
  p.status AS project_status,
  COUNT(pm.id) AS total_members,
  COUNT(CASE WHEN pm.status = 'CONFIRMED' THEN 1 END) AS confirmed_members,
  COUNT(CASE WHEN pm.status = 'INVITED' THEN 1 END) AS pending_members,
  COALESCE(SUM(pm.agreed_fee), 0) AS total_crew_cost,
  COALESCE(SUM(CASE WHEN pm.status = 'CONFIRMED' THEN pm.agreed_fee END), 0) AS confirmed_crew_cost,
  json_agg(...) AS team_members
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id;
```

**Uso:** Dashboard de projeto, comparação de custos estimados vs confirmados.

---

## 🔧 Instalação do Schema

1. **Execute o SQL no Supabase SQL Editor:**

```bash
# No diretório raiz do projeto
cat zooming-crm/projects-module-enhancement.sql
```

2. **Copie e cole no Supabase SQL Editor**

3. **Verifique a instalação:**

```sql
-- Verificar novos campos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Verificar tabela project_members
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'project_members'
ORDER BY ordinal_position;

-- Verificar trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_create_transaction_for_project_member';
```

---

## 📦 Estrutura de Arquivos

```
zooming-crm/
├── projects-module-enhancement.sql         # Migration SQL
├── src/
│   ├── types/
│   │   └── projects.ts                    # TypeScript types completos
│   ├── actions/
│   │   └── projects.ts                    # Server Actions (CRUD + Analytics)
│   ├── components/
│   │   └── projects/
│   │       ├── projects-kanban.tsx        # Kanban Board (drag-free)
│   │       └── project-detail-tabs.tsx    # Página de detalhes com 4 abas
│   └── app/
│       └── (dashboard)/
│           └── projects/
│               ├── page.tsx               # Listagem Kanban
│               └── [id]/
│                   └── page.tsx           # Detalhes do projeto
```

---

## 🎨 Funcionalidades Implementadas

### 1. **Kanban Board** (`/projects`)

**Recursos:**
- 6 colunas (BRIEFING → DONE)
- Cards com alertas visuais:
  - 🟣 "Gravação próxima" (próximos 7 dias)
  - 🔴 "Atrasado" (deadline passou)
- Estatísticas por status (cards contador)
- Select dropdown para mudar status (optimistic updates)
- Botão "Ver" → Link para página de detalhes
- Modal "Novo Projeto"

**Tecnologias:**
- Framer Motion (animações)
- Optimistic UI updates
- Server Actions

---

### 2. **Página de Detalhes** (`/projects/[id]`)

**Layout com 4 Abas:**

#### 🏠 Aba 1: Visão Geral
- **Card Informações Gerais:**
  - Cliente (nome, empresa, email)
  - Localização
  - Responsável (assigned_to)

- **Card Cronograma:**
  - Data de gravação (+ range se multi-dia)
  - Deadline de entrega

- **Card Especificações Técnicas:**
  - Formato de vídeo (16:9, 9:16...)
  - Resolução (1080p, 4K, 8K)

- **Card Documentos e Links:**
  - Link para pasta do Google Drive
  - Link para roteiro
  - (Clicáveis, abrem em nova aba)

- **Card Descrição:**
  - Descrição completa do projeto

#### 👥 Aba 2: Equipe
- Lista de membros (`project_members`)
- Para cada membro:
  - Avatar (inicial do nome)
  - Nome do freelancer
  - Role (Diretor, Câmera, etc.)
  - Cachê combinado (agreed_fee)
  - Status (badge colorido: Convidado/Confirmado)
- Botão "Adicionar Membro" (Search Select de freelancers)
- Estado vazio com ilustração

#### 📦 Aba 3: Equipamentos
- **Read-only view** da tabela `equipment_bookings`
- Lista equipamentos reservados para este projeto
- Placeholder para implementação futura

#### 💰 Aba 4: Financeiro (Job Costing)
- Componente de "Job Costing" completo:
  - Receitas (proposal value)
  - Custos (crew, equipment, logistics)
  - Margem de lucro (% e valor)
  - Breakdown por categoria
- Placeholder para integração com módulo financeiro

---

## 🔌 Server Actions Disponíveis

### CRUD de Projetos

```typescript
// Listar todos os projetos
const projects = await getProjects()

// Obter um projeto com relações
const project = await getProject(projectId)

// Criar projeto
const newProject = await createProject({
  title: 'Video Institucional',
  client_id: 'xxx',
  shooting_date: '2025-02-15',
  deadline_date: '2025-03-01',
  video_format: '16:9',
  resolution: '4K',
  // ...
})

// Atualizar projeto
await updateProject(projectId, { status: 'SHOOTING' })

// Atualizar apenas status (atalho)
await updateProjectStatus(projectId, 'POST_PROD')

// Deletar projeto (CASCADE para members)
await deleteProject(projectId)
```

---

### Gerenciamento de Equipe

```typescript
// Listar membros da equipe
const members = await getProjectMembers(projectId)

// Adicionar membro (trigger cria transação automática)
await addProjectMember({
  project_id: projectId,
  freelancer_id: 'xxx',
  role: 'Diretor de Fotografia',
  agreed_fee: 2500.00,
  notes: 'Preferência por shoots externos',
})

// Atualizar membro (ex: confirmar)
await updateProjectMember(memberId, {
  status: 'CONFIRMED',
})

// Remover membro
await removeProjectMember(memberId)
```

---

### Analytics e Views

```typescript
// Dados para Kanban (projetos agrupados por status)
const kanbanData = await getProjectsForKanban()

// Resumo da equipe (view SQL)
const teamSummary = await getProjectTeamSummary(projectId)
// Retorna: total_members, confirmed_members, total_crew_cost, etc.

// Estatísticas gerais
const stats = await getProjectStats()
// Retorna:
// - total_projects, active_projects, completed_projects
// - projects_by_status (object com contagem por status)
// - upcoming_shootings (próximos 7 dias)
// - overdue_projects (deadline passou)
```

---

## 🎭 TypeScript Types

Todos os tipos estão em `src/types/projects.ts`:

```typescript
// Status Enum
type ProjectStatus = 'BRIEFING' | 'PRE_PROD' | 'SHOOTING' | 'POST_PROD' | 'REVIEW' | 'DONE'

// Projeto com cliente (para listagem)
interface ProjectWithClient extends Project {
  clients: {
    id: string
    name: string
    company?: string
  }
}

// Projeto completo (para detalhes)
interface ProjectWithRelations extends Project {
  clients: { ... }
  users?: { ... }
  project_members?: Array<{
    id: string
    role: string
    status: ProjectMemberStatus
    agreed_fee?: number
    freelancers: { ... }
  }>
}

// Utility constants
PROJECT_STATUS_LABELS: Record<ProjectStatus, string>
PROJECT_STATUS_COLORS: Record<ProjectStatus, { bg, text, border }>
```

---

## 🚀 Próximos Passos

### 🔨 Para Implementar:

1. **Modal de Adicionar Membro:**
   - Search Select de freelancers (Shadcn Combobox)
   - Input para role
   - Input para agreed_fee
   - Auto-complete de daily_rate do freelancer

2. **Aba de Equipamentos:**
   - Query `equipment_bookings WHERE project_id = ?`
   - Card com foto, nome, categoria
   - Datas de reserva
   - Status (RESERVED, IN_USE, RETURNED)

3. **Aba Financeiro (Job Costing):**
   - Integrar com view `project_financials`
   - Gráfico de Pizza (custos por categoria)
   - Gráfico de Barras (receita vs custo)
   - Tabela de despesas detalhada

4. **Modal de Editar Projeto:**
   - Form completo com todos os campos
   - Validação com Zod
   - Upload de foto de capa (?)

5. **Drag and Drop no Kanban:**
   - Biblioteca `@hello-pangea/dnd` ou `dnd-kit`
   - Drag para mudar status
   - Animações smooth

6. **Filtros e Busca:**
   - Filtro por status
   - Filtro por cliente
   - Filtro por responsável
   - Busca por título

7. **Notificações:**
   - Lembrete 2 dias antes do shooting
   - Alerta de deadline próximo
   - Notificar freelancer quando convidado

---

## 🔗 Integrações com Outros Módulos

### 1. Módulo Financeiro
- Transações automáticas ao adicionar membros
- View `project_financials` para Job Costing
- Filtro de transações por `project_id`

### 2. Módulo de Equipamentos
- Query `equipment_bookings` por project_id
- Validação de conflitos de reserva
- Cálculo de custos de aluguel

### 3. Módulo de Freelancers
- Search/Select de freelancers disponíveis
- Pull de daily_rate para sugerir agreed_fee
- Query de disponibilidade (`freelancer_availability`)

---

## 📊 Queries Úteis

### 1. Projetos com Gravação na Próxima Semana

```sql
SELECT id, title, shooting_date
FROM projects
WHERE shooting_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY shooting_date ASC;
```

### 2. Projetos Atrasados

```sql
SELECT id, title, deadline_date
FROM projects
WHERE deadline_date < NOW()
  AND status != 'DONE'
ORDER BY deadline_date ASC;
```

### 3. Custo Total de Equipe por Projeto

```sql
SELECT
  p.id,
  p.title,
  SUM(pm.agreed_fee) AS total_crew_cost
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE pm.status = 'CONFIRMED'
GROUP BY p.id, p.title;
```

### 4. Freelancers Mais Alocados

```sql
SELECT
  f.name,
  COUNT(pm.id) AS projects_count,
  SUM(pm.agreed_fee) AS total_earned
FROM freelancers f
JOIN project_members pm ON f.id = pm.freelancer_id
WHERE pm.status = 'CONFIRMED'
GROUP BY f.id, f.name
ORDER BY projects_count DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Erro: "Column 'status' does not exist"
- Execute o migration SQL `projects-module-enhancement.sql`
- O script migra dados de `stage` → `status` automaticamente

### Erro: "Table 'project_members' does not exist"
- Execute o migration SQL completo
- Verifique permissões RLS no Supabase

### Trigger não está criando transações
- Verifique se a function `create_transaction_for_project_member` foi criada
- Check logs do Supabase: SQL Editor → Logs
- Valide que `agreed_fee` > 0

### Tipos TypeScript não estão sendo reconhecidos
- Importe de `@/types/projects` ao invés de definir inline
- Restart do TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")

---

## 📝 Notas de Desenvolvimento

- **Organization ID:** Atualmente hardcoded como `'org_demo'`
  - TODO: Substituir por auth-based org quando implementar autenticação

- **RLS Policies:** Configuradas para `org_demo`
  - TODO: Atualizar para `current_setting('app.current_organization_id')`

- **Campos Deprecados:**
  - `stage` → Mantido para compatibilidade, mas usar `status`
  - Funções `updateProjectStage()` e `addProject()` marcadas como `@deprecated`

- **Performance:**
  - Todos os índices necessários já criados
  - Views são materializadas automaticamente pelo Postgres
  - Use `revalidatePath()` após mutations para ISR

---

## 🎯 Checklist de Implementação

- [x] Migration SQL criada
- [x] Tabela `projects` aprimorada
- [x] Tabela `project_members` criada
- [x] Trigger financeiro implementado
- [x] View `project_team_summary` criada
- [x] Tipos TypeScript completos
- [x] Server Actions (CRUD + Analytics)
- [x] Kanban Board funcional
- [x] Página de detalhes com 4 abas
- [x] Aba Visão Geral completa
- [x] Aba Equipe (leitura)
- [ ] Modal adicionar membro
- [ ] Aba Equipamentos (integração bookings)
- [ ] Aba Financeiro (Job Costing)
- [ ] Drag and Drop no Kanban
- [ ] Filtros e busca
- [ ] Notificações

---

## 📚 Referências

- [Supabase Docs - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js 15 - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Framer Motion](https://www.framer.com/motion/)
- [Shadcn UI](https://ui.shadcn.com/)

---

**Desenvolvido para o RecFlow CRM** 🎬
