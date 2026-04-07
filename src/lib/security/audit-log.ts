import { createServiceClient } from '@/lib/supabase/server'

export type AuditAction =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_FAILED'
  | 'AUTH_SIGNUP'
  | 'CRUD_CREATE'
  | 'CRUD_UPDATE'
  | 'CRUD_DELETE'
  | 'AI_TOOL_CALL'
  | 'AI_TOOL_WRITE'
  | 'WEBHOOK_RECEIVED'
  | 'SUBSCRIPTION_CHANGE'
  | 'PERMISSION_CHANGE'

export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL'

interface AuditLogEntry {
  action: AuditAction
  userId?: string | null
  organizationId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  severity?: AuditSeverity
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createServiceClient()
    await supabase.from('audit_log').insert({
      action: entry.action,
      user_id: entry.userId ?? null,
      organization_id: entry.organizationId ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
      resource_type: entry.resourceType ?? null,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
      severity: entry.severity ?? 'INFO',
    })
  } catch (error) {
    // Audit log failure should never break the app
    console.error('[AUDIT_LOG] Failed to write:', error)
  }
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return null
}
