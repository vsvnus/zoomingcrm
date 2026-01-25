
-- Tabela de Notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR')) DEFAULT 'INFO',
    read BOOLEAN DEFAULT false,
    action_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas suas notificações
CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = recipient_id);

-- Sistema pode criar notificações (normalmente via função SECURITY DEFINER ou service role)
-- Permitir insert para authenticated por enquanto, mas ideal é via trigger/function
CREATE POLICY "Users can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (true); -- Ajustaremos para criar via Server Actions

-- Usuário pode marcar como lida (update)
CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = recipient_id);
