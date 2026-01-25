'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { createProject } from '@/actions/projects'
import { getClients } from '@/actions/clients'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (project: any) => void
}

type Client = {
  id: string
  name: string
  company?: string | null
}

/**
 * Modal simplificado de criação de projeto
 * 
 * Apenas 3 campos: Título, Cliente e Descrição (opcional)
 * Após criar, redireciona para tela de detalhes onde usuário pode
 * configurar o restante progressivamente.
 */
export function ProjectFormModal({ isOpen, onClose, onSuccess }: ProjectFormModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    description: '',
  })
  const [redirectAfterCreate, setRedirectAfterCreate] = useState(true)

  useEffect(() => {
    if (isOpen) {
      getClients().then(setClients)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação de campos obrigatórios
    if (!formData.title.trim()) {
      alert('Por favor, preencha o título do projeto.')
      return
    }

    if (!formData.client_id) {
      alert('Por favor, selecione um cliente.')
      return
    }

    setIsLoading(true)

    try {
      const newProject = await createProject({
        title: formData.title.trim(),
        client_id: formData.client_id,
        description: formData.description || undefined,
      })

      // Buscar dados do cliente para incluir no projeto
      const client = clients.find(c => c.id === formData.client_id)

      // Limpar formulário
      setFormData({
        title: '',
        client_id: '',
        description: '',
      })

      // Notificar sucesso
      onSuccess({ ...newProject, clients: client })
      onClose()

      // Redirecionar para detalhes do projeto (configuração progressiva)
      if (redirectAfterCreate && newProject?.id) {
        router.push(`/projects/${newProject.id}`)
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      alert('Erro ao criar projeto. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Projeto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mensagem informativa */}
        <div className="rounded-lg border border-accent-500/30 bg-accent-500/10 p-3">
          <p className="text-sm text-accent-300">
            💡 Crie rapidamente! Configure datas, equipe e orçamento depois na tela de detalhes.
          </p>
        </div>

        {/* Título */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Título do Projeto <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            placeholder="Ex: Vídeo Institucional, Campanha Redes Sociais..."
            autoFocus
          />
        </div>

        {/* Cliente */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Cliente <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-zinc-900">
                {client.name} {client.company && `- ${client.company}`}
              </option>
            ))}
          </select>
        </div>

        {/* Descrição (opcional) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Descrição <span className="text-zinc-500">(opcional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            placeholder="Breve descrição do projeto..."
          />
        </div>

        {/* Checkbox - Ir para detalhes */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="redirectAfterCreate"
            checked={redirectAfterCreate}
            onChange={(e) => setRedirectAfterCreate(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500/20"
          />
          <label htmlFor="redirectAfterCreate" className="text-sm text-zinc-400">
            Ir para detalhes após criar
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-accent-500 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-accent-600 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Criando...
              </span>
            ) : (
              'Criar Projeto'
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
