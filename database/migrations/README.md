# 🗄️ Database Migrations - CRM Zoomer

## 📋 Ordem de Execução

Execute as migrations **NA ORDEM NUMÉRICA** para configurar o banco de dados do zero.

### ✅ Todas as Migrations

| # | Arquivo | Descrição | Status |
|---|---------|-----------|--------|
| 00 | [00-supabase-initial-setup.sql](00-supabase-initial-setup.sql) | Setup inicial do Supabase (tabelas base, auth, RLS) | ✅ Base |
| 01 | [01-sprint-0-financial-foundation.sql](01-sprint-0-financial-foundation.sql) | **Sistema Financeiro Base** - Capital inicial, transações | ✅ Sprint 0 |
| 02 | [02-propostas-module.sql](02-propostas-module.sql) | Módulo de Propostas Comerciais | ✅ Módulo |
| 03 | [03-equipment-module.sql](03-equipment-module.sql) | Gestão de Equipamentos (inventário + aluguel) | ✅ Módulo |
| 04 | [04-projects-enhancement.sql](04-projects-enhancement.sql) | Melhorias no módulo de Projetos | ✅ Enhancement |
| 05 | [05-freelancers-enhancement.sql](05-freelancers-enhancement.sql) | Gestão de Freelancers | ✅ Enhancement |
| 06 | [06-data-integration.sql](06-data-integration.sql) | Integrações entre módulos (propostas ↔ projetos ↔ financeiro) | ✅ Integration |

---

## 🚀 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: https://app.supabase.com/project/SEU_PROJETO/sql
2. Copie e cole o conteúdo de cada migration
3. Clique em **Run**
4. Execute **NA ORDEM** (00 → 01 → 02 → ...)

### Opção 2: Via psql (Terminal)

```bash
# Conectar ao banco
psql "postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres"

# Executar migrations em ordem
\i 00-supabase-initial-setup.sql
\i 01-sprint-0-financial-foundation.sql
\i 02-propostas-module.sql
\i 03-equipment-module.sql
\i 04-projects-enhancement.sql
\i 05-freelancers-enhancement.sql
\i 06-data-integration.sql
```

### Opção 3: Script Automatizado

```bash
# Criar um script para rodar todas de uma vez
for file in migrations/*.sql; do
  psql "sua_connection_string" < "$file"
done
```

---

## 📝 Descrição Detalhada

### 00 - Supabase Initial Setup
**O que faz:**
- Cria tabelas base: `organizations`, `users`, `clients`, `projects`
- Configura autenticação (Supabase Auth)
- Habilita Row Level Security (RLS)
- Cria políticas de segurança base

**Tabelas criadas:**
- `organizations`
- `users`
- `clients`
- `projects`

---

### 01 - Sprint 0 Financial Foundation ⭐
**O que faz:**
- Cria tabela `financial_transactions` (base do sistema financeiro)
- Adiciona ENUMs: `transaction_type`, `transaction_status`, `transaction_origin`
- Implementa função `calculate_current_balance()`
- Cria view `financial_summary` (agregações)
- Função `create_initial_capital_transaction()`
- Trigger para `updated_at`
- RLS para isolamento por organização

**Tabelas criadas:**
- `financial_transactions`

**Campos adicionados:**
- `organizations.initial_capital`
- `organizations.initial_capital_set_at`

**Funções SQL:**
- `calculate_current_balance(org_id)` - Calcula saldo atual
- `create_initial_capital_transaction()` - Cria capital inicial

**Views:**
- `financial_summary` - Resumo financeiro por organização

📖 **Documentação:** [/docs/SPRINT-0-FINANCIAL-IMPLEMENTATION.md](../docs/SPRINT-0-FINANCIAL-IMPLEMENTATION.md)

---

### 02 - Propostas Module
**O que faz:**
- Cria tabela `proposals` (propostas comerciais)
- Sistema de itens de proposta
- Status de aprovação
- Geração de PDFs
- Versionamento

**Tabelas criadas:**
- `proposals`
- `proposal_items`

---

### 03 - Equipment Module
**O que faz:**
- Gestão de equipamentos
- Controle de inventário
- Sistema de aluguel
- Manutenção e histórico

**Tabelas criadas:**
- `equipments`
- `equipment_rentals`

---

### 04 - Projects Enhancement
**O que faz:**
- Melhorias no módulo de projetos
- Timeline de eventos
- Orçamento detalhado
- Status avançados

**Modificações:**
- Novos campos em `projects`
- Views de agregação

---

### 05 - Freelancers Enhancement
**O que faz:**
- Gestão de freelancers/colaboradores
- Especialidades e skills
- Histórico de trabalhos

**Tabelas criadas:**
- `freelancers`
- `freelancer_projects` (join table)

---

### 06 - Data Integration
**O que faz:**
- Integra propostas aprovadas → projetos
- Integra projetos → transações financeiras
- Views consolidadas
- Triggers de sincronização

**Features:**
- Auto-criação de projeto ao aprovar proposta
- Auto-criação de transação financeira ao finalizar projeto
- Dashboard consolidado

---

## ⚠️ Rollback (Reverter Migrations)

Caso precise reverter alguma migration, execute os comandos `DROP` na ordem inversa:

```sql
-- Exemplo: Reverter migration 01 (Financial)
DROP VIEW IF EXISTS financial_summary CASCADE;
DROP FUNCTION IF EXISTS calculate_current_balance(TEXT);
DROP FUNCTION IF EXISTS create_initial_capital_transaction(...);
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
-- ... etc
```

**⚠️ CUIDADO:** Isso **apaga todos os dados** dessas tabelas!

---

## 🧪 Validação

Após executar as migrations, valide com:

```sql
-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar ENUMs
SELECT typname
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;

-- Verificar funções
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🔄 Sincronizar Prisma

Após rodar as migrations, sincronize o Prisma:

```bash
cd /caminho/para/zooming-crm

# Atualizar schema.prisma baseado no banco
npx prisma db pull

# Gerar tipos TypeScript
npx prisma generate
```

---

## 📚 Documentação Relacionada

- **Sprint 0 Financeiro:** [/docs/SPRINT-0-FINANCIAL-IMPLEMENTATION.md](../docs/SPRINT-0-FINANCIAL-IMPLEMENTATION.md)
- **Módulo de Projetos:** [/docs/PROJECTS_MODULE_README.md](../docs/PROJECTS_MODULE_README.md)
- **Setup Geral:** [/docs/INSTALL-MANUAL.md](../docs/INSTALL-MANUAL.md)

---

## 🤔 FAQ

**Q: Posso pular alguma migration?**
A: **NÃO.** Elas têm dependências entre si. Execute todas em ordem.

**Q: Já tenho algumas tabelas no banco, o que fazer?**
A: As migrations usam `IF NOT EXISTS` quando possível, mas revise antes de executar.

**Q: Posso editar as migrations?**
A: Sim, mas mantenha backup. Migrations já executadas não devem ser editadas.

**Q: E os arquivos em `/legacy-sql/`?**
A: **NÃO use.** São versões antigas descontinuadas.

---

**Última atualização:** 2026-01-13
**Versão:** 1.0
