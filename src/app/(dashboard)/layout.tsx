import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardClient } from '@/components/layout/dashboard-client'
import { checkFinancialAlerts } from '@/actions/financeiro'
import { getOrganizationSubscription } from '@/lib/subscription/server'

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

  // Buscar dados do usuário para onboarding
  const { data: userData } = await supabase
    .from('users')
    .select('name, onboarded')
    .eq('id', user.id)
    .single()

  const showOnboarding = userData?.onboarded === false
  const userName = userData?.name || user.email?.split('@')[0] || 'Usuário'

  // Buscar dados de subscription
  let subscriptionData = { subscriptionStatus: null as string | null, trialEndsAt: null as string | null, effectivePlan: 'EXPIRED' as string }
  try {
    const sub = await getOrganizationSubscription()
    subscriptionData = {
      subscriptionStatus: sub.subscriptionStatus,
      trialEndsAt: sub.trialEndsAt,
      effectivePlan: sub.effectivePlan,
    }
  } catch {
    // Silently handle — fallback to expired
  }

  // Verificar alertas financeiros (fire-and-forget, não bloqueia render)
  checkFinancialAlerts().catch(err =>
    console.error('Financial alerts check failed:', err)
  )

  return (
    <div className="relative min-h-screen bg-bg-primary">
      {/* Background gradiente sutil - adapta ao tema */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/5 via-transparent to-transparent" />

      <Sidebar />

      <DashboardClient
        showOnboarding={showOnboarding}
        userName={userName}
        subscriptionStatus={subscriptionData.subscriptionStatus}
        trialEndsAt={subscriptionData.trialEndsAt}
        effectivePlan={subscriptionData.effectivePlan}
      >
        {children}
      </DashboardClient>
    </div>
  )
}
