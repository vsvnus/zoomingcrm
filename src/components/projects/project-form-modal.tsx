'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { addProject } from '@/actions/projects'
import { getClients } from '@/actions/clients'
import { motion } from 'framer-motion'
import { DatesManager } from './dates-manager'

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

interface ShootingDate {
  date: string
  time?: string
  location?: string
  notes?: string
}

interface DeliveryDate {
  date: string
  description: string
  completed?: boolean
}

export function ProjectFormModal({ isOpen, onClose, onSuccess }: ProjectFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    deadline: '',
    shooting_date: '',
    budget: '',
    deliverablesDescription: '', // SPRINT 2
  })
  const [shootingDates, setShootingDates] = useState<ShootingDate[]>([])
  const [deliveryDates, setDeliveryDates] = useState<DeliveryDate[]>([])

  useEffect(() => {
    if (isOpen) {
      getClients().then(setClients)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newProject = await addProject({
        title: formData.title,
        description: formData.description || undefined,
        client_id: formData.client_id,
        deadline: formData.deadline || undefined,
        shooting_date: formData.shooting_date || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deliverables_description: formData.deliverablesDescription || undefined, // SPRINT 2
      })

      // TODO: Adicionar shooting_dates e delivery_dates após criar o projeto
      // Isso será implementado quando integrar com a página de detalhes do projeto

      // Buscar dados do cliente para incluir no projeto
      const client = clients.find(c => c.id === formData.client_id)

      setFormData({
        title: '',
        description: '',
        client_id: '',
        deadline: '',
        shooting_date: '',
        budget: '',
        deliverablesDescription: '',
      })
      setShootingDates([])
      setDeliveryDates([])

      // Passar o projeto completo com dados do cliente
      onSuccess({ ...newProject, clients: client })
      onClose()
    } catch (error) {
      alert('Erro ao criar projeto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Projeto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Título do Projeto *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Vídeo Institucional"
          />
        </div>

        {/* Cliente */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Cliente *
          </label>
          <select
            required
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-zinc-900">
                {client.name} {client.company && `- ${client.company}`}
              </option>
            ))}
          </select>
        </div>

        {/* Descrição */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Detalhes do projeto..."
          />
        </div>

        {/* Data de Gravação */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Data de Gravação
          </label>
          <input
            type="date"
            value={formData.shooting_date}
            onChange={(e) => setFormData({ ...formData, shooting_date: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Prazo de Entrega
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        {/* Orçamento */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Orçamento (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="10000.00"
          />
        </div>

        {/* SPRINT 2: Resumo de Entregáveis */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Resumo de Entregáveis
          </label>
          <textarea
            value={formData.deliverablesDescription}
            onChange={(e) => setFormData({ ...formData, deliverablesDescription: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Ex: 1 vídeo 30s Instagram, 2 banners 1920x1080, thumb YouTube..."
          />
        </div>

        {/* SPRINT 2: Gerenciador de Datas */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <DatesManager
            shootingDates={shootingDates}
            deliveryDates={deliveryDates}
            onShootingDatesChange={setShootingDates}
            onDeliveryDatesChange={setDeliveryDates}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : 'Criar Projeto'}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
