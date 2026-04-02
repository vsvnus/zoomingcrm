-- Create google_calendar_connections table
CREATE TABLE IF NOT EXISTS google_calendar_connections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add google_event_id to calendar_events for sync tracking
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS google_synced_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_google_calendar_connections_user_id ON google_calendar_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_connections_org_id ON google_calendar_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_google_event_id ON calendar_events(google_event_id);

-- RLS
ALTER TABLE google_calendar_connections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Users can only see their own connections
    BEGIN
        CREATE POLICY "Users can view own google calendar connection"
        ON google_calendar_connections FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Users can insert their own connection
    BEGIN
        CREATE POLICY "Users can insert own google calendar connection"
        ON google_calendar_connections FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid());
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Users can update their own connection
    BEGIN
        CREATE POLICY "Users can update own google calendar connection"
        ON google_calendar_connections FOR UPDATE
        TO authenticated
        USING (user_id = auth.uid());
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Users can delete their own connection
    BEGIN
        CREATE POLICY "Users can delete own google calendar connection"
        ON google_calendar_connections FOR DELETE
        TO authenticated
        USING (user_id = auth.uid());
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_google_calendar_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_google_calendar_connections_updated_at ON google_calendar_connections;
CREATE TRIGGER trigger_update_google_calendar_connections_updated_at
    BEFORE UPDATE ON google_calendar_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_google_calendar_connections_updated_at();
