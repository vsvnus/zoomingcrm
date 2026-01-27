-- Migration for Project Expenses table (using TEXT primary keys like other tables)

-- Create project_finances table if not exists
CREATE TABLE IF NOT EXISTS project_finances (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL,
    approved_value DECIMAL(12,2) DEFAULT 0,
    additives DECIMAL(12,2) DEFAULT 0,
    target_margin_percent DECIMAL(5,2) DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create project_expenses table if not exists
CREATE TABLE IF NOT EXISTS project_expenses (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    project_finance_id TEXT REFERENCES project_finances(id) ON DELETE SET NULL,
    organization_id TEXT NOT NULL,
    category TEXT CHECK (category IN ('CREW_TALENT', 'EQUIPMENT', 'LOGISTICS')) NOT NULL,
    description TEXT NOT NULL,
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    freelancer_id TEXT REFERENCES freelancers(id) ON DELETE SET NULL,
    equipment_id TEXT,
    payment_status TEXT CHECK (payment_status IN ('TO_PAY', 'SCHEDULED', 'PAID')) DEFAULT 'TO_PAY',
    payment_date DATE,
    invoice_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_expenses_project ON project_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_expenses_category ON project_expenses(category);
CREATE INDEX IF NOT EXISTS idx_project_finances_project ON project_finances(project_id);

-- Enable RLS
ALTER TABLE project_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_finances (allow all for authenticated)
DROP POLICY IF EXISTS "project_finances_all" ON project_finances;
CREATE POLICY "project_finances_all" ON project_finances
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for project_expenses (allow all for authenticated)
DROP POLICY IF EXISTS "project_expenses_all" ON project_expenses;
CREATE POLICY "project_expenses_all" ON project_expenses
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
