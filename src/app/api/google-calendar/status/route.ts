import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserConnection } from '@/lib/google-calendar/client'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 })
  }

  const connection = await getUserConnection(user.id)

  return NextResponse.json({
    connected: !!connection,
    connectedAt: connection?.connected_at || null,
    calendarId: connection?.calendar_id || null,
  })
}
