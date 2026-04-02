import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { removeConnection } from '@/lib/google-calendar/client'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    await removeConnection(user.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao desconectar Google Calendar:', err)
    return NextResponse.json(
      { error: 'Erro ao desconectar' },
      { status: 500 }
    )
  }
}
