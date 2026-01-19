'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { signOut, getCurrentUserData } from '@/actions/auth'
import { GlobalSearch } from '@/components/global-search'

interface UserData {
  name: string
  email: string
  role: string
  avatar: string | null
}

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Verifica cache primeiro para evitar delay na navegação
    const cached = sessionStorage.getItem('userData')
    if (cached) {
      setUserData(JSON.parse(cached))
      return
    }

    const loadUserData = async () => {
      const data = await getCurrentUserData()
      if (data) {
        setUserData(data)
        sessionStorage.setItem('userData', JSON.stringify(data))
      }
    }
    loadUserData()
  }, [])

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
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-text-tertiary transition-all hover:bg-bg-hover hover:text-text-primary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs font-bold text-white">
              3
            </span>
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 transition-all hover:bg-bg-hover"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
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
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-all hover:bg-bg-hover hover:text-text-primary"
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
