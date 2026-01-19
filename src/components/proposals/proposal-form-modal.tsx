'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { addProposal } from '@/actions/proposals'
import { getClients } from '@/actions/clients'
import { motion } from 'framer-motion'

interface ProposalFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (proposal: any) => void
}

type Client = {
  id: string
  name: string
  company?: string | null
}

export function ProposalFormModal({ isOpen, onClose, onSuccess }: ProposalFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    base_value: '',
    discount: '',
  })

  const baseValue = parseFloat(formData.base_value) || 0
  const discount = parseFloat(formData.discount) || 0
  const totalValue = baseValue - discount

  useEffect(() => {
    if (isOpen) {
      getClients().then(setClients)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newProposal = await addProposal({
        title: formData.title,
        client_id: formData.client_id,
        base_value: baseValue,
        discount: discount || undefined,
      })

      // Buscar dados do cliente para incluir na proposta
      const client = clients.find(c => c.id === formData.client_id)

      setFormData({
        title: '',
        client_id: '',
        base_value: '',
        discount: '',
      })

      // Passar a proposta completa com dados do cliente
      onSuccess({ ...newProposal, clients: client })
      onClose()
    } catch (error) {
      alert('Erro ao criar proposta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Proposta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Título da Proposta *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Proposta Comercial - Janeiro 2024"
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

        {/* Valor Base */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Valor Base (R$) *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.base_value}
            onChange={(e) => setFormData({ ...formData, base_value: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="15000.00"
          />
        </div>

        {/* Desconto */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Desconto (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="0.00"
          />
        </div>

        {/* Valor Total (Preview) */}
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Valor Total</span>
            <span className="text-2xl font-bold text-green-400">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
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
            {isLoading ? 'Criando...' : 'Criar Proposta'}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
