# 🚀 Zooming CRM - Contexto Atualizado (Jan 2026)

## 📌 Status Atual: Sprint 2 Concluída
O sistema de gestão de projetos está funcional, com integração financeira automática e controle de escopo.

### ✅ O que está funcionando:
1. **Gestão de Projetos:**
   - Kanban board (Briefing -> Concluído)
   - Lista tabular com status e prazos
   - Detalhes do projeto com abas (Overview, Escopo, Equipe, Equipamentos, Financeiro)
   - Múltiplas datas de gravação e entrega

2. **Integração Financeira (Automática):**
   - **Aceitar Proposta** -> Cria Projeto + Cria Registro Financeiro Base (Orçamento Aprovado)
   - **Alocar Freelancer** -> Cria/Atualiza "Conta a Pagar" pendente

3. **Escopo e Entregáveis:**
   - Itens da proposta são copiados para o projeto
   - Checklist de "Feito/Pendente" na aba Escopo
   - Valor do projeto é puxado da proposta e exibido no financeiro do projeto

### 🚧 Próximos Passos (Pontas Soltas para Sprint 3):
1. **Módulo de Propostas (Melhorias):**
   - Ajustar edição de propostas existentes (bug tela preta)
   - Melhorar visualização do orçamento para o cliente

2. **Financeiro Avançado:**
   - Fluxo de Caixa Real (Conciliação bancária)
   - Relatórios de margem por período

---

## 📂 Estrutura de Pastas Relevante
```
src/
├── actions/           # Server Actions (Back-end logic)
│   ├── projects.ts    # Lógica de projetos (CRUD, membros, datas)
│   ├── proposals.ts   # Lógica de propostas (criação, aceite -> gera projeto)
│   └── finances.ts    # Lógica financeira (despesas, receitas)
├── components/
│   ├── projects/      # Componentes de UI do projeto
│   │   ├── project-detail-tabs.tsx  # Onde a mágica acontece (abas explicadas acima)
│   │   ├── dates-manager.tsx        # Gestão de datas
│   │   └── kanban.tsx               # Quadro e lista
│   └── financeiro/    # Componentes financeiros
└── types/             # Definições TypeScript (Project, ProjectItem, etc)
```

## 🛠️ Comandos Úteis
- `npm run dev` - Rodar servidor local
- `npx localtunnel --port 3000` - Gerar link público temporário
- `npx prisma db push` - Atualizar banco de dados (se mexer no schema)

## 📝 Notas de Desenvolvimento
- O banco de dados é **Supabase**.
- ORM é **Prisma**.
- Se for criar novos modelos, lembre de rodar `npx prisma generate` após editar o `schema.prisma`.
