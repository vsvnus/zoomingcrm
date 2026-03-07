import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardClient } from '@/components/layout/dashboard-client'

/**
 * Dashboard layout -- async Server Component with auth guard.
 *
 * Defense-in-depth: even if the middleware session check is bypassed
 * (e.g. static generation, edge-case race), this layout will redirect
 * unauthenticated users to /login before any dashboard page renders.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="relative min-h-screen bg-bg-primary">
      {/* Background gradiente sutil - adapta ao tema */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/5 via-transparent to-transparent" />

      <Sidebar />

      <DashboardClient>{children}</DashboardClient>
    </div>
  )
}
