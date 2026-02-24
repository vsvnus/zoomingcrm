-- ============================================
-- ZOOMING STUDIO: Scripts & Storyboard Module
-- Migration: Create scripts, scenes, scene_assets tables
-- ============================================

-- 1. Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  status TEXT NOT NULL DEFAULT 'DRAFT',
  -- DRAFT, IN_REVIEW, APPROVED, CHANGES_REQUESTED, IN_PRODUCTION, COMPLETED

  version INT NOT NULL DEFAULT 1,
  total_duration INT, -- duração total em segundos (calculado)

  -- Metadados do vídeo
  video_format TEXT, -- 16:9, 9:16, 1:1, 4:5
  target_platform TEXT, -- YouTube, Instagram, TikTok, TV, Cinema
  target_audience TEXT,
  tone TEXT, -- Formal, Casual, Emocional, Humorístico, Inspirador

  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,

  "order" INT NOT NULL DEFAULT 0,
  title TEXT,
  duration INT, -- duração em segundos
  start_time INT, -- tempo de início calculado

  -- Campos de roteiro
  description TEXT, -- descrição visual da cena
  action TEXT, -- ações dos personagens
  dialogue TEXT, -- diálogos/falas
  voiceover TEXT, -- texto do locutor
  lettering TEXT, -- textos na tela / grafismos
  sound_design TEXT, -- efeitos sonoros / música
  notes TEXT, -- notas de produção

  -- Storyboard
  storyboard_url TEXT, -- URL da imagem do storyboard
  camera_angle TEXT, -- Close, Medium, Wide, Aerial, POV
  camera_movement TEXT, -- Static, Pan, Tilt, Dolly, Tracking
  transition TEXT, -- Cut, Fade, Dissolve, Wipe

  -- Notas de produção
  location_note TEXT,
  equipment_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Scene Assets table (múltiplos arquivos por cena)
CREATE TABLE IF NOT EXISTS scene_assets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  scene_id TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,

  type TEXT NOT NULL DEFAULT 'IMAGE', -- IMAGE, VIDEO_REF, AUDIO_REF, DOCUMENT
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Script Versions (snapshots para versionamento)
CREATE TABLE IF NOT EXISTS script_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,

  version INT NOT NULL,
  snapshot JSONB NOT NULL, -- snapshot completo do roteiro + cenas
  change_note TEXT,

  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scripts_project_id ON scripts(project_id);
CREATE INDEX IF NOT EXISTS idx_scripts_organization_id ON scripts(organization_id);
CREATE INDEX IF NOT EXISTS idx_scripts_status ON scripts(status);
CREATE INDEX IF NOT EXISTS idx_scenes_script_id ON scenes(script_id);
CREATE INDEX IF NOT EXISTS idx_scenes_order ON scenes(script_id, "order");
CREATE INDEX IF NOT EXISTS idx_scene_assets_scene_id ON scene_assets(scene_id);
CREATE INDEX IF NOT EXISTS idx_script_versions_script_id ON script_versions(script_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_versions ENABLE ROW LEVEL SECURITY;

-- Scripts: Users can only access scripts from their organization
CREATE POLICY "Users can view scripts from their org" ON scripts
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert scripts in their org" ON scripts
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update scripts in their org" ON scripts
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete scripts in their org" ON scripts
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

-- Scenes: Access through script ownership
CREATE POLICY "Users can view scenes from their scripts" ON scenes
  FOR SELECT USING (
    script_id IN (
      SELECT s.id FROM scripts s
      JOIN users u ON u.organization_id = s.organization_id
      WHERE u.id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert scenes in their scripts" ON scenes
  FOR INSERT WITH CHECK (
    script_id IN (
      SELECT s.id FROM scripts s
      JOIN users u ON u.organization_id = s.organization_id
      WHERE u.id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update scenes in their scripts" ON scenes
  FOR UPDATE USING (
    script_id IN (
      SELECT s.id FROM scripts s
      JOIN users u ON u.organization_id = s.organization_id
      WHERE u.id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete scenes in their scripts" ON scenes
  FOR DELETE USING (
    script_id IN (
      SELECT s.id FROM scripts s
      JOIN users u ON u.organization_id = s.organization_id
      WHERE u.id = auth.uid()::text
    )
  );

-- Scene Assets: Access through scene/script ownership
CREATE POLICY "Users can manage scene assets" ON scene_assets
  FOR ALL USING (
    scene_id IN (
      SELECT sc.id FROM scenes sc
      JOIN scripts s ON s.id = sc.script_id
      JOIN users u ON u.organization_id = s.organization_id
      WHERE u.id = auth.uid()::text
    )
  );

-- Script Versions: Access through script ownership
CREATE POLICY "Users can manage script versions" ON script_versions
  FOR ALL USING (
    script_id IN (
      SELECT s.id FROM scripts s
      JOIN users u ON u.organization_id = s.organization_id
      WHERE u.id = auth.uid()::text
    )
  );

-- ============================================
-- TRIGGER: auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_scripts_updated_at') THEN
    CREATE TRIGGER update_scripts_updated_at
      BEFORE UPDATE ON scripts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_scenes_updated_at') THEN
    CREATE TRIGGER update_scenes_updated_at
      BEFORE UPDATE ON scenes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
