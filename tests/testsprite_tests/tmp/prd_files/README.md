# Clapper 🎬

> CRM especializado para Produtoras de Vídeo e Agências Audiovisuais

Um sistema de gestão completo que resolve as dores específicas do mercado audiovisual: propostas interativas com portfólio embarcado, pipeline de produção cinematográfica, controle anti-conflito de equipamentos e banco de talentos freelancers.

---

## Por que Clapper?

CRMs tradicionais (Salesforce, Pipedrive) não atendem o mercado audiovisual porque:

- ❌ Orçamentos em PDF estático não engajam clientes
- ❌ Não há gestão de equipamentos (câmeras, drones, iluminação)
- ❌ Pipeline genérico não reflete etapas de produção (Briefing → Shooting → Pós)
- ❌ Falta controle de freelancers e disponibilidade
- ❌ Revisão de vídeos desconectada do projeto

### Clapper resolve tudo isso:

✅ **Propostas Interativas** - Landing pages com vídeos e seleção de opcionais em tempo real
✅ **Pipeline Audiovisual** - Kanban específico (Lead → Briefing → Shooting → Pós → Entrega)
✅ **Sistema Anti-Conflito** - Nunca reserve a mesma câmera para 2 projetos no mesmo dia
✅ **Banco de Talentos** - Freelancers com calendário de disponibilidade
✅ **Aprovação de Mídia** - Cliente aprova/rejeita vídeos direto no sistema

---

## Tecnologias

### Stack Principal
- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **ORM:** Prisma
- **State:** Zustand + React Query

### Infraestrutura
- **Hosting:** Vercel
- **Database:** Supabase Cloud
- **Email:** Resend
- **Analytics:** Vercel Analytics

---

## Funcionalidades MVP

### 1️⃣ Gestão Visual de Propostas
- Landing page única por proposta (`/p/{token}`)
- Vídeos de portfólio embarcados (Vimeo/YouTube)
- Seleção de opcionais com cálculo em tempo real
- Cliente aceita proposta com um clique

### 2️⃣ Pipeline de Produção
- Kanban customizado: **Lead → Briefing → Pré-Produção → Shooting → Pós → Revisão → Entrega**
- Validações por etapa (ex: Shooting exige data + local + equipe)
- Notificações automáticas por email

### 3️⃣ Reserva de Equipamentos
- Cadastro de equipamentos (Câmeras, Lentes, Áudio, Iluminação, Drones)
- **Sistema anti-conflito:** Impede dupla reserva na mesma data
- Kits pré-configurados (ex: Kit Mirrorless = Câmera + 3 Lentes + Bateria)
- Calendário visual de disponibilidade

### 4️⃣ Banco de Talentos
- Cadastro de freelancers com tags (Câmera, Áudio, Editor, Motion Designer)
- Avaliação interna (1-5 estrelas)
- Calendário de disponibilidade
- Notificação automática quando alocado

### 5️⃣ Controle de Revisões
- Cliente acessa `/review/{token}` para ver vídeo
- Botões "Aprovar" ou "Solicitar Alterações"
- Histórico de versões (V1, V2, V3...)
- Aprovação move projeto automaticamente para "Entrega"

---

## Documentação

📚 **Docs Disponíveis:**

- [PRD.md](PRD.md) - Product Requirements Document completo
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura e decisões técnicas
- [DATABASE_ERD.md](DATABASE_ERD.md) - Diagrama do banco de dados
- [SETUP.md](SETUP.md) - Guia passo a passo de instalação

---

## Instalação Rápida

### Pré-requisitos
- Node.js 18+
- pnpm 8+
- Conta no Supabase (gratuita)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/clapper.git
cd clapper
```

### 2. Instale dependências
```bash
pnpm install
```

### 3. Configure variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
DATABASE_URL=postgresql://...
```

### 4. Execute migrations
```bash
pnpm db:migrate
pnpm db:seed  # Popula com dados de exemplo
```

### 5. Inicie o servidor
```bash
pnpm dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

📖 **Para setup detalhado, veja [SETUP.md](SETUP.md)**

---

## Estrutura do Projeto

```
clapper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login/Signup
│   │   ├── (dashboard)/       # Área autenticada
│   │   │   ├── projects/      # Pipeline Kanban
│   │   │   ├── proposals/     # Gestão de Propostas
│   │   │   ├── clients/       # CRUD Clientes
│   │   │   ├── inventory/     # Equipamentos
│   │   │   └── freelancers/   # Banco de Talentos
│   │   └── (public)/          # Rotas públicas
│   │       ├── p/[token]      # Proposta pública
│   │       └── review/[token] # Revisão de vídeo
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilitários (Prisma, Supabase)
│   ├── actions/               # Server Actions
│   └── hooks/                 # Custom Hooks
├── prisma/
│   └── schema.prisma          # Schema do banco
└── public/                    # Assets estáticos
```

---

## Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor (localhost:3000)
pnpm build            # Build de produção
pnpm lint             # Rodar ESLint

# Database (Prisma)
pnpm db:generate      # Gerar tipos TypeScript
pnpm db:migrate       # Criar/aplicar migrations
pnpm db:push          # Sync schema (dev only)
pnpm db:studio        # Abrir Prisma Studio (GUI do banco)
pnpm db:seed          # Popular com dados fake

# Testes
pnpm test             # Rodar testes unitários
pnpm test:e2e         # Testes end-to-end
```

---

## Roadmap

### ✅ MVP (Q1 2026)
- [x] Autenticação e multi-tenancy
- [x] CRUD de Clientes e Projetos
- [x] Propostas Interativas
- [x] Pipeline Kanban
- [x] Sistema de Equipamentos
- [x] Banco de Freelancers
- [x] Controle de Revisões

### 🚧 V2 (Q2 2026)
- [ ] Dashboard com métricas (DRE, funil de vendas)
- [ ] Integração WhatsApp para notificações
- [ ] Assinatura eletrônica de contratos (DocuSign/ClickSign)
- [ ] Templates de proposta (por segmento)
- [ ] Relatório de uso de equipamentos

### 🔮 Futuro
- [ ] App mobile (React Native)
- [ ] IA para sugestão de orçamentos
- [ ] Marketplace público de freelancers
- [ ] Integração com Google Drive/Dropbox para mídia

---

## Contribuindo

Contribuições são bem-vindas! Para mudanças grandes:

1. Abra uma issue descrevendo a feature/bug
2. Fork o repositório
3. Crie uma branch: `git checkout -b feature/nome-da-feature`
4. Commit: `git commit -m 'feat: adiciona funcionalidade X'`
5. Push: `git push origin feature/nome-da-feature`
6. Abra um Pull Request

### Padrão de Commits
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nova funcionalidade
fix: correção de bug
docs: mudanças na documentação
style: formatação (sem mudança de lógica)
refactor: refatoração de código
test: adição de testes
chore: mudanças em configs/build
```

---

## Suporte

- 📧 Email: suporte@clapper.app
- 💬 Discord: [discord.gg/clapper](https://discord.gg/clapper)
- 🐛 Bugs: [GitHub Issues](https://github.com/seu-usuario/clapper/issues)
- 📖 Docs: [docs.clapper.app](https://docs.clapper.app)

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Autores

Desenvolvido com ❤️ por profissionais do mercado audiovisual que entenderam a dor.

**Equipe:**
- Product Owner: [Seu Nome]
- Tech Lead: [Seu Nome]
- Designer UI/UX: [Seu Nome]

---

## Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Proposta Interativa
![Proposta](docs/screenshots/proposta.png)

### Pipeline Kanban
![Pipeline](docs/screenshots/pipeline.png)

### Calendário de Equipamentos
![Equipamentos](docs/screenshots/equipamentos.png)

---

## Agradecimentos

- [Next.js](https://nextjs.org) - Framework React
- [Supabase](https://supabase.com) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Prisma](https://prisma.io) - ORM TypeScript
- [Vercel](https://vercel.com) - Hosting

---

<div align="center">

**[Website](https://clapper.app)** • **[Documentação](docs/)** • **[Roadmap](https://github.com/seu-usuario/clapper/projects)** • **[Changelog](CHANGELOG.md)**

</div>
