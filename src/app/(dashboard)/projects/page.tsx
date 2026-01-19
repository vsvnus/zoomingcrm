import { Suspense } from 'react'
import { getProjects } from '@/actions/projects'
import { ProjectsKanban } from '@/components/projects/projects-kanban'

async function ProjectsData() {
  const projects = await getProjects()
  return <ProjectsKanban initialProjects={projects} />
}

function ProjectsLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectsData />
    </Suspense>
  )
}
