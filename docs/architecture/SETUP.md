# Guia de Setup - Zooming CRM

Este documento contém o passo a passo completo para inicializar o projeto do zero.

---

## Pré-requisitos

Certifique-se de ter instalado:

- **Node.js:** v18.17 ou superior (recomendado: v20 LTS)
- **pnpm:** v8 ou superior (mais rápido que npm)
- **Git:** Para versionamento
- **VS Code:** Editor recomendado com extensões:
  - Prisma
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

Verificar versões:
```bash
node --version  # deve retornar v18+
pnpm --version  # deve retornar v8+
git --version
```

---

## 1. Criar Projeto Next.js

Execute o comando para criar um novo projeto Next.js com TypeScript e Tailwind CSS:

```bash
pnpm create next-app@latest zooming-crm --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

**Respostas para as perguntas do setup:**
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **Yes**
- Would you like to use App Router? **Yes**
- Would you like to customize the default import alias? **No** (já configurado para @/*)

Entre na pasta do projeto:
```bash
cd zooming-crm
```

---

## 2. Instalar Dependências Essenciais

### 2.1 Dependências de Produção

```bash
pnpm add @prisma/client @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add zustand react-query @tanstack/react-query
pnpm add zod react-hook-form @hookform/resolvers
pnpm add date-fns clsx tailwind-merge
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add lucide-react class-variance-authority
pnpm add resend react-email
```

### 2.2 Dependências de Desenvolvimento

```bash
pnpm add -D prisma
pnpm add -D @types/node
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D vitest @vitejs/plugin-react
```

---

## 3. Configurar Supabase

### 3.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha:
   - **Name:** Zooming CRM
   - **Database Password:** Gere uma senha forte e **guarde**
   - **Region:** South America (São Paulo) - melhor latência
   - **Pricing Plan:** Free (para desenvolvimento)
4. Aguarde ~2 minutos até o projeto ser provisionado

### 3.2 Obter Credenciais

No dashboard do Supabase, vá em **Settings → API** e copie:
- `Project URL` (ex: https://abc123.supabase.co)
- `anon public` key
- `service_role` key (apenas para migrations)

### 3.3 Obter Database URL

Vá em **Settings → Database → Connection String → URI** e copie a URL completa.

**IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou.

---

## 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# .env.local

# Supabase (Frontend - Cliente Público)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Supabase (Backend - Service Role para migrations)
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Database (Prisma)
DATABASE_URL="postgresql://postgres.abc123:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Para migrations diretas (sem pooler)
DIRECT_URL="postgresql://postgres.abc123:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# Email (Resend - opcional para MVP)
RESEND_API_KEY=re_seu_key_aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANTE:** Adicione `.env.local` ao `.gitignore` (já vem por padrão).

Crie também um `.env.example` para referência da equipe:

```bash
# .env.example (sem valores sensíveis)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Configurar Prisma

### 5.1 Atualizar `prisma/schema.prisma`

O schema já foi criado no arquivo `prisma/schema.prisma`. Verifique se a configuração do datasource está correta:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Para migrations (sem pooler)
}
```

### 5.2 Gerar Cliente Prisma

```bash
pnpm prisma generate
```

### 5.3 Criar Migration Inicial

```bash
pnpm prisma migrate dev --name init
```

Este comando irá:
1. Criar a migration SQL
2. Aplicar no banco Supabase
3. Gerar os tipos TypeScript

### 5.4 (Opcional) Popular Banco com Dados Fake

Crie o arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar organização de exemplo
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Produtora',
      slug: 'acme',
      email: 'contato@acme.com.br',
      phone: '11999999999',
    },
  })

  // Criar usuário admin
  const user = await prisma.user.create({
    data: {
      email: 'admin@acme.com.br',
      name: 'Admin Acme',
      role: 'ADMIN',
      organizationId: org.id,
    },
  })

  // Criar cliente de exemplo
  const client = await prisma.client.create({
    data: {
      name: 'Empresa XYZ Ltda',
      email: 'cliente@xyz.com.br',
      phone: '11988887777',
      company: 'XYZ Tecnologia',
      organizationId: org.id,
    },
  })

  console.log('✅ Seed concluído:', { org, user, client })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Adicione ao `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Instale `tsx` e rode o seed:
```bash
pnpm add -D tsx
pnpm prisma db seed
```

---

## 6. Configurar shadcn/ui

O shadcn/ui é uma coleção de componentes que você instala via CLI (não é um pacote npm).

### 6.1 Inicializar shadcn/ui

```bash
pnpm dlx shadcn-ui@latest init
```

**Respostas recomendadas:**
- Which style would you like to use? **Default**
- Which color would you like to use as base color? **Slate**
- Would you like to use CSS variables for colors? **Yes**

### 6.2 Instalar Componentes Iniciais

```bash
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add form
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add label
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add badge
pnpm dlx shadcn-ui@latest add calendar
```

Isso criará os arquivos em `src/components/ui/`.

---

## 7. Configurar Utilitários

### 7.1 Criar `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatadores
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}
```

### 7.2 Criar Singleton do Prisma `src/lib/db.ts`

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

### 7.3 Configurar Supabase Client `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 7.4 Configurar Supabase Server `src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component
          }
        },
      },
    }
  )
}
```

---

## 8. Configurar Middleware de Autenticação

Crie `src/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Proteger rotas do dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirecionar de /login para /dashboard se já estiver autenticado
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 9. Estrutura de Scripts no package.json

Atualize o `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,md}\""
  }
}
```

---

## 10. Rodar o Projeto

### 10.1 Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 10.2 Abrir Prisma Studio (Visualizador de Banco)

Em outro terminal:

```bash
pnpm db:studio
```

Acesse: [http://localhost:5555](http://localhost:5555)

---

## 11. Comandos Úteis Durante o Desenvolvimento

### Prisma
```bash
# Gerar tipos TypeScript após alterar schema
pnpm db:generate

# Criar nova migration
pnpm db:migrate

# Reset do banco (CUIDADO: apaga tudo)
pnpm prisma migrate reset

# Sincronizar schema sem criar migration (dev only)
pnpm db:push
```

### Next.js
```bash
# Build de produção
pnpm build

# Rodar build localmente
pnpm start

# Limpar cache do Next
rm -rf .next
```

### Git
```bash
# Inicializar repositório
git init
git add .
git commit -m "chore: initial setup"

# Conectar ao GitHub
git remote add origin https://github.com/seu-usuario/zooming-crm.git
git push -u origin main
```

---

## 12. Próximos Passos

Após o setup, comece implementando na seguinte ordem:

1. **Criar layout base** (`src/app/(dashboard)/layout.tsx`)
2. **Página de login** (`src/app/(auth)/login/page.tsx`)
3. **CRUD de Clientes** (mais simples para testar a stack)
4. **CRUD de Projetos**
5. **Sistema de Propostas** (funcionalidade estrela)

---

## Troubleshooting

### Erro: "Can't reach database server"
- Verifique se a `DATABASE_URL` no `.env.local` está correta
- Confirme que o IP da sua máquina está liberado no Supabase (Settings → Database → Connection Pooling)

### Erro: "Module not found: @prisma/client"
```bash
pnpm db:generate
```

### Erro no Middleware (cookies)
- Certifique-se de usar `@supabase/ssr` ao invés de `@supabase/auth-helpers-nextjs`
- Versão mínima do Next.js: 14.0.0

### Erro de CORS em API Routes
- Adicione headers no `next.config.mjs`:
```js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ]
}
```

---

## Recursos Adicionais

- [Documentação Next.js 15](https://nextjs.org/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Última Atualização:** 2026-01-10
**Autor:** Arquitetura Zooming CRM
