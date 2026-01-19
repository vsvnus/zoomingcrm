import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-white">404</h1>
        <p className="mb-8 text-xl text-zinc-400">Projeto não encontrado</p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black transition-all hover:bg-white/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para projetos
        </Link>
      </div>
    </div>
  )
}
