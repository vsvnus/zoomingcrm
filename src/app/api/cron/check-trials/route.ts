import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  // Verificar secret para proteger o endpoint
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  try {
    // Expirar trials vencidos
    const { data: expiredTrials, error: trialsError } = await supabase
      .from('organizations')
      .update({ subscription_status: 'EXPIRED' })
      .eq('subscription_status', 'TRIALING')
      .lt('trial_ends_at', new Date().toISOString())
      .select('id')

    if (trialsError) {
      console.error('[cron/check-trials] Erro ao expirar trials:', trialsError)
    }

    // Expirar subscriptions canceladas cujo período acabou
    const { data: expiredCanceled, error: canceledError } = await supabase
      .from('organizations')
      .update({
        subscription_status: 'EXPIRED',
        asaas_subscription_id: null,
      })
      .eq('subscription_status', 'CANCELED')
      .lt('subscription_ends_at', new Date().toISOString())
      .select('id')

    if (canceledError) {
      console.error('[cron/check-trials] Erro ao expirar cancelados:', canceledError)
    }

    return NextResponse.json({
      success: true,
      expiredTrials: expiredTrials?.length || 0,
      expiredCanceled: expiredCanceled?.length || 0,
    })
  } catch (error) {
    console.error('[cron/check-trials] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
