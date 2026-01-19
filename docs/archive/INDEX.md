# Índice de Documentação - Zooming CRM
## Guia de Navegação dos Documentos do Projeto

---

## 📋 Documentos Criados

### 1. [README.md](README.md) - Visão Geral do Projeto
**Audiência:** Todos (desenvolvedores, stakeholders, novos membros)
**Quando usar:** Primeiro documento a ler para entender o que é o Zooming

**Conteúdo:**
- O que é Zooming e por que existe
- Funcionalidades principais (resumidas)
- Tech stack
- Como instalar (resumo)
- Screenshots e links úteis

⏱️ **Tempo de leitura:** 5 minutos

---

### 2. [PRD.md](PRD.md) - Product Requirements Document
**Audiência:** Product Managers, Desenvolvedores, QA
**Quando usar:** Para entender DETALHADAMENTE cada funcionalidade antes de codificar

**Conteúdo:**
- User Stories completas com Critérios de Aceite
- Regras de negócio (ex: como calcular desconto, quando bloquear equipamento)
- Requisitos não-funcionais (performance, segurança)
- Métricas de sucesso (KPIs)
- Cronograma em sprints
- Riscos e mitigações

⏱️ **Tempo de leitura:** 30 minutos

**💡 Dica:** Leia a User Story específica antes de implementar cada feature.

---

### 3. [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura Técnica
**Audiência:** Desenvolvedores, Tech Leads
**Quando usar:** Para entender decisões arquiteturais e estrutura do código

**Conteúdo:**
- Tech stack justificada (por que Next.js? por que Supabase?)
- Estrutura de pastas detalhada
- Fluxo de dados (como funciona cada funcionalidade por baixo dos panos)
- Estratégias de segurança (RLS, middleware)
- Otimizações de performance
- Monitoramento e logs

⏱️ **Tempo de leitura:** 20 minutos

**💡 Dica:** Consulte este documento ao criar novos módulos para seguir o padrão.

---

### 4. [DATABASE_ERD.md](DATABASE_ERD.md) - Schema do Banco de Dados
**Audiência:** Desenvolvedores Backend, DBAs
**Quando usar:** Ao trabalhar com Prisma, queries SQL ou entender relacionamentos

**Conteúdo:**
- Diagrama visual das tabelas (ASCII art)
- Relacionamentos (1:N, N:M)
- Índices críticos para performance
- Constraints e regras de negócio
- Queries complexas de exemplo (anti-conflito, dashboards)
- Triggers e funções SQL

⏱️ **Tempo de leitura:** 25 minutos

**💡 Dica:** Imprima o diagrama e cole na parede do escritório.

---

### 5. [SETUP.md](SETUP.md) - Guia de Instalação Completo
**Audiência:** Desenvolvedores (setup inicial)
**Quando usar:** Primeira vez configurando o ambiente ou onboarding novo dev

**Conteúdo:**
- Pré-requisitos (Node, pnpm, etc)
- Passo a passo para criar projeto Next.js
- Como configurar Supabase
- Instalação de todas as dependências
- Configuração de variáveis de ambiente
- Comandos para rodar migrations
- Setup do shadcn/ui
- Troubleshooting de problemas comuns

⏱️ **Tempo de execução:** 1-2 horas (fazendo tudo)

**💡 Dica:** Siga o checklist linearmente. Não pule etapas.

---

### 6. [BEST_PRACTICES.md](BEST_PRACTICES.md) - Convenções de Código
**Audiência:** Desenvolvedores
**Quando usar:** Antes de escrever código OU durante code review

**Conteúdo:**
- Como organizar componentes (Server vs Client)
- Quando usar Server Actions vs API Routes
- Validação com Zod
- Padrões de queries Prisma (include vs select)
- Gerenciamento de estado (React Query + Zustand)
- Performance (Suspense, dynamic imports, imagens)
- Segurança (RLS, validação de permissões, sanitização)
- Testes (unitários, integração, E2E)
- Convenções de nomenclatura
- Git workflow

⏱️ **Tempo de leitura:** 30 minutos

**💡 Dica:** Leia este doc pelo menos uma vez por semana durante o desenvolvimento.

---

### 7. [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) - Resumo Executivo
**Audiência:** Stakeholders, Investidores, Product Owners
**Quando usar:** Para apresentar o projeto a não-técnicos ou pitch

**Conteúdo:**
- O problema de mercado (com números)
- A solução (Zooming)
- Diferencial competitivo (vs Pipedrive, Salesforce, Monday)
- Funcionalidades core explicadas com ROI
- Modelo de negócio (preços, receita projetada)
- Roadmap de desenvolvimento
- Riscos e mitigações
- Métricas de sucesso (OKRs)

⏱️ **Tempo de leitura:** 15 minutos

**💡 Dica:** Use este documento para alinhar expectativas com stakeholders.

---

### 8. [GETTING_STARTED_CHECKLIST.md](GETTING_STARTED_CHECKLIST.md) - Checklist de Início
**Audiência:** Desenvolvedores (primeiro dia)
**Quando usar:** Onboarding ou para garantir que nada foi esquecido no setup

**Conteúdo:**
- Checklist fase a fase com checkboxes ✅
- Links para documentação relevante
- Comandos prontos para copiar/colar
- Validação final (type checking, build)
- Próximos passos após setup

⏱️ **Tempo de execução:** 2-3 horas (com calma)

**💡 Dica:** Imprima e vá marcando conforme completa.

---

### 9. [prisma/schema.prisma](prisma/schema.prisma) - Schema Prisma
**Audiência:** Desenvolvedores Backend
**Quando usar:** Ao criar migrations, queries ou entender modelos

**Conteúdo:**
- Todos os modelos (Organization, User, Client, Proposal, Project, etc)
- Relacionamentos (com `@relation`)
- Enums (ProjectStage, ProposalStatus, etc)
- Índices e constraints
- Comentários explicativos

⏱️ **Tempo de leitura:** 15 minutos

**💡 Dica:** Use junto com DATABASE_ERD.md para ter visão completa.

---

### 10. [.env.example](.env.example) - Exemplo de Variáveis de Ambiente
**Audiência:** Desenvolvedores
**Quando usar:** Ao configurar `.env.local` pela primeira vez

**Conteúdo:**
- Template de todas as variáveis necessárias
- Comentários explicando cada uma
- Links para obter keys (Supabase, Resend)

⏱️ **Tempo de uso:** 5 minutos

**💡 Dica:** NUNCA commite `.env.local`. Sempre use `.env.example` como referência.

---

## 🗺️ Fluxo de Leitura Recomendado

### Para Stakeholders (Não-Técnicos)
1. [README.md](README.md) - 5 min
2. [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) - 15 min
3. [PRD.md](PRD.md) (seções 1-2 apenas) - 10 min

**Total:** 30 minutos para entender o projeto

---

### Para Desenvolvedores (Primeiro Dia)
1. [README.md](README.md) - 5 min
2. [PRD.md](PRD.md) - 30 min (ler tudo)
3. [ARCHITECTURE.md](ARCHITECTURE.md) - 20 min
4. [DATABASE_ERD.md](DATABASE_ERD.md) - 25 min
5. [GETTING_STARTED_CHECKLIST.md](GETTING_STARTED_CHECKLIST.md) - 2h (executar)

**Total:** 3h20min para setup completo + contexto

---

### Para Desenvolvedores (Durante o Desenvolvimento)
**Antes de cada sprint:**
- Revisar [PRD.md](PRD.md) para as User Stories da sprint
- Consultar [BEST_PRACTICES.md](BEST_PRACTICES.md) para padrões

**Ao implementar nova feature:**
1. Ler User Story no [PRD.md](PRD.md)
2. Verificar schema no [DATABASE_ERD.md](DATABASE_ERD.md)
3. Seguir padrões do [BEST_PRACTICES.md](BEST_PRACTICES.md)
4. Consultar [ARCHITECTURE.md](ARCHITECTURE.md) se necessário

**Ao fazer code review:**
- Verificar se código segue [BEST_PRACTICES.md](BEST_PRACTICES.md)
- Confirmar que atende Critérios de Aceite do [PRD.md](PRD.md)

---

## 📊 Mapa Mental da Documentação

```
Zooming CRM
│
├─ Para Entender o Produto
│  ├─ README.md (visão geral)
│  ├─ EXECUTIVE_SUMMARY.md (pitch para stakeholders)
│  └─ PRD.md (requisitos detalhados)
│
├─ Para Desenvolver
│  ├─ ARCHITECTURE.md (decisões técnicas)
│  ├─ DATABASE_ERD.md (schema do banco)
│  ├─ BEST_PRACTICES.md (como escrever código)
│  └─ prisma/schema.prisma (modelos)
│
└─ Para Começar
   ├─ SETUP.md (guia de instalação)
   ├─ GETTING_STARTED_CHECKLIST.md (checklist)
   └─ .env.example (configuração)
```

---

## 🔍 Busca Rápida por Tópico

### Quero saber sobre...

**Propostas Interativas**
- [PRD.md - User Stories 1.1, 1.2, 1.3](PRD.md#user-story-11-cliente-visualiza-proposta-interativa)
- [ARCHITECTURE.md - Fluxo de Dados #2](ARCHITECTURE.md#2-proposta-interativa-cliente-público)
- [DATABASE_ERD.md - Tabela Proposal](DATABASE_ERD.md#clients--proposals)

**Sistema Anti-Conflito**
- [PRD.md - User Story 3.1](PRD.md#user-story-31-sistema-anti-conflito-de-locação)
- [ARCHITECTURE.md - Fluxo de Dados #3](ARCHITECTURE.md#3-sistema-anti-conflito-de-equipamentos)
- [DATABASE_ERD.md - Query Anti-Conflito](DATABASE_ERD.md#1-busca-de-conflitos-de-equipamentos)
- [BEST_PRACTICES.md - Anti-Conflito](BEST_PRACTICES.md#3-anti-conflito-de-equipamentos-query-otimizada)

**Autenticação**
- [SETUP.md - Seção 8](SETUP.md#8-configurar-middleware-de-autenticação)
- [ARCHITECTURE.md - Middleware](ARCHITECTURE.md#middleware-nextjs)
- [BEST_PRACTICES.md - Segurança](BEST_PRACTICES.md#segurança)

**Testes**
- [BEST_PRACTICES.md - Testes](BEST_PRACTICES.md#testes)

**Deploy**
- [BEST_PRACTICES.md - Deploy](BEST_PRACTICES.md#deploy)

---

## 📞 Suporte

Dúvidas sobre a documentação?
- Abra uma issue no GitHub
- Consulte o [README.md - Seção Suporte](README.md#suporte)

---

## 🔄 Versionamento

Estes documentos são vivos e serão atualizados conforme o projeto evolui.

**Convenção:**
- Cada documento tem "Última Atualização" no rodapé
- Mudanças significativas devem atualizar o changelog (futuro)

**Como contribuir:**
1. Encontrou erro ou informação desatualizada?
2. Abra PR com correção
3. Atualize data de "Última Atualização"

---

**Última Atualização deste Índice:** 2026-01-10
**Responsável:** Arquitetura Zooming CRM

---

<div align="center">

**[⬆️ Voltar ao README](README.md)** • **[📚 Ver Todos os Docs](.)** • **[🚀 Começar Agora](GETTING_STARTED_CHECKLIST.md)**

</div>
