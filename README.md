# Zooming CRM

Sistema de gestao para produtoras audiovisuais.

## Quick Start

```bash
# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env.local

# Rodar migrations
psql "sua_connection_string" < database/migrations/00-supabase-initial-setup.sql

# Iniciar desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth

## Estrutura do Projeto

```
zooming-crm/
├── src/
│   ├── app/           # Rotas Next.js (App Router)
│   ├── components/    # Componentes React
│   ├── actions/       # Server Actions
│   ├── lib/           # Utilitarios e helpers
│   ├── hooks/         # Custom React Hooks
│   ├── store/         # Estado global (Zustand)
│   └── types/         # TypeScript types
├── prisma/            # Schema do banco
├── database/
│   ├── migrations/    # Migrations SQL (executar em ordem)
│   └── legacy-sql/    # Scripts antigos (NAO usar)
├── docs/
│   ├── guides/        # Guias de instalacao e uso
│   ├── sprints/       # Documentacao de sprints
│   └── archive/       # Documentos arquivados
├── scripts/           # Scripts de utilidade
├── tests/             # Testes automatizados
└── public/            # Assets estaticos
```

## Modulos

- Autenticacao (Supabase Auth + RLS)
- Dashboard (Visao geral + metricas)
- Clientes (CRUD completo)
- Projetos (Gestao + timeline + budget)
- Propostas (Criacao + envio + aprovacao)
- Equipamentos (Inventario + aluguel)
- Freelancers (Gestao de colaboradores)
- Financeiro (Capital inicial + transacoes)

## Documentacao

- [Guias](docs/guides/) - Instalacao e configuracao
- [Sprints](docs/sprints/) - Historico de implementacao
- [Arquivos](docs/archive/) - Documentos de referencia

## Scripts

```bash
npm run dev          # Iniciar desenvolvimento
npm run build        # Build de producao
npm run start        # Iniciar producao
npm run lint         # Rodar linter
```

## Licenca

Proprietary - Zooming CRM 2025
