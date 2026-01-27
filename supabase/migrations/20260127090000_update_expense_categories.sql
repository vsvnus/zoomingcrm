ALTER TABLE project_expenses DROP CONSTRAINT IF EXISTS project_expenses_category_check;

ALTER TABLE project_expenses
ADD CONSTRAINT project_expenses_category_check
CHECK (category = ANY (ARRAY['CREW_TALENT'::text, 'EQUIPMENT'::text, 'LOGISTICS'::text, 'FOOD'::text, 'OTHER'::text]));
