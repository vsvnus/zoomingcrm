# Sprint 1: Estabilidade do Core e Correções Críticas

**Data:** 2026-01-22
**Status:** COMPLETO
**Objetivo:** Garantir que o sistema funcione sem erros e que a interface reaja instantaneamente

---

## Bugs Corrigidos

### BUG 1: Reatividade e Estado (UI não atualiza após criar/editar)

**Problema:** Itens adicionados/editados (Propostas, Freelas, Equipamentos, Contas) só apareciam após F5.

**Correções:**

#### 1a. proposals-list.tsx
- Adicionado estado local `proposals` com `useState`
- Sincronização com `initialProposals` via `useEffect`
- Listener de `visibilitychange` para atualizar ao trocar de aba
- Callback `handleModalClose` que força refresh após fechar modal

**Arquivo:** `src/components/proposals/proposals-list.tsx`

#### 1b. freelancers-grid.tsx + add-freelancer-dialog.tsx
- Adicionado callback `onSuccess` no `AddFreelancerDialog`
- Grid agora recebe e processa novos freelancers imediatamente
- Atualização otimista: freelancer aparece na lista antes do refresh do servidor

**Arquivos:**
- `src/components/freelancers/freelancers-grid.tsx`
- `src/components/freelancers/add-freelancer-dialog.tsx`

#### 1c. payables-tab.tsx + receivables-tab.tsx
- Corrigido bug onde `onUpdate` era chamado com dados antigos
- Agora usa função callback `(prev) => ({...prev, payables: updated})`
- Ao marcar como pago/cancelar, item é removido da lista imediatamente

**Arquivos:**
- `src/components/financeiro/payables-tab.tsx`
- `src/components/financeiro/receivables-tab.tsx`

---

### BUG 2: Erro 500 ao Criar Projeto

**Problema:** Criar projeto com `client_id` vazio causava erro 500 no banco.

**Correções:**

#### Frontend (project-form-modal.tsx)
- Adicionada validação antes do submit
- Verifica se `title` e `client_id` estão preenchidos
- Exibe alert amigável se campos obrigatórios estão vazios

#### Backend (projects.ts)
- Adicionada validação de `title` e `client_id` no `createProject()`
- Mensagem de erro específica retornada ao usuário
- Trim aplicado no título para evitar strings vazias

**Arquivos:**
- `src/components/projects/project-form-modal.tsx`
- `src/actions/projects.ts`

---

### BUG 3: Duplicar Proposta Criava Registro Vazio

**Problema:** Função de duplicar proposta criava registro com valores zerados.

**Correções:**
- Calculado `base_value` a partir dos itens originais
- Calculado `total_value` considerando desconto
- Copiados campos adicionais: `validity_days`, `payment_terms`, `notes`
- Adicionado tratamento de erros para itens/opcionais/vídeos
- Retorna proposta completa com relacionamentos após duplicação

**Arquivo:** `src/actions/proposals.ts` (função `duplicateProposal`)

---

### BUG 4: Gráfico do Dashboard Não Renderizava

**Problema:** Gráfico de fluxo de caixa não mostrava dados mesmo com transações no banco.

**Causa Raiz:** Código usava coluna `transaction_date` que **não existe** no banco. As colunas corretas são `payment_date` e `created_at`.

**Correções:**
- Alterado select para usar `payment_date` e `created_at`
- Removido filtro por `transaction_date`
- Ordenação agora usa `payment_date`
- Processamento usa `payment_date || created_at` para determinar data
- Removido import não utilizado `endOfMonth`

**Arquivo:** `src/actions/dashboard.ts` (função `getCashFlowData`)

---

## Schema do Banco (Referência Atualizada)

A tabela `financial_transactions` usa os seguintes campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `amount` | decimal | Valor da transação |
| `type` | enum | INCOME, EXPENSE, INITIAL_CAPITAL |
| `status` | enum | PAID, PENDING, SCHEDULED, CANCELLED |
| `payment_date` | timestamp | Data do pagamento efetivo |
| `due_date` | timestamp | Data de vencimento |
| `created_at` | timestamp | Data de criação do registro |

**Nota:** O código antigo usava `valor`, `transaction_date`, e tipos em português. O schema atual usa nomes em inglês.

---

## Arquivos Modificados

1. `src/actions/dashboard.ts` - Correção do gráfico
2. `src/actions/projects.ts` - Validação de criação
3. `src/actions/proposals.ts` - Função duplicateProposal
4. `src/components/proposals/proposals-list.tsx` - Reatividade
5. `src/components/freelancers/freelancers-grid.tsx` - Reatividade
6. `src/components/freelancers/add-freelancer-dialog.tsx` - Callback onSuccess
7. `src/components/projects/project-form-modal.tsx` - Validação
8. `src/components/financeiro/payables-tab.tsx` - Optimistic updates
9. `src/components/financeiro/receivables-tab.tsx` - Optimistic updates

---

## Checklist de Validação

- [x] Propostas aparecem imediatamente após criar/editar
- [x] Freelancers aparecem imediatamente após criar
- [x] Contas a pagar/receber atualizam ao marcar como pago
- [x] Criar projeto com cliente obrigatório funciona
- [x] Duplicar proposta copia todos os dados corretamente
- [x] Gráfico do dashboard renderiza dados financeiros

---

## Próximos Passos

O Sprint 1 de estabilidade está completo. Os próximos sprints podem focar em:

1. **Sprint 2:** Melhorias de UX e funcionalidades
2. **Sprint 3:** Integrações e automações
3. **Sprint 4:** Relatórios e analytics

---

**Sprint 1 - Bugfixes Completo!**
