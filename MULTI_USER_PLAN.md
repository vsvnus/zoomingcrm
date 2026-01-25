# Plano de Implementação Multi-Usuários e Colaboração

## Visão Geral
O Zooming CRM já possui uma arquitetura baseada em **Organizações** (`Organization`), onde cada usuário (`User`) pertence a uma organização. Isso é o fundamento para multi-tenancy. No entanto, para tornar a experiência "boa para multiusuários", precisamos implementar permissões granulares, fluxos de convite e auditoria.

## Estrutura Atual (Análise)
- **Model Organization**: Centraliza todos os dados (Projetos, Propostas, Clientes, etc. têm `organizationId`).
- **Model User**: Tem `organizationId` e `role` (ADMIN, PRODUCER, COORDINATOR, EDITOR).
- **Isolamento**: As Server Actions já filtram por `organizationId` (ex: `getProposals` busca onde `organization_id` == user.org_id).

## Plano de Melhorias (Roadmap)

### 1. Sistema de Convites (Invite System)
**Problema:** Atualmente não há um fluxo claro para adicionar novos membros à equipe.
**Solução:**
- Criar tabela `OrganizationInvite` (email, role, token, expiresAt).
- Criar tela de "Membros" nas configurações.
- Fluxo: Admin envia convite por email -> Usuário clica no link -> Cria conta já vinculada à organização.

### 2. Perfis de Acesso (RBAC - Role Based Access Control)
**Problema:** Os papéis existem no banco (`UserRole`), mas não são verificados na UI ou Actions de forma rígida.
**Solução:**
- **Admin:** Acesso total (Financeiro, Configurações da Empresa).
- **Producer:** Cria projetos, propostas, vê financeiro de seus projetos.
- **Coordinator:** Gere calendário e equipamentos, sem acesso a valores financeiros sensíveis.
- **Editor:** Apenas visualiza tarefas e faz upload de reviews.
- **Implementação:** middleware ou HOC (Higher Order Component) para verificar permissões nas rotas.

### 3. Colaboração em Tempo Real
**Problema:** Se dois usuários editarem a mesma proposta, um pode sobrescrever o outro.
**Solução:**
- Usar Supabase Realtime para mostrar "Quem está editando".
- Bloqueio otimista ou avisos de "Alguém alterou este registro".

### 4. Auditoria (Logs)
**Problema:** Em equipes grandes, é essencial saber "quem deletou aquele projeto?".
**Solução:**
- Ativar a tabela `AuditLog` (já existente no schema).
- Registrar ações críticas (Delete, Update Status, Approve) com `userId`.

### 5. Configurações de Perfil Usuário
**Problema:** Falta personalização individual.
**Solução:**
- Avatar do usuário (diferente do logo da empresa).
- Preferências de notificação (email, push).
- Assinatura de email personalizada.

## Próximos Passos Imediatos
1. Criar página de **Perfil do Usuário** (Edição de Nome, Avatar, Senha).
2. Implementar **Upload de Logo** e Avatar (Storage).
3. Criar página de **Gestão de Membros** (Listagem simples, futuramente convites).
