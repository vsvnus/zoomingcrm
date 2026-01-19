import { getProject } from '@/actions/projects'
import { getProjectFinancialSummary, getProjectExpenses } from '@/actions/finances'
import { getProjectEquipmentBookings } from '@/actions/equipments'
import { ProjectDetailTabs } from '@/components/projects/project-detail-tabs'
import { notFound } from 'next/navigation'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  const financialSummary = await getProjectFinancialSummary(id)
  const expenses = await getProjectExpenses(id)
  const equipmentBookings = await getProjectEquipmentBookings(id)

  return (
    <ProjectDetailTabs
      project={project}
      financialSummary={financialSummary}
      expenses={expenses}
      equipmentBookings={equipmentBookings}
    />
  )
}
