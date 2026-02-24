import { getProjectScript } from '@/actions/scripts'
import { redirect } from 'next/navigation'

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const script = await getProjectScript(id)

  if (script) {
    redirect(`/studio/${script.id}` as any)
  }

  redirect(`/studio/new?project=${id}` as any)
}
