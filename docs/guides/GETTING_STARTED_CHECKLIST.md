# Checklist de Início - Zooming CRM
## Lista de Verificação para Começar o Desenvolvimento

Use este checklist para garantir que tudo está configurado corretamente antes de começar a codificar.

---

## ✅ Fase 1: Revisão da Documentação (30 min)

- [ ] Li e entendi o [PRD.md](PRD.md) completo
- [ ] Revisei a [ARCHITECTURE.md](ARCHITECTURE.md) e concordo com as decisões técnicas
- [ ] Analisei o [DATABASE_ERD.md](DATABASE_ERD.md) e entendo as relações
- [ ] Li o [SETUP.md](SETUP.md) para saber os próximos passos
- [ ] Revisei [BEST_PRACTICES.md](BEST_PRACTICES.md) para seguir convenções

**Decisão:** Stack aprovada? (Next.js + Supabase + Prisma + shadcn/ui)
- [ ] Sim, prosseguir
- [ ] Não, preciso revisar alternativas

---

## ✅ Fase 2: Preparação do Ambiente (1h)

### 2.1 Software Necessário

- [ ] **Node.js v18+** instalado
  ```bash
  node --version  # deve retornar v18 ou superior
  ```

- [ ] **pnpm** instalado (mais rápido que npm)
  ```bash
  npm install -g pnpm
  pnpm --version  # deve retornar v8+
  ```

- [ ] **Git** configurado
  ```bash
  git --version
  git config --global user.name "Seu Nome"
  git config --global user.email "seu@email.com"
  ```

- [ ] **VS Code** com extensões:
  - [ ] Prisma (prisma.prisma)
  - [ ] Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
  - [ ] ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
  - [ ] Pretty TypeScript Errors (yoavbls.pretty-ts-errors)

### 2.2 Criar Conta no Supabase

- [ ] Acessei [supabase.com](https://supabase.com) e criei conta
- [ ] Criei novo projeto:
  - Nome: **Zooming CRM**
  - Database Password: _________________ (guardar em gerenciador de senhas)
  - Region: **South America (São Paulo)**
  - Pricing Plan: **Free** (para desenvolvimento)

- [ ] Aguardei ~2 minutos até projeto ficar verde (Ready)

- [ ] Copiei credenciais (Settings → API):
  - [ ] Project URL: `https://____________.supabase.co`
  - [ ] `anon public` key: `eyJh...`
  - [ ] `service_role` key: `eyJh...` (NUNCA commitar)

- [ ] Copiei Database URL (Settings → Database → Connection String):
  - [ ] URI (Connection Pooling): `postgresql://postgres...`

---

## ✅ Fase 3: Inicialização do Projeto (30 min)

### 3.1 Criar Projeto Next.js

```bash
cd "/Users/viniciuspimentel/ProjetosDev/CRM ZOOMER"

pnpm create next-app@latest zooming-crm \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias "@/*"
```

**Checklist das respostas:**
- [ ] TypeScript? **Yes**
- [ ] ESLint? **Yes**
- [ ] Tailwind CSS? **Yes**
- [ ] `src/` directory? **Yes**
- [ ] App Router? **Yes**
- [ ] Customize import alias? **No**

```bash
cd zooming-crm
```

### 3.2 Copiar Arquivos de Configuração

- [ ] Copiar `prisma/schema.prisma` para o projeto
  ```bash
  mkdir -p prisma
  cp "../prisma/schema.prisma" ./prisma/
  ```

- [ ] Copiar `.env.example` e renomear para `.env.local`
  ```bash
  cp "../.env.example" ./.env.local
  ```

- [ ] Preencher `.env.local` com credenciais do Supabase:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
  SUPABASE_SERVICE_ROLE_KEY=eyJh...
  DATABASE_URL="postgresql://postgres..."
  DIRECT_URL="postgresql://postgres..."
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

### 3.3 Instalar Dependências

```bash
# Dependências de produção
pnpm add @prisma/client @supabase/supabase-js @supabase/ssr
pnpm add zustand @tanstack/react-query
pnpm add zod react-hook-form @hookform/resolvers
pnpm add date-fns clsx tailwind-merge
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add lucide-react class-variance-authority

# Dependências de desenvolvimento
pnpm add -D prisma
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D vitest @vitejs/plugin-react
```

**Checklist:**
- [ ] Todas as dependências instaladas sem erros
- [ ] `node_modules/` criado
- [ ] `pnpm-lock.yaml` gerado

---

## ✅ Fase 4: Configurar Database (15 min)

### 4.1 Gerar Cliente Prisma

```bash
pnpm prisma generate
```

- [ ] Comando executado com sucesso
- [ ] `node_modules/@prisma/client` criado

### 4.2 Criar Migration Inicial

```bash
pnpm prisma migrate dev --name init
```

**Possíveis problemas:**
- ❌ "Can't reach database server"
  - Verificar se `DATABASE_URL` no `.env.local` está correta
  - Confirmar que IP está liberado no Supabase

- [ ] Migration criada em `prisma/migrations/`
- [ ] Tabelas criadas no Supabase (verificar em Database → Tables)

### 4.3 (Opcional) Seed com Dados Fake

- [ ] Criar arquivo `prisma/seed.ts` (conteúdo no SETUP.md)
- [ ] Adicionar script no `package.json`:
  ```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
  ```
- [ ] Instalar `tsx`: `pnpm add -D tsx`
- [ ] Rodar seed: `pnpm prisma db seed`

---

## ✅ Fase 5: shadcn/ui (15 min)

### 5.1 Inicializar shadcn/ui

```bash
pnpm dlx shadcn-ui@latest init
```

**Respostas:**
- [ ] Style: **Default**
- [ ] Base color: **Slate**
- [ ] CSS variables: **Yes**

### 5.2 Instalar Componentes Iniciais

```bash
pnpm dlx shadcn-ui@latest add button card dialog form input label select table toast dropdown-menu avatar badge calendar
```

- [ ] Componentes criados em `src/components/ui/`

---

## ✅ Fase 6: Estrutura de Pastas (10 min)

Criar estrutura base conforme [ARCHITECTURE.md](ARCHITECTURE.md):

```bash
# Criar pastas de rotas
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/signup
mkdir -p src/app/\(dashboard\)/dashboard
mkdir -p src/app/\(dashboard\)/projects
mkdir -p src/app/\(dashboard\)/proposals
mkdir -p src/app/\(dashboard\)/clients
mkdir -p src/app/\(dashboard\)/inventory
mkdir -p src/app/\(dashboard\)/freelancers
mkdir -p src/app/\(public\)/p
mkdir -p src/app/\(public\)/review

# Criar pastas de componentes
mkdir -p src/components/layout
mkdir -p src/components/proposals
mkdir -p src/components/projects
mkdir -p src/components/inventory
mkdir -p src/components/freelancers
mkdir -p src/components/reviews

# Criar pastas de utilidades
mkdir -p src/lib/supabase
mkdir -p src/lib/validations
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/actions
mkdir -p src/types
```

- [ ] Todas as pastas criadas

---

## ✅ Fase 7: Arquivos Base (20 min)

### 7.1 Criar `src/lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] Arquivo criado

### 7.2 Criar `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] Arquivo criado

### 7.3 Criar `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] Arquivo criado

### 7.4 Criar `src/middleware.ts`

- [ ] Copiar conteúdo do [SETUP.md](SETUP.md) seção 8
- [ ] Arquivo criado na raiz de `src/`

---

## ✅ Fase 8: Primeira Execução (5 min)

### 8.1 Rodar Servidor

```bash
pnpm dev
```

- [ ] Servidor iniciou sem erros
- [ ] Acessei [http://localhost:3000](http://localhost:3000)
- [ ] Página padrão do Next.js carregou

### 8.2 Abrir Prisma Studio

Em outro terminal:

```bash
pnpm db:studio
```

- [ ] Prisma Studio abriu em [http://localhost:5555](http://localhost:5555)
- [ ] Consigo ver as tabelas criadas

---

## ✅ Fase 9: Git (10 min)

### 9.1 Inicializar Repositório

```bash
git init
git add .
git commit -m "chore: initial setup with Next.js, Prisma and Supabase"
```

- [ ] Commit criado

### 9.2 (Opcional) Conectar ao GitHub

```bash
# Criar repositório no GitHub primeiro
git remote add origin https://github.com/seu-usuario/zooming-crm.git
git branch -M main
git push -u origin main
```

- [ ] Código no GitHub

---

## ✅ Fase 10: Validação Final (5 min)

Execute estes comandos para garantir que tudo está OK:

```bash
# Type checking
pnpm exec tsc --noEmit

# Linting
pnpm lint

# Build test
pnpm build
```

**Checklist:**
- [ ] Zero erros de TypeScript
- [ ] Zero erros de ESLint
- [ ] Build completo com sucesso

---

## 🎉 Parabéns! Setup Completo

Você está pronto para começar o desenvolvimento. Próximos passos:

### Sprint 1 (Semanas 1-2): Fundação

**Tarefa 1:** Sistema de Autenticação
- [ ] Criar página de login (`src/app/(auth)/login/page.tsx`)
- [ ] Implementar login com Supabase Auth
- [ ] Criar página de signup
- [ ] Testar fluxo completo

**Tarefa 2:** Layout Base
- [ ] Criar `src/components/layout/sidebar.tsx`
- [ ] Criar `src/components/layout/header.tsx`
- [ ] Implementar layout em `src/app/(dashboard)/layout.tsx`

**Tarefa 3:** CRUD de Clientes (primeiro módulo completo)
- [ ] Criar `src/app/(dashboard)/clients/page.tsx` (listagem)
- [ ] Criar `src/app/(dashboard)/clients/new/page.tsx` (formulário)
- [ ] Criar `src/actions/clients.ts` (Server Actions)
- [ ] Criar validação em `src/lib/validations/client.ts`

---

## 📚 Recursos de Apoio

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query Docs](https://tanstack.com/query/latest)

---

## 🆘 Troubleshooting

### Problema: "Can't reach database server"
**Solução:**
1. Verificar se `DATABASE_URL` no `.env.local` está correta
2. Confirmar que projeto Supabase está ativo (não pausado)
3. Verificar se IP da máquina está liberado (Supabase libera todos por padrão)

### Problema: "Module not found: @prisma/client"
**Solução:**
```bash
pnpm prisma generate
```

### Problema: Erros de TypeScript após adicionar shadcn/ui
**Solução:**
Reiniciar TypeScript Server no VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

---

**Data de Conclusão do Setup:** ______________

**Desenvolvedor Responsável:** ______________

**Hora de Começar:** ✅ [Iniciar Sprint 1](#-parabéns-setup-completo)
