-- ==============================================================================
-- MIGRATION: SECURITY HARDENING (RLS & POLICIES) - V4 (Final Fixes)
-- ==============================================================================

-- 1. Helper Function to get Current User's Organization
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id 
  FROM public.users 
  WHERE id = auth.uid()::text
  LIMIT 1;
$$;

-- 2. Enable RLS on ALL tables
--    (Even if already enabled, this is idempotent-ish or safe)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_optionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. DROP Existing Weak Policies
DROP POLICY IF EXISTS "Allow all for now" ON public.users;
DROP POLICY IF EXISTS "Allow all for now" ON public.organizations;
DROP POLICY IF EXISTS "Allow all for now" ON public.clients;
DROP POLICY IF EXISTS "Allow all for now" ON public.proposals;
DROP POLICY IF EXISTS "Allow all for now" ON public.projects;
DROP POLICY IF EXISTS "Allow all for now" ON public.equipments;
DROP POLICY IF EXISTS "Allow all for now" ON public.freelancers;
DROP POLICY IF EXISTS "project_finances_all" ON public.project_finances;
DROP POLICY IF EXISTS "project_expenses_all" ON public.project_expenses;
DROP POLICY IF EXISTS "project_tasks_all" ON public.project_tasks;

-- 4. CREATE Strict Policies

-- USERS
DROP POLICY IF EXISTS "Users view self and org members" ON public.users;
CREATE POLICY "Users view self and org members" ON public.users
FOR SELECT USING (
  id = auth.uid()::text OR organization_id = auth_org_id()
);

DROP POLICY IF EXISTS "Users update self" ON public.users;
CREATE POLICY "Users update self" ON public.users
FOR UPDATE USING (id = auth.uid()::text);

-- ORGANIZATIONS
DROP POLICY IF EXISTS "View own organization" ON public.organizations;
CREATE POLICY "View own organization" ON public.organizations
FOR SELECT USING (id = auth_org_id());

-- CLIENTS
DROP POLICY IF EXISTS "Org isolation for clients" ON public.clients;
CREATE POLICY "Org isolation for clients" ON public.clients
FOR ALL USING (organization_id = auth_org_id());

-- PROJECTS
DROP POLICY IF EXISTS "Org isolation for projects" ON public.projects;
CREATE POLICY "Org isolation for projects" ON public.projects
FOR ALL USING (organization_id = auth_org_id());

-- FINANCIAL TRANSACTIONS
DROP POLICY IF EXISTS "Users can view transactions from their org" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can insert transactions for their org" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can update transactions from their org" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can delete transactions from their org" ON public.financial_transactions;
DROP POLICY IF EXISTS "Org isolation for finances" ON public.financial_transactions;
CREATE POLICY "Org isolation for finances" ON public.financial_transactions
FOR ALL USING (organization_id = auth_org_id());

-- FREELANCERS
DROP POLICY IF EXISTS "Org isolation for freelancers" ON public.freelancers;
CREATE POLICY "Org isolation for freelancers" ON public.freelancers
FOR ALL USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "Org isolation for freelancer_tags" ON public.freelancer_tags;
CREATE POLICY "Org isolation for freelancer_tags" ON public.freelancer_tags
FOR ALL USING (
  freelancer_id IN (SELECT id FROM public.freelancers WHERE organization_id = auth_org_id())
);

DROP POLICY IF EXISTS "Org isolation for freelancer_allocations" ON public.freelancer_allocations;
CREATE POLICY "Org isolation for freelancer_allocations" ON public.freelancer_allocations
FOR ALL USING (
  freelancer_id IN (SELECT id FROM public.freelancers WHERE organization_id = auth_org_id())
);

DROP POLICY IF EXISTS "Org isolation for freelancer_availability" ON public.freelancer_availability;
CREATE POLICY "Org isolation for freelancer_availability" ON public.freelancer_availability
FOR ALL USING (
  freelancer_id IN (SELECT id FROM public.freelancers WHERE organization_id = auth_org_id())
);

-- EQUIPMENTS
DROP POLICY IF EXISTS "Org isolation for equipments" ON public.equipments;
CREATE POLICY "Org isolation for equipments" ON public.equipments
FOR ALL USING (organization_id = auth_org_id());

-- Equipment Bookings (Fixed: Links via project_id)
DROP POLICY IF EXISTS "Org isolation for bookings" ON public.equipment_bookings;
CREATE POLICY "Org isolation for bookings" ON public.equipment_bookings
FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE organization_id = auth_org_id())
);

DROP POLICY IF EXISTS "Org isolation for kits" ON public.equipment_kits;
CREATE POLICY "Org isolation for kits" ON public.equipment_kits
FOR ALL USING (organization_id = auth_org_id());

-- PROPOSALS
DROP POLICY IF EXISTS "Org isolation for proposals" ON public.proposals;
CREATE POLICY "Org isolation for proposals" ON public.proposals
FOR ALL USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "Public view proposals via token" ON public.proposals;
CREATE POLICY "Public view proposals via token" ON public.proposals
FOR SELECT USING (token IS NOT NULL);

-- PROPOSAL ITEMS
DROP POLICY IF EXISTS "Org isolation for proposal_items" ON public.proposal_items;
CREATE POLICY "Org isolation for proposal_items" ON public.proposal_items
FOR ALL USING (
  proposal_id IN (SELECT id FROM public.proposals WHERE organization_id = auth_org_id())
);

DROP POLICY IF EXISTS "Public view proposal_items" ON public.proposal_items;
CREATE POLICY "Public view proposal_items" ON public.proposal_items
FOR SELECT USING (
  proposal_id IN (SELECT id FROM public.proposals WHERE token IS NOT NULL)
);

-- PROPOSAL OPTIONALS
DROP POLICY IF EXISTS "Org isolation for proposal_optionals" ON public.proposal_optionals;
CREATE POLICY "Org isolation for proposal_optionals" ON public.proposal_optionals
FOR ALL USING (
  proposal_id IN (SELECT id FROM public.proposals WHERE organization_id = auth_org_id())
);

DROP POLICY IF EXISTS "Public view proposal_optionals" ON public.proposal_optionals;
CREATE POLICY "Public view proposal_optionals" ON public.proposal_optionals
FOR SELECT USING (
  proposal_id IN (SELECT id FROM public.proposals WHERE token IS NOT NULL)
);

-- PROPOSAL VIDEOS
DROP POLICY IF EXISTS "Org isolation for proposal_videos" ON public.proposal_videos;
CREATE POLICY "Org isolation for proposal_videos" ON public.proposal_videos
FOR ALL USING (
  proposal_id IN (SELECT id FROM public.proposals WHERE organization_id = auth_org_id())
);

DROP POLICY IF EXISTS "Public view proposal_videos" ON public.proposal_videos;
CREATE POLICY "Public view proposal_videos" ON public.proposal_videos
FOR SELECT USING (
  proposal_id IN (SELECT id FROM public.proposals WHERE token IS NOT NULL)
);

-- PROJECT ITEMS
DROP POLICY IF EXISTS "Org isolation for project_items" ON public.project_items;
CREATE POLICY "Org isolation for project_items" ON public.project_items
FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE organization_id = auth_org_id())
);

-- PROJECT FINANCES
DROP POLICY IF EXISTS "Org isolation for project_finances" ON public.project_finances;
CREATE POLICY "Org isolation for project_finances" ON public.project_finances
FOR ALL USING (organization_id = auth_org_id());

-- PROJECT EXPENSES
DROP POLICY IF EXISTS "Org isolation for project_expenses" ON public.project_expenses;
CREATE POLICY "Org isolation for project_expenses" ON public.project_expenses
FOR ALL USING (organization_id = auth_org_id());

-- PROJECT MEMBERS
DROP POLICY IF EXISTS "Org isolation for project_members" ON public.project_members;
CREATE POLICY "Org isolation for project_members" ON public.project_members
FOR ALL USING (organization_id = auth_org_id());

-- PROJECT TASKS
DROP POLICY IF EXISTS "Org isolation for project_tasks" ON public.project_tasks;
CREATE POLICY "Org isolation for project_tasks" ON public.project_tasks
FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE organization_id = auth_org_id())
);

-- CALENDAR
DROP POLICY IF EXISTS "Org isolation for calendar" ON public.calendar_events;
CREATE POLICY "Org isolation for calendar" ON public.calendar_events
FOR ALL USING (organization_id = auth_org_id());

-- NOTIFICATIONS (Fixed: UUID comparison)
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
FOR SELECT USING (recipient_id = auth.uid());
