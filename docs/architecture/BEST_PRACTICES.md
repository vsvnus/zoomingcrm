# Boas Práticas - Zooming CRM

Este documento reúne as convenções de código, padrões arquiteturais e decisões técnicas do projeto.

---

## Estrutura de Código

### 1. Organização de Componentes

**Server Components por Padrão**
```tsx
// app/projects/page.tsx (Server Component)
import { prisma } from '@/lib/db'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany()
  return <ProjectList projects={projects} />
}
```

**Client Components quando necessário**
```tsx
// components/projects/project-card.tsx
'use client'

import { useState } from 'react'

export function ProjectCard({ project }) {
  const [isOpen, setIsOpen] = useState(false)
  // ...
}
```

**Regra:** Use Client Component apenas se precisar de:
- `useState`, `useEffect`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `navigator`)

---

### 2. Server Actions vs API Routes

**Preferir Server Actions (App Router)**
```tsx
// actions/proposals.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function acceptProposal(proposalId: string) {
  const proposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  })

  revalidatePath('/dashboard/proposals')
  return { success: true, proposal }
}
```

**Uso no componente:**
```tsx
'use client'

import { acceptProposal } from '@/actions/proposals'

export function AcceptButton({ proposalId }) {
  return (
    <Button
      onClick={() => acceptProposal(proposalId)}
    >
      Aceitar Proposta
    </Button>
  )
}
```

**API Routes apenas para:**
- Webhooks externos (Stripe, Supabase)
- Integrações com third-party (Vimeo, YouTube)
- Endpoints públicos que receberão POST de formulários externos

---

### 3. Validação com Zod

**Schema reutilizável:**
```typescript
// lib/validations/proposal.ts
import { z } from 'zod'

export const proposalSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  baseValue: z.number().positive('Valor deve ser positivo'),
  discount: z.number().min(0).max(100, 'Desconto deve estar entre 0 e 100'),
  clientId: z.string().cuid(),
})

export type ProposalInput = z.infer<typeof proposalSchema>
```

**Uso com React Hook Form:**
```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { proposalSchema } from '@/lib/validations/proposal'

export function ProposalForm() {
  const form = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      baseValue: 0,
      discount: 0,
    },
  })

  return <Form {...form}>...</Form>
}
```

---

## Database e Prisma

### 1. Sempre usar Transactions para Operações Críticas

**Errado:**
```typescript
// ❌ Se falhar no meio, fica inconsistente
await prisma.proposal.update({ ... })
await prisma.auditLog.create({ ... })
await prisma.notification.create({ ... })
```

**Correto:**
```typescript
// ✅ Tudo ou nada
await prisma.$transaction([
  prisma.proposal.update({ ... }),
  prisma.auditLog.create({ ... }),
  prisma.notification.create({ ... }),
])
```

---

### 2. Uso de `include` vs `select`

**Quando usar `include`:**
```typescript
// Trazer relação completa
const proposal = await prisma.proposal.findUnique({
  where: { id },
  include: {
    client: true,
    items: true,
    optionals: true,
  },
})
```

**Quando usar `select` (melhor performance):**
```typescript
// Apenas campos necessários
const proposals = await prisma.proposal.findMany({
  select: {
    id: true,
    title: true,
    totalValue: true,
    client: {
      select: {
        name: true,
      },
    },
  },
})
```

---

### 3. Anti-Conflito de Equipamentos (Query Otimizada)

```typescript
// actions/equipments.ts
'use server'

import { prisma } from '@/lib/db'

export async function checkEquipmentAvailability(
  equipmentId: string,
  startDate: Date,
  endDate: Date
) {
  const conflict = await prisma.equipmentBooking.findFirst({
    where: {
      equipmentId,
      OR: [
        {
          // Nova reserva começa durante booking existente
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } },
          ],
        },
        {
          // Nova reserva termina durante booking existente
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } },
          ],
        },
        {
          // Nova reserva engloba booking existente
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
      ],
    },
    include: {
      project: {
        select: {
          title: true,
        },
      },
    },
  })

  if (conflict) {
    return {
      available: false,
      conflictWith: conflict.project.title,
      conflictDates: `${conflict.startDate} - ${conflict.endDate}`,
    }
  }

  return { available: true }
}
```

---

## Gerenciamento de Estado

### 1. React Query para Server State

```typescript
// hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, updateProjectStage } from '@/actions/projects'

export function useProjects(organizationId: string) {
  return useQuery({
    queryKey: ['projects', organizationId],
    queryFn: () => getProjects(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useUpdateProjectStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, stage }: { projectId: string; stage: string }) =>
      updateProjectStage(projectId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

---

### 2. Zustand para UI State

```typescript
// store/use-sidebar.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
)
```

**Uso:**
```tsx
'use client'

export function Sidebar() {
  const { isOpen, toggle } = useSidebar()

  return (
    <aside className={cn('sidebar', isOpen && 'open')}>
      <Button onClick={toggle}>Toggle</Button>
    </aside>
  )
}
```

---

## Performance

### 1. Loading States com Suspense

```tsx
// app/dashboard/projects/page.tsx
import { Suspense } from 'react'
import { ProjectList } from '@/components/projects/project-list'
import { ProjectListSkeleton } from '@/components/projects/project-list-skeleton'

export default function ProjectsPage() {
  return (
    <div>
      <h1>Projetos</h1>
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList />
      </Suspense>
    </div>
  )
}
```

---

### 2. Imagens Otimizadas

```tsx
import Image from 'next/image'

// ✅ Sempre usar next/image
<Image
  src="/logo.png"
  alt="Zooming Logo"
  width={200}
  height={50}
  priority // Para imagens above-the-fold
  placeholder="blur" // Opcional: blur enquanto carrega
/>

// ❌ Nunca usar <img> diretamente
<img src="/logo.png" alt="Logo" />
```

---

### 3. Dynamic Imports para Componentes Pesados

```tsx
import dynamic from 'next/dynamic'

// Componente com biblioteca pesada (ex: editor de vídeo)
const VideoEditor = dynamic(
  () => import('@/components/reviews/video-editor'),
  {
    loading: () => <p>Carregando editor...</p>,
    ssr: false, // Não renderizar no servidor
  }
)

export function ReviewPage() {
  return <VideoEditor />
}
```

---

## Segurança

### 1. Row Level Security (RLS) no Supabase

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só acessa dados da própria organização
CREATE POLICY "users_own_org_projects"
ON projects
FOR ALL
USING (
  organization_id = (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid()
  )
);
```

---

### 2. Validação de Permissões em Server Actions

```typescript
// actions/projects.ts
'use server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function deleteProject(projectId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Não autenticado')
  }

  // Verificar se projeto pertence à organização do usuário
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  })

  if (project?.organizationId !== user.organizationId) {
    throw new Error('Sem permissão para deletar este projeto')
  }

  // Apenas ADMIN pode deletar
  if (user.role !== 'ADMIN') {
    throw new Error('Apenas administradores podem deletar projetos')
  }

  await prisma.project.delete({
    where: { id: projectId },
  })

  return { success: true }
}
```

---

### 3. Sanitização de Inputs (XSS)

```typescript
import DOMPurify from 'isomorphic-dompurify'

// Sanitizar HTML antes de salvar
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

// Uso
const cleanDescription = sanitizeHTML(userInput)
await prisma.proposal.create({
  data: {
    description: cleanDescription,
  },
})
```

---

## Testes

### 1. Testes Unitários (Vitest)

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '@/lib/utils'

describe('formatCurrency', () => {
  it('deve formatar valores em reais', () => {
    expect(formatCurrency(1500.5)).toBe('R$ 1.500,50')
  })
})

describe('formatDate', () => {
  it('deve formatar data no padrão brasileiro', () => {
    const date = new Date('2026-01-10')
    expect(formatDate(date)).toBe('10/01/2026')
  })
})
```

---

### 2. Testes de Integração (Prisma)

```typescript
// __tests__/actions/proposals.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/db'
import { acceptProposal } from '@/actions/proposals'

beforeAll(async () => {
  // Setup: Criar dados de teste
  await prisma.organization.create({
    data: { name: 'Test Org', slug: 'test-org', email: 'test@test.com' },
  })
})

afterAll(async () => {
  // Cleanup: Deletar dados de teste
  await prisma.organization.deleteMany()
})

describe('acceptProposal', () => {
  it('deve aceitar proposta e registrar timestamp', async () => {
    const proposal = await prisma.proposal.create({
      data: { /* ... */ },
    })

    const result = await acceptProposal(proposal.id)

    expect(result.success).toBe(true)
    expect(result.proposal.status).toBe('ACCEPTED')
    expect(result.proposal.acceptedAt).toBeInstanceOf(Date)
  })
})
```

---

### 3. Testes E2E (Playwright)

```typescript
// tests/e2e/proposals.spec.ts
import { test, expect } from '@playwright/test'

test('cliente consegue aceitar proposta', async ({ page }) => {
  // Acessar proposta pública
  await page.goto('/p/abc123')

  // Marcar opcionais
  await page.click('input[name="optional-drone"]')

  // Verificar cálculo atualizado
  await expect(page.locator('.total-value')).toContainText('R$ 3.500,00')

  // Aceitar
  await page.click('button:has-text("Aceitar Proposta")')

  // Verificar sucesso
  await expect(page.locator('.success-message')).toBeVisible()
})
```

---

## Convenções de Nomenclatura

### 1. Arquivos e Pastas
```
kebab-case para arquivos: proposal-card.tsx
PascalCase para componentes: ProposalCard
camelCase para funções: getUserProjects
UPPERCASE para constantes: MAX_FILE_SIZE
```

### 2. Componentes
```tsx
// ✅ Correto
export function ProposalCard({ proposal }: ProposalCardProps) { }

// ❌ Errado
export const ProposalCard = ({ proposal }: ProposalCardProps) => { }
```

**Motivo:** `function` tem melhor stack trace e é mais idiomático em React.

---

### 3. Server Actions
```typescript
// Verbos: create, update, delete, get, list
export async function createProposal(data: ProposalInput) { }
export async function updateProposal(id: string, data: Partial<ProposalInput>) { }
export async function deleteProposal(id: string) { }
export async function getProposal(id: string) { }
export async function listProposals(filters?: ProposalFilters) { }
```

---

## Git Workflow

### 1. Branches
```
main          - Produção (protegido)
develop       - Desenvolvimento
feature/xxx   - Novas funcionalidades
fix/xxx       - Correções de bugs
hotfix/xxx    - Correções urgentes em produção
```

### 2. Commits (Conventional Commits)
```bash
feat: adiciona sistema de revisões
fix: corrige cálculo de desconto em propostas
docs: atualiza README com instruções de setup
style: formata código com prettier
refactor: extrai lógica de validação para hook
test: adiciona testes para anti-conflito de equipamentos
chore: atualiza dependências do prisma
```

### 3. Pull Requests
**Template:**
```markdown
## Descrição
Implementa sistema de aprovação de vídeos com versionamento.

## Tipo de Mudança
- [x] Nova funcionalidade
- [ ] Correção de bug
- [ ] Breaking change

## Checklist
- [x] Código segue style guide
- [x] Comentários adicionados onde necessário
- [x] Testes unitários passando
- [x] Testes E2E passando
- [x] Documentação atualizada

## Screenshots
[Anexar prints se aplicável]
```

---

## Deploy

### 1. Vercel (Recomendado)

**Conectar repositório:**
1. Criar conta no Vercel
2. Import Git Repository
3. Selecionar `zooming-crm`
4. Adicionar variáveis de ambiente (Settings → Environment Variables)
5. Deploy automático a cada push em `main`

**Variáveis de Ambiente:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL
DIRECT_URL
RESEND_API_KEY
```

---

### 2. Migrations em Produção

```bash
# Gerar migration localmente
pnpm prisma migrate dev --name add_new_feature

# Aplicar em produção (via Vercel CLI ou GitHub Actions)
pnpm prisma migrate deploy
```

**IMPORTANTE:** Sempre testar migrations em ambiente de staging antes de produção.

---

## Monitoramento

### 1. Sentry (Erros)
```bash
pnpm add @sentry/nextjs
pnpm sentry:init
```

```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

---

### 2. Vercel Analytics (Performance)
```bash
pnpm add @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Recursos Adicionais

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Última Atualização:** 2026-01-10
**Mantenedor:** Equipe Zooming CRM
