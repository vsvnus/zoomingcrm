# Arquitetura do Projeto - Zooming CRM

## Tech Stack Final

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand (global) + React Query (server state)
- **Formulários:** React Hook Form + Zod
- **Drag & Drop:** @dnd-kit/core
- **Datas:** date-fns

### Backend
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **ORM:** Prisma
- **API:** Next.js API Routes + Server Actions
- **File Upload:** Supabase Storage
- **Email:** Resend ou React Email

### DevOps & Infra
- **Hosting:** Vercel (frontend + edge functions)
- **Database:** Supabase Cloud
- **Versionamento:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Monitoramento:** Vercel Analytics + Sentry

---

## Estrutura de Pastas

```
zooming-crm/
├── README.md
├── PRD.md                          # Este documento
├── ARCHITECTURE.md                 # Você está aqui
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── .env.local                      # Variáveis de ambiente
├── .env.example
│
├── prisma/
│   ├── schema.prisma               # Schema do banco
│   ├── migrations/                 # Migrations automáticas
│   └── seed.ts                     # Dados iniciais para dev
│
├── public/
│   ├── logo.svg
│   └── assets/
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Layout raiz
│   │   ├── page.tsx                # Homepage (redirect para /dashboard)
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                 # Grupo de rotas públicas
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/            # Grupo de rotas autenticadas
│   │   │   ├── layout.tsx          # Sidebar + Header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Overview/métricas
│   │   │   │
│   │   │   ├── projects/           # Pipeline de Produção
│   │   │   │   ├── page.tsx        # Kanban
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx    # Detalhes do projeto
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── proposals/          # Gestão de Propostas
│   │   │   │   ├── page.tsx        # Lista
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx    # Editor
│   │   │   │   │   └── preview/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── clients/            # Clientes
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── inventory/          # Equipamentos
│   │   │   │   ├── page.tsx        # Lista + Calendário
│   │   │   │   ├── equipments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── kits/
│   │   │   │       ├── page.tsx
│   │   │   │       └── new/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── freelancers/        # Banco de Talentos
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── settings/           # Configurações
│   │   │       ├── page.tsx
│   │   │       ├── organization/
│   │   │       ├── users/
│   │   │       └── billing/
│   │   │
│   │   ├── (public)/               # Rotas públicas (sem auth)
│   │   │   ├── p/                  # Propostas públicas
│   │   │   │   └── [token]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── review/             # Sistema de Revisão
│   │   │       └── [token]/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── proposals/
│   │       │   └── [id]/
│   │       │       └── accept/
│   │       │           └── route.ts
│   │       ├── reviews/
│   │       │   └── [token]/
│   │       │       └── submit/
│   │       │           └── route.ts
│   │       └── webhooks/
│   │           └── supabase/
│   │               └── route.ts
│   │
│   ├── components/                 # Componentes React
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                 # Componentes de layout
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── page-header.tsx
│   │   │
│   │   ├── proposals/              # Componentes específicos
│   │   │   ├── proposal-card.tsx
│   │   │   ├── optional-selector.tsx
│   │   │   ├── price-calculator.tsx
│   │   │   └── video-embed.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── project-card.tsx
│   │   │   └── shooting-modal.tsx
│   │   │
│   │   ├── inventory/
│   │   │   ├── equipment-card.tsx
│   │   │   ├── booking-calendar.tsx
│   │   │   └── conflict-alert.tsx
│   │   │
│   │   ├── freelancers/
│   │   │   ├── freelancer-card.tsx
│   │   │   └── availability-calendar.tsx
│   │   │
│   │   └── reviews/
│   │       ├── review-player.tsx
│   │       └── feedback-form.tsx
│   │
│   ├── lib/                        # Utilitários e configurações
│   │   ├── db.ts                   # Prisma Client singleton
│   │   ├── supabase/
│   │   │   ├── client.ts           # Cliente para navegador
│   │   │   ├── server.ts           # Cliente para server components
│   │   │   └── middleware.ts       # Middleware de auth
│   │   ├── utils.ts                # Funções auxiliares (cn, formatters)
│   │   ├── validations/            # Schemas Zod
│   │   │   ├── proposal.ts
│   │   │   ├── project.ts
│   │   │   └── ...
│   │   └── constants.ts            # Constantes da aplicação
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── use-user.ts
│   │   ├── use-organization.ts
│   │   └── use-toast.ts
│   │
│   ├── store/                      # Zustand stores
│   │   ├── use-sidebar.ts
│   │   └── use-proposal-builder.ts
│   │
│   ├── actions/                    # Server Actions
│   │   ├── proposals.ts
│   │   ├── projects.ts
│   │   ├── equipments.ts
│   │   └── ...
│   │
│   └── types/                      # TypeScript types
│       ├── database.ts             # Tipos gerados do Prisma
│       └── index.ts
│
├── tests/                          # Testes (Vitest + Playwright)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── scripts/                        # Scripts utilitários
    ├── seed-demo.ts                # Popular banco com dados fake
    └── generate-types.ts
```

---

## Fluxo de Dados

### 1. Autenticação (Supabase Auth)
```
User Login → Supabase Auth → JWT Token → Middleware verifica → Acessa Dashboard
```

### 2. Proposta Interativa (Cliente Público)
```
Cliente acessa /p/{token}
  ↓
Next.js busca proposta no DB (Prisma)
  ↓
Renderiza página com:
  - Vídeos embarcados (Vimeo/YouTube iframe)
  - Opcionais (React State local)
  - Cálculo dinâmico (useMemo)
  ↓
Cliente aceita → POST /api/proposals/[id]/accept
  ↓
Atualiza status no DB + Envia email (Resend)
```

### 3. Sistema Anti-Conflito de Equipamentos
```
Usuário seleciona equipamento + data no form
  ↓
Server Action verifica no DB:
  SELECT * FROM equipment_bookings
  WHERE equipmentId = X
  AND (startDate <= novaData AND endDate >= novaData)
  ↓
Se conflito → Retorna erro com projeto conflitante
Se livre → Cria booking com transaction lock
```

### 4. Pipeline Kanban com Validação
```
Drag & Drop no frontend (@dnd-kit)
  ↓
onDrop → Server Action "updateProjectStage"
  ↓
If stage === "SHOOTING":
  - Valida campos obrigatórios (data, equipe)
  - Se inválido → Reject action
  - Se válido → Update DB + Notifica equipe (email)
Else:
  - Update direto
```

---

## Segurança e Multi-Tenancy

### Row Level Security (RLS) no Supabase
```sql
-- Exemplo: Usuário só vê dados da própria organização

CREATE POLICY "Users can only access their org data"
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

### Middleware Next.js
```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Rotas protegidas
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect('/login')
  }

  // Rotas públicas (propostas, reviews)
  if (req.nextUrl.pathname.startsWith('/p/') || req.nextUrl.pathname.startsWith('/review/')) {
    return NextResponse.next()
  }
}
```

---

## Performance & Escalabilidade

### Otimizações Next.js
- **Server Components por padrão:** Reduz bundle JS
- **Streaming SSR:** Loading states com `<Suspense>`
- **Image Optimization:** `next/image` com blur placeholder
- **Font Optimization:** `next/font` com Geist Sans

### Database Indexing
```sql
-- Índices críticos já definidos no schema Prisma:
@@index([equipmentId, startDate, endDate]) -- Busca de conflitos
@@index([entityType, entityId]) -- Audit logs
@@unique([freelancerId, date]) -- Alocação de freelancers
```

### Caching Strategy
- **React Query:** Cache de 5min para listas (projects, equipments)
- **Next.js:** `revalidate: 60` em páginas estáticas
- **Supabase Realtime:** Updates automáticos no Kanban (WebSocket)

---

## Monitoramento e Logs

### Eventos Críticos para Audit Log
```typescript
enum AuditAction {
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
  PROJECT_STAGE_CHANGED = 'PROJECT_STAGE_CHANGED',
  EQUIPMENT_BOOKED = 'EQUIPMENT_BOOKED',
  REVIEW_APPROVED = 'REVIEW_APPROVED',
  // ...
}

// Uso:
await prisma.auditLog.create({
  data: {
    action: 'PROPOSAL_ACCEPTED',
    entityType: 'Proposal',
    entityId: proposal.id,
    userId: user.id,
    metadata: { totalValue: proposal.totalValue },
  }
})
```

### Métricas no Vercel Analytics
- Tempo de carregamento de propostas públicas
- Taxa de conversão (sent → accepted)
- Erros de conflito de equipamentos (track em Sentry)

---

## Próximos Passos (Pós-Arquitetura)

1. **Setup Inicial:**
   - Criar projeto Next.js
   - Configurar Supabase
   - Instalar dependências

2. **Sprint 1-2: Fundação**
   - Sistema de autenticação
   - CRUD de clientes e projetos
   - Layout base (sidebar, header)

3. **Sprint 3-4: Propostas**
   - Editor de propostas
   - Página pública interativa
   - Sistema de aceitação

4. **Sprint 5-7: Core Features**
   - Kanban do pipeline
   - Sistema de equipamentos
   - Banco de freelancers

5. **Sprint 8-10: Polimento**
   - Sistema de revisões
   - Notificações por email
   - Testes E2E

---

**Última Atualização:** 2026-01-10
