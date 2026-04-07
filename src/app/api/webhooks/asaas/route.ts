import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { checkRateLimit, getRequestIP, rateLimitResponse } from '@/lib/security/rate-limit'
import { logAudit } from '@/lib/security/audit-log'

const REPLAY_WINDOW_MS = 5 * 60 * 1000 // 5 minutos

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 25)
}

function verifyWebhookSignature(
  rawBody: string,
  receivedToken: string | null
): boolean {
  const secret = process.env.ASAAS_WEBHOOK_SECRET
  if (secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')
    const receivedSignature =
      receivedToken || ''
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature.padEnd(expectedSignature.length))
    )
  }
  // Fallback: validação por token simples (legado)
  return receivedToken === process.env.ASAAS_WEBHOOK_TOKEN
}

export async function POST(req: NextRequest) {
  // Rate limit: 30 req/min por IP
  const ip = getRequestIP(req)
  const rl = checkRateLimit(`ip:${ip}:webhook-asaas`, { limit: 30, windowSeconds: 60 })
  if (!rl.success) return rateLimitResponse(rl.retryAfter)

  // Ler body como texto para validação de assinatura
  const rawBody = await req.text()

  // Verificar autenticação: HMAC signature (preferencial) ou token (legado)
  const token = req.headers.get('asaas-access-token')
  if (!verifyWebhookSignature(rawBody, token)) {
    console.warn('[webhook/asaas] Assinatura/token inválido - possível spoofing')
    logAudit({
      action: 'WEBHOOK_RECEIVED',
      ipAddress: ip,
      metadata: { provider: 'asaas', status: 'UNAUTHORIZED' },
      severity: 'CRITICAL',
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Proteção contra replay: rejeitar payloads antigos
  const payloadDate = (payload.dateCreated as string) || null
  if (payloadDate) {
    const eventTime = new Date(payloadDate).getTime()
    if (Date.now() - eventTime > REPLAY_WINDOW_MS) {
      console.warn('[webhook/asaas] Evento antigo rejeitado (replay protection)')
      return NextResponse.json({ error: 'Event too old' }, { status: 422 })
    }
  }

  const event = payload.event as string
  const payment = payload.payment as Record<string, unknown> | undefined

  if (!event) {
    return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const asaasPaymentId = (payment?.id as string) || null
  const asaasSubscriptionId = (payment?.subscription as string) || null

  // Verificar idempotência: ignorar evento já processado
  if (asaasPaymentId) {
    const { data: existing } = await supabase
      .from('asaas_webhook_events')
      .select('id')
      .eq('asaas_payment_id', asaasPaymentId)
      .eq('event_type', event)
      .not('processed_at', 'is', null)
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }
  }

  // Registrar evento
  const { data: webhookEvent, error: insertError } = await supabase
    .from('asaas_webhook_events')
    .insert({
      id: generateId(),
      event_type: event,
      asaas_payment_id: asaasPaymentId,
      asaas_subscription_id: asaasSubscriptionId,
      payload,
    })
    .select('id')
    .single()

  if (insertError || !webhookEvent) {
    console.error('[webhook/asaas] Erro ao registrar evento:', insertError)
    return NextResponse.json({ error: 'Failed to store event' }, { status: 500 })
  }

  try {
    // Encontrar organização pelo subscription ID do Asaas
    let organization: { id: string; subscription_plan: string | null } | null = null

    if (asaasSubscriptionId) {
      const { data } = await supabase
        .from('organizations')
        .select('id, subscription_plan')
        .eq('asaas_subscription_id', asaasSubscriptionId)
        .single()
      organization = data
    }

    if (!organization) {
      // Tentar encontrar pelo customer ID
      const customerId = (payment?.customer as string) || null
      if (customerId) {
        const { data } = await supabase
          .from('organizations')
          .select('id, subscription_plan')
          .eq('asaas_customer_id', customerId)
          .single()
        organization = data
      }
    }

    if (organization) {
      // Atualizar evento com organizationId
      await supabase
        .from('asaas_webhook_events')
        .update({ organization_id: organization.id })
        .eq('id', webhookEvent.id)

      // Processar evento
      await processEvent(supabase, event, organization.id, payment)

      logAudit({
        action: 'SUBSCRIPTION_CHANGE',
        organizationId: organization.id,
        ipAddress: ip,
        resourceType: 'subscription',
        metadata: { event, paymentId: asaasPaymentId, subscriptionId: asaasSubscriptionId },
        severity: event.includes('DELETED') || event.includes('EXPIRED') ? 'WARN' : 'INFO',
      })
    }

    // Marcar como processado
    await supabase
      .from('asaas_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', webhookEvent.id)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await supabase
      .from('asaas_webhook_events')
      .update({ error: errorMessage })
      .eq('id', webhookEvent.id)
    console.error('[webhook/asaas] Erro ao processar evento:', error)
  }

  return NextResponse.json({ received: true })
}

async function processEvent(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  event: string,
  organizationId: string,
  payment: Record<string, unknown> | undefined
) {
  switch (event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED': {
      const nextDueDate = payment?.dueDate as string | undefined
      await supabase
        .from('organizations')
        .update({
          subscription_status: 'ACTIVE',
          ...(nextDueDate && { subscription_ends_at: nextDueDate }),
          canceled_at: null,
        })
        .eq('id', organizationId)
      break
    }

    case 'PAYMENT_OVERDUE': {
      await supabase
        .from('organizations')
        .update({ subscription_status: 'PAST_DUE' })
        .eq('id', organizationId)
      break
    }

    case 'PAYMENT_DELETED':
    case 'PAYMENT_REFUNDED': {
      await supabase
        .from('organizations')
        .update({ subscription_status: 'EXPIRED' })
        .eq('id', organizationId)
      break
    }

    case 'SUBSCRIPTION_DELETED':
    case 'SUBSCRIPTION_EXPIRED': {
      await supabase
        .from('organizations')
        .update({
          subscription_status: 'EXPIRED',
          asaas_subscription_id: null,
        })
        .eq('id', organizationId)
      break
    }
  }
}
