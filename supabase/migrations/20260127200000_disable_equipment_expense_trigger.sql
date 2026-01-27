-- Drop the trigger and function with CASCADE to ensure dependent triggers are removed
-- The error showed the trigger name is 'trigger_create_expense_for_booking', but CASCADE handles it regardless of the name.
DROP FUNCTION IF EXISTS create_expense_for_equipment_booking() CASCADE;

-- Re-create the ROI view to ensure it uses bookings for calculation instead of financial_transactions
-- This ensures 'internal' calculation based on daily_rate even if no transaction exists.

DROP VIEW IF EXISTS equipment_roi_analysis;

CREATE OR REPLACE VIEW equipment_roi_analysis AS
WITH booking_revenue AS (
    SELECT 
        eb.equipment_id,
        COALESCE(SUM(
            (EXTRACT(DAY FROM (eb.end_date - eb.start_date))::INTEGER + 1) * 
            COALESCE(e.daily_rate, 0)
        ), 0) as total_estimated_revenue,
        COUNT(eb.id) as total_bookings,
        SUM((EXTRACT(DAY FROM (eb.end_date - eb.start_date))::INTEGER + 1)) as total_days_rented
    FROM equipment_bookings eb
    JOIN equipments e ON eb.equipment_id = e.id
    GROUP BY eb.equipment_id
),
maintenance_costs AS (
    SELECT 
        equipment_id,
        COALESCE(SUM(cost), 0) as total_maintenance_cost
    FROM maintenance_logs
    GROUP BY equipment_id
)
SELECT 
    e.id as equipment_id,
    e.organization_id,
    e.name,
    e.category,
    e.purchase_price,
    e.purchase_date,
    e.daily_rate,
    COALESCE(br.total_bookings, 0) as total_bookings,
    COALESCE(br.total_days_rented, 0) as total_days_rented,
    COALESCE(br.total_estimated_revenue, 0) as total_revenue,
    COALESCE(mc.total_maintenance_cost, 0) as total_maintenance_cost,
    (COALESCE(br.total_estimated_revenue, 0) - COALESCE(e.purchase_price, 0) - COALESCE(mc.total_maintenance_cost, 0)) as roi_value,
    CASE 
        WHEN COALESCE(e.purchase_price, 0) > 0 THEN 
            ((COALESCE(br.total_estimated_revenue, 0) - COALESCE(e.purchase_price, 0) - COALESCE(mc.total_maintenance_cost, 0)) / e.purchase_price) * 100
        ELSE 0 
    END as roi_percent
FROM equipments e
LEFT JOIN booking_revenue br ON e.id = br.equipment_id
LEFT JOIN maintenance_costs mc ON e.id = mc.equipment_id;

-- Grant permissions
GRANT SELECT ON equipment_roi_analysis TO authenticated;
GRANT SELECT ON equipment_roi_analysis TO service_role;
