'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Users, Box, Truck } from 'lucide-react'
import { addExpense } from '@/actions/finances'

interface AddExpenseModalProps {
  projectId: string
  onClose: () => void
}

export function AddExpenseModal({ projectId, onClose }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    category: 'CREW_TALENT' as 'CREW_TALENT' | 'EQUIPMENT' | 'LOGISTICS',
    description: '',
    estimated_cost: '',
    actual_cost: '',
    payment_status: 'TO_PAY' as 'TO_PAY' | 'SCHEDULED' | 'PAID',
    payment_date: '',
    invoice_number: '',
    notes: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await addExpense({
        project_id: projectId,
        category: formData.category,
        description: formData.description,
        estimated_cost: parseFloat(formData.estimated_cost),
        actual_cost: formData.actual_cost
          ? parseFloat(formData.actual_cost)
          : 0,
        payment_status: formData.payment_status,
        payment_date: formData.payment_date || undefined,
        invoice_number: formData.invoice_number || undefined,
        notes: formData.notes || undefined,
      })

      onClose()
    } catch (err) {
      setError('Erro ao criar despesa. Tente novamente.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: 'CREW_TALENT', label: 'Crew & Talents', icon: Users },
    { value: 'EQUIPMENT', label: 'Equipamentos', icon: Box },
    { value: 'LOGISTICS', label: 'Logística', icon: Truck },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Adicionar Despesa</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-zinc-300">
              Categoria
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => {
                const Icon = category.icon
                const isSelected = formData.category === category.value

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        category: category.value as
                          | 'CREW_TALENT'
                          | 'EQUIPMENT'
                          | 'LOGISTICS',
                      })
                    }
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      isSelected
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Descrição
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Ex: Diretor de Fotografia - 3 diárias"
            />
          </div>

          {/* Costs */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Custo Estimado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.estimated_cost}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_cost: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Custo Realizado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.actual_cost}
                onChange={(e) =>
                  setFormData({ ...formData, actual_cost: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Deixe em branco se ainda não foi pago
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Status de Pagamento
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_status: e.target.value as
                      | 'TO_PAY'
                      | 'SCHEDULED'
                      | 'PAID',
                  })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              >
                <option value="TO_PAY">A Pagar</option>
                <option value="SCHEDULED">Agendado</option>
                <option value="PAID">Pago</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Data de Pagamento
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) =>
                  setFormData({ ...formData, payment_date: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>

          {/* Invoice Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Número da Nota Fiscal (opcional)
            </label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) =>
                setFormData({ ...formData, invoice_number: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Ex: NF-12345"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Observações (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Detalhes adicionais sobre esta despesa..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 py-3 font-medium text-white transition-all hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-white py-3 font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Adicionar Despesa'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
