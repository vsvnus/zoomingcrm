import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from './encryption'

export type GoogleCalendarConnection = {
  id: string
  user_id: string
  organization_id: string
  access_token: string
  refresh_token: string
  token_expires_at: string
  calendar_id: string
  connected_at: string
  updated_at: string
}

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl(state: string): string {
  const oauth2Client = createOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state,
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function getAuthenticatedCalendar(userId: string) {
  const supabase = await createClient()

  const { data: connection, error } = await supabase
    .from('google_calendar_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !connection) {
    return null
  }

  const oauth2Client = createOAuth2Client()

  oauth2Client.setCredentials({
    access_token: decrypt(connection.access_token),
    refresh_token: decrypt(connection.refresh_token),
    expiry_date: new Date(connection.token_expires_at).getTime(),
  })

  // Auto-refresh: save new tokens when they're refreshed
  oauth2Client.on('tokens', async (tokens) => {
    const updateData: Record<string, string> = {
      access_token: encrypt(tokens.access_token!),
      token_expires_at: new Date(tokens.expiry_date!).toISOString(),
    }
    if (tokens.refresh_token) {
      updateData.refresh_token = encrypt(tokens.refresh_token)
    }

    await supabase
      .from('google_calendar_connections')
      .update(updateData)
      .eq('user_id', userId)
  })

  return {
    calendar: google.calendar({ version: 'v3', auth: oauth2Client }),
    calendarId: connection.calendar_id || 'primary',
  }
}

export async function getUserConnection(userId: string): Promise<GoogleCalendarConnection | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('google_calendar_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data
}

export async function saveConnection(
  userId: string,
  organizationId: string,
  tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null }
) {
  const supabase = await createClient()

  const data = {
    user_id: userId,
    organization_id: organizationId,
    access_token: encrypt(tokens.access_token!),
    refresh_token: encrypt(tokens.refresh_token!),
    token_expires_at: new Date(tokens.expiry_date!).toISOString(),
    calendar_id: 'primary',
  }

  // Upsert: insert or update if exists
  const { error } = await supabase
    .from('google_calendar_connections')
    .upsert(data, { onConflict: 'user_id' })

  if (error) {
    console.error('Erro ao salvar conexão Google Calendar:', error)
    throw new Error('Erro ao salvar conexão com Google Calendar')
  }
}

export async function removeConnection(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('google_calendar_connections')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao remover conexão Google Calendar:', error)
    throw new Error('Erro ao remover conexão com Google Calendar')
  }
}
