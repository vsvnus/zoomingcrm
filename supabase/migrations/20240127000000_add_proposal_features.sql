-- Migration for Proposal and Project features

-- 1.2 Proposal Items Dates
ALTER TABLE proposal_items ADD COLUMN IF NOT EXISTS recording_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE proposal_items ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE proposal_items ADD COLUMN IF NOT EXISTS show_dates BOOLEAN DEFAULT FALSE;

-- 1.3 Proposal Financial Summary
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;

-- 1.4 Recurrence
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- 1.5 Project Items Dates (Sync from Proposal)
ALTER TABLE project_items ADD COLUMN IF NOT EXISTS recording_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE project_items ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;

-- 2.1 Project Tasks (To-Do List)
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add RLS policies for project_tasks if needed (assuming RLS is enabled)
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Users can view tasks of their organization" ON project_tasks;
DROP POLICY IF EXISTS "Users can manage tasks of their projects" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_select" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_insert" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_update" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks_delete" ON project_tasks;

-- SELECT policy - simplified using project organization match
CREATE POLICY "project_tasks_select" ON project_tasks
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN users u ON p.organization_id = u.organization_id::text
            WHERE u.id::text = auth.uid()::text
        )
    );

-- INSERT policy
CREATE POLICY "project_tasks_insert" ON project_tasks
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN users u ON p.organization_id = u.organization_id::text
            WHERE u.id::text = auth.uid()::text
        )
    );

-- UPDATE policy
CREATE POLICY "project_tasks_update" ON project_tasks
    FOR UPDATE
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN users u ON p.organization_id = u.organization_id::text
            WHERE u.id::text = auth.uid()::text
        )
    );

-- DELETE policy
CREATE POLICY "project_tasks_delete" ON project_tasks
    FOR DELETE
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN users u ON p.organization_id = u.organization_id::text
            WHERE u.id::text = auth.uid()::text
        )
    );
