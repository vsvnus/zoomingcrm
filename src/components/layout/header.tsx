'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, User, LogOut, UserCircle, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { signOut, getCurrentUserData } from '@/actions/auth'
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead, type Notification } from '@/actions/notifications'
import { GlobalSearch } from '@/components/global-search'
import { createClient } from '@/lib/supabase/client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserData {
  name: string
  email: string
  role: string
  avatar: string | null
}

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verifica cache primeiro
    const cached = sessionStorage.getItem('userData')
    if (cached) {
      setUserData(JSON.parse(cached))
    }

    const loadUserData = async () => {
      const data = await getCurrentUserData()
      if (data) {
        setUserData(data)
        sessionStorage.setItem('userData', JSON.stringify(data))
      }
    }
    loadUserData()

    // Carregar notificações iniciais
    fetchNotifications()

    // 🔔 Realtime Subscription
    const channel = supabase
      .channel('notifications-header')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: userData ? `recipient_id=eq.${userData.role}` : undefined // Simple filter trick, actually RLS handles security
        },
        (payload) => {
          // Refresh on new notification
          fetchNotifications()
          // Optional: Play sound or show Toast
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    const list = await getNotifications()
    const count = await getUnreadCount()
    setNotifications(list)
    setUnreadCount(count)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id)
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    if (n.action_link) {
      router.push(n.action_link as any)
      setIsNotificationsOpen(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header
      className="sticky top-0 z-30 h-16 border-b border-[rgb(var(--border))] bg-background/80 backdrop-blur-xl"
    >
      <div className="flex h-full items-center justify-between px-8">
        {/* Global Search */}
        <GlobalSearch />

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Popover */}
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-text-tertiary transition-all hover:bg-bg-hover hover:text-text-primary outline-none"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs font-bold text-white shadow-sm ring-2 ring-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h4 className="font-semibold text-sm">Notificações</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Marcar lidas
                  </button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-4 text-left border-b last:border-0 hover:bg-muted/50 transition-colors",
                          !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
                        )}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className={cn(
                            "text-sm font-medium leading-none",
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {notification.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 transition-all hover:bg-bg-hover"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 border border-white/10">
                {userData?.name ? (
                  <span className="text-xs font-bold text-white">
                    {userData.name.substring(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4 text-white/70" />
                )}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-text-primary">
                  {userData?.name || 'Carregando...'}
                </p>
                <p className="text-xs text-text-tertiary">
                  {userData?.email || ''}
                </p>
              </div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />

                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[rgb(var(--border))] bg-card p-2 shadow-4"
                  >
                    <div className="px-3 py-2 text-xs font-semibold uppercase text-text-tertiary">
                      Conta
                    </div>
                    <a
                      href="/settings/profile"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-all hover:bg-bg-hover hover:text-text-primary mb-1"
                    >
                      <UserCircle className="h-4 w-4" />
                      Meu Perfil
                    </a>
                    <div className="my-1 h-px bg-bg-tertiary" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-error transition-all hover:bg-error/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
