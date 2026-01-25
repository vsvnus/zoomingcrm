# ZOOMING CRM - SCHEMA & INTEGRATIONS MAP

> Documento gerado automaticamente para mapear entidades, relacionamentos e automações do sistema.
> **Última atualização:** 2026-01-24

---

## 🏗️ 1. Entidades Principais (Core)

### 🏢 Organization (`organizations`)
- Centraliza todos os dados (Multi-tenant)
- **Campos Chave:** `id` (PK), `initial_capital`
- **Relacionamentos:** Parent de TODAS as outras tabelas.

### 👤 User (`users`)
- Usuários do sistema (Produtores, Admins)
- **Campos Chave:** `id` (PK, TEXTO - vinculado ao Supabase Auth via trigger/code), `role`
- **Integrado com:** Tudo via `created_by` ou `assigned_to`
- **⚠️ Nota:** `id` é TEXT, mas Supabase Auth retorna UUID. Policies devem usar `id = auth.uid()::text`.

### 🤝 Client (`clients`)
- Clientes da produtora
- **Relacionamentos:** 
    - `proposals.client_id`
    - `projects.client_id`
    - `financial_transactions.client_id`

---

## 📜 2. Módulo de Propostas (`proposals`)

**Fluxo:** `DRAFT` -> `SENT` -> `ACCEPTED`

- **Tabelas Filhas:**
    - `proposal_items`: Escopo do trabalho (com `date` opcional)
    - `proposal_optionals`: Adicionais (com preço)
    - `proposal_videos`: Portfolio
- **Automações (Via Server Action `processProposalToProject`):**
    1. **Cria Projeto:** `projects` com status `PRE_PROD`
    2. **Financeiro:** Cria `project_finances` e `financial_transactions` (INCOME, PENDING)
    3. **Calendário:** Cria `calendar_events` para itens com data
    4. **Escopo:** Copia itens para `project_items`

---

## 🎬 3. Módulo de Projetos (`projects`)

**Pipeline:** `BRIEFING` -> `PRE_PROD` -> `SHOOTING` -> `POST_PROD` -> `REVIEW` -> `DONE`

- **Campo `origin`:** Identifica origem do projeto
    - `'manual'`: Criado manualmente (status inicial: BRIEFING)
    - `'proposal'`: Criado via proposta aprovada (status inicial: PRE_PROD)
- **Fluxos de Criação:**
    1. **Manual (Simplificado):** Apenas título + cliente + descrição → Configuração progressiva depois
    2. **Automático (Proposta Aprovada):** Projeto completo com budget, itens, finanças e eventos
- **Estrutura:**
    - `project_members`: Equipe (Freelancers)
    - `project_items`: Escopo de entrega (Vem da proposta ou manual)
    - `project_finances`: Controle de margem e orçamento
- **Integrações:**
    - **Financeiro:** `project_members` gera transação de despesa (Expense) via Trigger `create_transaction_for_project_member`.
    - **Equipamentos:** `equipment_bookings` gera despesa (Equipment Rental) via Trigger `create_expense_for_equipment_booking`.

---

## 👥 3.1. Item Assignments (`item_assignments`)

**Vincula freelancers a itens específicos de propostas e projetos**

- **Campos Principais:**
    - `freelancer_id`: Quem vai executar o trabalho
    - `proposal_item_id`: Vínculo com item da proposta (opcional)
    - `project_item_id`: Vínculo com item do projeto (opcional)
    - `role`: Função (Câmera, Editor, Roteirista...)
    - `agreed_fee`: Cachê combinado (opcional)
    - `scheduled_date`: Data prevista (opcional)
    - `status`: PENDING | IN_PROGRESS | DONE
- **Fluxo:**
    1. Freelancer é vinculado a item na proposta (opcional)
    2. Quando proposta é aprovada, assignments são copiados para project_items
    3. Pode adicionar/modificar assignments diretamente no projeto
- **Views:**
    - `freelancer_work_history`: Histórico de trabalhos do freelancer
    - `freelancer_financial_summary`: Resumo financeiro do freelancer

---

## 💰 4. Módulo Financeiro (`financial_transactions`)

**Centraliza o Fluxo de Caixa**

- **Tipos:** `INCOME` (Receita), `EXPENSE` (Despesa), `INITIAL_CAPITAL`
- **Status:** `PENDING`, `PAID`, `SCHEDULED`
- **Origens Automáticas:**
    - **Proposta Aceita:** Gera `INCOME/PENDING`
    - **Freelancer Alocado:** Gera `EXPENSE/PENDING` (Categoria: CREW_TALENT)
    - **Equipamento Reservado:** Gera `EXPENSE/PENDING` (Categoria: EQUIPMENT_RENTAL)
    - **Manutenção:** Gera `EXPENSE/PENDING` (Categoria: MAINTENANCE)
- **Views:**
    - `financial_overview`: Usada no Dashboard (Inglês ENUMs)
    - `financial_summary`: View legada

---

## 🎥 5. Módulo de Equipamentos (`equipments`)

- **Estrutura:**
    - `equipment_bookings`: Reservas vinculadas a projetos
    - `maintenance_logs`: Histórico de reparos
- **Views de Análise:**
    - `equipment_roi_analysis`: ROI Real (Receita gerada - Manutenção)
    - `equipment_availability`: Calendário de uso

---

## ⚡ 6. Triggers & Automações Ativas (Database)

| Trigger | Tabela Origem | Ação | Descrição |
|---------|---------------|------|-----------|
| `recalculate_proposal_total` | `proposals` | Calc | Atualiza total quando itens mudam |
| `create_expense_for_booking` | `equipment_bookings` | Insert | Cria Despesa Financeira automaticamente |
| `create_expense_for_maintenance` | `maintenance_logs` | Insert | Cria Despesa Financeira automaticamente |
| `create_transaction_for_project_member` | `project_members` | Insert | Cria Despesa Financeira p/ Freelancer |
| `sync_transaction_on_member_update` | `project_members` | Update | Atualiza valor financeiro se cachê mudar |

> **⚠️ Atenção:** O trigger `create_income_for_approved_proposal` foi **DESATIVADO** na migration 11 em favor da lógica via código (`proposals.ts`) para evitar duplicidade e garantir criação correta do projeto.

---

## 🛡️ 7. Segurança (RLS Policies)

- **Padrão Global:** `organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()::text)`
- **Correção Recente:** Adicionado cast `::text` para comparar ID de usuário (TEXT) com Supabase Auth (UUID).

