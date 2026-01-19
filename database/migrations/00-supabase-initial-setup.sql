-- Zooming CRM - Setup do Banco de Dados no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- ============================================
-- 1. CORE ENTITIES (Organizations & Users)
-- ============================================

CREATE TABLE organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  max_discount DECIMAL DEFAULT 15,
  max_revisions INTEGER DEFAULT 2,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'PRODUCER', -- ADMIN, PRODUCER, COORDINATOR, EDITOR
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. CLIENTS
-- ============================================

CREATE TABLE clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  notes TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. PROPOSALS (Propostas Interativas)
-- ============================================

CREATE TABLE proposals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  token TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  base_value DECIMAL NOT NULL,
  discount DECIMAL DEFAULT 0,
  total_value DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED
  version INTEGER DEFAULT 1,
  valid_until TIMESTAMP,
  accepted_at TIMESTAMP,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE proposal_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  "order" INTEGER NOT NULL,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE
);

CREATE TABLE proposal_optionals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  is_selected BOOLEAN DEFAULT FALSE,
  dependency TEXT,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE
);

CREATE TABLE proposal_videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE
);

-- ============================================
-- 4. PROJECTS (Pipeline de Produção)
-- ============================================

CREATE TABLE projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'LEAD', -- LEAD, BRIEFING, PRE_PRODUCTION, SHOOTING, POST_PRODUCTION, REVIEW, DELIVERED, ARCHIVED
  deadline TIMESTAMP,
  shooting_date TIMESTAMP,
  shooting_time TEXT,
  location TEXT,
  client_id TEXT NOT NULL REFERENCES clients(id),
  assigned_to_id TEXT REFERENCES users(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. EQUIPMENTS (Inventário)
-- ============================================

CREATE TABLE equipments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- CAMERA, LENS, AUDIO, LIGHTING, GRIP, DRONE, ACCESSORY, OTHER
  serial_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, IN_USE, MAINTENANCE, RETIRED
  notes TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment_kits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment_kit_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  quantity INTEGER DEFAULT 1,
  kit_id TEXT NOT NULL REFERENCES equipment_kits(id) ON DELETE CASCADE,
  equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  UNIQUE(kit_id, equipment_id)
);

CREATE TABLE equipment_bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  return_date TIMESTAMP,
  notes TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  equipment_id TEXT NOT NULL REFERENCES equipments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca de conflitos (IMPORTANTE!)
CREATE INDEX idx_equipment_bookings_conflict ON equipment_bookings(equipment_id, start_date, end_date);

-- ============================================
-- 6. FREELANCERS (Banco de Talentos)
-- ============================================

CREATE TABLE freelancers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  portfolio TEXT,
  avatar TEXT,
  daily_rate DECIMAL,
  rating INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, BLACKLISTED
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE freelancer_tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  freelancer_id TEXT NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE
);

CREATE TABLE freelancer_allocations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date TIMESTAMP NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id TEXT NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(freelancer_id, date)
);

CREATE TABLE freelancer_availability (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date TIMESTAMP UNIQUE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  freelancer_id TEXT NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE
);

-- ============================================
-- 7. REVIEW SYSTEM (Aprovação de Vídeos)
-- ============================================

CREATE TABLE review_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  token TEXT UNIQUE NOT NULL,
  version INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  client_feedback TEXT,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB,
  user_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- 9. SEED DATA (Dados Iniciais para Teste)
-- ============================================

-- Criar organização de exemplo
INSERT INTO organizations (id, name, slug, email, phone)
VALUES ('org_demo', 'Acme Produtora', 'acme', 'contato@acme.com.br', '11999999999');

-- Criar usuário admin
INSERT INTO users (id, email, name, role, organization_id)
VALUES ('user_admin', 'admin@acme.com.br', 'Vinícius Pimentel', 'ADMIN', 'org_demo');

-- Criar clientes de exemplo
INSERT INTO clients (name, email, phone, company, organization_id) VALUES
('Tech Corp', 'contato@techcorp.com', '11999999999', 'Tech Corp Ltda', 'org_demo'),
('Fashion Brand', 'marketing@fashionbrand.com', '11988888888', 'Fashion Brand S.A.', 'org_demo'),
('StartupX', 'hello@startupx.io', '11977777777', 'StartupX Innovation', 'org_demo'),
('Food Company', 'contato@foodco.com.br', '11966666666', 'Food Company Brasil', 'org_demo');

-- Criar projetos de exemplo
INSERT INTO projects (title, description, stage, client_id, assigned_to_id, organization_id) VALUES
('Vídeo Institucional Tech Corp', 'Vídeo institucional de 2 minutos', 'POST_PRODUCTION', (SELECT id FROM clients WHERE name = 'Tech Corp'), 'user_admin', 'org_demo'),
('Campanha Redes Sociais Fashion', 'Série de 5 vídeos para Instagram', 'SHOOTING', (SELECT id FROM clients WHERE name = 'Fashion Brand'), 'user_admin', 'org_demo'),
('Documentário StartupX', 'Documentário sobre a história da startup', 'REVIEW', (SELECT id FROM clients WHERE name = 'StartupX'), 'user_admin', 'org_demo');

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessário)
-- Por enquanto, permitir tudo (depois refinamos com auth)
CREATE POLICY "Allow all for now" ON organizations FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON proposals FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON equipments FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON freelancers FOR ALL USING (true);

-- ============================================
-- ✅ PRONTO! Banco configurado com sucesso
-- ============================================

SELECT 'Zooming CRM database setup completed! 🎉' AS message;
