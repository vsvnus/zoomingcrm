-- Fix calendar events date handling in proposal acceptance RPC
-- Adds 12 hours offset to dates to prevent timezone issues shifting events to previous day
-- Explicitly sets all_day for delivery events

CREATE OR REPLACE FUNCTION accept_proposal_v1(
  p_proposal_id TEXT,
  p_user_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- 3. Copy Items to Project Items
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

  -- 3b. Copy Item Assignments
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
    pi.id,
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
  -- 5a. Legacy Date Items (Offset 12h to Noon UTC to be safe)
  INSERT INTO calendar_events (
    title,
    description,
    start_date,
    end_date,
    project_id,
    organization_id,
    type,
    created_by,
    all_day
  )
  SELECT
    description || ' - ' || v_proposal.title,
    'Item da proposta: ' || description,
    date + interval '12 hours',
    date + interval '13 hours',
    v_project_id,
    v_proposal.organization_id,
    'shooting',
    p_user_id,
    FALSE
  FROM proposal_items
  WHERE proposal_id = p_proposal_id AND date IS NOT NULL;

  -- 5b. Recording Dates (Offset 12h to Noon UTC)
  INSERT INTO calendar_events (
    title,
    description,
    start_date,
    end_date,
    project_id,
    organization_id,
    type,
    created_by,
    all_day
  )
  SELECT
    'GRAVAÇÃO: ' || description,
    'Gravação referente ao projeto: ' || v_proposal.title,
    recording_date + interval '12 hours',
    recording_date + interval '16 hours', -- Default 4h duration
    v_project_id,
    v_proposal.organization_id,
    'shooting',
    p_user_id,
    FALSE
  FROM proposal_items
  WHERE proposal_id = p_proposal_id AND recording_date IS NOT NULL;

  -- 5c. Delivery Dates (Offset 12h to Noon UTC, FORCE ALL DAY)
  INSERT INTO calendar_events (
    title,
    description,
    start_date,
    end_date,
    project_id,
    organization_id,
    type,
    created_by,
    all_day
  )
  SELECT
    'ENTREGA: ' || description,
    'Entrega referente ao projeto: ' || v_proposal.title,
    delivery_date + interval '12 hours',
    delivery_date + interval '12 hours',
    v_project_id,
    v_proposal.organization_id,
    'delivery',
    p_user_id,
    TRUE
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
  RAISE EXCEPTION 'Erro ao processar aceite da proposta: %', SQLERRM;
END;
$$;
