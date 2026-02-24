import { getProjectsForStudio } from '@/actions/scripts'
import { StudioNewScript } from '@/components/studio/studio-new-script'

export default async function StudioNewPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { project: preselectedProjectId } = await searchParams
  const projects = await getProjectsForStudio()

  return (
    <StudioNewScript
      projects={projects}
      preselectedProjectId={preselectedProjectId}
    />
  )
}
