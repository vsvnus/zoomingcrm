'use client'

import { AIChatProvider } from '@/components/ai/ai-chat-context'
import { Header } from './header'
import { AIChatWidget } from '@/components/ai/ai-chat-widget'
import { BottomTabBar } from './bottom-tab-bar'
import { OnboardingTour } from '@/components/onboarding/onboarding-tour'
import { TrialBanner } from '@/components/subscription/trial-banner'
import { ExpiredBanner } from '@/components/subscription/expired-banner'
import { UpgradeModal } from '@/components/subscription/upgrade-modal'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useEffect } from 'react'
import type { PlanKey } from '@/lib/subscription/plans'

interface DashboardClientProps {
  children: React.ReactNode
  showOnboarding?: boolean
  userName?: string
  subscriptionStatus?: string | null
  trialEndsAt?: string | null
  effectivePlan?: string
}

export function DashboardClient({
  children,
  showOnboarding,
  userName,
  subscriptionStatus,
  trialEndsAt,
  effectivePlan,
}: DashboardClientProps) {
  const setSubscription = useSubscriptionStore((s) => s.setSubscription)

  useEffect(() => {
    setSubscription({
      effectivePlan: (effectivePlan as PlanKey) || 'EXPIRED',
      subscriptionStatus: subscriptionStatus ?? null,
      trialEndsAt: trialEndsAt ?? null,
    })
  }, [effectivePlan, subscriptionStatus, trialEndsAt, setSubscription])

  return (
    <AIChatProvider>
      <div className="pl-0 md:pl-[280px]">
        <Header />
        <main className="relative min-h-[calc(100vh-4rem)] p-4 pb-20 md:p-8 md:pb-8">
          <TrialBanner
            trialEndsAt={trialEndsAt ?? null}
            subscriptionStatus={subscriptionStatus ?? null}
          />
          <ExpiredBanner subscriptionStatus={subscriptionStatus ?? null} />
          {(subscriptionStatus === 'TRIALING' || subscriptionStatus === 'EXPIRED') && (
            <div className="mb-4" />
          )}
          {children}
        </main>
      </div>
      <AIChatWidget />
      <BottomTabBar />
      <UpgradeModal />
      {showOnboarding && <OnboardingTour userName={userName || 'Usuário'} />}
    </AIChatProvider>
  )
}
