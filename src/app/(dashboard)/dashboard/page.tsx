import { Suspense } from 'react'
import { getDashboardStats } from '@/actions/dashboard'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

async function DashboardData() {
  const stats = await getDashboardStats()
  return <DashboardContent stats={stats} />
}

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  )
}
