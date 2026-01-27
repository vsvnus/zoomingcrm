-- Correção para o trigger create_expense_for_equipment_booking
-- O trigger original tentava acessar NEW.organization_id, que não existe em equipment_bookings
-- Esta correção busca o organization_id a partir do projeto relacionado

CREATE OR REPLACE FUNCTION create_expense_for_equipment_booking()
RETURNS TRIGGER AS $$
DECLARE
  equipment_daily_rate DECIMAL;
  equipment_name TEXT;
  project_org_id TEXT;
  total_days INTEGER;
  total_cost DECIMAL;
BEGIN
  -- Buscar informações do equipamento
  SELECT daily_rate, name INTO equipment_daily_rate, equipment_name
  FROM equipments
  WHERE id = NEW.equipment_id;
  
  -- Buscar organization_id do projeto
  SELECT organization_id INTO project_org_id
  FROM projects
  WHERE id = NEW.project_id;

  -- Só criar despesa se daily_rate estiver definido
  IF equipment_daily_rate IS NOT NULL AND equipment_daily_rate > 0 THEN
    -- Calcular dias e custo total (inclusive)
    total_days := EXTRACT(DAY FROM (NEW.end_date - NEW.start_date))::INTEGER + 1;
    total_cost := equipment_daily_rate * total_days;

    -- Inserir transação de despesa
    INSERT INTO financial_transactions (
      organization_id,
      type,
      category,
      amount,
      estimated_amount,
      description,
      status,
      project_id,
      equipment_id,
      created_at
    ) VALUES (
      project_org_id, -- Use fetched organization_id
      'EXPENSE',
      'EQUIPMENT_RENTAL',
      total_cost,
      total_cost,
      'Uso de ' || equipment_name || ' (' || total_days || ' dias)',
      'PENDING',
      NEW.project_id,
      NEW.equipment_id,
      NOW()
    );

    RAISE NOTICE 'Despesa de equipamento criada: R$ % para %', total_cost, equipment_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
