'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { addProposalOptional } from '@/actions/proposals'

interface AddOptionalModalProps {
  proposalId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddOptionalModal({
  proposalId,
  isOpen,
  onClose,
  onSuccess,
}: AddOptionalModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addProposalOptional(proposalId, {
        title: formData.title,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
      })

      setFormData({ title: '', description: '', price: '' })
      onSuccess()
      onClose()
    } catch (error) {
      alert('Erro ao adicionar opcional')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Adicionar Opcional</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Ex: Filmagem com Drone"
            />
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
              placeholder="Descrição detalhada do opcional..."
            />
          </div>

          {/* Preço */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Preço (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="0.00"
            />
          </div>

          {/* Price Preview */}
          {formData.price && (
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Valor do Opcional</span>
                <span className="text-2xl font-bold text-purple-400">
                  R${' '}
                  {parseFloat(formData.price || '0').toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Opcional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
