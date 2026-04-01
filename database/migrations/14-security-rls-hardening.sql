-- =============================================
-- SECURITY: RLS Hardening Migration
-- Clapper - Security Remediation
-- =============================================
-- This migration:
-- 1. Creates a helper function auth_org_id()
-- 2. Replaces permissive "Allow all" policies with proper org-scoped policies
-- 3. Enables RLS on child tables
-- 4. Creates public access policies for proposal public pages

-- =============================================
-- HELPER FUNCTION: Get current user's organization_id
-- =============================================

CREATE OR REPLACE FUNCTION public.auth_org_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()::text
$$;

-- =============================================
-- DROP PERMISSIVE POLICIES
-- =============================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        policyname ILIKE '%allow all%'
        OR policyname ILIKE '%allow_all%'
        OR policyname ILIKE '%temp%'
        OR policyname ILIKE '%todo%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- =============================================
-- MAIN TABLES: Organization-scoped RLS Policies
-- =============================================

-- CLIENTS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_select_org" ON public.clients;
CREATE POLICY "clients_select_org" ON public.clients
  FOR SELECT USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "clients_insert_org" ON public.clients;
CREATE POLICY "clients_insert_org" ON public.clients
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

DROP POLICY IF EXISTS "clients_update_org" ON public.clients;
CREATE POLICY "clients_update_org" ON public.clients
  FOR UPDATE USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "clients_delete_org" ON public.clients;
CREATE POLICY "clients_delete_org" ON public.clients
  FOR DELETE USING (organization_id = auth_org_id());

-- PROJECTS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_org" ON public.projects;
CREATE POLICY "projects_select_org" ON public.projects
  FOR SELECT USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "projects_insert_org" ON public.projects;
CREATE POLICY "projects_insert_org" ON public.projects
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

DROP POLICY IF EXISTS "projects_update_org" ON public.projects;
CREATE POLICY "projects_update_org" ON public.projects
  FOR UPDATE USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "projects_delete_org" ON public.projects;
CREATE POLICY "projects_delete_org" ON public.projects
  FOR DELETE USING (organization_id = auth_org_id());

-- PROPOSALS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposals_select_org" ON public.proposals;
CREATE POLICY "proposals_select_org" ON public.proposals
  FOR SELECT USING (
    organization_id = auth_org_id()
    OR token IS NOT NULL
  );

DROP POLICY IF EXISTS "proposals_insert_org" ON public.proposals;
CREATE POLICY "proposals_insert_org" ON public.proposals
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

DROP POLICY IF EXISTS "proposals_update_org" ON public.proposals;
CREATE POLICY "proposals_update_org" ON public.proposals
  FOR UPDATE USING (
    organization_id = auth_org_id()
    OR token IS NOT NULL
  );

DROP POLICY IF EXISTS "proposals_delete_org" ON public.proposals;
CREATE POLICY "proposals_delete_org" ON public.proposals
  FOR DELETE USING (organization_id = auth_org_id());

-- EQUIPMENTS
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipments_select_org" ON public.equipments;
CREATE POLICY "equipments_select_org" ON public.equipments
  FOR SELECT USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "equipments_insert_org" ON public.equipments;
CREATE POLICY "equipments_insert_org" ON public.equipments
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

DROP POLICY IF EXISTS "equipments_update_org" ON public.equipments;
CREATE POLICY "equipments_update_org" ON public.equipments
  FOR UPDATE USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "equipments_delete_org" ON public.equipments;
CREATE POLICY "equipments_delete_org" ON public.equipments
  FOR DELETE USING (organization_id = auth_org_id());

-- FREELANCERS
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "freelancers_select_org" ON public.freelancers;
CREATE POLICY "freelancers_select_org" ON public.freelancers
  FOR SELECT USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "freelancers_insert_org" ON public.freelancers;
CREATE POLICY "freelancers_insert_org" ON public.freelancers
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

DROP POLICY IF EXISTS "freelancers_update_org" ON public.freelancers;
CREATE POLICY "freelancers_update_org" ON public.freelancers
  FOR UPDATE USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "freelancers_delete_org" ON public.freelancers;
CREATE POLICY "freelancers_delete_org" ON public.freelancers
  FOR DELETE USING (organization_id = auth_org_id());

-- FINANCIAL_TRANSACTIONS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_transactions_select_org" ON public.financial_transactions;
CREATE POLICY "financial_transactions_select_org" ON public.financial_transactions
  FOR SELECT USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "financial_transactions_insert_org" ON public.financial_transactions;
CREATE POLICY "financial_transactions_insert_org" ON public.financial_transactions
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

DROP POLICY IF EXISTS "financial_transactions_update_org" ON public.financial_transactions;
CREATE POLICY "financial_transactions_update_org" ON public.financial_transactions
  FOR UPDATE USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "financial_transactions_delete_org" ON public.financial_transactions;
CREATE POLICY "financial_transactions_delete_org" ON public.financial_transactions
  FOR DELETE USING (organization_id = auth_org_id());

-- ORGANIZATIONS (readable for public proposal pages)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_select_own" ON public.organizations;
CREATE POLICY "organizations_select_own" ON public.organizations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "organizations_update_own" ON public.organizations;
CREATE POLICY "organizations_update_own" ON public.organizations
  FOR UPDATE USING (id = auth_org_id());

-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_org" ON public.users;
CREATE POLICY "users_select_org" ON public.users
  FOR SELECT USING (organization_id = auth_org_id() OR id = auth.uid()::text);

DROP POLICY IF EXISTS "users_update_self" ON public.users;
CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (id = auth.uid()::text);

-- =============================================
-- CHILD TABLES: Enable RLS + Join-based Policies
-- =============================================

-- PROPOSAL_ITEMS
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposal_items_select" ON public.proposal_items;
CREATE POLICY "proposal_items_select" ON public.proposal_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id
      AND (p.organization_id = auth_org_id() OR p.token IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "proposal_items_insert" ON public.proposal_items;
CREATE POLICY "proposal_items_insert" ON public.proposal_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "proposal_items_update" ON public.proposal_items;
CREATE POLICY "proposal_items_update" ON public.proposal_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "proposal_items_delete" ON public.proposal_items;
CREATE POLICY "proposal_items_delete" ON public.proposal_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

-- PROPOSAL_OPTIONALS
ALTER TABLE public.proposal_optionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposal_optionals_select" ON public.proposal_optionals;
CREATE POLICY "proposal_optionals_select" ON public.proposal_optionals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id
      AND (p.organization_id = auth_org_id() OR p.token IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "proposal_optionals_insert" ON public.proposal_optionals;
CREATE POLICY "proposal_optionals_insert" ON public.proposal_optionals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "proposal_optionals_update" ON public.proposal_optionals;
CREATE POLICY "proposal_optionals_update" ON public.proposal_optionals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id
      AND (p.organization_id = auth_org_id() OR (p.token IS NOT NULL AND p.status IN ('SENT', 'VIEWED')))
    )
  );

DROP POLICY IF EXISTS "proposal_optionals_delete" ON public.proposal_optionals;
CREATE POLICY "proposal_optionals_delete" ON public.proposal_optionals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

-- PROPOSAL_VIDEOS
ALTER TABLE public.proposal_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposal_videos_select" ON public.proposal_videos;
CREATE POLICY "proposal_videos_select" ON public.proposal_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id
      AND (p.organization_id = auth_org_id() OR p.token IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "proposal_videos_insert" ON public.proposal_videos;
CREATE POLICY "proposal_videos_insert" ON public.proposal_videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "proposal_videos_update" ON public.proposal_videos;
CREATE POLICY "proposal_videos_update" ON public.proposal_videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "proposal_videos_delete" ON public.proposal_videos;
CREATE POLICY "proposal_videos_delete" ON public.proposal_videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );

-- EQUIPMENT_BOOKINGS (no organization_id — join via equipments)
ALTER TABLE IF EXISTS public.equipment_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipment_bookings_select" ON public.equipment_bookings;
CREATE POLICY "equipment_bookings_select" ON public.equipment_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.equipments e
      WHERE e.id = equipment_id AND e.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "equipment_bookings_insert" ON public.equipment_bookings;
CREATE POLICY "equipment_bookings_insert" ON public.equipment_bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipments e
      WHERE e.id = equipment_id AND e.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "equipment_bookings_update" ON public.equipment_bookings;
CREATE POLICY "equipment_bookings_update" ON public.equipment_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.equipments e
      WHERE e.id = equipment_id AND e.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "equipment_bookings_delete" ON public.equipment_bookings;
CREATE POLICY "equipment_bookings_delete" ON public.equipment_bookings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.equipments e
      WHERE e.id = equipment_id AND e.organization_id = auth_org_id()
    )
  );

-- EQUIPMENT_KIT_ITEMS (join via equipments)
ALTER TABLE IF EXISTS public.equipment_kit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipment_kit_items_select" ON public.equipment_kit_items;
CREATE POLICY "equipment_kit_items_select" ON public.equipment_kit_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.equipments e
      WHERE e.id = equipment_id AND e.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "equipment_kit_items_modify" ON public.equipment_kit_items;
CREATE POLICY "equipment_kit_items_modify" ON public.equipment_kit_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.equipments e
      WHERE e.id = equipment_id AND e.organization_id = auth_org_id()
    )
  );

-- FREELANCER_TAGS (join via freelancers)
ALTER TABLE IF EXISTS public.freelancer_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "freelancer_tags_select" ON public.freelancer_tags;
CREATE POLICY "freelancer_tags_select" ON public.freelancer_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.freelancers f
      WHERE f.id = freelancer_id AND f.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "freelancer_tags_modify" ON public.freelancer_tags;
CREATE POLICY "freelancer_tags_modify" ON public.freelancer_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.freelancers f
      WHERE f.id = freelancer_id AND f.organization_id = auth_org_id()
    )
  );

-- FREELANCER_ALLOCATIONS (join via freelancers)
ALTER TABLE IF EXISTS public.freelancer_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "freelancer_allocations_select" ON public.freelancer_allocations;
CREATE POLICY "freelancer_allocations_select" ON public.freelancer_allocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.freelancers f
      WHERE f.id = freelancer_id AND f.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "freelancer_allocations_modify" ON public.freelancer_allocations;
CREATE POLICY "freelancer_allocations_modify" ON public.freelancer_allocations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.freelancers f
      WHERE f.id = freelancer_id AND f.organization_id = auth_org_id()
    )
  );

-- FREELANCER_AVAILABILITY (join via freelancers)
ALTER TABLE IF EXISTS public.freelancer_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "freelancer_availability_select" ON public.freelancer_availability;
CREATE POLICY "freelancer_availability_select" ON public.freelancer_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.freelancers f
      WHERE f.id = freelancer_id AND f.organization_id = auth_org_id()
    )
  );

DROP POLICY IF EXISTS "freelancer_availability_modify" ON public.freelancer_availability;
CREATE POLICY "freelancer_availability_modify" ON public.freelancer_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.freelancers f
      WHERE f.id = freelancer_id AND f.organization_id = auth_org_id()
    )
  );

-- CALENDAR_EVENTS (has organization_id)
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calendar_events_select_org" ON public.calendar_events;
CREATE POLICY "calendar_events_select_org" ON public.calendar_events
  FOR SELECT USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "calendar_events_insert_org" ON public.calendar_events;
CREATE POLICY "calendar_events_insert_org" ON public.calendar_events
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

DROP POLICY IF EXISTS "calendar_events_update_org" ON public.calendar_events;
CREATE POLICY "calendar_events_update_org" ON public.calendar_events
  FOR UPDATE USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "calendar_events_delete_org" ON public.calendar_events;
CREATE POLICY "calendar_events_delete_org" ON public.calendar_events
  FOR DELETE USING (organization_id = auth_org_id());

-- NOTIFICATIONS (uses recipient_id, NOT organization_id)
-- Already has RLS enabled and policies from 20260124214500_create_notifications.sql
-- Just replace with stricter policies
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_org" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_org" ON public.notifications;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "notifications_insert_auth" ON public.notifications
  FOR INSERT WITH CHECK (true);  -- Managed by server actions / service role

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- AGENT_MEMORY (has organization_id)
ALTER TABLE IF EXISTS public.agent_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_memory_select_org" ON public.agent_memory;
CREATE POLICY "agent_memory_select_org" ON public.agent_memory
  FOR SELECT USING (organization_id = auth_org_id());

DROP POLICY IF EXISTS "agent_memory_insert_org" ON public.agent_memory;
CREATE POLICY "agent_memory_insert_org" ON public.agent_memory
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

-- PAYMENT_SCHEDULE (already has RLS + policies from 20260307 migration)
-- Drop old policies and replace with consistent naming
DROP POLICY IF EXISTS "Org isolation for payment_schedule" ON public.payment_schedule;
DROP POLICY IF EXISTS "Public view payment_schedule" ON public.payment_schedule;
DROP POLICY IF EXISTS "payment_schedule_select" ON public.payment_schedule;
DROP POLICY IF EXISTS "payment_schedule_modify" ON public.payment_schedule;

ALTER TABLE IF EXISTS public.payment_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_schedule_select" ON public.payment_schedule
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id
      AND (p.organization_id = auth_org_id() OR p.token IS NOT NULL)
    )
  );

CREATE POLICY "payment_schedule_modify" ON public.payment_schedule
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND p.organization_id = auth_org_id()
    )
  );
