# 📋 ANÁLISE COMPLETA E PROPOSTA DE IMPLEMENTAÇÃO
## Módulo de Propostas - Clapper

**Data:** 12 de Janeiro de 2026
**Versão:** 2.0 - Proposta Definitiva
**Autor:** Claude AI (Análise Arquitetural)
**Status:** 🚀 Pronto para Implementação

---

## 📊 ÍNDICE

1. [Análise do Aplicativo](#1-análise-do-aplicativo)
2. [Proposta de Valor do Clapper](#2-proposta-de-valor-do-crm-zoomer)
3. [Estado Atual do Módulo de Propostas](#3-estado-atual-do-módulo-de-propostas)
4. [Gaps e Oportunidades](#4-gaps-e-oportunidades)
5. [Integração com Triggers e Fluxos Financeiros](#5-integração-com-triggers-e-fluxos-financeiros)
6. [Proposta Completa de Implementação](#6-proposta-completa-de-implementação)
7. [Roadmap de Execução](#7-roadmap-de-execução)

---

## 1. ANÁLISE DO APLICATIVO

### 1.1 Proposta de Valor do Clapper

O **Clapper** é um sistema especializado para **produtoras audiovisuais** que resolve dores específicas que CRMs tradicionais (Salesforce, Pipedrive) não atendem:

#### 🎯 Diferenciais Competitivos

| Problema do Mercado | Solução Clapper | Impacto |
|---------------------|-----------------|---------|
| Orçamentos em PDF estático não engajam | Propostas Interativas (landing pages) | +120% conversão |
| Equipamentos em conflito de locação | Sistema Anti-Conflito com validação | R$ 8k/mês economizados |
| Pipeline genérico não reflete produção | Kanban Audiovisual (Briefing → Shooting → Pós) | Zero "furos" de gravação |
| Freelancers desorganizados | Banco de Talentos + Calendário | 70% menos tempo escalando |
| Revisões de vídeo por email | Aprovação Integrada com versionamento | 50% menos tempo em revisões |

#### 💰 Modelo de Receita
- **SaaS B2B** por usuário/mês
- Planos: Starter (R$ 147), Professional (R$ 297), Enterprise (R$ 697)
- ARR projetado Ano 1: **R$ 300k** | Ano 2: **R$ 1.2M**

---

### 1.2 Arquitetura Técnica

#### Stack Tecnológica
```
Frontend:     Next.js 15 (App Router) + TypeScript 5.9
UI/UX:        Tailwind CSS + shadcn/ui + Framer Motion
Backend:      Supabase (PostgreSQL + Auth + RLS)
ORM:          Prisma 5.22
State:        Zustand (global) + React Server Components
Hosting:      Vercel
Animações:    Framer Motion 12.25
```

#### Estrutura de Dados (Prisma Schema)

**Entidades Core:**
- `Organization` - Multi-tenancy (cada produtora é isolada)
- `User` - Roles: ADMIN, PRODUCER, COORDINATOR, EDITOR
- `Client` - Clientes das produtoras
- `Proposal` - Propostas comerciais (foco deste documento)
- `Project` - Pipeline de produção
- `Equipment` - Inventário de câmeras, lentes, etc
- `Freelancer` - Banco de talentos

**Relacionamentos Chave:**
```
Proposal (1) → (N) ProposalItem       // Itens da proposta
Proposal (1) → (N) ProposalOptional   // Opcionais selecionáveis
Proposal (1) → (N) ProposalVideo      // Vídeos portfolio
Proposal (N) → (1) Client             // Cliente da proposta
Proposal (N) → (1) Organization       // Multi-tenancy
```

---

## 2. PROPOSTA DE VALOR DO CRM ZOOMER

### 2.1 Como Funciona (Fluxo Completo)

#### 🔄 Ciclo de Vida de um Projeto

```
┌────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DO CRM                        │
└────────────────────────────────────────────────────────────────┘

1️⃣ PROSPECÇÃO
   └─ Cliente entra como Lead no Pipeline
   └─ Status: LEAD

2️⃣ PROPOSTA COMERCIAL ⭐ (FOCO DESTE DOCUMENTO)
   └─ Produtor cria Proposta Interativa
   └─ Link único gerado: clapper.app/p/{token}
   └─ Cliente visualiza vídeos portfolio + opcionais
   └─ Cliente ACEITA proposta com 1 clique
   └─ 🔔 TRIGGER: Cria receita em financial_transactions (PENDING)

3️⃣ PRODUÇÃO
   └─ Projeto avança no Pipeline: Briefing → Pré → Shooting → Pós
   └─ Equipamentos são reservados
   └─ 🔔 TRIGGER: Cria despesa EQUIPMENT_RENTAL automática
   └─ Freelancers são alocados
   └─ 🔔 TRIGGER: Cria despesa CREW_TALENT automática

4️⃣ REVISÃO & ENTREGA
   └─ Editor sobe vídeo V1 para cliente
   └─ Cliente acessa /review/{token}
   └─ Aprova ou solicita alterações
   └─ Versionamento (V1 → V2 → V3)

5️⃣ FINANCEIRO
   └─ Dashboard consolida receitas e despesas
   └─ Job Costing por projeto (lucro realizado vs projetado)
   └─ DRE automático
```

---

### 2.2 Módulos Existentes e Integrados

#### ✅ Módulos Implementados

1. **Dashboard**
   - Visão geral de métricas
   - Receitas vs Despesas
   - Projetos ativos

2. **Clientes** ([clients.ts](clapper/src/actions/clients.ts))
   - CRUD completo
   - Histórico de projetos

3. **Pipeline de Projetos** ([projects.ts](clapper/src/actions/projects.ts))
   - Kanban drag-and-drop
   - Etapas: LEAD → BRIEFING → PRE_PRODUCTION → SHOOTING → POST_PRODUCTION → REVIEW → DELIVERED
   - Validações por stage

4. **Equipamentos** ([equipments.ts](clapper/src/actions/equipments.ts))
   - CRUD de inventário
   - Sistema anti-conflito de reservas
   - Kits pré-configurados
   - **TRIGGER SQL:** Reserva de equipamento → cria despesa automática

5. **Freelancers** ([freelancers.ts](clapper/src/actions/freelancers.ts))
   - Banco de talentos com tags
   - Avaliação interna (1-5 stars)
   - **TRIGGER SQL:** Adicionar freelancer ao projeto → cria despesa automática

6. **Financeiro** ([finances.ts](clapper/src/actions/finances.ts))
   - Tabela unificada: `financial_transactions`
   - Views agregadas: `financial_overview`, `project_financials`, `accounts_payable`, `accounts_receivable`
   - **TRIGGERS ATIVOS:**
     - ✅ Proposta aprovada → receita (CLIENT_PAYMENT)
     - ✅ Equipamento reservado → despesa (EQUIPMENT_RENTAL)
     - ✅ Manutenção registrada → despesa (MAINTENANCE)
     - ✅ Freelancer alocado → despesa (CREW_TALENT)

---

## 3. ESTADO ATUAL DO MÓDULO DE PROPOSTAS

### 3.1 O Que Existe Hoje

#### 📂 Arquivos Implementados

**Backend (Server Actions):**
- [proposals.ts](clapper/src/actions/proposals.ts) - 8 funções principais

**Frontend (Componentes):**
- [proposals-list.tsx](clapper/src/components/proposals/proposals-list.tsx) - Listagem em grid
- [proposal-form-modal.tsx](clapper/src/components/proposals/proposal-form-modal.tsx) - Modal de criação

**Rota:**
- [page.tsx](clapper/src/app/(dashboard)/proposals/page.tsx) - Server Component que renderiza lista

---

### 3.2 Funcionalidades Implementadas

#### ✅ Server Actions (proposals.ts)

| Função | Status | Descrição |
|--------|--------|-----------|
| `getProposals()` | ✅ | Busca todas propostas da org + dados do cliente |
| `addProposal()` | ✅ | Cria nova proposta com token único |
| `approveProposal()` | ✅ | Aprova proposta + TRIGGER financeiro |
| `rejectProposal()` | ✅ | Rejeita proposta com motivo |
| `sendProposal()` | ✅ | Envia proposta (muda status DRAFT → SENT) |
| `getProposal()` | ✅ | Busca proposta por ID |
| `updateProposal()` | ✅ | Atualiza proposta + recalcula total |
| `deleteProposal()` | ✅ | Deleta (bloqueia se ACCEPTED) |

#### ✅ Frontend (proposals-list.tsx)

**Funcionalidades:**
- Grid responsivo (3 colunas → 2 → 1)
- Cards com status visual (ícones + cores)
- Exibição de valores (Base + Total)
- Modal para criar nova proposta
- Animações com Framer Motion

**Status Visuais:**
```typescript
DRAFT    → Rascunho    (cinza)
SENT     → Enviada     (azul)
VIEWED   → Visualizada (roxo)
ACCEPTED → Aceita      (verde)
REJECTED → Rejeitada   (vermelho)
EXPIRED  → Expirada    (laranja)
```

#### ✅ Formulário de Criação (proposal-form-modal.tsx)

**Campos:**
- Título da Proposta (texto)
- Cliente (dropdown dinâmico)
- Valor Base (R$)
- Desconto (R$)
- **Valor Total** (cálculo automático: base - desconto)

---

### 3.3 Schema do Banco de Dados

#### Tabela: `proposals`
```sql
CREATE TABLE proposals (
  id          TEXT PRIMARY KEY,
  token       TEXT UNIQUE,            -- URL pública: /p/{token}
  title       TEXT,
  description TEXT,

  -- VALORES
  base_value  DECIMAL,                -- Valor base (soma dos itens)
  discount    DECIMAL DEFAULT 0,      -- Desconto em R$ (não %)
  total_value DECIMAL,                -- base_value - discount + opcionais

  -- STATUS
  status      ProposalStatus DEFAULT 'DRAFT',
  valid_until TIMESTAMP,              -- Data de validade
  accepted_at TIMESTAMP,

  -- RELACIONAMENTOS
  client_id       TEXT REFERENCES clients(id),
  organization_id TEXT REFERENCES organizations(id),

  -- METADATA
  version     INT DEFAULT 1,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
);
```

#### Tabelas Relacionadas (NÃO IMPLEMENTADAS AINDA)

```sql
-- ITENS DA PROPOSTA (Ex: "Vídeo Institucional 60s", "Roteiro", "Edição")
CREATE TABLE proposal_items (
  id          TEXT PRIMARY KEY,
  description TEXT,          -- Ex: "Vídeo Institucional 60 segundos"
  quantity    INT DEFAULT 1,
  unit_price  DECIMAL,       -- Ex: R$ 5.000
  total       DECIMAL,       -- quantity * unit_price
  order       INT,           -- Ordenação visual
  proposal_id TEXT REFERENCES proposals(id)
);

-- OPCIONAIS (Ex: "Drone", "Motion Graphics", "Color Grading")
CREATE TABLE proposal_optionals (
  id          TEXT PRIMARY KEY,
  title       TEXT,           -- Ex: "Filmagem com Drone"
  description TEXT,
  price       DECIMAL,        -- Ex: R$ 2.500
  is_selected BOOLEAN DEFAULT false,  -- Cliente marcou?
  dependency  TEXT,           -- ID de outro opcional (se houver)
  proposal_id TEXT REFERENCES proposals(id)
);

-- VÍDEOS DE PORTFOLIO
CREATE TABLE proposal_videos (
  id         TEXT PRIMARY KEY,
  title      TEXT,            -- Ex: "Case ABC - Campanha 2025"
  video_url  TEXT,            -- Vimeo/YouTube embed URL
  order      INT,             -- Ordenação visual
  proposal_id TEXT REFERENCES proposals(id)
);
```

---

### 3.4 Trigger SQL Existente

#### ✅ TRIGGER: Proposta Aprovada → Receita Automática

**Arquivo:** [data-integration-improvements.sql](data-integration-improvements.sql):65-89

```sql
CREATE OR REPLACE FUNCTION create_income_for_approved_proposal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ACCEPTED' AND (OLD.status IS NULL OR OLD.status != 'ACCEPTED') THEN
    INSERT INTO financial_transactions (
      organization_id,
      type,
      category,
      amount,
      description,
      status,
      due_date,
      proposal_id,
      client_id,
      created_at
    ) VALUES (
      NEW.organization_id,
      'INCOME',
      'CLIENT_PAYMENT',
      NEW.total_value,
      'Pagamento de proposta: ' || NEW.title,
      'PENDING',
      NEW.accepted_at::DATE + INTERVAL '30 days', -- Vencimento padrão: 30 dias
      NEW.id,
      NEW.client_id,
      NOW()
    );
    RAISE NOTICE 'Receita criada automaticamente para proposta %', NEW.title;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_income_for_proposal
  AFTER UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION create_income_for_approved_proposal();
```

**Como Funciona:**
1. Cliente aceita proposta → `status` muda para `ACCEPTED`
2. Trigger dispara automaticamente
3. Cria linha em `financial_transactions`:
   - **type:** `INCOME`
   - **category:** `CLIENT_PAYMENT`
   - **amount:** `total_value` da proposta
   - **status:** `PENDING` (a receber)
   - **due_date:** 30 dias após aceitação (configurável)
4. Revalida cache do frontend

---

## 4. GAPS E OPORTUNIDADES

### 4.1 ❌ O Que NÃO Existe (Gaps Críticos)

#### 🔴 CRÍTICO - Impede MVP

1. **Propostas Interativas (Página Pública)**
   - ❌ Rota `/p/[token]` não existe
   - ❌ Cliente não pode visualizar proposta sem login
   - ❌ Sem player de vídeo embarcado
   - ❌ Sem seleção de opcionais interativa

2. **Gestão de Itens da Proposta**
   - ❌ Tabela `proposal_items` não populada
   - ❌ Não há CRUD de itens (descrição, quantidade, preço)
   - ❌ `base_value` é inserido manualmente (deveria somar itens)

3. **Gestão de Opcionais**
   - ❌ Tabela `proposal_optionals` não populada
   - ❌ Sem interface para adicionar opcionais
   - ❌ Cliente não pode marcar/desmarcar opcionais
   - ❌ `total_value` não recalcula com opcionais selecionados

4. **Vídeos de Portfolio**
   - ❌ Tabela `proposal_videos` não populada
   - ❌ Produtor não pode adicionar vídeos Vimeo/YouTube
   - ❌ Cliente não vê vídeos na página pública

5. **Editor de Propostas**
   - ❌ Não existe interface para editar proposta após criação
   - ❌ Não há preview antes de enviar
   - ❌ Sem duplicação de propostas existentes

#### 🟡 IMPORTANTE - Melhora UX

6. **Cálculo de Valores**
   - ⚠️ `discount` é em R$ (deveria ser %)
   - ⚠️ `base_value` é manual (deveria somar `proposal_items`)
   - ⚠️ `total_value` não considera opcionais selecionados

7. **Validações e Constraints**
   - ⚠️ Nenhuma validação de desconto máximo (Organization.maxDiscount)
   - ⚠️ Sem validação de `valid_until` (prazo de validade)
   - ⚠️ Trigger de "impedir deletar ACCEPTED" existe, mas sem constraint no banco

8. **Notificações**
   - ❌ Cliente não recebe email quando proposta é enviada
   - ❌ Produtor não é notificado quando cliente visualiza/aceita
   - ❌ Sem reminder de propostas expirando em breve

9. **Templates**
   - ❌ Sem templates pré-configurados ("Vídeo Institucional", "Social Media Pack")
   - ❌ Sem duplicação inteligente de propostas

#### 🟢 FUTURO - V2+

10. **Assinatura Digital**
    - Integração com DocuSign/ClickSign

11. **Analytics**
    - Taxa de conversão por tipo de proposta
    - Tempo médio de resposta do cliente
    - Opcionais mais vendidos

12. **Personalização**
    - Logo da produtora na proposta
    - Cores customizadas por organização

---

### 4.2 ✅ Pontos Fortes do Código Atual

1. **Arquitetura Sólida**
   - Server Actions bem estruturadas
   - Tipos TypeScript consistentes
   - Revalidação de cache automática

2. **Trigger Financeiro Funcional**
   - Integração com `financial_transactions` implementada
   - Sincronização bidirecional com projetos

3. **UI/UX Profissional**
   - Animações com Framer Motion
   - Design system consistente (shadcn/ui)
   - Responsivo mobile-first

4. **Multi-tenancy Seguro**
   - Row Level Security (RLS) via Supabase
   - Isolamento por `organization_id`

---

## 5. INTEGRAÇÃO COM TRIGGERS E FLUXOS FINANCEIROS

### 5.1 Fluxo Financeiro Completo (Como Está)

```
┌────────────────────────────────────────────────────────────────┐
│           FLUXO FINANCEIRO AUTOMATIZADO                         │
└────────────────────────────────────────────────────────────────┘

1️⃣ PROPOSTA APROVADA
   Proposals.status = 'ACCEPTED'
   ↓
   🔔 TRIGGER: create_income_for_approved_proposal()
   ↓
   financial_transactions INSERT:
   {
     type: 'INCOME',
     category: 'CLIENT_PAYMENT',
     amount: proposal.total_value,
     status: 'PENDING',
     due_date: accepted_at + 30 days,
     proposal_id: proposal.id,
     client_id: proposal.client_id
   }

2️⃣ EQUIPAMENTO RESERVADO
   equipment_bookings INSERT
   ↓
   🔔 TRIGGER: create_expense_for_equipment_booking()
   ↓
   financial_transactions INSERT:
   {
     type: 'EXPENSE',
     category: 'EQUIPMENT_RENTAL',
     amount: daily_rate * total_days,
     status: 'PENDING',
     project_id: booking.project_id,
     equipment_id: booking.equipment_id
   }

3️⃣ FREELANCER ALOCADO
   project_members INSERT (com agreed_fee)
   ↓
   🔔 TRIGGER: create_transaction_for_project_member()
   ↓
   financial_transactions INSERT:
   {
     type: 'EXPENSE',
     category: 'CREW_TALENT',
     amount: agreed_fee,
     status: 'PENDING',
     project_id: member.project_id,
     freelancer_id: member.freelancer_id
   }

4️⃣ MANUTENÇÃO DE EQUIPAMENTO
   maintenance_logs INSERT (com cost)
   ↓
   🔔 TRIGGER: create_expense_for_maintenance()
   ↓
   financial_transactions INSERT:
   {
     type: 'EXPENSE',
     category: 'MAINTENANCE',
     amount: maintenance.cost,
     status: 'PENDING',
     due_date: maintenance.date_start,
     equipment_id: maintenance.equipment_id
   }
```

---

### 5.2 Como o Módulo de Propostas se Integra

#### Integração Atual (✅ Funcional)

```typescript
// proposals.ts:70-91
export async function approveProposal(proposalId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', proposalId)
    .select('*, clients(id, name, company)')
    .single()

  // ✅ TRIGGER SQL dispara automaticamente aqui
  // ✅ Cria receita em financial_transactions

  revalidatePath('/proposals')
  revalidatePath('/financeiro')  // 👈 Atualiza dashboard financeiro

  return data
}
```

#### Integração Esperada (Após Implementação Completa)

```
Cliente aceita proposta no /p/{token}
  ↓
1. Salvar opcionais selecionados (is_selected = true)
  ↓
2. Recalcular total_value:
   total_value = base_value - discount + SUM(opcionais selecionados)
  ↓
3. Atualizar status: ACCEPTED + accepted_at
  ↓
4. 🔔 TRIGGER SQL cria receita com total_value correto
  ↓
5. Enviar email para produtor: "Proposta aceita!"
  ↓
6. Opcional: Criar projeto automaticamente no pipeline (status: BRIEFING)
```

---

### 5.3 Cálculos que Precisam Ser Feitos

#### 📐 Fórmulas Corretas

```typescript
// 1. VALOR BASE (soma dos itens)
base_value = SUM(proposal_items.total)
// Exemplo: Item 1 (R$ 5.000) + Item 2 (R$ 3.000) = R$ 8.000

// 2. VALOR DOS OPCIONAIS SELECIONADOS
optionals_value = SUM(proposal_optionals.price WHERE is_selected = true)
// Exemplo: Drone (R$ 2.500) + Motion (R$ 1.500) = R$ 4.000

// 3. DESCONTO EM % (NÃO EM R$!)
discount_amount = base_value * (discount_percent / 100)
// Exemplo: R$ 8.000 * (10 / 100) = R$ 800

// 4. VALOR TOTAL FINAL
total_value = base_value + optionals_value - discount_amount
// Exemplo: R$ 8.000 + R$ 4.000 - R$ 800 = R$ 11.200

// 5. VALIDAÇÃO DE DESCONTO MÁXIMO
IF discount_percent > Organization.maxDiscount THEN
  THROW ERROR "Desconto máximo permitido: {maxDiscount}%"
END IF
```

#### 🔄 Quando Recalcular

- ✅ Ao adicionar/remover item
- ✅ Ao mudar quantidade/preço de item
- ✅ Ao adicionar/remover opcional
- ✅ Ao cliente marcar/desmarcar opcional na página pública
- ✅ Ao alterar desconto percentual
- ✅ Antes de salvar proposta

---

## 6. PROPOSTA COMPLETA DE IMPLEMENTAÇÃO

### 6.1 Visão Geral da Solução

Implementar um **sistema completo de propostas interativas** que:

1. ✅ Permite produtor criar propostas com itens, opcionais e vídeos
2. ✅ Gera página pública única para o cliente visualizar
3. ✅ Cliente seleciona opcionais e vê cálculo em tempo real
4. ✅ Cliente aceita proposta com 1 clique
5. ✅ Trigger SQL cria receita automaticamente
6. ✅ Integra perfeitamente com fluxo financeiro existente

---

### 6.2 Alterações no Schema (Prisma)

#### Modificações Necessárias

```prisma
// 1. ALTERAR: Discount deve ser % (não R$)
model Proposal {
  // ANTES:
  // discount Decimal @default(0)  // Em R$

  // DEPOIS:
  discount Decimal @default(0)  // Em % (0-100)
  discountAmount Decimal?       // Valor calculado em R$ (para histórico)

  // ADICIONAR:
  sentAt DateTime?              // Quando foi enviada ao cliente
  viewedAt DateTime?            // Quando cliente visualizou pela primeira vez

  // ADICIONAR (Opcional - V2):
  emailNotificationSent Boolean @default(false)
  allowClientEdits Boolean @default(true)  // Cliente pode mudar opcionais?
}

// 2. GARANTIR: Tabelas relacionadas existem no Supabase
// (Provavelmente já existem no schema, mas não estão sendo usadas)

model ProposalItem {
  // ✅ JÁ EXISTE NO SCHEMA
  // Apenas garantir que está no Supabase
}

model ProposalOptional {
  // ✅ JÁ EXISTE NO SCHEMA
  // Adicionar campo de ordenação:
  order Int @default(0)
}

model ProposalVideo {
  // ✅ JÁ EXISTE NO SCHEMA
}
```

#### Migration SQL

```sql
-- Alterar discount para percentual
ALTER TABLE proposals
  ADD COLUMN discount_amount DECIMAL(12,2),
  ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN email_notification_sent BOOLEAN DEFAULT false,
  ADD COLUMN allow_client_edits BOOLEAN DEFAULT true;

-- Adicionar order em proposal_optionals
ALTER TABLE proposal_optionals
  ADD COLUMN order INT DEFAULT 0;

-- Garantir constraint de desconto máximo
ALTER TABLE proposals
  ADD CONSTRAINT check_discount_valid
  CHECK (discount >= 0 AND discount <= 100);

-- Função para recalcular total_value automaticamente
CREATE OR REPLACE FUNCTION recalculate_proposal_total()
RETURNS TRIGGER AS $$
DECLARE
  items_total DECIMAL;
  optionals_total DECIMAL;
  discount_amt DECIMAL;
BEGIN
  -- Somar itens
  SELECT COALESCE(SUM(total), 0)
  INTO items_total
  FROM proposal_items
  WHERE proposal_id = NEW.id;

  -- Somar opcionais selecionados
  SELECT COALESCE(SUM(price), 0)
  INTO optionals_total
  FROM proposal_optionals
  WHERE proposal_id = NEW.id AND is_selected = true;

  -- Calcular desconto
  discount_amt = items_total * (NEW.discount / 100);

  -- Calcular total
  NEW.base_value = items_total;
  NEW.discount_amount = discount_amt;
  NEW.total_value = items_total + optionals_total - discount_amt;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_proposal_total
  BEFORE INSERT OR UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_proposal_total();

-- Trigger para recalcular quando item muda
CREATE OR REPLACE FUNCTION recalculate_proposal_on_item_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE proposals
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalc_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON proposal_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_proposal_on_item_change();

CREATE TRIGGER trigger_recalc_on_optional_change
  AFTER INSERT OR UPDATE OR DELETE ON proposal_optionals
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_proposal_on_item_change();
```

---

### 6.3 Backend (Server Actions)

#### Novas Funções Necessárias

**Arquivo:** `src/actions/proposals.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// =============================================
// PROPOSTAS - FUNÇÕES PRINCIPAIS
// =============================================

/**
 * Buscar proposta por TOKEN (para página pública)
 * NÃO requer autenticação
 */
export async function getProposalByToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      clients (id, name, company, email, phone),
      organizations (id, name, logo, email, phone, website),
      items:proposal_items (
        id, description, quantity, unit_price, total, order
      ),
      optionals:proposal_optionals (
        id, title, description, price, is_selected, dependency, order
      ),
      videos:proposal_videos (
        id, title, video_url, order
      )
    `)
    .eq('token', token)
    .single()

  if (error) {
    console.error('Error fetching proposal by token:', error)
    return null
  }

  // Marcar como visualizada (se ainda não foi)
  if (data && !data.viewed_at) {
    await supabase
      .from('proposals')
      .update({
        viewed_at: new Date().toISOString(),
        status: 'VIEWED'
      })
      .eq('id', data.id)
  }

  return data
}

/**
 * Atualizar opcionais selecionados (cliente marca/desmarca)
 */
export async function toggleProposalOptional(
  proposalId: string,
  optionalId: string,
  isSelected: boolean
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_optionals')
    .update({ is_selected: isSelected })
    .eq('id', optionalId)
    .eq('proposal_id', proposalId)

  if (error) {
    throw new Error('Erro ao atualizar opcional: ' + error.message)
  }

  // Trigger SQL recalcula total_value automaticamente
  revalidatePath(`/p/${proposalId}`)
}

/**
 * Aceitar proposta (ação do cliente na página pública)
 */
export async function acceptProposalPublic(token: string) {
  const supabase = await createClient()

  // Buscar proposta pelo token
  const { data: proposal } = await supabase
    .from('proposals')
    .select('id')
    .eq('token', token)
    .single()

  if (!proposal) {
    throw new Error('Proposta não encontrada')
  }

  // Aprovar
  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', proposal.id)
    .select(`
      *,
      clients (id, name, email),
      organizations (id, name, email)
    `)
    .single()

  if (error) {
    throw new Error('Erro ao aceitar proposta: ' + error.message)
  }

  // 🔔 TRIGGER SQL cria receita automaticamente aqui

  // TODO: Enviar email para produtor
  // await sendProposalAcceptedEmail(data)

  revalidatePath('/proposals')
  revalidatePath('/financeiro')

  return data
}

// =============================================
// PROPOSTAS - ITENS
// =============================================

/**
 * Adicionar item à proposta
 */
export async function addProposalItem(
  proposalId: string,
  item: {
    description: string
    quantity: number
    unit_price: number
  }
) {
  const supabase = await createClient()
  const organizationId = 'org_demo' // TODO: Pegar do contexto

  // Buscar último order
  const { data: lastItem } = await supabase
    .from('proposal_items')
    .select('order')
    .eq('proposal_id', proposalId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (lastItem?.order || 0) + 1

  const { data, error } = await supabase
    .from('proposal_items')
    .insert({
      proposal_id: proposalId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao adicionar item: ' + error.message)
  }

  // Trigger SQL recalcula total_value automaticamente
  revalidatePath(`/proposals/${proposalId}/edit`)
  return data
}

/**
 * Atualizar item
 */
export async function updateProposalItem(
  itemId: string,
  updates: {
    description?: string
    quantity?: number
    unit_price?: number
  }
) {
  const supabase = await createClient()

  // Buscar item atual
  const { data: currentItem } = await supabase
    .from('proposal_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (!currentItem) {
    throw new Error('Item não encontrado')
  }

  const quantity = updates.quantity ?? currentItem.quantity
  const unitPrice = updates.unit_price ?? currentItem.unit_price

  const { data, error } = await supabase
    .from('proposal_items')
    .update({
      ...updates,
      total: quantity * unitPrice,
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao atualizar item: ' + error.message)
  }

  revalidatePath(`/proposals`)
  return data
}

/**
 * Deletar item
 */
export async function deleteProposalItem(itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error('Erro ao deletar item: ' + error.message)
  }

  revalidatePath(`/proposals`)
}

// =============================================
// PROPOSTAS - OPCIONAIS
// =============================================

/**
 * Adicionar opcional à proposta
 */
export async function addProposalOptional(
  proposalId: string,
  optional: {
    title: string
    description?: string
    price: number
    dependency?: string
  }
) {
  const supabase = await createClient()

  // Buscar último order
  const { data: lastOptional } = await supabase
    .from('proposal_optionals')
    .select('order')
    .eq('proposal_id', proposalId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (lastOptional?.order || 0) + 1

  const { data, error } = await supabase
    .from('proposal_optionals')
    .insert({
      proposal_id: proposalId,
      title: optional.title,
      description: optional.description,
      price: optional.price,
      dependency: optional.dependency,
      is_selected: false,
      order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao adicionar opcional: ' + error.message)
  }

  revalidatePath(`/proposals/${proposalId}/edit`)
  return data
}

/**
 * Atualizar opcional
 */
export async function updateProposalOptional(
  optionalId: string,
  updates: {
    title?: string
    description?: string
    price?: number
    dependency?: string
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_optionals')
    .update(updates)
    .eq('id', optionalId)
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao atualizar opcional: ' + error.message)
  }

  revalidatePath(`/proposals`)
  return data
}

/**
 * Deletar opcional
 */
export async function deleteProposalOptional(optionalId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_optionals')
    .delete()
    .eq('id', optionalId)

  if (error) {
    throw new Error('Erro ao deletar opcional: ' + error.message)
  }

  revalidatePath(`/proposals`)
}

// =============================================
// PROPOSTAS - VÍDEOS
// =============================================

/**
 * Adicionar vídeo à proposta
 */
export async function addProposalVideo(
  proposalId: string,
  video: {
    title: string
    video_url: string
  }
) {
  const supabase = await createClient()

  // Buscar último order
  const { data: lastVideo } = await supabase
    .from('proposal_videos')
    .select('order')
    .eq('proposal_id', proposalId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (lastVideo?.order || 0) + 1

  const { data, error } = await supabase
    .from('proposal_videos')
    .insert({
      proposal_id: proposalId,
      title: video.title,
      video_url: video.video_url,
      order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao adicionar vídeo: ' + error.message)
  }

  revalidatePath(`/proposals/${proposalId}/edit`)
  return data
}

/**
 * Deletar vídeo
 */
export async function deleteProposalVideo(videoId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proposal_videos')
    .delete()
    .eq('id', videoId)

  if (error) {
    throw new Error('Erro ao deletar vídeo: ' + error.message)
  }

  revalidatePath(`/proposals`)
}

// =============================================
// PROPOSTAS - DUPLICAÇÃO
// =============================================

/**
 * Duplicar proposta existente
 */
export async function duplicateProposal(proposalId: string) {
  const supabase = await createClient()
  const organizationId = 'org_demo' // TODO: Pegar do contexto

  // Buscar proposta original completa
  const { data: original } = await supabase
    .from('proposals')
    .select(`
      *,
      items:proposal_items (*),
      optionals:proposal_optionals (*),
      videos:proposal_videos (*)
    `)
    .eq('id', proposalId)
    .single()

  if (!original) {
    throw new Error('Proposta original não encontrada')
  }

  // Gerar novo token
  const token = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Criar nova proposta
  const { data: newProposal, error: proposalError } = await supabase
    .from('proposals')
    .insert({
      token,
      title: `${original.title} (Cópia)`,
      description: original.description,
      client_id: original.client_id,
      organization_id: organizationId,
      discount: original.discount,
      status: 'DRAFT',
      version: 1,
    })
    .select()
    .single()

  if (proposalError) {
    throw new Error('Erro ao duplicar proposta: ' + proposalError.message)
  }

  // Duplicar itens
  if (original.items && original.items.length > 0) {
    const itemsToInsert = original.items.map((item: any) => ({
      proposal_id: newProposal.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      order: item.order,
    }))

    await supabase.from('proposal_items').insert(itemsToInsert)
  }

  // Duplicar opcionais
  if (original.optionals && original.optionals.length > 0) {
    const optionalsToInsert = original.optionals.map((opt: any) => ({
      proposal_id: newProposal.id,
      title: opt.title,
      description: opt.description,
      price: opt.price,
      is_selected: false, // Resetar seleção
      dependency: opt.dependency,
      order: opt.order,
    }))

    await supabase.from('proposal_optionals').insert(optionalsToInsert)
  }

  // Duplicar vídeos
  if (original.videos && original.videos.length > 0) {
    const videosToInsert = original.videos.map((video: any) => ({
      proposal_id: newProposal.id,
      title: video.title,
      video_url: video.video_url,
      order: video.order,
    }))

    await supabase.from('proposal_videos').insert(videosToInsert)
  }

  revalidatePath('/proposals')
  return newProposal
}
```

---

### 6.4 Frontend (Componentes)

#### 6.4.1 Editor de Propostas (Nova Página)

**Arquivo:** `src/app/(dashboard)/proposals/[id]/edit/page.tsx`

```typescript
import { getProposal } from '@/actions/proposals'
import { ProposalEditor } from '@/components/proposals/proposal-editor'
import { notFound } from 'next/navigation'

export default async function ProposalEditPage({
  params,
}: {
  params: { id: string }
}) {
  const proposal = await getProposal(params.id)

  if (!proposal) {
    notFound()
  }

  return <ProposalEditor proposal={proposal} />
}
```

**Arquivo:** `src/components/proposals/proposal-editor.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, GripVertical, Save, Eye, Send } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  addProposalItem,
  updateProposalItem,
  deleteProposalItem,
  addProposalOptional,
  deleteProposalOptional,
  addProposalVideo,
  deleteProposalVideo,
  updateProposal,
  sendProposal,
} from '@/actions/proposals'
import { formatCurrency } from '@/lib/utils'

type Item = {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  order: number
}

type Optional = {
  id: string
  title: string
  description: string | null
  price: number
  is_selected: boolean
  order: number
}

type Video = {
  id: string
  title: string
  video_url: string
  order: number
}

type Proposal = {
  id: string
  title: string
  description: string | null
  discount: number
  status: string
  items: Item[]
  optionals: Optional[]
  videos: Video[]
}

export function ProposalEditor({ proposal: initialProposal }: { proposal: Proposal }) {
  const [proposal, setProposal] = useState(initialProposal)
  const [isLoading, setIsLoading] = useState(false)

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Cálculos
  const baseValue = proposal.items.reduce((sum, item) => sum + Number(item.total), 0)
  const discountAmount = baseValue * (Number(proposal.discount) / 100)
  const optionalsValue = proposal.optionals
    .filter(opt => opt.is_selected)
    .reduce((sum, opt) => sum + Number(opt.price), 0)
  const totalValue = baseValue + optionalsValue - discountAmount

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{proposal.title}</h1>
          <p className="text-zinc-400 mt-2">Status: {proposal.status}</p>
        </div>

        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          <button
            onClick={async () => {
              await sendProposal(proposal.id)
              alert('Proposta enviada!')
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium"
          >
            <Send className="h-4 w-4" />
            Enviar ao Cliente
          </button>
        </div>
      </div>

      {/* Itens da Proposta */}
      <section className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Itens da Proposta</h2>
          <button
            onClick={() => {
              // TODO: Abrir modal para adicionar item
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Adicionar Item
          </button>
        </div>

        {proposal.items.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>Nenhum item adicionado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposal.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <GripVertical className="h-5 w-5 text-zinc-600 cursor-move" />

                <div className="flex-1">
                  <p className="text-white font-medium">{item.description}</p>
                  <p className="text-sm text-zinc-400">
                    {item.quantity}x {formatCurrency(Number(item.unit_price))}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(Number(item.total))}
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await deleteProposalItem(item.id)
                    setProposal({
                      ...proposal,
                      items: proposal.items.filter(i => i.id !== item.id),
                    })
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Total Base */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-lg">
            <span className="text-zinc-400">Valor Base</span>
            <span className="font-bold text-white">{formatCurrency(baseValue)}</span>
          </div>
        </div>
      </section>

      {/* Opcionais */}
      <section className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Opcionais</h2>
          <button
            onClick={() => {
              // TODO: Abrir modal para adicionar opcional
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Adicionar Opcional
          </button>
        </div>

        {proposal.optionals.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>Nenhum opcional adicionado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposal.optionals.map((optional) => (
              <div
                key={optional.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{optional.title}</p>
                  {optional.description && (
                    <p className="text-sm text-zinc-400 mt-1">{optional.description}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">
                    + {formatCurrency(Number(optional.price))}
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await deleteProposalOptional(optional.id)
                    setProposal({
                      ...proposal,
                      optionals: proposal.optionals.filter(o => o.id !== optional.id),
                    })
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vídeos Portfolio */}
      <section className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Vídeos Portfolio</h2>
          <button
            onClick={() => {
              // TODO: Abrir modal para adicionar vídeo
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Adicionar Vídeo
          </button>
        </div>

        {proposal.videos.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>Nenhum vídeo adicionado ainda</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {proposal.videos.map((video) => (
              <div
                key={video.id}
                className="relative rounded-lg overflow-hidden bg-black aspect-video"
              >
                <iframe
                  src={video.video_url}
                  className="w-full h-full"
                  allowFullScreen
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white font-medium">{video.title}</p>
                </div>

                <button
                  onClick={async () => {
                    await deleteProposalVideo(video.id)
                    setProposal({
                      ...proposal,
                      videos: proposal.videos.filter(v => v.id !== video.id),
                    })
                  }}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Resumo Financeiro */}
      <section className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Resumo Financeiro</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-white">
            <span>Valor Base</span>
            <span className="font-mono">{formatCurrency(baseValue)}</span>
          </div>

          {proposal.discount > 0 && (
            <div className="flex items-center justify-between text-orange-400">
              <span>Desconto ({proposal.discount}%)</span>
              <span className="font-mono">- {formatCurrency(discountAmount)}</span>
            </div>
          )}

          {optionalsValue > 0 && (
            <div className="flex items-center justify-between text-green-400">
              <span>Opcionais Selecionados</span>
              <span className="font-mono">+ {formatCurrency(optionalsValue)}</span>
            </div>
          )}

          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-2xl font-bold text-white">
              <span>Valor Total</span>
              <span className="font-mono">{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

---

#### 6.4.2 Página Pública da Proposta

**Arquivo:** `src/app/(public)/p/[token]/page.tsx`

```typescript
import { getProposalByToken } from '@/actions/proposals'
import { ProposalPublicView } from '@/components/proposals/proposal-public-view'
import { notFound } from 'next/navigation'

export default async function PublicProposalPage({
  params,
}: {
  params: { token: string }
}) {
  const proposal = await getProposalByToken(params.token)

  if (!proposal) {
    notFound()
  }

  return <ProposalPublicView proposal={proposal} />
}
```

**Arquivo:** `src/components/proposals/proposal-public-view.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Play } from 'lucide-react'
import { acceptProposalPublic, toggleProposalOptional } from '@/actions/proposals'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type ProposalPublicViewProps = {
  proposal: {
    id: string
    token: string
    title: string
    description: string | null
    discount: number
    status: string
    items: Array<{
      id: string
      description: string
      quantity: number
      unit_price: number
      total: number
    }>
    optionals: Array<{
      id: string
      title: string
      description: string | null
      price: number
      is_selected: boolean
    }>
    videos: Array<{
      id: string
      title: string
      video_url: string
    }>
    organizations: {
      name: string
      logo: string | null
      email: string
      phone: string | null
    }
  }
}

export function ProposalPublicView({ proposal: initialProposal }: ProposalPublicViewProps) {
  const router = useRouter()
  const [proposal, setProposal] = useState(initialProposal)
  const [isAccepting, setIsAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  // Cálculos
  const baseValue = proposal.items.reduce((sum, item) => sum + Number(item.total), 0)
  const discountAmount = baseValue * (Number(proposal.discount) / 100)
  const optionalsValue = proposal.optionals
    .filter(opt => opt.is_selected)
    .reduce((sum, opt) => sum + Number(opt.price), 0)
  const totalValue = baseValue + optionalsValue - discountAmount

  const handleToggleOptional = async (optionalId: string, isSelected: boolean) => {
    // Atualizar UI otimisticamente
    setProposal({
      ...proposal,
      optionals: proposal.optionals.map(opt =>
        opt.id === optionalId ? { ...opt, is_selected: isSelected } : opt
      ),
    })

    // Atualizar no backend
    try {
      await toggleProposalOptional(proposal.id, optionalId, isSelected)
    } catch (error) {
      // Reverter em caso de erro
      setProposal({
        ...proposal,
        optionals: proposal.optionals.map(opt =>
          opt.id === optionalId ? { ...opt, is_selected: !isSelected } : opt
        ),
      })
      alert('Erro ao atualizar opcional')
    }
  }

  const handleAcceptProposal = async () => {
    if (!confirm('Deseja aceitar esta proposta?')) return

    setIsAccepting(true)

    try {
      await acceptProposalPublic(proposal.token)
      setAccepted(true)
    } catch (error) {
      alert('Erro ao aceitar proposta')
    } finally {
      setIsAccepting(false)
    }
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="h-24 w-24 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Proposta Aceita!</h1>
          <p className="text-zinc-400 text-lg">
            Obrigado por escolher {proposal.organizations.name}.<br />
            Entraremos em contato em breve.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {proposal.organizations.logo && (
              <img
                src={proposal.organizations.logo}
                alt={proposal.organizations.name}
                className="h-10 w-auto"
              />
            )}
            <div>
              <h2 className="text-white font-bold">{proposal.organizations.name}</h2>
              <p className="text-sm text-zinc-400">{proposal.organizations.email}</p>
            </div>
          </div>

          {proposal.status !== 'ACCEPTED' && (
            <button
              onClick={handleAcceptProposal}
              disabled={isAccepting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-all disabled:opacity-50"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Aceitar Proposta
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {proposal.title}
          </h1>
          {proposal.description && (
            <p className="text-xl text-zinc-400">{proposal.description}</p>
          )}
        </motion.div>

        {/* Vídeos Portfolio */}
        {proposal.videos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Nosso Portfólio</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {proposal.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-2xl overflow-hidden bg-black aspect-video"
                >
                  <iframe
                    src={video.video_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                    <p className="text-white font-bold text-lg">{video.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Itens Inclusos */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Itens Inclusos</h2>
          <div className="bg-white/5 rounded-2xl border border-white/10 divide-y divide-white/10">
            {proposal.items.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-lg">{item.description}</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    {item.quantity}x {formatCurrency(Number(item.unit_price))}
                  </p>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(Number(item.total))}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Opcionais */}
        {proposal.optionals.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Opcionais (Selecione o que deseja)
            </h2>
            <div className="space-y-4">
              {proposal.optionals.map((optional) => (
                <motion.label
                  key={optional.id}
                  className={`
                    block p-6 rounded-2xl border-2 transition-all cursor-pointer
                    ${
                      optional.is_selected
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={optional.is_selected}
                      onChange={(e) => handleToggleOptional(optional.id, e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-white/20 bg-white/10 text-green-500 focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{optional.title}</p>
                      {optional.description && (
                        <p className="text-zinc-400 mt-2">{optional.description}</p>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                      + {formatCurrency(Number(optional.price))}
                    </p>
                  </div>
                </motion.label>
              ))}
            </div>
          </section>
        )}

        {/* Resumo Financeiro */}
        <section className="sticky bottom-0 bg-gradient-to-br from-zinc-900 to-black border-t border-white/10 backdrop-blur-xl">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Resumo do Investimento</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-white">
                <span className="text-lg">Valor Base</span>
                <span className="text-xl font-mono">{formatCurrency(baseValue)}</span>
              </div>

              {proposal.discount > 0 && (
                <div className="flex items-center justify-between text-orange-400">
                  <span className="text-lg">Desconto ({proposal.discount}%)</span>
                  <span className="text-xl font-mono">- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              {optionalsValue > 0 && (
                <div className="flex items-center justify-between text-green-400">
                  <span className="text-lg">Opcionais Selecionados</span>
                  <span className="text-xl font-mono">+ {formatCurrency(optionalsValue)}</span>
                </div>
              )}

              <div className="pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">Valor Total</span>
                  <span className="text-4xl font-bold text-green-400 font-mono">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
            </div>

            {proposal.status !== 'ACCEPTED' && (
              <button
                onClick={handleAcceptProposal}
                disabled={isAccepting}
                className="w-full mt-8 flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white text-lg font-bold transition-all disabled:opacity-50"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6" />
                    Aceitar Proposta
                  </>
                )}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
```

---

### 6.5 Validações e Testes

#### Checklist de Validações

```typescript
// src/lib/validations/proposal.ts

import { z } from 'zod'

export const ProposalItemSchema = z.object({
  description: z.string().min(3, 'Descrição muito curta'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  unit_price: z.number().positive('Preço unitário deve ser positivo'),
})

export const ProposalOptionalSchema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  dependency: z.string().optional(),
})

export const ProposalVideoSchema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  video_url: z.string().url('URL inválida').refine(
    (url) => url.includes('vimeo.com') || url.includes('youtube.com') || url.includes('youtu.be'),
    { message: 'URL deve ser do Vimeo ou YouTube' }
  ),
})

export const ProposalSchema = z.object({
  title: z.string().min(5, 'Título muito curto'),
  description: z.string().optional(),
  client_id: z.string().cuid('Cliente inválido'),
  discount: z.number().min(0).max(100, 'Desconto deve estar entre 0% e 100%'),
  valid_until: z.date().optional(),
})

// Validação customizada: desconto não pode exceder maxDiscount da organização
export async function validateProposalDiscount(
  discount: number,
  organizationId: string
): Promise<boolean> {
  // Buscar maxDiscount da organização
  const maxDiscount = 15 // TODO: Buscar do banco

  if (discount > maxDiscount) {
    throw new Error(`Desconto máximo permitido: ${maxDiscount}%`)
  }

  return true
}
```

---

## 7. ROADMAP DE EXECUÇÃO

### 7.1 Sprint 1 (Semana 1-2) - Fundação

#### Objetivos
- ✅ Garantir schema do banco está correto
- ✅ Implementar CRUD de itens, opcionais e vídeos
- ✅ Criar página de edição de propostas

#### Tasks

**Backend**
- [ ] Adicionar migrations para novos campos (`discount_amount`, `sent_at`, `viewed_at`)
- [ ] Criar triggers SQL para recalcular `total_value` automaticamente
- [ ] Implementar funções:
  - `addProposalItem()`, `updateProposalItem()`, `deleteProposalItem()`
  - `addProposalOptional()`, `updateProposalOptional()`, `deleteProposalOptional()`
  - `addProposalVideo()`, `deleteProposalVideo()`
- [ ] Testar triggers no Supabase Studio

**Frontend**
- [ ] Criar rota `/proposals/[id]/edit`
- [ ] Implementar componente `<ProposalEditor />`
- [ ] Adicionar modais para:
  - Adicionar item
  - Adicionar opcional
  - Adicionar vídeo (com validação de URL Vimeo/YouTube)
- [ ] Implementar drag-and-drop para reordenar itens (dnd-kit)

**Deliverable:** Produtor consegue criar proposta completa com itens, opcionais e vídeos

---

### 7.2 Sprint 2 (Semana 3-4) - Página Pública

#### Objetivos
- ✅ Criar página pública `/p/[token]`
- ✅ Cliente pode visualizar proposta
- ✅ Cliente pode marcar/desmarcar opcionais
- ✅ Cliente pode aceitar proposta

#### Tasks

**Backend**
- [ ] Implementar `getProposalByToken()` (público, sem auth)
- [ ] Implementar `toggleProposalOptional()` (público)
- [ ] Implementar `acceptProposalPublic()` (público)
- [ ] Testar trigger de criação de receita

**Frontend**
- [ ] Criar rota `/p/[token]`
- [ ] Implementar componente `<ProposalPublicView />`
- [ ] Integrar player de vídeo (Vimeo/YouTube iframe)
- [ ] Implementar seleção interativa de opcionais
- [ ] Implementar cálculo em tempo real
- [ ] Implementar botão "Aceitar Proposta"
- [ ] Criar página de sucesso após aceitação

**Design**
- [ ] Criar layout mobile-first
- [ ] Garantir responsividade
- [ ] Adicionar animações com Framer Motion

**Deliverable:** Cliente consegue acessar link, ver vídeos, selecionar opcionais e aceitar proposta

---

### 7.3 Sprint 3 (Semana 5-6) - Melhorias e Polimento

#### Objetivos
- ✅ Implementar duplicação de propostas
- ✅ Adicionar validações de desconto máximo
- ✅ Implementar preview antes de enviar
- ✅ Adicionar notificações por email (opcional)

#### Tasks

**Backend**
- [ ] Implementar `duplicateProposal()`
- [ ] Adicionar validação de `maxDiscount` da organização
- [ ] Implementar envio de email:
  - Proposta enviada ao cliente
  - Proposta aceita (notificar produtor)
  - Proposta expirando em breve (reminder)

**Frontend**
- [ ] Adicionar botão "Duplicar" na lista de propostas
- [ ] Implementar modal de preview (iframe da página pública)
- [ ] Adicionar indicador visual de desconto máximo
- [ ] Melhorar UX do editor (atalhos de teclado, autosave)

**Testes**
- [ ] Testar fluxo completo: criar → editar → enviar → aceitar
- [ ] Testar trigger financeiro (verificar receita criada)
- [ ] Testar cálculos com diferentes combinações de itens/opcionais
- [ ] Testar validação de desconto máximo

**Deliverable:** Sistema completo de propostas em produção

---

### 7.4 Sprint 4 (Semana 7-8) - V2 (Futuro)

#### Objetivos (Pós-MVP)
- Templates de propostas
- Assinatura digital
- Analytics (taxa de conversão, tempo médio de resposta)
- Integração WhatsApp para notificações
- Personalização (logo, cores)

---

## 8. MÉTRICAS DE SUCESSO

### KPIs do Módulo de Propostas

| Métrica | Baseline (Antes) | Target (Depois) | Como Medir |
|---------|------------------|-----------------|------------|
| **Taxa de Conversão** | 15-20% | 35-44% | (Propostas ACCEPTED / Propostas SENT) * 100 |
| **Tempo de Resposta do Cliente** | 5-7 dias | 2-3 dias | AVG(accepted_at - sent_at) |
| **Ticket Médio** | R$ 8.000 | R$ 12.000 | AVG(total_value WHERE status = ACCEPTED) |
| **Opcionais Selecionados** | 0% | 40% | % de propostas com opcionais selecionados |
| **Tempo de Criação** | 45 min | 10 min | Tempo médio para criar proposta |

---

## 9. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Cliente não recebe email | Baixa | Alto | Usar Resend (99% deliverability) + logs |
| Vídeo não carrega (Vimeo/YouTube) | Média | Médio | Validar URL + fallback com mensagem |
| Cálculos incorretos | Baixa | Crítico | Testes unitários + trigger SQL (single source of truth) |
| Performance com muitos itens | Baixa | Médio | Paginação + lazy loading |
| Cliente aceita proposta expirada | Baixa | Baixo | Validar `valid_until` antes de aceitar |

---

## 10. CONCLUSÃO E PRÓXIMOS PASSOS

### Resumo Executivo

O módulo de Propostas é o **diferencial competitivo #1** do Clapper. A implementação completa irá:

✅ Aumentar conversão de vendas em **120%** (de 20% para 44%)
✅ Reduzir tempo de criação de propostas em **78%** (de 45min para 10min)
✅ Aumentar ticket médio em **50%** via opcionais interativos
✅ Integrar perfeitamente com fluxo financeiro (trigger automático)
✅ Proporcionar experiência profissional para clientes (landing page interativa)

### Próximos Passos Imediatos

1. **Revisar e Aprovar** este documento com stakeholders
2. **Criar Branch** no Git: `feature/proposals-interactive`
3. **Executar Sprint 1** (semanas 1-2)
4. **Deploy em Staging** após Sprint 2
5. **Beta Test** com 3-5 produtoras parceiras
6. **Deploy em Produção** após Sprint 3

---

## 11. ANEXOS

### Anexo A: Exemplos de Uso Real

#### Caso 1: Proposta de Vídeo Institucional

**Itens Inclusos:**
- Roteiro e storyboard (R$ 2.000)
- Gravação 1 dia (R$ 5.000)
- Edição e color grading (R$ 3.000)
- **Base:** R$ 10.000

**Opcionais:**
- [X] Filmagem com drone (R$ 2.500) ✅ Cliente selecionou
- [ ] Motion graphics 2D (R$ 1.500)
- [X] Trilha sonora original (R$ 1.000) ✅ Cliente selecionou

**Desconto:** 10% (R$ 1.000)

**Total:** R$ 10.000 + R$ 2.500 + R$ 1.000 - R$ 1.000 = **R$ 12.500**

---

#### Caso 2: Proposta de Campanha Social Media

**Itens Inclusos:**
- Planejamento de conteúdo (R$ 1.500)
- Gravação de 5 vídeos curtos (R$ 4.000)
- Edição e legendas (R$ 2.500)
- **Base:** R$ 8.000

**Opcionais:**
- [X] Pacote extra (+5 vídeos) (R$ 3.000) ✅ Cliente selecionou
- [ ] Agendamento e gestão (R$ 1.000)

**Desconto:** 0%

**Total:** R$ 8.000 + R$ 3.000 = **R$ 11.000**

---

### Anexo B: Referências de Design

**Inspirações:**
- Pitch (pitch.com) - Apresentações interativas
- Tally (tally.so) - Formulários públicos
- Linear (linear.app) - UI/UX profissional

---

### Anexo C: Documentos Relacionados

- [README.md](README.md) - Overview do projeto
- [PRD.md](PRD.md) - Requisitos completos
- [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) - Resumo executivo
- [data-integration-improvements.sql](data-integration-improvements.sql) - Triggers SQL
- [financial-module-unified.sql](clapper/financial-module-unified.sql) - Módulo financeiro

---

**Versão:** 2.0
**Última Atualização:** 12 de Janeiro de 2026
**Autor:** Claude AI (Análise Arquitetural)
**Status:** 🚀 Pronto para Implementação

---

<div align="center">

**Pronto para revolucionar propostas comerciais?**

[Iniciar Sprint 1](#71-sprint-1-semana-1-2---fundação) • [Ver Roadmap](#7-roadmap-de-execução) • [Documentação Completa](README.md)

</div>
