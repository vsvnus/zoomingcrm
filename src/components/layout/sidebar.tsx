'use client'

import {
  LayoutDashboard,
  Film,
  FileText,
  Users,
  Package,
  UserCircle,
  Settings,
  Play,
  DollarSign,
  Calendar,
  Building2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getSidebarBadges } from '@/actions/financeiro'

type MenuItem = {
  icon: typeof LayoutDashboard
  label: string
  href: string
  badge?: string | number | null
  badgeColor?: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [badges, setBadges] = useState({
    proposals: 0,
    projects: 0,
    financial: 0
  })

  useEffect(() => {
    async function loadBadges() {
      try {
        const data = await getSidebarBadges()
        setBadges(data)
      } catch (error) {
        console.error('Erro ao carregar badges:', error)
      }
    }
    loadBadges()
  }, [])

  const menuItems: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Principal',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        {
          icon: FileText,
          label: 'Propostas',
          href: '/proposals',
          badge: badges.proposals > 0 ? badges.proposals : null
        },
        {
          icon: Film,
          label: 'Projetos',
          href: '/projects',
          badge: badges.projects > 0 ? badges.projects : null
        },
        { icon: Users, label: 'Clientes', href: '/clients' },
        { icon: Calendar, label: 'Calendário', href: '/calendar' },
        {
          icon: DollarSign,
          label: 'Financeiro',
          href: '/financeiro',
          badge: badges.financial > 0 ? '!' : null,
          badgeColor: 'bg-error text-white'
        },
      ]
    },
    {
      title: 'Recursos',
      items: [
        { icon: Package, label: 'Equipamentos', href: '/inventory' },
        { icon: UserCircle, label: 'Freelancers', href: '/freelancers' },
      ]
    }
  ]

  return (
    <aside
      className="glass-panel fixed left-0 top-0 z-40 h-screen w-[280px]"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[rgb(var(--glass-border))] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-text-primary leading-tight">
            Zooming
          </span>
          <span className="text-[9px] font-light tracking-wider text-text-tertiary uppercase -mt-0.5">
            By Trip Labz
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="custom-scrollbar h-[calc(100vh-144px)] overflow-y-auto px-3 py-6">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-md px-3 h-11 transition-colors duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    )}
                  >
                    {/* Indicador ativo */}
                    {isActive && (
                      <div
                        className="absolute left-0 h-6 w-1 rounded-r-full bg-primary"
                      />
                    )}

                    <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>

                    {item.badge && (
                      <span className={cn(
                        "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-bg-tertiary text-text-secondary"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Settings + Theme Toggle */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[rgb(var(--glass-border))] bg-bg-tertiary p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Link
            href="/settings/company"
            className="flex-1 flex items-center gap-3 rounded-md px-3 h-10 text-text-secondary transition-colors duration-150 hover:bg-bg-hover hover:text-text-primary"
          >
            <Building2 className="h-5 w-5" strokeWidth={2} />
            <span className="text-sm font-medium">Minha Empresa</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
