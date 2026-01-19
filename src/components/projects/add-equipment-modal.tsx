'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { motion } from 'framer-motion'
import { Package, Calendar } from 'lucide-react'
import { getEquipments, addEquipmentBooking } from '@/actions/equipments'
import { useRouter } from 'next/navigation'

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

export function AddEquipmentModal({ isOpen, onClose, projectId }: AddEquipmentModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [formData, setFormData] = useState({
    equipmentId: '',
    startDate: '',
    endDate: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      getEquipments().then((data) => {
        // Filtrar apenas equipamentos disponíveis
        const available = data.filter(
          (e: Equipment) => e.status === 'AVAILABLE' || e.status === 'IN_USE'
        )
        setEquipments(available)
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addEquipmentBooking({
        projectId,
        equipmentId: formData.equipmentId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes || undefined,
      })

      router.refresh()
      onClose()
      setFormData({
        equipmentId: '',
        startDate: '',
        endDate: '',
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
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Equipamento *
          </label>
          <select
            required
            value={formData.equipmentId}
            onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="">Selecione um equipamento</option>
            {equipments.map((equipment) => (
              <option key={equipment.id} value={equipment.id} className="bg-zinc-900">
                {equipment.name} ({categoryLabels[equipment.category] || equipment.category})
                {equipment.daily_rate && ` - R$ ${equipment.daily_rate}/dia`}
              </option>
            ))}
          </select>
        </div>

        {/* Preview do equipamento selecionado */}
        {selectedEquipment && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                <Package className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">{selectedEquipment.name}</p>
                <p className="text-xs text-zinc-400">
                  {categoryLabels[selectedEquipment.category] || selectedEquipment.category}
                  {selectedEquipment.serial_number && ` • S/N: ${selectedEquipment.serial_number}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Data Início *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Data Fim *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Ex: Trazer baterias extras, cuidado com lente..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        {/* Aviso de conflito */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-xs text-blue-300">
            💡 O sistema verificará automaticamente se o equipamento está disponível nas datas
            selecionadas.
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            disabled={isLoading || !formData.equipmentId || !formData.startDate || !formData.endDate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Reservando...' : 'Reservar Equipamento'}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
