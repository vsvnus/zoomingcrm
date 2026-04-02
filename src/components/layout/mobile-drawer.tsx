'use client'

import {
  FileText,
  Calendar,
  Clapperboard,
  Calculator,
  Package,
  UserCircle,
  Settings,
  Building2,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from '@/actions/auth'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const menuItems = [
  { icon: FileText, label: 'Propostas', href: '/proposals' },
  { icon: Calendar, label: 'Calendário', href: '/calendar' },
  { icon: Clapperboard, label: 'Clapper Studio', href: '/studio' },
  { icon: Calculator, label: 'Calculadora', href: '/budget-calculator' },
  { icon: Package, label: 'Equipamentos', href: '/inventory' },
  { icon: UserCircle, label: 'Freelancers', href: '/freelancers' },
]

const settingsItems = [
  { icon: Settings, label: 'Configurações', href: '/settings/profile' },
  { icon: Building2, label: 'Minha Empresa', href: '/settings/company' },
]

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[280px] bg-[rgb(var(--bg-primary))] p-0">
        <SheetHeader className="border-b border-[rgb(var(--glass-border))] px-4 py-4">
          <SheetTitle className="text-left text-base font-semibold text-text-primary">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col py-4">
          <div className="px-4 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Ferramentas
            </span>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href as any}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                {item.label}
              </Link>
            )
          })}

          <div className="my-3 h-px bg-[rgb(var(--glass-border))]" />

          <div className="px-4 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Configurações
            </span>
          </div>
          {settingsItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href as any}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                {item.label}
              </Link>
            )
          })}

          <div className="my-3 h-px bg-[rgb(var(--glass-border))]" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-error/10"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
            Sair
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
