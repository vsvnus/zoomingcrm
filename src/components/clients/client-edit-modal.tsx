'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { updateClient } from '@/actions/clients'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  notes?: string | null
}

interface ClientEditModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client
  onSuccess?: () => void
}

export function ClientEditModal({ isOpen, onClose, client, onSuccess }: ClientEditModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  })

  // Atualizar form quando cliente mudar
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        notes: client.notes || '',
      })
    }
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateClient(client.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        notes: formData.notes || null,
      })
      onSuccess?.()
      onClose()
      router.refresh()
    } catch (error) {
      alert('Erro ao atualizar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Nome *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-2.5 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="Joao Silva"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-2.5 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="joao@empresa.com"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Telefone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-2.5 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Empresa */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Empresa
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-2.5 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="Empresa LTDA"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Observacoes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-2.5 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="Informacoes adicionais..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-bg-hover"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
