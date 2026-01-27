-- ==============================================================================
-- ADD RPC FOR ATOMIC PROPOSAL ACCEPTANCE
-- ==============================================================================

-- Add proposal_item_id to project_items to track lineage and enable easier data migration
-- Using TEXT type to match existing schema
ALTER TABLE project_items
ADD COLUMN IF NOT EXISTS proposal_item_id TEXT REFERENCES proposal_items(id);

-- Drop previous version with UUID params if exists (since we change signature)
DROP FUNCTION IF EXISTS accept_proposal_v1(UUID, UUID);

-- Update the RPC to include item_assignments copying and handle nullable user_id
-- CHANGED TO TEXT PARAMS TO MATCH SCHEMA
CREATE OR REPLACE FUNCTION accept_proposal_v1(
  p_proposal_id TEXT,
  p_user_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Run as creator to ensure permissions on all tables
AS $$
DECLARE
  v_proposal RECORD;
  v_project_id TEXT;
  v_client_name TEXT;
  v_installment_value NUMERIC;
  v_first_due_date DATE;
  v_user_org_id TEXT;
BEGIN
  -- 1. Fetch Proposal
  SELECT * INTO v_proposal
  FROM proposals
  WHERE id = p_proposal_id;

  IF v_proposal IS NULL THEN
    RAISE EXCEPTION 'Proposta não encontrada';
  END IF;

  IF v_proposal.status = 'ACCEPTED' THEN
    RAISE EXCEPTION 'Proposta já foi aceita anteriormente';
  END IF;

  v_user_org_id := v_proposal.organization_id;

  -- 2. Create Project
  INSERT INTO projects (
    title,
    description,
    client_id,
    organization_id,
    assigned_to_id,
    status,
    origin,
    budget,
    deadline_date,
    created_at,
    is_recurring,
    proposal_id
  ) VALUES (
    v_proposal.title,
    v_proposal.description,
    v_proposal.client_id,
    v_proposal.organization_id,
    p_user_id, -- Can be NULL
    'PRE_PROD',
    'proposal',
    v_proposal.total_value,
    v_proposal.valid_until,
    NOW(),
    COALESCE(v_proposal.is_recurring, false),
    v_proposal.id
  )
  RETURNING id INTO v_project_id;

  -- 3. Copy Items to Project Items (Now including proposal_item_id)
  INSERT INTO project_items (
    project_id,
    description,
    quantity,
    unit_price,
    total_price,
    status,
    proposal_item_id
  )
  SELECT
    v_project_id,
    description,
    quantity,
    unit_price,
    total,
    'PENDING',
    id
  FROM proposal_items
  WHERE proposal_id = p_proposal_id;

  -- 3b. Copy Item Assignments (Freelancers)
  -- We link project_items back to proposal_items via the new column
  INSERT INTO item_assignments (
    project_item_id,
    freelancer_id,
    role,
    agreed_fee,
    estimated_hours,
    scheduled_date,
    status,
    notes,
    organization_id
  )
  SELECT
    pi.id, -- New project_item_id
    ia.freelancer_id,
    ia.role,
    ia.agreed_fee,
    ia.estimated_hours,
    ia.scheduled_date,
    'PENDING',
    ia.notes,
    ia.organization_id
  FROM project_items pi
  JOIN item_assignments ia ON ia.proposal_item_id = pi.proposal_item_id
  WHERE pi.project_id = v_project_id;

  -- 4. Create Project Finances
  INSERT INTO project_finances (
    project_id,
    organization_id,
    approved_value,
    target_margin_percent
  ) VALUES (
    v_project_id,
    v_proposal.organization_id,
    v_proposal.total_value,
    30 -- Default margin
  );

  -- 5. Create Calendar Events
  -- 5a. Legacy Date Items
  INSERT INTO calendar_events (
    title,
    description,
    start_date,
    end_date,
    project_id,
    organization_id,
    type,
    created_by
  )
  SELECT
    description || ' - ' || v_proposal.title,
    'Item da proposta: ' || description,
    date,
    date + interval '1 hour',
    v_project_id,
    v_proposal.organization_id,
    'shooting',
    p_user_id
  FROM proposal_items
  WHERE proposal_id = p_proposal_id AND date IS NOT NULL;

  -- 5b. Recording Dates
  INSERT INTO calendar_events (
    title,
    description,
    start_date,
    end_date,
    project_id,
    organization_id,
    type,
    created_by
  )
  SELECT
    'GRAVAÇÃO: ' || description,
    'Gravação referente ao projeto: ' || v_proposal.title,
    recording_date,
    recording_date + interval '4 hours', -- Default 4h duration
    v_project_id,
    v_proposal.organization_id,
    'shooting',
    p_user_id
  FROM proposal_items
  WHERE proposal_id = p_proposal_id AND recording_date IS NOT NULL;

  -- 5c. Delivery Dates
  INSERT INTO calendar_events (
    title,
    description,
    start_date,
    end_date,
    project_id,
    organization_id,
    type,
    created_by
  )
  SELECT
    'ENTREGA: ' || description,
    'Entrega referente ao projeto: ' || v_proposal.title,
    delivery_date,
    delivery_date, -- Start = End
    v_project_id,
    v_proposal.organization_id,
    'delivery',
    p_user_id
  FROM proposal_items
  WHERE proposal_id = p_proposal_id AND delivery_date IS NOT NULL;

  -- 6. Create Financial Transactions (Revenue)
  v_installment_value := v_proposal.total_value / GREATEST(COALESCE(v_proposal.installments, 1), 1);
  v_first_due_date := COALESCE(v_proposal.payment_date, v_proposal.valid_until, CURRENT_DATE);

  INSERT INTO financial_transactions (
    organization_id,
    type,
    category,
    description,
    amount,
    status,
    project_id,
    proposal_id,
    client_id,
    due_date,
    created_at
  )
  SELECT
    v_proposal.organization_id,
    'INCOME',
    'CLIENT_PAYMENT',
    'Pagamento Proposta: ' || v_proposal.title || ' (' || s.i || '/' || GREATEST(COALESCE(v_proposal.installments, 1), 1) || ')',
    v_installment_value,
    'PENDING',
    v_project_id,
    v_proposal.id,
    v_proposal.client_id,
    v_first_due_date + ((s.i - 1) * interval '1 month'),
    NOW()
  FROM generate_series(1, GREATEST(COALESCE(v_proposal.installments, 1), 1)) AS s(i);

  -- 7. Update Proposal Status
  UPDATE proposals
  SET
    status = 'ACCEPTED',
    accepted_at = NOW()
  WHERE id = p_proposal_id;

  -- Return Result
  RETURN jsonb_build_object(
    'success', true,
    'project_id', v_project_id,
    'message', 'Proposta aceita e projeto criado com sucesso'
  );

EXCEPTION WHEN OTHERS THEN
  -- Rollback is automatic in PL/pgSQL exceptions
  RAISE EXCEPTION 'Erro ao processar aceite da proposta: %', SQLERRM;
END;
$$;
