import { Suspense } from 'react'
import { getEquipments } from '@/actions/equipments'
import { getFreelancers } from '@/actions/freelancers'
import { BudgetCalculatorClient } from '@/components/budget-calculator/budget-calculator-client'

async function BudgetCalculatorData() {
  const [equipments, freelancers] = await Promise.all([
    getEquipments(),
    getFreelancers(),
  ])

  return (
    <BudgetCalculatorClient
      equipments={equipments}
      freelancers={freelancers}
    />
  )
}

function BudgetCalculatorLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function BudgetCalculatorPage() {
  return (
    <Suspense fallback={<BudgetCalculatorLoading />}>
      <BudgetCalculatorData />
    </Suspense>
  )
}
