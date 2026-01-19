'use client'

import { useState } from 'react'
import { Plus, X, User, DollarSign, Calendar, Edit2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface Freelancer {
  id: string
  name: string
  email?: string
  phone?: string
  dailyRate?: number
  skills?: string[]
}

interface FreelancerAllocation {
  id?: string
  freelancerId: string
  freelancerName?: string
  date: string
  customRate?: number | null // SPRINT 2: Valor customizado
  confirmed?: boolean
  notes?: string
}

interface FreelancerSelectorProps {
  projectId?: string
  availableFreelancers: Freelancer[]
  selectedAllocations: FreelancerAllocation[]
  onAllocationsChange: (allocations: FreelancerAllocation[]) => void
  onPayableUpdate?: (freelancerId: string, amount: number) => void // Callback para atualizar Contas a Pagar
}

// Componente separado para cada item da lista (para respeitar regras de hooks)
interface AllocationItemProps {
  allocation: FreelancerAllocation
  index: number
  freelancer?: Freelancer
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveRate: (rate: number) => void
  onRemove: () => void
}

function AllocationItem({
  allocation,
  index,
  freelancer,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveRate,
  onRemove,
}: AllocationItemProps) {
  const [tempRate, setTempRate] = useState(allocation.customRate || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-sm text-white">
          <User className="h-4 w-4 text-amber-400" />
          <span className="font-medium">
            {allocation.freelancerName || freelancer?.name || 'Freelancer'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {new Date(allocation.date + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* SPRINT 2: Valor editável */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <input
                  type="number"
                  step="0.01"
                  value={tempRate}
                  onChange={(e) => setTempRate(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white"
                />
                <button
                  onClick={() => onSaveRate(tempRate)}
                  className="rounded p-1 text-green-400 hover:bg-green-500/10"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="rounded p-1 text-zinc-400 hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <DollarSign className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400">
                  R$ {allocation.customRate?.toFixed(2) || '0.00'}
                </span>
                <button
                  onClick={() => {
                    setTempRate(allocation.customRate || 0)
                    onStartEdit()
                  }}
                  className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {allocation.notes && <p className="text-xs text-zinc-500">{allocation.notes}</p>}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="ml-3 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export function FreelancerSelector({
  projectId,
  availableFreelancers,
  selectedAllocations,
  onAllocationsChange,
  onPayableUpdate,
}: FreelancerSelectorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newAllocation, setNewAllocation] = useState<FreelancerAllocation>({
    freelancerId: '',
    date: '',
    customRate: null,
    notes: '',
  })

  const addAllocation = () => {
    if (newAllocation.freelancerId && newAllocation.date) {
      const freelancer = availableFreelancers.find((f) => f.id === newAllocation.freelancerId)
      const allocation: FreelancerAllocation = {
        ...newAllocation,
        freelancerName: freelancer?.name,
        // Se customRate não foi definido, usa o dailyRate do freelancer
        customRate: newAllocation.customRate || freelancer?.dailyRate || null,
      }

      onAllocationsChange([...selectedAllocations, allocation])

      // SPRINT 2: Atualizar Contas a Pagar automaticamente
      if (onPayableUpdate && allocation.customRate) {
        onPayableUpdate(allocation.freelancerId, allocation.customRate)
      }

      setNewAllocation({
        freelancerId: '',
        date: '',
        customRate: null,
        notes: '',
      })
      setShowForm(false)
    }
  }

  const removeAllocation = (index: number) => {
    onAllocationsChange(selectedAllocations.filter((_, i) => i !== index))
  }

  const updateCustomRate = (index: number, newRate: number) => {
    const updated = selectedAllocations.map((alloc, i) =>
      i === index ? { ...alloc, customRate: newRate } : alloc
    )
    onAllocationsChange(updated)

    // SPRINT 2: Atualizar Contas a Pagar automaticamente
    const allocation = selectedAllocations[index]
    if (onPayableUpdate && allocation) {
      onPayableUpdate(allocation.freelancerId, newRate)
    }

    setEditingIndex(null)
  }

  const handleFreelancerSelect = (freelancerId: string) => {
    const freelancer = availableFreelancers.find((f) => f.id === freelancerId)
    setNewAllocation({
      ...newAllocation,
      freelancerId,
      customRate: freelancer?.dailyRate || null,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">
          Freelancers Alocados
        </label>
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="h-8 gap-1 rounded-lg bg-amber-600 px-3 text-xs hover:bg-amber-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar Freelancer
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Freelancer *
              </label>
              <select
                value={newAllocation.freelancerId}
                onChange={(e) => handleFreelancerSelect(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Selecione um freelancer</option>
                {availableFreelancers.map((freelancer) => (
                  <option key={freelancer.id} value={freelancer.id} className="bg-zinc-900">
                    {freelancer.name}
                    {freelancer.dailyRate && ` - R$ ${freelancer.dailyRate}/dia`}
                    {freelancer.skills && ` (${freelancer.skills.slice(0, 2).join(', ')})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Data *
                </label>
                <input
                  type="date"
                  value={newAllocation.date}
                  onChange={(e) =>
                    setNewAllocation({ ...newAllocation, date: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Valor Diária (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAllocation.customRate || ''}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      customRate: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Valor personalizado"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Observações
              </label>
              <textarea
                value={newAllocation.notes}
                onChange={(e) =>
                  setNewAllocation({ ...newAllocation, notes: e.target.value })
                }
                rows={2}
                placeholder="Ex: Responsável pela câmera principal"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={addAllocation}
                disabled={!newAllocation.freelancerId || !newAllocation.date}
                className="flex-1 h-9 rounded-lg bg-amber-600 text-sm hover:bg-amber-700 disabled:opacity-50"
              >
                Adicionar
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 rounded-lg bg-white/5 px-4 text-sm hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {selectedAllocations.length > 0 ? (
          selectedAllocations.map((allocation, index) => {
            const freelancer = availableFreelancers.find((f) => f.id === allocation.freelancerId)

            return (
              <AllocationItem
                key={allocation.id || index}
                allocation={allocation}
                index={index}
                freelancer={freelancer}
                isEditing={editingIndex === index}
                onStartEdit={() => setEditingIndex(index)}
                onCancelEdit={() => setEditingIndex(null)}
                onSaveRate={(rate) => updateCustomRate(index, rate)}
                onRemove={() => removeAllocation(index)}
              />
            )
          })
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-6 text-center">
            <User className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-500">Nenhum freelancer alocado</p>
          </div>
        )}
      </div>

      {/* SPRINT 2: Alerta sobre integração com Contas a Pagar */}
      {selectedAllocations.length > 0 && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-xs text-blue-300">
            💡 <strong>Integração automática:</strong> Quando você edita o valor de um freelancer,
            o sistema atualiza automaticamente as "Contas a Pagar" no módulo Financeiro.
          </p>
        </div>
      )}
    </div>
  )
}
