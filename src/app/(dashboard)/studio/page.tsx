import { Suspense } from 'react'
import { getAllScripts, getProjectsForStudio } from '@/actions/scripts'
import { StudioListPage } from '@/components/studio/studio-list-page'

async function StudioData() {
  const [scripts, projects] = await Promise.all([
    getAllScripts(),
    getProjectsForStudio(),
  ])

  return <StudioListPage scripts={scripts} projects={projects} />
}

function StudioLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioData />
    </Suspense>
  )
}
