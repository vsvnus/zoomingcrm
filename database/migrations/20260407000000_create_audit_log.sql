-- Audit Log - Registro de ações críticas para segurança
-- Operação Blindagem - Fase 3.2

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

  -- Quem
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- O quê
  action TEXT NOT NULL, -- AUTH_LOGIN, AUTH_LOGOUT, AUTH_FAILED, CRUD_CREATE, CRUD_UPDATE, CRUD_DELETE, AI_TOOL_CALL, WEBHOOK_RECEIVED, SUBSCRIPTION_CHANGE
  resource_type TEXT, -- user, client, project, proposal, etc.
  resource_id TEXT,

  -- Detalhes
  metadata JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'INFO', -- INFO, WARN, CRITICAL

  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para queries de auditoria
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_org ON audit_log(organization_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_severity ON audit_log(severity);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- RLS: apenas service_role pode inserir, org members podem ler seus próprios logs
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their audit logs"
  ON audit_log FOR SELECT
  USING (organization_id = auth_org_id());

-- Função para limpar logs antigos (reter 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
