# Documentacao

Indice completo da documentacao do Zooming CRM.

## Guias

| Documento | Descricao |
|-----------|-----------|
| [LEIA-ME-PRIMEIRO](guides/LEIA-ME-PRIMEIRO.md) | Comece aqui |
| [QUICK-START-GUIDE](guides/QUICK-START-GUIDE.md) | Instalacao rapida |
| [INSTALL-MANUAL](guides/INSTALL-MANUAL.md) | Instalacao detalhada |
| [GETTING_STARTED_CHECKLIST](guides/GETTING_STARTED_CHECKLIST.md) | Checklist inicial |
| [INSTRUCOES_IMPLEMENTACAO](guides/INSTRUCOES_IMPLEMENTACAO.md) | Instrucoes |
| [PROJECTS_MODULE_README](guides/PROJECTS_MODULE_README.md) | Modulo de projetos |

## Arquitetura

| Documento | Descricao |
|-----------|-----------|
| [ARCHITECTURE](architecture/ARCHITECTURE.md) | Arquitetura do sistema |
| [DATABASE_ERD](architecture/DATABASE_ERD.md) | Modelo de dados |
| [BEST_PRACTICES](architecture/BEST_PRACTICES.md) | Boas praticas |
| [SETUP](architecture/SETUP.md) | Configuracao |

## Planejamento

| Documento | Descricao |
|-----------|-----------|
| [PRD](planning/PRD.md) | Product Requirements |
| [EXECUTIVE_SUMMARY](planning/EXECUTIVE_SUMMARY.md) | Resumo executivo |
| [PROPOSTA_MODULO_PROPOSTAS](planning/PROPOSTA_MODULO_PROPOSTAS.md) | Modulo de propostas |
| [PLANO-IMPLEMENTACAO-ISSUES](planning/PLANO-IMPLEMENTACAO-ISSUES.md) | Issues |
| [PLANO-REDESIGN-UI-IOS](planning/PLANO-REDESIGN-UI-IOS.md) | Redesign UI |

## Sprints

| Documento | Descricao |
|-----------|-----------|
| [SPRINT-0-README](sprints/SPRINT-0-README.md) | Sprint 0 |
| [SPRINT-0-FINANCIAL-IMPLEMENTATION](sprints/SPRINT-0-FINANCIAL-IMPLEMENTATION.md) | Financeiro |
| [SPRINT-0-1-VALIDATION-CHECKLIST](sprints/SPRINT-0-1-VALIDATION-CHECKLIST.md) | Validacao |
| [SPRINT-1-IMPLEMENTATION](sprints/SPRINT-1-IMPLEMENTATION.md) | Sprint 1 |
| [SPRINT-2-IMPLEMENTATION](sprints/SPRINT-2-IMPLEMENTATION.md) | Sprint 2 |
| [SPRINT-3-IMPLEMENTATION](sprints/SPRINT-3-IMPLEMENTATION.md) | Sprint 3 |

## Arquivo

| Documento | Descricao |
|-----------|-----------|
| [ESTRUTURA-ORGANIZADA](archive/ESTRUTURA-ORGANIZADA.md) | Estrutura |
| [O-QUE-E-PRISMA](archive/O-QUE-E-PRISMA.md) | Prisma ORM |
| [STATUS-DO-PROJETO](archive/STATUS-DO-PROJETO.md) | Status |
| [MELHORIAS-IMPLEMENTADAS](archive/MELHORIAS-IMPLEMENTADAS.md) | Changelog |

## Migrations

As migrations SQL estao em: `database/migrations/`

Execute em ordem numerica:
1. `00-supabase-initial-setup.sql`
2. `01-sprint-0-financial-foundation.sql`
3. `02-propostas-module.sql`
4. `03-equipment-module.sql`
5. `04-projects-enhancement.sql`
6. `05-freelancers-enhancement.sql`
7. `06-data-integration.sql`
