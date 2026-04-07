import { create } from 'zustand'
import type { PlanKey } from '@/lib/subscription/plans'

interface SubscriptionState {
  effectivePlan: PlanKey
  subscriptionStatus: string | null
  trialEndsAt: string | null
  showUpgradeModal: boolean
  blockedFeature: string | null
  setSubscription: (data: {
    effectivePlan: PlanKey
    subscriptionStatus: string | null
    trialEndsAt: string | null
  }) => void
  openUpgradeModal: (feature: string) => void
  closeUpgradeModal: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  effectivePlan: 'EXPIRED',
  subscriptionStatus: null,
  trialEndsAt: null,
  showUpgradeModal: false,
  blockedFeature: null,
  setSubscription: (data) => set(data),
  openUpgradeModal: (feature) => set({ showUpgradeModal: true, blockedFeature: feature }),
  closeUpgradeModal: () => set({ showUpgradeModal: false, blockedFeature: null }),
}))
