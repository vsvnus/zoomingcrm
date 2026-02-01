-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL, -- Generic ID, typically CUID or UUID as text
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for reading (users can only see their org's logs)
DROP POLICY IF EXISTS "Org isolation for audit_logs" ON public.audit_logs;
CREATE POLICY "Org isolation for audit_logs" ON public.audit_logs
FOR ALL USING (organization_id = auth_org_id());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS audit_logs_organization_id_idx ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS audit_logs_record_id_idx ON public.audit_logs(record_id);
