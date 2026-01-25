-- Create project_items table to store scope/deliverables from proposals
-- This corresponds to the ProjectItem model in Prisma

CREATE TABLE IF NOT EXISTS project_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, DONE
  due_date TIMESTAMP WITH TIME ZONE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(project_id);

-- Add comments
COMMENT ON TABLE project_items IS 'Itens do escopo do projeto (copiados da proposta)';
COMMENT ON COLUMN project_items.status IS 'Status do item: PENDING, IN_PROGRESS, DONE';
