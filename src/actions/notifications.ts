'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Notification = {
    id: string
    title: string
    message: string
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
    read: boolean
    action_link?: string | null
    created_at: string
}

/**
 * Buscar notificações do usuário logado
 */
export async function getNotifications(limit = 10) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching notifications:', error)
        return []
    }

    return data as Notification[]
}

/**
 * Buscar contagem de não lidas
 */
export async function getUnreadCount() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

    if (error) return 0

    return count || 0
}

/**
 * Marcar todas como lidas
 */
export async function markAllAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

    revalidatePath('/')
}

/**
 * Marcar uma como lida
 */
export async function markAsRead(notificationId: string) {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

    revalidatePath('/')
}

/**
 * Criar notificação (uso interno)
 * NÃO EXPORTA como server action publica para evitar spam
 * Deve ser usada por outras server actions
 */
export async function createNotificationInternal(
    recipientId: string,
    data: {
        title: string
        message: string
        type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
        action_link?: string
    }
) {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .insert({
            recipient_id: recipientId,
            title: data.title,
            message: data.message,
            type: data.type || 'INFO',
            action_link: data.action_link,
            read: false
        })
}
