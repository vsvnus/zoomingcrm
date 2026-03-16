import { getScript } from '@/actions/scripts'
import { getProject } from '@/actions/projects'
import { ScriptEditor } from '@/components/script/script-editor'
import { notFound } from 'next/navigation'

export default async function StudioEditorPage({
  params,
}: {
  params: Promise<{ scriptId: string }>
}) {
  const { scriptId } = await params
  const script = await getScript(scriptId)

  if (!script) {
    notFound()
  }

  const project = script.project_id ? await getProject(script.project_id) : null

  return (
    <ScriptEditor
      script={script}
      projectId={script.project_id || ''}
      projectTitle={project?.title || 'Sem Projeto'}
      studioMode
    />
  )
}
