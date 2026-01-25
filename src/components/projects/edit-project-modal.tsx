'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { updateProject, addShootingDate, addDeliveryDate, deleteShootingDate, deleteDeliveryDate, getOrganizationUsers } from '@/actions/projects'
import { getClients } from '@/actions/clients'
import { motion } from 'framer-motion'
import type { ProjectWithRelations, VideoFormat, VideoResolution, ShootingDate, DeliveryDate } from '@/types/projects'
import { useRouter } from 'next/navigation'
import { DatesManager } from './dates-manager'

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: ProjectWithRelations
}

type Client = {
  id: string
  name: string
  company?: string | null
}

type User = {
  id: string
  name: string
  email: string
}

interface LocalShootingDate {
  id?: string
  date: string
  time?: string
  location?: string
  notes?: string
  isNew?: boolean
}

interface LocalDeliveryDate {
  id?: string
  date: string
  description: string
  completed?: boolean
  isNew?: boolean
}

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeSection, setActiveSection] = useState<'basic' | 'dates'>('basic')

  // Datas de gravação e entrega
  const [shootingDates, setShootingDates] = useState<LocalShootingDate[]>([])
  const [deliveryDates, setDeliveryDates] = useState<LocalDeliveryDate[]>([])
  const [deletedShootingIds, setDeletedShootingIds] = useState<string[]>([])
  const [deletedDeliveryIds, setDeletedDeliveryIds] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    client_id: project.client_id,
    assigned_to_id: project.assigned_to_id || '',
    location: project.location || '',
    shooting_date: project.shooting_date
      ? new Date(project.shooting_date).toISOString().split('T')[0]
      : '',
    shooting_end_date: project.shooting_end_date
      ? new Date(project.shooting_end_date).toISOString().split('T')[0]
      : '',
    shooting_time: project.shooting_time || '',
    deadline_date: project.deadline_date
      ? new Date(project.deadline_date).toISOString().split('T')[0]
      : '',
    video_format: project.video_format || '',
    resolution: project.resolution || '',
    drive_folder_link: project.drive_folder_link || '',
    script_link: project.script_link || '',
  })

  // Carregar datas existentes do projeto
  useEffect(() => {
    if (isOpen && project) {
      // Carregar shooting_dates
      if (project.shooting_dates && project.shooting_dates.length > 0) {
        setShootingDates(
          project.shooting_dates.map((sd) => ({
            id: sd.id,
            date: new Date(sd.date).toISOString().split('T')[0],
            time: sd.time || '',
            location: sd.location || '',
            notes: sd.notes || '',
          }))
        )
      } else {
        setShootingDates([])
      }

      // Carregar delivery_dates
      if (project.delivery_dates && project.delivery_dates.length > 0) {
        setDeliveryDates(
          project.delivery_dates.map((dd) => ({
            id: dd.id,
            date: new Date(dd.date).toISOString().split('T')[0],
            description: dd.description,
            completed: dd.completed,
          }))
        )
      } else {
        setDeliveryDates([])
      }

      setDeletedShootingIds([])
      setDeletedDeliveryIds([])
    }
  }, [isOpen, project])

  useEffect(() => {
    if (isOpen) {
      getClients().then(setClients)
      getOrganizationUsers().then(setUsers)
    }
  }, [isOpen])

  // Handler para mudança de datas de gravação
  const handleShootingDatesChange = (dates: LocalShootingDate[]) => {
    // Verificar se alguma data foi removida
    const currentIds = dates.map(d => d.id).filter(Boolean)
    const removedIds = shootingDates
      .filter(d => d.id && !currentIds.includes(d.id))
      .map(d => d.id!)

    setDeletedShootingIds([...deletedShootingIds, ...removedIds])
    setShootingDates(dates.map(d => ({ ...d, isNew: !d.id })))
  }

  // Handler para mudança de datas de entrega
  const handleDeliveryDatesChange = (dates: LocalDeliveryDate[]) => {
    // Verificar se alguma data foi removida
    const currentIds = dates.map(d => d.id).filter(Boolean)
    const removedIds = deliveryDates
      .filter(d => d.id && !currentIds.includes(d.id))
      .map(d => d.id!)

    setDeletedDeliveryIds([...deletedDeliveryIds, ...removedIds])
    setDeliveryDates(dates.map(d => ({ ...d, isNew: !d.id })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Atualizar dados básicos do projeto
      await updateProject(project.id, {
        title: formData.title,
        description: formData.description || undefined,
        client_id: formData.client_id,
        assigned_to_id: formData.assigned_to_id || undefined,
        location: formData.location || undefined,
        shooting_date: formData.shooting_date || undefined,
        shooting_end_date: formData.shooting_end_date || undefined,
        shooting_time: formData.shooting_time || undefined,
        deadline_date: formData.deadline_date || undefined,
        video_format: (formData.video_format as VideoFormat) || undefined,
        resolution: (formData.resolution as VideoResolution) || undefined,
        drive_folder_link: formData.drive_folder_link || undefined,
        script_link: formData.script_link || undefined,
      })

      // 2. Deletar datas de gravação removidas
      for (const id of deletedShootingIds) {
        await deleteShootingDate(id, project.id)
      }

      // 3. Deletar datas de entrega removidas
      for (const id of deletedDeliveryIds) {
        await deleteDeliveryDate(id, project.id)
      }

      // 4. Adicionar novas datas de gravação
      for (const sd of shootingDates) {
        if (!sd.id) {
          await addShootingDate(project.id, {
            date: sd.date,
            time: sd.time || undefined,
            location: sd.location || undefined,
            notes: sd.notes || undefined,
          })
        }
      }

      // 5. Adicionar novas datas de entrega
      for (const dd of deliveryDates) {
        if (!dd.id) {
          await addDeliveryDate(project.id, {
            date: dd.date,
            description: dd.description,
            completed: dd.completed || false,
          })
        }
      }

      router.refresh()
      onClose()
    } catch (error) {
      alert('Erro ao atualizar projeto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Projeto">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Abas de navegação */}
        <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${activeSection === 'basic'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Informações Básicas
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('dates')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${activeSection === 'dates'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Cronograma
          </button>
        </div>

        {activeSection === 'basic' && (
          <>
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

            {/* Responsável */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Responsável
              </label>
              <select
                value={formData.assigned_to_id}
                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              >
                <option value="">Selecione um responsável</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="bg-zinc-900">
                    {user.name} ({user.email})
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

            {/* Localização */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Localização
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="São Paulo, SP"
              />
            </div>

            {/* Especificações Técnicas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Formato de Vídeo
                </label>
                <select
                  value={formData.video_format}
                  onChange={(e) => setFormData({ ...formData, video_format: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="">Selecione</option>
                  <option value="16:9" className="bg-zinc-900">
                    16:9 (Horizontal)
                  </option>
                  <option value="9:16" className="bg-zinc-900">
                    9:16 (Vertical)
                  </option>
                  <option value="1:1" className="bg-zinc-900">
                    1:1 (Quadrado)
                  </option>
                  <option value="4:5" className="bg-zinc-900">
                    4:5 (Instagram)
                  </option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Resolução
                </label>
                <select
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="">Selecione</option>
                  <option value="1080p" className="bg-zinc-900">
                    1080p (Full HD)
                  </option>
                  <option value="4K" className="bg-zinc-900">
                    4K (Ultra HD)
                  </option>
                  <option value="8K" className="bg-zinc-900">
                    8K
                  </option>
                </select>
              </div>
            </div>

            {/* Links */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Link da Pasta do Drive
              </label>
              <input
                type="url"
                value={formData.drive_folder_link}
                onChange={(e) =>
                  setFormData({ ...formData, drive_folder_link: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Link do Roteiro
              </label>
              <input
                type="url"
                value={formData.script_link}
                onChange={(e) => setFormData({ ...formData, script_link: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="https://docs.google.com/..."
              />
            </div>
          </>
        )}

        {activeSection === 'dates' && (
          <>
            {/* Data Principal (para compatibilidade) */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
              <h4 className="text-sm font-medium text-white">Data Principal do Projeto</h4>
              <p className="text-xs text-zinc-500">
                Defina a data de gravação e prazo principal. Para projetos com múltiplas datas, adicione abaixo.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Início da Gravação
                  </label>
                  <input
                    type="date"
                    value={formData.shooting_date}
                    onChange={(e) => setFormData({ ...formData, shooting_date: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Fim da Gravação
                  </label>
                  <input
                    type="date"
                    value={formData.shooting_end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, shooting_end_date: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={formData.shooting_time}
                    onChange={(e) => setFormData({ ...formData, shooting_time: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Prazo de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.deadline_date}
                    onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Datas Adicionais */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <h4 className="mb-3 text-sm font-medium text-white">Cronograma Detalhado</h4>
              <p className="mb-4 text-xs text-zinc-500">
                Adicione múltiplas datas de gravação e prazos de entrega para cada entregável.
              </p>
              <DatesManager
                shootingDates={shootingDates}
                deliveryDates={deliveryDates}
                onShootingDatesChange={handleShootingDatesChange}
                onDeliveryDatesChange={handleDeliveryDatesChange}
              />
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-zinc-900 py-4 -mx-2 px-2">
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
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
