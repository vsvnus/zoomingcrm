'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { addProposalItem } from '@/actions/proposals'

interface AddItemModalProps {
  proposalId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddItemModal({ proposalId, isOpen, onClose, onSuccess }: AddItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unit_price: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addProposalItem(proposalId, {
        description: formData.description,
        quantity: formData.quantity,
        unit_price: parseFloat(formData.unit_price),
      })

      setFormData({ description: '', quantity: 1, unit_price: '' })
      onSuccess()
      onClose()
    } catch (error) {
      alert('Erro ao adicionar item')
    } finally {
      setIsLoading(false)
    }
  }

  const total = formData.quantity * (parseFloat(formData.unit_price) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Adicionar Item</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Descrição *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Ex: Roteiro e Storyboard"
            />
          </div>

          {/* Quantidade e Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Preço Unitário (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Total do Item</span>
              <span className="text-2xl font-bold text-green-400">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
