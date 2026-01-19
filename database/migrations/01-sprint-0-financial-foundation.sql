-- ============================================
-- SPRINT 0 - FUNDAÇÃO DO SISTEMA FINANCEIRO
-- CRM Zoomer - Capital Inicial e Transações Base
-- ============================================
-- Data: 2026-01-12
-- Versão: 1.0
-- ============================================

-- ============================================
-- 1. ADICIONAR CAPITAL INICIAL NA ORGANIZAÇÃO
-- ============================================

-- Adicionar campo para rastrear o capital inicial informado
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS initial_capital DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS initial_capital_set_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN organizations.initial_capital IS
'Capital inicial informado pelo usuário no cadastro. Este valor será registrado como transação financeira.';

COMMENT ON COLUMN organizations.initial_capital_set_at IS
'Data/hora em que o capital inicial foi definido pela primeira vez.';

-- ============================================
-- 2. CRIAR TABELA DE TRANSAÇÕES FINANCEIRAS
-- ============================================

-- Tipos de transação
CREATE TYPE transaction_type AS ENUM (
  'capital_inicial',  -- Registro do capital inicial
  'receita',          -- Receita de projeto/venda
  'despesa',          -- Despesa operacional
  'transferencia'     -- Movimentação entre contas (futuro)
);

-- Status da transação
CREATE TYPE transaction_status AS ENUM (
  'confirmado',       -- Transação realizada/confirmada
  'pendente',         -- Aguardando confirmação
  'agendado',         -- Agendado para data futura
  'cancelado'         -- Transação cancelada
);

-- Origem da transação (rastreabilidade)
CREATE TYPE transaction_origin AS ENUM (
  'cadastro',         -- Criado no cadastro (capital inicial)
  'projeto',          -- Vinculado a um projeto
  'manual',           -- Lançamento manual
  'proposta',         -- Vinculado a uma proposta aceita
  'sistema'           -- Criado automaticamente pelo sistema
);

-- Tabela principal de transações financeiras
CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  -- Relacionamentos
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  proposal_id TEXT REFERENCES proposals(id) ON DELETE SET NULL,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,

  -- Tipo e classificação
  type transaction_type NOT NULL,
  origin transaction_origin NOT NULL,
  status transaction_status NOT NULL DEFAULT 'confirmado',

  -- Valores
  valor DECIMAL(12,2) NOT NULL,

  -- Descrição e categoria
  description TEXT NOT NULL,
  category TEXT,  -- Para categorização futura (ex: "Equipamento", "Freelancer")

  -- Datas
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,  -- Para receitas/despesas futuras

  -- Metadados
  notes TEXT,
  metadata JSONB,  -- Dados adicionais flexíveis

  -- Auditoria
  created_by TEXT,  -- ID do usuário que criou
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_org
  ON financial_transactions(organization_id);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_type
  ON financial_transactions(type);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_status
  ON financial_transactions(status);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_date
  ON financial_transactions(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_project
  ON financial_transactions(project_id) WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financial_transactions_client
  ON financial_transactions(client_id) WHERE client_id IS NOT NULL;

-- Constraint: valor não pode ser zero
ALTER TABLE financial_transactions
  ADD CONSTRAINT check_valor_not_zero
  CHECK (valor != 0);

COMMENT ON TABLE financial_transactions IS
'Tabela central do sistema financeiro. Registra TODAS as movimentações: capital inicial, receitas, despesas.';

-- ============================================
-- 3. FUNÇÃO: CALCULAR SALDO ATUAL
-- ============================================

CREATE OR REPLACE FUNCTION calculate_current_balance(org_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
  total_receitas DECIMAL;
  total_despesas DECIMAL;
  capital_inicial DECIMAL;
  saldo_atual DECIMAL;
BEGIN
  -- Buscar capital inicial
  SELECT COALESCE(
    (SELECT valor
     FROM financial_transactions
     WHERE organization_id = org_id
       AND type = 'capital_inicial'
       AND status = 'confirmado'
     LIMIT 1),
    0
  ) INTO capital_inicial;

  -- Calcular total de receitas confirmadas
  SELECT COALESCE(SUM(valor), 0)
  INTO total_receitas
  FROM financial_transactions
  WHERE organization_id = org_id
    AND type = 'receita'
    AND status = 'confirmado';

  -- Calcular total de despesas confirmadas (valores positivos na tabela, mas subtraem do saldo)
  SELECT COALESCE(SUM(ABS(valor)), 0)
  INTO total_despesas
  FROM financial_transactions
  WHERE organization_id = org_id
    AND type = 'despesa'
    AND status = 'confirmado';

  -- Saldo = Capital Inicial + Receitas - Despesas
  saldo_atual := capital_inicial + total_receitas - total_despesas;

  RETURN saldo_atual;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_current_balance(TEXT) IS
'Calcula o saldo atual do caixa baseado em todas as transações confirmadas. Fórmula: Capital Inicial + Receitas - Despesas';

-- ============================================
-- 4. VIEW: RESUMO FINANCEIRO POR ORGANIZAÇÃO
-- ============================================

CREATE OR REPLACE VIEW financial_summary AS
SELECT
  o.id as organization_id,
  o.name as organization_name,
  o.initial_capital,
  o.initial_capital_set_at,

  -- Capital inicial (transação)
  (SELECT valor
   FROM financial_transactions
   WHERE organization_id = o.id
     AND type = 'capital_inicial'
     AND status = 'confirmado'
   LIMIT 1) as capital_inicial_transaction,

  -- Total de receitas confirmadas
  COALESCE(SUM(ft.valor) FILTER (
    WHERE ft.type = 'receita' AND ft.status = 'confirmado'
  ), 0) as total_receitas,

  -- Total de despesas confirmadas
  COALESCE(SUM(ABS(ft.valor)) FILTER (
    WHERE ft.type = 'despesa' AND ft.status = 'confirmado'
  ), 0) as total_despesas,

  -- Receitas pendentes
  COALESCE(SUM(ft.valor) FILTER (
    WHERE ft.type = 'receita' AND ft.status IN ('pendente', 'agendado')
  ), 0) as receitas_pendentes,

  -- Despesas pendentes
  COALESCE(SUM(ABS(ft.valor)) FILTER (
    WHERE ft.type = 'despesa' AND ft.status IN ('pendente', 'agendado')
  ), 0) as despesas_pendentes,

  -- Saldo atual (calculado)
  calculate_current_balance(o.id) as saldo_atual,

  -- Contadores
  COUNT(DISTINCT ft.id) FILTER (WHERE ft.type = 'receita') as total_receitas_count,
  COUNT(DISTINCT ft.id) FILTER (WHERE ft.type = 'despesa') as total_despesas_count,

  -- Última transação
  MAX(ft.created_at) as ultima_transacao

FROM organizations o
LEFT JOIN financial_transactions ft ON o.id = ft.organization_id
GROUP BY o.id, o.name, o.initial_capital, o.initial_capital_set_at;

COMMENT ON VIEW financial_summary IS
'View agregada com resumo financeiro completo por organização. Inclui saldo atual calculado dinamicamente.';

-- ============================================
-- 5. FUNÇÃO: CRIAR TRANSAÇÃO DE CAPITAL INICIAL
-- ============================================

CREATE OR REPLACE FUNCTION create_initial_capital_transaction(
  p_organization_id TEXT,
  p_valor DECIMAL,
  p_created_by TEXT DEFAULT NULL
)
RETURNS TABLE (
  transaction_id TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_transaction_id TEXT;
  v_existing_capital DECIMAL;
BEGIN
  -- Verificar se já existe capital inicial registrado
  SELECT valor INTO v_existing_capital
  FROM financial_transactions
  WHERE organization_id = p_organization_id
    AND type = 'capital_inicial'
  LIMIT 1;

  IF v_existing_capital IS NOT NULL THEN
    RETURN QUERY SELECT
      NULL::TEXT,
      FALSE,
      'Capital inicial já foi registrado para esta organização.'::TEXT;
    RETURN;
  END IF;

  -- Validar valor
  IF p_valor < 0 THEN
    RETURN QUERY SELECT
      NULL::TEXT,
      FALSE,
      'Capital inicial não pode ser negativo.'::TEXT;
    RETURN;
  END IF;

  -- Criar transação
  INSERT INTO financial_transactions (
    organization_id,
    type,
    origin,
    status,
    valor,
    description,
    transaction_date,
    created_by
  ) VALUES (
    p_organization_id,
    'capital_inicial',
    'cadastro',
    'confirmado',
    p_valor,
    'Capital inicial informado no cadastro',
    NOW(),
    p_created_by
  )
  RETURNING id INTO v_transaction_id;

  -- Atualizar organização com data de definição
  UPDATE organizations
  SET
    initial_capital = p_valor,
    initial_capital_set_at = NOW()
  WHERE id = p_organization_id;

  RETURN QUERY SELECT
    v_transaction_id,
    TRUE,
    'Capital inicial registrado com sucesso.'::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_initial_capital_transaction(TEXT, DECIMAL, TEXT) IS
'Cria a transação de capital inicial no cadastro. Valida se já existe e atualiza a organização.';

-- ============================================
-- 6. TRIGGER: ATUALIZAR updated_at AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION update_financial_transaction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_financial_transaction_timestamp
  ON financial_transactions;

CREATE TRIGGER trigger_update_financial_transaction_timestamp
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_transaction_timestamp();

-- ============================================
-- 7. POLÍTICA RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver transações da sua organização
CREATE POLICY financial_transactions_org_isolation ON financial_transactions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- ============================================
-- ✅ INSTALAÇÃO COMPLETA - SPRINT 0
-- ============================================

SELECT
  '✅ SPRINT 0 - Sistema Financeiro Base instalado!' as status,
  '1 tabela criada (financial_transactions)' as tabelas,
  '3 tipos ENUM criados' as enums,
  '2 funções criadas (calcular saldo + criar capital inicial)' as funcoes,
  '1 view agregada (financial_summary)' as views,
  '6 índices para performance' as indices,
  '1 trigger (updated_at)' as triggers,
  'RLS habilitado' as seguranca;

-- ============================================
-- 📋 TESTES RECOMENDADOS
-- ============================================

/*
-- 1. Testar criação de capital inicial
SELECT * FROM create_initial_capital_transaction(
  'org_demo',  -- ID da organização
  50000.00,    -- R$ 50.000,00
  NULL         -- created_by (opcional)
);

-- 2. Verificar saldo atual
SELECT calculate_current_balance('org_demo');

-- 3. Ver resumo financeiro
SELECT * FROM financial_summary WHERE organization_id = 'org_demo';

-- 4. Listar transações
SELECT
  id,
  type,
  origin,
  status,
  valor,
  description,
  transaction_date,
  created_at
FROM financial_transactions
WHERE organization_id = 'org_demo'
ORDER BY created_at DESC;

-- 5. Simular receita e despesa
INSERT INTO financial_transactions (
  organization_id, type, origin, status, valor, description
) VALUES
  ('org_demo', 'receita', 'manual', 'confirmado', 10000, 'Projeto XYZ'),
  ('org_demo', 'despesa', 'manual', 'confirmado', 3000, 'Equipamento');

-- 6. Recalcular saldo
SELECT calculate_current_balance('org_demo');
*/

-- ============================================
-- 📝 PRÓXIMOS SPRINTS - PONTOS DE ATENÇÃO
-- ============================================

/*
SPRINT 1 - Contas a Pagar/Receber:
- Adicionar campos: installment_number, total_installments
- Adicionar relacionamento com payment_method
- Criar views: accounts_payable, accounts_receivable
- Implementar notificações de vencimento

SPRINT 2 - Integração com Propostas:
- Ao aceitar proposta, criar transação de receita automaticamente
- Adicionar campo "parcelas" na proposta
- Criar transações agendadas para cada parcela

SPRINT 3 - Fluxo de Caixa:
- Criar view de fluxo de caixa (por dia/semana/mês)
- Implementar projeções futuras
- Dashboard com gráficos

SPRINT 4 - Relatórios:
- DRE simplificado
- Relatório de margem por projeto
- Exportação de dados (CSV/PDF)

SPRINT 5 - Categorias e Tags:
- Sistema de categorias personalizáveis
- Tags para organização
- Filtros avançados
*/
