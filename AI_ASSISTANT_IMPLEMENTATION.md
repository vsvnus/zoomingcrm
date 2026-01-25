# Plano de Implementação: Assistente IA Inteligente (Zooming CRM)

Este documento descreve a implementação de um assistente de IA integrado ao CRM, focado em fornecer respostas inteligentes sobre os dados do usuário com total segurança e isolamento por tenant (cliente).

## 1. Visão Geral
- **Objetivo**: Criar uma IA onisciente sobre os dados do CRM do usuário.
- **Fase 1 (Atual)**: Apenas leitura (responder perguntas, gerar insights, buscar dados).
- **Fase 2 (Futuro)**: Execução de tarefas (criar projetos, editar dados) com aprovação.
- **Segurança**: Isolamento estrito de dados por `organization_id`.
- **UX**: Chat flutuante (Floating Widget) global, discreto mas acessível.

## 2. Stack Tecnológico
- **SDK**: Vercel AI SDK (`ai`) para gerenciamento de chat e streaming.
- **Model**: OpenAI (`openai`) - GPT-4o ou GPT-4-Turbo para alta precisão.
- **Data Access**: Supabase Client (usando RLS existente para segurança).
- **UI**: Shadcn UI + Tailwind CSS (AnimatePresence para transições suaves).

## 3. Arquitetura "Tool-Use"
A IA não "adivinhará" os dados. Ela terá acesso a **Ferramentas (Tools)** que executam queries seguras no Supabase.

### Ferramentas Iniciais (Read-Only):
1.  `get_financial_summary`: Retorna totais de entradas, saídas, fluxo de caixa e transações recentes.
2.  `search_projects`: Busca projetos por nome, status ou cliente.
3.  `list_freelancers`: Lista freelancers disponíveis, ativos ou por especialidade.
4.  `get_crm_stats`: Visão geral de dashboard (projetos ativos, propostas pendentes).

## 4. Etapas de Implementação

### Passo 1: Configuração e Dependências
- [ ] Instalar `ai` e `@ai-sdk/openai`.
- [ ] Configurar variáveis de ambiente (`OPENAI_API_KEY`).

### Passo 2: Backend (Route Handler)
- [ ] Criar endpoint `app/api/chat/route.ts`.
- [ ] Implementar System Prompt robusto ("Você é um especialista em gestão de CRM...").
- [ ] Definir Tools com schemas Zod.
- [ ] **Crítico**: Garantir que toda query injete o `organization_id` da sessão atual.

### Passo 3: Frontend (Componentes)
- [ ] Criar `components/ai/ai-chat-widget.tsx`.
- [ ] Implementar botão flutuante com animação de entrada/saída.
- [ ] Criar interface de chat (mensagens do usuário vs. IA).
- [ ] Implementar "Thinking State" (indicador de que a IA está consultando o banco).

### Passo 4: Integração Global
- [ ] Adicionar o Widget ao Layout principal (`app/layout.tsx` ou layout do dashboard).
- [ ] Testar isolamento de dados (garantir que User A não veja dados de User B).

## 5. Exemplo de Fluxo
1.  **Usuário**: "Quanto gastamos com freelancers esse mês?"
2.  **IA**: Identifica intenção -> Chama tool `get_financial_transactions(category='FREELANCER', date_range='current_month')`.
3.  **Sistema**: Executa query SQL segura no Supabase.
4.  **IA**: Recebe JSON -> Formata resposta em texto natural ("Neste mês, o total foi R$ 15.400,00...").
