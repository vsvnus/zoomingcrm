'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { motion } from 'framer-motion'
import { Package, Calendar, Check, X } from 'lucide-react'
import { getEquipments, addEquipmentBooking } from '@/actions/equipments'
import { getProjectShootingDates } from '@/actions/projects'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AddEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

interface Equipment {
  id: string
  name: string
  category: string
  status: string
  daily_rate?: number
  serial_number?: string
}

interface ShootingDate {
  id: string
  date: string
  location?: string
  time?: string
}

export function AddEquipmentModal({ isOpen, onClose, projectId }: AddEquipmentModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [shootingDates, setShootingDates] = useState<ShootingDate[]>([])

  const [formData, setFormData] = useState({
    equipmentId: '',
    selectedDates: [] as string[],
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      // Carregar equipamentos
      getEquipments().then((data) => {
        const available = data.filter(
          (e: Equipment) => e.status === 'AVAILABLE' || e.status === 'IN_USE'
        )
        setEquipments(available)
      })

      // Carregar datas de gravação
      getProjectShootingDates(projectId).then((data) => {
        setShootingDates(data || [])
      })
    }
  }, [isOpen, projectId])

  const toggleDate = (date: string) => {
    setFormData(prev => {
      const exists = prev.selectedDates.includes(date)
      if (exists) {
        return { ...prev, selectedDates: prev.selectedDates.filter(d => d !== date) }
      } else {
        return { ...prev, selectedDates: [...prev.selectedDates, date] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (formData.selectedDates.length === 0) {
        throw new Error('Selecione pelo menos uma data de gravação')
      }

      // Criar uma reserva para cada data selecionada
      // Usamos Promise.all para fazer em paralelo, mas se falhar uma, falha tudo (ou trata erro individualmente)
      // Como é uma operação server action, vamos tentar uma a uma para garantir consistência ou feedback

      const promises = formData.selectedDates.map(date =>
        addEquipmentBooking({
          projectId,
          equipmentId: formData.equipmentId,
          startDate: date,
          endDate: date, // Reserva de 1 dia apenas
          notes: formData.notes || undefined,
        })
      )

      await Promise.all(promises)

      router.refresh()
      onClose()
      setFormData({
        equipmentId: '',
        selectedDates: [],
        notes: '',
      })
    } catch (error: any) {
      alert(error.message || 'Erro ao reservar equipamento')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedEquipment = equipments.find((e) => e.id === formData.equipmentId)

  const categoryLabels: Record<string, string> = {
    CAMERA: 'Câmera',
    LENS: 'Lente',
    AUDIO: 'Áudio',
    LIGHTING: 'Iluminação',
    GRIP: 'Grip',
    DRONE: 'Drone',
    ACCESSORY: 'Acessório',
    OTHER: 'Outro',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Equipamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção de Equipamento */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Equipamento *
          </label>
          <select
            required
            value={formData.equipmentId}
            onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-text-primary transition-all focus:border-border focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="">Selecione um equipamento</option>
            {equipments.map((equipment) => (
              <option key={equipment.id} value={equipment.id} className="bg-card">
                {equipment.name} ({categoryLabels[equipment.category] || equipment.category})
              </option>
            ))}
          </select>
        </div>

        {/* Preview do equipamento selecionado */}
        {selectedEquipment && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-text-primary">{selectedEquipment.name}</p>
                <p className="text-xs text-text-tertiary">
                  {categoryLabels[selectedEquipment.category] || selectedEquipment.category}
                  {selectedEquipment.serial_number && ` • S/N: ${selectedEquipment.serial_number}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seleção de Datas */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Datas de Uso *
          </label>

          {/* Opção 1: Datas de Gravação (Checklist) */}
          {shootingDates.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs text-text-tertiary">Datas de Gravação do Projeto</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {shootingDates.map((shoot) => {
                  const isSelected = formData.selectedDates.includes(shoot.date)
                  return (
                    <div
                      key={shoot.id}
                      onClick={() => toggleDate(shoot.date)}
                      className={cn(
                        "cursor-pointer rounded-lg border px-3 py-2 transition-all flex items-center gap-3",
                        isSelected
                          ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                          : "border-border bg-secondary text-text-secondary hover:bg-bg-hover"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                        isSelected ? "border-purple-500 bg-purple-500 text-white" : "border-text-quaternary bg-transparent"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div>
                        <span className="block text-sm font-medium">
                          {new Date(shoot.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        {shoot.location && (
                          <span className="block text-xs opacity-70 truncate max-w-[120px]">
                            {shoot.location}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Opção 2: Data Manual */}
          <div>
            <p className="mb-2 text-xs text-text-tertiary">Adicionar Data Manualmente</p>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                onChange={(e) => {
                  if (e.target.value) {
                    toggleDate(e.target.value)
                    e.target.value = '' // Reset input
                  }
                }}
              />
            </div>
            {/* Lista de datas selecionadas que não estão no shootingProjects (manuais) */}
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.selectedDates
                .filter(date => !shootingDates.find(sd => sd.date === date))
                .map(date => (
                  <div key={date} className="flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                    <span>{new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    <button
                      type="button"
                      onClick={() => toggleDate(date)}
                      className="rounded-full p-0.5 hover:bg-purple-500/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Ex: Trazer baterias extras..."
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-text-primary placeholder-text-quaternary transition-all focus:border-border focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-bg-hover"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            disabled={isLoading || !formData.equipmentId || formData.selectedDates.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Reservando...' : `Reservar (${formData.selectedDates.length} dias)`}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
