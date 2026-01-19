# Product Requirements Document (PRD)
## Zooming - CRM para Produtoras Audiovisuais

**Versão:** 1.0 (MVP)
**Data:** Janeiro 2026
**Autor:** Arquitetura de Produto
**Status:** Em Desenvolvimento

---

## 1. Visão do Produto

### 1.1 Problema
Produtoras de vídeo e agências audiovisuais enfrentam desafios únicos que CRMs tradicionais (Salesforce, Pipedrive) não resolvem:
- Orçamentos estáticos em PDF que não engajam clientes
- Impossibilidade de mostrar portfólio integrado à proposta
- Falta de controle de inventário de equipamentos (conflitos de locação)
- Gestão manual de freelancers e disponibilidade
- Processo de revisão/aprovação de vídeos desconectado do pipeline

### 1.2 Solução
CRM especializado com:
- Propostas interativas (Landing Pages com vídeos e seleção de opcionais)
- Pipeline de produção audiovisual (Briefing → Shooting → Pós → Entrega)
- Sistema anti-conflito de reserva de equipamentos
- Banco de talentos com calendário de disponibilidade
- Integração com plataformas de vídeo para aprovações

### 1.3 Público-Alvo (ICP)
- Produtoras de vídeo com 3-20 funcionários
- Agências de marketing com departamento audiovisual
- Estúdios de conteúdo digital
- Faturamento: R$ 30k-300k/mês
- Dor principal: Perdem equipamentos/datas por falta de organização

---

## 2. Funcionalidades Core (MVP)

### 2.1 Gestão Visual de Propostas

#### User Story 1.1: Cliente Visualiza Proposta Interativa
**Como** cliente de uma produtora,
**Quero** acessar um link único da proposta e visualizar vídeos do portfólio diretamente,
**Para** entender a qualidade do trabalho sem baixar arquivos ou abrir múltiplos links.

**Critérios de Aceite:**
- [ ] Proposta possui URL única e privada (ex: `zooming.app/p/ABC123`)
- [ ] Player de vídeo embarcado (Vimeo/YouTube) funciona sem sair da página
- [ ] Design responsivo (mobile-first)
- [ ] Não requer login para o cliente visualizar
- [ ] Exibe logo e informações da produtora no cabeçalho

**Prioridade:** P0 (Crítico)
**Estimativa:** 8 pontos

---

#### User Story 1.2: Seleção de Opcionais com Cálculo Dinâmico
**Como** cliente,
**Quero** marcar/desmarcar opcionais (ex: "Drone", "Color Grading") e ver o valor total atualizar em tempo real,
**Para** montar um pacote personalizado dentro do meu orçamento.

**Critérios de Aceite:**
- [ ] Checkboxes/toggle para cada opcional listado
- [ ] Valor total atualiza sem reload (React State)
- [ ] Exibe breakdown: Valor Base + Opcionais = Total
- [ ] Desconto percentual (se aplicável) recalculado automaticamente
- [ ] Botão "Aceitar Proposta" envia confirmação para a produtora

**Regras de Negócio:**
- Opcionais podem ter dependências (ex: "Motion Graphics avançado" só aparece se "Edição Premium" estiver marcado)
- Desconto máximo configurável por produtora (ex: até 15%)

**Prioridade:** P0
**Estimativa:** 13 pontos

---

#### User Story 1.3: Produtor Cria Proposta em Minutos
**Como** produtor,
**Quero** duplicar propostas anteriores e alterar apenas valores/itens,
**Para** economizar tempo em orçamentos semelhantes.

**Critérios de Aceite:**
- [ ] Botão "Duplicar" em propostas existentes
- [ ] Template pré-configurado com itens padrão (ex: "Vídeo Institucional 60s")
- [ ] Editor drag-and-drop para reorganizar seções
- [ ] Preview em tempo real antes de enviar
- [ ] Sistema de versionamento (V1, V2) se cliente pedir alterações

**Prioridade:** P1
**Estimativa:** 8 pontos

---

### 2.2 Pipeline de Produção (Kanban Customizado)

#### User Story 2.1: Movimentação Guiada por Etapas
**Como** gerente de produção,
**Quero** mover projetos entre colunas do pipeline com validações automáticas,
**Para** garantir que nenhuma etapa seja pulada.

**Critérios de Aceite:**
- [ ] Colunas fixas: Lead → Briefing → Pré-Produção → Shooting → Pós-Produção → Revisão → Entrega
- [ ] Drag & drop entre colunas (dnd-kit ou similar)
- [ ] Ao mover para "Shooting", modal obriga preencher:
  - Data da gravação
  - Horário de início
  - Locação/endereço
  - Equipe alocada (mínimo 1 pessoa)
- [ ] Bloqueia avanço se campos obrigatórios não preenchidos
- [ ] Notificação por email para equipe quando projeto chega em "Shooting"

**Prioridade:** P0
**Estimativa:** 13 pontos

---

#### User Story 2.2: Filtros e Busca no Pipeline
**Como** produtor executivo,
**Quero** filtrar projetos por cliente, data de entrega ou responsável,
**Para** ter visibilidade rápida de gargalos.

**Critérios de Aceite:**
- [ ] Barra de busca por nome do projeto/cliente
- [ ] Filtros: Data (Esta Semana, Este Mês), Status, Responsável
- [ ] Contador de projetos por coluna
- [ ] Indicador visual de atraso (vermelho se prazo vencido)

**Prioridade:** P1
**Estimativa:** 5 pontos

---

### 2.3 Reserva de Equipamentos (Inventory Booking)

#### User Story 3.1: Sistema Anti-Conflito de Locação
**Como** coordenador de produção,
**Quero** que o sistema impeça a reserva do mesmo equipamento para dois projetos na mesma data,
**Para** evitar conflitos logísticos e clientes insatisfeitos.

**Critérios de Aceite:**
- [ ] Ao tentar alocar equipamento, sistema verifica disponibilidade via query
- [ ] Se conflito, exibe mensagem: "Sony FX3 já reservada para 'Projeto X' em 10/01"
- [ ] Sugestão automática de equipamento alternativo (mesma categoria)
- [ ] Calendário visual mostrando período de locação (data início → data retorno)
- [ ] Bloqueio de 1 dia pós-gravação para manutenção (configurável)

**Regras de Negócio:**
- Equipamento "Em Manutenção" não aparece em buscas
- Histórico de locações para rastreabilidade

**Prioridade:** P0
**Estimativa:** 13 pontos

---

#### User Story 3.2: Cadastro de Kits de Equipamentos
**Como** responsável pelo inventário,
**Quero** agrupar itens em Kits (ex: "Kit Mirrorless" = Câmera + 3 Lentes + Bateria),
**Para** alocar conjuntos completos com um clique.

**Critérios de Aceite:**
- [ ] CRUD de Kits (nome, descrição, lista de itens)
- [ ] Ao reservar Kit, sistema reserva todos os itens individualmente
- [ ] Se 1 item do Kit estiver indisponível, bloqueia todo o Kit
- [ ] Exibição do status do Kit (Disponível, Parcialmente Disponível, Indisponível)

**Prioridade:** P1
**Estimativa:** 8 pontos

---

### 2.4 Banco de Talentos (Freelancers)

#### User Story 4.1: Cadastro e Categorização de Freelancers
**Como** produtor,
**Quero** manter um banco de freelancers com especialidades e contato,
**Para** escalar equipe rapidamente conforme demanda.

**Critérios de Aceite:**
- [ ] Campos: Nome, Email, Telefone, Portfólio URL, Diária (R$), Tags
- [ ] Tags predefinidas: Câmera, Áudio, Iluminação, Editor, Motion Designer, Drone
- [ ] Upload de foto de perfil
- [ ] Avaliação interna (1-5 estrelas) e notas privadas
- [ ] Status: Ativo, Inativo, Lista Negra

**Prioridade:** P1
**Estimativa:** 5 pontos

---

#### User Story 4.2: Calendário de Disponibilidade
**Como** coordenador,
**Quero** visualizar a disponibilidade dos freelancers antes de alocar,
**Para** não convidar alguém que já está em outro job.

**Critérios de Aceite:**
- [ ] Freelancer marca dias indisponíveis no próprio perfil (login básico)
- [ ] Calendário mostra "Ocupado" em vermelho e "Livre" em verde
- [ ] Ao alocar para projeto, dia é automaticamente marcado como ocupado
- [ ] Notificação automática para freelancer quando for alocado

**Prioridade:** P2 (Pós-MVP, mas desejável)
**Estimativa:** 13 pontos

---

### 2.5 Controle de Revisões (Aprovação de Mídia)

#### User Story 5.1: Cliente Aprova ou Solicita Alterações
**Como** cliente,
**Quero** clicar em um link de revisão, assistir o vídeo e marcar "Aprovado" ou "Solicitar Alterações",
**Para** formalizar feedbacks sem emails confusos.

**Critérios de Aceite:**
- [ ] URL única por versão (ex: `zooming.app/review/XYZ/v1`)
- [ ] Player embarcado do Vimeo/YouTube
- [ ] Dois botões grandes: "✅ Aprovar Final" e "✏️ Solicitar Mudanças"
- [ ] Se "Solicitar Mudanças", abre textarea para comentários obrigatórios
- [ ] Sistema registra timestamp da aprovação
- [ ] Notificação automática para editor e produtor

**Regras de Negócio:**
- Vídeo aprovado move automaticamente o projeto para coluna "Entrega"
- Limite de revisões configurável (ex: 2 rodadas inclusas)

**Prioridade:** P0
**Estimativa:** 8 pontos

---

#### User Story 5.2: Histórico de Versões
**Como** editor,
**Quero** ver todas as versões enviadas e feedbacks do cliente,
**Para** entender a evolução do projeto e evitar retrabalho.

**Critérios de Aceite:**
- [ ] Timeline visual: V1 (Rejeitado - 05/01) → V2 (Aprovado - 10/01)
- [ ] Link para cada versão do vídeo
- [ ] Comentários do cliente expandíveis por versão
- [ ] Indicador de SLA (ex: "Revisão pendente há 3 dias")

**Prioridade:** P1
**Estimativa:** 5 pontos

---

## 3. Requisitos Não-Funcionais

### 3.1 Performance
- Propostas devem carregar em < 2s (LCP)
- Operações de reserva de equipamento em < 500ms
- Suporte a 100 projetos ativos simultâneos no MVP

### 3.2 Segurança
- Propostas acessíveis apenas via token único (sem indexação em buscadores)
- Autenticação JWT (Supabase Auth)
- RLS (Row Level Security) no Postgres para multi-tenancy
- Logs de auditoria para ações críticas (aprovação, alteração de valores)

### 3.3 Usabilidade
- Interface em português brasileiro
- Mobile-first design
- Acessibilidade WCAG 2.1 (mínimo AA)
- Onboarding com exemplo pré-configurado

### 3.4 Escalabilidade
- Arquitetura preparada para multi-tenancy (1 banco, N produtoras)
- Fila de jobs (Supabase Edge Functions ou Inngest) para notificações
- CDN para assets (Vercel Edge ou Cloudflare)

---

## 4. Fora do Escopo (Pós-MVP)

- Integração nativa com WhatsApp para notificações
- Assinatura de contrato eletrônico (DocuSign/ClickSign)
- Dashboard financeiro completo (DRE, fluxo de caixa)
- App mobile nativo
- IA para sugestão de orçamentos baseada em histórico
- Marketplace de freelancers público

---

## 5. Métricas de Sucesso (KPIs)

**Adoção:**
- 10 produtoras ativas em 3 meses
- 50 propostas criadas/mês

**Engajamento:**
- Taxa de conversão de proposta: > 40% (benchmark: PDF comum = 20%)
- Tempo médio de fechamento de deal: < 7 dias

**Operacional:**
- Redução de 80% em conflitos de equipamento
- 100% das gravações com equipe confirmada (sem "furo")

**Retenção:**
- Churn < 5% MRR
- NPS > 50

---

## 6. Cronograma (Estimativa em Sprints de 2 semanas)

| Sprint | Entregável |
|--------|------------|
| 1-2 | Setup projeto + Auth + CRUD Clientes/Projetos |
| 3-4 | Propostas Interativas (US 1.1, 1.2) |
| 5 | Pipeline Kanban (US 2.1) |
| 6-7 | Sistema de Equipamentos (US 3.1, 3.2) |
| 8 | Banco de Talentos (US 4.1) |
| 9 | Controle de Revisões (US 5.1) |
| 10 | Testes, Ajustes, Deploy Beta |

**Total:** 20 semanas (5 meses) para MVP completo

---

## 7. Stakeholders e Aprovações

| Papel | Nome | Responsabilidade |
|-------|------|------------------|
| Product Owner | [A definir] | Priorização do backlog |
| Tech Lead | [A definir] | Decisões arquiteturais |
| Designer UI/UX | [A definir] | Fluxos e identidade visual |
| QA Lead | [A definir] | Estratégia de testes |

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Integração com Vimeo/YouTube falhar | Média | Alto | Implementar fallback com upload direto |
| Complexidade do anti-conflito de equipamentos | Alta | Médio | Usar transaction locks no Postgres |
| Adoção baixa por resistência a mudança | Média | Alto | Onboarding guiado + templates prontos |
| Custos de infraestrutura explodirem | Baixa | Alto | Monitorar com Vercel Analytics + rate limiting |

---

## 9. Anexos

### Glossário
- **Opcional:** Item adicional que o cliente pode contratar além do pacote base
- **Shooting:** Dia da gravação/filmagem
- **Pós-Produção:** Edição, colorização, motion graphics
- **Kit:** Conjunto de equipamentos agrupados para locação conjunta
- **RLS:** Row Level Security (segurança a nível de linha no banco)

### Referências
- [Benchmark: Propostas Interativas - PandaDoc](https://www.pandadoc.com)
- [Sistema de Reservas - Booqable](https://booqable.com)
- [Pipeline Audiovisual - Frame.io](https://frame.io)

---

**Última Atualização:** 2026-01-10
**Próxima Revisão:** Após Sprint 2 (validação com beta testers)
