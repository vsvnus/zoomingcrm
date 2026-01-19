# 🔷 O Que É o Prisma?

**Prisma** é um **ORM (Object-Relational Mapper)** moderno para Node.js e TypeScript.

---

## 🎯 O Que Ele Faz?

### Em Termos Simples:
**Prisma traduz seu banco de dados PostgreSQL em código TypeScript**.

Ao invés de escrever SQL diretamente:
```sql
SELECT * FROM projects WHERE organization_id = 'org_123';
```

Você escreve TypeScript type-safe:
```typescript
const projects = await prisma.project.findMany({
  where: { organizationId: 'org_123' }
})
// ✅ TypeScript sabe exatamente quais campos existem
// ✅ Autocomplete no VS Code
// ✅ Erros de tipo em tempo de compilação
```

---

## 🏗️ Arquitetura do Prisma no CRM Zoomer

```
┌─────────────────────────────────────────┐
│  PostgreSQL (Supabase)                  │
│  - Tabelas reais                        │
│  - Organizations, Users, Projects, etc  │
└──────────────┬──────────────────────────┘
               │
               │ 1. Você cria/modifica via SQL migrations
               ▼
┌─────────────────────────────────────────┐
│  schema.prisma                          │
│  - Arquivo que DESCREVE o banco         │
│  - Models sincronizados com as tabelas  │
│  - Enums, relacionamentos, índices      │
└──────────────┬──────────────────────────┘
               │
               │ 2. prisma generate
               ▼
┌─────────────────────────────────────────┐
│  @prisma/client (node_modules)          │
│  - Cliente TypeScript gerado            │
│  - Tipos automáticos                    │
│  - Query builder type-safe              │
└──────────────┬──────────────────────────┘
               │
               │ 3. Você usa no código
               ▼
┌─────────────────────────────────────────┐
│  src/actions/*.ts                       │
│  import { prisma } from '@/lib/prisma'  │
│  await prisma.project.create(...)       │
└─────────────────────────────────────────┘
```

---

## 📁 Arquivo: `schema.prisma`

Este arquivo é o **"blueprint"** do seu banco de dados.

**Localização:** `/prisma/schema.prisma`

### O Que Ele Contém?

```prisma
// 1. CONFIGURAÇÃO
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 2. MODELS (representa tabelas)
model Project {
  id          String   @id @default(cuid())
  title       String
  description String?

  clientId    String
  client      Client   @relation(...)

  createdAt   DateTime @default(now())

  @@map("projects")  // Nome real da tabela no banco
}

// 3. ENUMS
enum ProjectStage {
  LEAD
  BRIEFING
  SHOOTING
  DELIVERED
}
```

---

## 🔄 Fluxo de Trabalho

### Cenário 1: Você Criou uma Migration SQL

Você executou uma migration SQL que criou a tabela `financial_transactions`:

```sql
CREATE TABLE financial_transactions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  type transaction_type NOT NULL,
  valor DECIMAL(12,2),
  ...
);
```

**Agora precisa sincronizar o Prisma:**

```bash
# 1. Atualizar schema.prisma baseado no banco
npx prisma db pull

# 2. Gerar cliente TypeScript
npx prisma generate
```

**O que acontece:**
- `db pull` → Lê o banco e atualiza `schema.prisma`
- `generate` → Cria tipos TypeScript em `node_modules/@prisma/client`

---

### Cenário 2: Você Quer Usar o Prisma no Código

```typescript
// src/actions/financeiro.ts
import { createClient } from '@/lib/supabase/server'

export async function getProjects(orgId: string) {
  const supabase = await createClient()

  // Jeito 1: SQL direto via Supabase
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId)

  // Jeito 2: Prisma (type-safe)
  // const projects = await prisma.project.findMany({
  //   where: { organizationId: orgId }
  // })
}
```

**Por que usar Prisma?**
- ✅ **Type-safety**: TypeScript sabe todos os campos
- ✅ **Autocomplete**: VS Code sugere campos e relações
- ✅ **Validação**: Erros em tempo de compilação, não runtime
- ✅ **Relações**: Fácil buscar dados relacionados

```typescript
// Buscar projeto COM cliente e transações
const project = await prisma.project.findUnique({
  where: { id: 'proj_123' },
  include: {
    client: true,
    financialTransactions: true
  }
})

// TypeScript sabe que:
// project.client.name existe ✅
// project.financialTransactions[0].valor existe ✅
```

---

## ⚡ Comandos Principais

### 1. `npx prisma db pull`
**O que faz:** Lê o banco de dados e atualiza o `schema.prisma`

**Quando usar:**
- Você executou migrations SQL manualmente
- Outra pessoa alterou o banco
- Quer sincronizar o schema com o estado atual do banco

```bash
npx prisma db pull
```

**Resultado:**
```
✔ Introspected 15 models and wrote them into prisma/schema.prisma in 2.1s
```

---

### 2. `npx prisma generate`
**O que faz:** Gera o cliente TypeScript baseado no `schema.prisma`

**Quando usar:**
- Após fazer `db pull`
- Após editar manualmente o `schema.prisma`
- Quando os tipos TypeScript estão desatualizados

```bash
npx prisma generate
```

**Resultado:**
```
✔ Generated Prisma Client (v5.22.0) in 1.2s
```

---

### 3. `npx prisma studio`
**O que faz:** Abre uma interface web para visualizar/editar dados

```bash
npx prisma studio
```

**Abre em:** http://localhost:5555

Interface visual para:
- Ver registros de todas as tabelas
- Adicionar/editar/deletar dados manualmente
- Explorar relacionamentos

---

### 4. `npx prisma format`
**O que faz:** Formata o arquivo `schema.prisma`

```bash
npx prisma format
```

---

### 5. `npx prisma validate`
**O que faz:** Valida se o `schema.prisma` está correto

```bash
npx prisma validate
```

---

## 🔧 Como Está Configurado no CRM Zoomer

### Arquivo: `.env.local`
```env
# Supabase Connection
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

- `DATABASE_URL` → Usado para queries (via connection pooler)
- `DIRECT_URL` → Usado para migrations (conexão direta)

### Arquivo: `prisma/schema.prisma`

Já está sincronizado com as tabelas atuais! ✅

Contém:
- 23 models (Organization, User, Client, Project, Proposal, Equipment, etc)
- 12 enums (UserRole, ProjectStage, ProposalStatus, etc)
- **FinancialTransaction** (Sprint 0) ✅

---

## ✅ O Que Fazer Agora?

### Seu Prisma JÁ ESTÁ sincronizado!

Verifiquei e o `schema.prisma` já contém o modelo `FinancialTransaction` completo:

```prisma
model FinancialTransaction {
  id              String            @id @default(cuid())
  organizationId  String
  organization    Organization      @relation(...)

  type            TransactionType   // CAPITAL_INICIAL, RECEITA, DESPESA
  origin          TransactionOrigin // CADASTRO, PROJETO, MANUAL
  status          TransactionStatus // CONFIRMADO, PENDENTE, AGENDADO

  valor           Decimal           @db.Decimal(12, 2)
  description     String
  // ... todos os campos

  @@map("financial_transactions")
}
```

### ✅ Apenas Execute Isto Para Garantir:

```bash
cd /Users/viniciuspimentel/ProjetosDev/CRM\ ZOOMER/zooming-crm

# Gerar cliente atualizado (caso não esteja)
npx prisma generate
```

Pronto! Agora você pode usar no código:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Exemplo: Buscar saldo financeiro
const transactions = await prisma.financialTransaction.findMany({
  where: {
    organizationId: 'org_123',
    status: 'CONFIRMADO'
  }
})
```

---

## 🆚 Prisma vs Supabase Client

### No CRM Zoomer você usa os DOIS:

| | Supabase Client | Prisma |
|---|---|---|
| **Onde usar** | Server Actions, APIs | Qualquer código Node.js |
| **Type-safety** | ⚠️ Parcial (precisa tipar manualmente) | ✅ Total (tipos gerados automaticamente) |
| **RLS (Row Level Security)** | ✅ Respeita (usa auth.uid()) | ❌ Bypassa (usa service role) |
| **Uso no projeto** | Auth, queries com RLS | Lógica de negócio, cálculos |

**Recomendação:**
- Use **Supabase Client** quando precisa de RLS (dados por usuário/organização)
- Use **Prisma** para operações administrativas, migrações, scripts

---

## 📚 Docs Oficiais

- **Prisma:** https://www.prisma.io/docs
- **Prisma + Supabase:** https://supabase.com/docs/guides/database/prisma

---

## 🐛 Troubleshooting

### Erro: "Type 'X' is not assignable"
**Causa:** Cliente Prisma desatualizado
**Solução:**
```bash
npx prisma generate
```

### Erro: "Unknown field 'campo_novo'"
**Causa:** Schema não sincronizado com o banco
**Solução:**
```bash
npx prisma db pull
npx prisma generate
```

### Erro ao conectar
**Causa:** Variáveis de ambiente erradas
**Solução:** Verifique `.env.local`:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

---

**Agora você sabe o que é o Prisma! 🎉**

É basicamente seu **TypeScript ORM** que torna trabalhar com o banco muito mais seguro e produtivo.
