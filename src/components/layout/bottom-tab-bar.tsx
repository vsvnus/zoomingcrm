'use client'

import { LayoutDashboard, Film, Users, DollarSign, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { MobileDrawer } from './mobile-drawer'

const tabs = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Film, label: 'Projetos', href: '/projects' },
  { icon: Users, label: 'Clientes', href: '/clients' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
] as const

export function BottomTabBar() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgb(var(--glass-border))] bg-[rgb(var(--bg-primary))]/95 backdrop-blur-xl md:hidden pb-safe">
        <div className="flex h-16 items-center justify-around px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.href}
                href={tab.href as any}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
                  isActive
                    ? 'text-indigo-500'
                    : 'text-text-tertiary'
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
              drawerOpen ? 'text-indigo-500' : 'text-text-tertiary'
            )}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
