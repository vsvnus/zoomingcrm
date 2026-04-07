import { getProjectsForStudio } from '@/actions/scripts'
import { StudioNewScript } from '@/components/studio/studio-new-script'
import { StudioNewChoice } from '@/components/studio/studio-new-choice'
import { StudioAIWizard } from '@/components/studio/studio-ai-wizard'

export default async function StudioNewPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; mode?: string }>
}) {
  const { project: preselectedProjectId, mode } = await searchParams

  if (mode === 'ai') {
    return <StudioAIWizard />
  }

  if (mode === 'manual') {
    const projects = await getProjectsForStudio()
    return (
      <StudioNewScript
        projects={projects}
        preselectedProjectId={preselectedProjectId}
      />
    )
  }

  // Default: show choice between AI and manual
  return <StudioNewChoice />
}
