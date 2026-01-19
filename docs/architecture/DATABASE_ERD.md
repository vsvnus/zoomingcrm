# Diagrama Entidade-Relacionamento (ERD)
## Zooming CRM - Database Schema

Este documento apresenta a estrutura visual do banco de dados do Zooming CRM.

---

## Visão Geral

O banco de dados é estruturado em **5 domínios principais**:

1. **Core** - Organizações e Usuários (Multi-tenancy)
2. **Sales** - Clientes e Propostas
3. **Production** - Projetos e Pipeline
4. **Inventory** - Equipamentos e Reservas
5. **People** - Freelancers e Alocações
6. **Review** - Aprovações de Mídia

---

## Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE (Multi-Tenancy)                        │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  Organization    │
    ├──────────────────┤
    │ id (PK)          │
    │ name             │
    │ slug (UNIQUE)    │──┐
    │ logo             │  │
    │ maxDiscount      │  │
    │ maxRevisions     │  │
    └──────────────────┘  │
            │             │
            │ 1:N         │
            ▼             │
    ┌──────────────────┐  │
    │      User        │  │
    ├──────────────────┤  │
    │ id (PK)          │  │
    │ email (UNIQUE)   │  │
    │ name             │  │
    │ role             │  │ (Todas as tabelas têm FK para Organization)
    │ organizationId   │──┘
    └──────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      SALES (Propostas e Clientes)                   │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐           ┌──────────────────────┐
    │     Client       │           │      Proposal        │
    ├──────────────────┤           ├──────────────────────┤
    │ id (PK)          │ 1:N       │ id (PK)              │
    │ name             │───────────│ token (UNIQUE)       │  ← URL pública: /p/{token}
    │ email            │           │ title                │
    │ company          │           │ baseValue            │
    │ organizationId   │           │ discount             │
    └──────────────────┘           │ totalValue           │
                                   │ status               │  ← DRAFT/SENT/ACCEPTED
                                   │ clientId (FK)        │
                                   │ organizationId       │
                                   └──────────────────────┘
                                            │
                            ┌───────────────┼───────────────┐
                            │ 1:N           │ 1:N           │ 1:N
                            ▼               ▼               ▼
                   ┌─────────────┐  ┌──────────────┐  ┌───────────────┐
                   │ProposalItem │  │ProposalOptio.│  │ProposalVideo  │
                   ├─────────────┤  ├──────────────┤  ├───────────────┤
                   │ description │  │ title        │  │ title         │
                   │ quantity    │  │ price        │  │ videoUrl      │
                   │ unitPrice   │  │ isSelected   │  │ order         │
                   │ total       │  │ dependency   │  └───────────────┘
                   └─────────────┘  └──────────────┘
                                         ▲
                                         │ Self-referencing (dependency)


┌─────────────────────────────────────────────────────────────────────┐
│                   PRODUCTION (Pipeline de Projetos)                 │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐
    │        Project           │
    ├──────────────────────────┤
    │ id (PK)                  │
    │ title                    │
    │ stage                    │  ← LEAD → BRIEFING → PRE_PRODUCTION
    │ deadline                 │           → SHOOTING → POST → REVIEW → DELIVERED
    │ shootingDate             │
    │ shootingTime             │
    │ location                 │
    │ clientId (FK)            │
    │ assignedToId (FK User)   │
    │ organizationId           │
    └──────────────────────────┘
            │
            │ 1:N
            ▼
    ┌──────────────────────────┐
    │    ReviewVersion         │
    ├──────────────────────────┤
    │ id (PK)                  │
    │ token (UNIQUE)           │  ← URL pública: /review/{token}
    │ version                  │  ← V1, V2, V3...
    │ videoUrl                 │
    │ status                   │  ← PENDING/APPROVED/REJECTED
    │ clientFeedback           │
    │ approvedAt               │
    │ projectId (FK)           │
    └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│               INVENTORY (Equipamentos e Reservas)                   │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐                    ┌──────────────────────┐
    │   Equipment      │                    │   EquipmentKit       │
    ├──────────────────┤                    ├──────────────────────┤
    │ id (PK)          │                    │ id (PK)              │
    │ name             │                    │ name                 │
    │ category         │  ← CAMERA/LENS/... │ description          │
    │ serialNumber     │                    │ organizationId       │
    │ status           │  ← AVAILABLE/...   └──────────────────────┘
    │ organizationId   │                             │
    └──────────────────┘                             │ 1:N
            │                                        ▼
            │ N:M                          ┌──────────────────────┐
            │ (via EquipmentKitItem)       │ EquipmentKitItem     │
            │                              ├──────────────────────┤
            │                              │ kitId (FK)           │
            │                              │ equipmentId (FK)     │
            └──────────────────────────────│ quantity             │
                                           └──────────────────────┘
    ┌──────────────────┐
    │   Equipment      │
    ├──────────────────┤
    │ id (PK)          │
    └──────────────────┘
            │
            │ 1:N
            ▼
    ┌──────────────────────────┐
    │  EquipmentBooking        │
    ├──────────────────────────┤
    │ id (PK)                  │
    │ startDate                │  ← Sistema anti-conflito verifica
    │ endDate                  │     se há overlap de datas
    │ returnDate               │
    │ equipmentId (FK)         │
    │ projectId (FK)           │
    └──────────────────────────┘

    ** Query Anti-Conflito **
    SELECT * FROM equipment_bookings
    WHERE equipmentId = X
      AND startDate <= @novaData
      AND endDate >= @novaData


┌─────────────────────────────────────────────────────────────────────┐
│                PEOPLE (Freelancers e Banco de Talentos)             │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐
    │      Freelancer          │
    ├──────────────────────────┤
    │ id (PK)                  │
    │ name                     │
    │ email                    │
    │ phone                    │
    │ portfolio                │
    │ dailyRate                │
    │ rating                   │  ← Avaliação interna (1-5)
    │ status                   │  ← ACTIVE/INACTIVE/BLACKLISTED
    │ organizationId           │
    └──────────────────────────┘
            │
            ├───────┬─────────────────┐
            │ 1:N   │ 1:N             │ 1:N
            ▼       ▼                 ▼
    ┌──────────┐ ┌─────────────────┐ ┌──────────────────────┐
    │Tag       │ │Allocation       │ │Availability          │
    ├──────────┤ ├─────────────────┤ ├──────────────────────┤
    │ name     │ │ date            │ │ date                 │
    └──────────┘ │ confirmed       │ │ isAvailable          │
                 │ projectId (FK)  │ └──────────────────────┘
                 │ freelancerId    │
                 └─────────────────┘
                         │
                         │ UNIQUE(freelancerId, date)
                         │ ← Freelancer não pode estar em 2 projetos no mesmo dia


┌─────────────────────────────────────────────────────────────────────┐
│                       AUDITORIA E LOGS                              │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐
    │       AuditLog           │
    ├──────────────────────────┤
    │ id (PK)                  │
    │ action                   │  ← PROPOSAL_ACCEPTED, EQUIPMENT_BOOKED, etc
    │ entityType               │  ← "Proposal", "Project"...
    │ entityId                 │
    │ metadata (JSON)          │
    │ userId (FK)              │
    │ ipAddress                │
    │ createdAt                │
    └──────────────────────────┘

    ** Índice Composto **
    INDEX idx_audit_entity ON audit_logs(entityType, entityId)
```

---

## Índices Críticos para Performance

### 1. Busca de Conflitos de Equipamentos
```sql
CREATE INDEX idx_bookings_conflict
ON equipment_bookings (equipmentId, startDate, endDate);
```

**Query otimizada:**
```sql
-- Verifica se equipamento está livre em determinada data
SELECT * FROM equipment_bookings
WHERE equipmentId = '123'
  AND startDate <= '2026-01-15'
  AND endDate >= '2026-01-15'
LIMIT 1;

-- Se retornar 0 linhas = equipamento livre
```

### 2. Alocação de Freelancers (Constraint Único)
```sql
CREATE UNIQUE INDEX idx_freelancer_date
ON freelancer_allocations (freelancerId, date);
```

**Garante:** Freelancer não pode estar em 2 projetos no mesmo dia.

### 3. Audit Logs (Busca por Entidade)
```sql
CREATE INDEX idx_audit_entity
ON audit_logs (entityType, entityId);
```

**Uso:** Ver histórico completo de uma proposta ou projeto.

---

## Constraints e Regras de Negócio

### 1. Propostas
- `token` deve ser único (UUID ou nanoid)
- `totalValue` = `baseValue` + soma(opcionais selecionados) - desconto
- Desconto não pode exceder `Organization.maxDiscount`
- Status transitions válidas:
  ```
  DRAFT → SENT → VIEWED → ACCEPTED
                     ↓
                 REJECTED
  ```

### 2. Projetos
- Ao mover para stage `SHOOTING`:
  - `shootingDate` obrigatório
  - `shootingTime` obrigatório
  - `location` obrigatório
  - Pelo menos 1 `FreelancerAllocation`

- Ao mover para `DELIVERED`:
  - Deve existir `ReviewVersion` com status `APPROVED`

### 3. Equipamentos
- `Equipment.status = IN_USE` se existir `EquipmentBooking` ativo
- `Equipment.status = MAINTENANCE` bloqueia novas reservas
- Reserva deve ter margem de 1 dia para manutenção (configurável)

### 4. Revisões
- Número de rodadas não pode exceder `Organization.maxRevisions`
- `ReviewVersion.version` auto-incrementa a cada nova submissão
- Cliente aprovando (`status = APPROVED`) move projeto para `DELIVERED`

---

## Queries Complexas (Casos de Uso)

### 1. Dashboard - Próximas Gravações (Shooting)
```sql
SELECT
  p.id,
  p.title,
  p.shootingDate,
  p.location,
  c.name AS clientName,
  COUNT(fa.id) AS teamSize
FROM projects p
JOIN clients c ON c.id = p.clientId
LEFT JOIN freelancer_allocations fa ON fa.projectId = p.id
WHERE p.stage = 'SHOOTING'
  AND p.shootingDate BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  AND p.organizationId = '...'
GROUP BY p.id, c.name
ORDER BY p.shootingDate ASC;
```

### 2. Propostas - Taxa de Conversão
```sql
SELECT
  COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END)::FLOAT /
  COUNT(CASE WHEN status IN ('SENT', 'VIEWED', 'ACCEPTED', 'REJECTED') THEN 1 END) * 100
  AS conversion_rate
FROM proposals
WHERE organizationId = '...'
  AND createdAt >= NOW() - INTERVAL '30 days';
```

### 3. Equipamentos - Disponibilidade por Período
```sql
-- Equipamentos livres na semana de 13/01 a 20/01
SELECT e.*
FROM equipments e
WHERE e.status = 'AVAILABLE'
  AND e.organizationId = '...'
  AND NOT EXISTS (
    SELECT 1 FROM equipment_bookings eb
    WHERE eb.equipmentId = e.id
      AND eb.startDate <= '2026-01-20'
      AND eb.endDate >= '2026-01-13'
  );
```

### 4. Freelancers - Top 5 Mais Alocados
```sql
SELECT
  f.name,
  f.rating,
  COUNT(fa.id) AS total_jobs,
  AVG(p.rating) AS avg_project_rating -- assumindo que Project terá rating futuro
FROM freelancers f
JOIN freelancer_allocations fa ON fa.freelancerId = f.id
JOIN projects p ON p.id = fa.projectId
WHERE f.organizationId = '...'
  AND fa.date >= NOW() - INTERVAL '6 months'
GROUP BY f.id
ORDER BY total_jobs DESC
LIMIT 5;
```

---

## Migrations Importantes

### 1. Trigger: Atualizar Status de Equipamento
```sql
-- Quando booking é criado, marcar equipamento como IN_USE
CREATE OR REPLACE FUNCTION update_equipment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Ao criar booking
  IF (TG_OP = 'INSERT') THEN
    UPDATE equipments
    SET status = 'IN_USE'
    WHERE id = NEW.equipmentId
      AND startDate <= NOW()
      AND endDate >= NOW();
  END IF;

  -- Ao retornar (returnDate preenchido)
  IF (TG_OP = 'UPDATE' AND NEW.returnDate IS NOT NULL) THEN
    -- Verificar se não há outros bookings ativos
    IF NOT EXISTS (
      SELECT 1 FROM equipment_bookings
      WHERE equipmentId = NEW.equipmentId
        AND id != NEW.id
        AND startDate <= NOW()
        AND endDate >= NOW()
    ) THEN
      UPDATE equipments
      SET status = 'AVAILABLE'
      WHERE id = NEW.equipmentId;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_equipment_status
AFTER INSERT OR UPDATE ON equipment_bookings
FOR EACH ROW
EXECUTE FUNCTION update_equipment_status();
```

### 2. Função: Calcular Total da Proposta
```sql
CREATE OR REPLACE FUNCTION calculate_proposal_total(proposal_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
  base DECIMAL;
  discount DECIMAL;
  optionals_total DECIMAL;
BEGIN
  -- Buscar valores base
  SELECT baseValue, discount INTO base, discount
  FROM proposals
  WHERE id = proposal_id;

  -- Somar opcionais selecionados
  SELECT COALESCE(SUM(price), 0) INTO optionals_total
  FROM proposal_optionals
  WHERE proposalId = proposal_id
    AND isSelected = true;

  -- Total = Base + Opcionais - (Desconto%)
  RETURN base + optionals_total - ((base + optionals_total) * discount / 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar totalValue automaticamente
CREATE TRIGGER trg_update_proposal_total
AFTER INSERT OR UPDATE ON proposal_optionals
FOR EACH ROW
EXECUTE FUNCTION refresh_proposal_total();
```

---

## Estratégia de Backup e Retenção

### Supabase (Plano Gratuito)
- Backups automáticos diários (últimos 7 dias)
- Retenção de 1 semana

### Supabase (Plano Pro)
- Backups Point-in-Time Recovery (PITR)
- Retenção customizável (até 30 dias)

### Recomendação para Produção
```bash
# Script de backup manual (cron diário)
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
```

---

## Segurança (Row Level Security)

Habilite RLS no Supabase para todas as tabelas:

```sql
-- Exemplo: Usuário só acessa dados da própria organização
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own org projects"
ON projects
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Aplicar política similar em todas as tabelas com organizationId
```

**Exceções (Rotas Públicas):**
- `proposals` - Acessível via token (sem auth)
- `review_versions` - Acessível via token (sem auth)

---

**Última Atualização:** 2026-01-10
**Responsável:** Arquitetura de Dados - Zooming CRM
