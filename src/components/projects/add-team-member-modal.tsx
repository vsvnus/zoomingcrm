'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { addProjectMember } from '@/actions/projects'
import { getFreelancers } from '@/actions/freelancers'
import { motion } from 'framer-motion'
import { Search, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { FREELANCER_ROLES } from '@/constants/freelancers'

interface AddTeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

type Freelancer = {
  id: string
  name: string
  email?: string
  phone?: string
  skills?: string
  daily_rate?: number
}


export function AddTeamMemberModal({
  isOpen,
  onClose,
  projectId,
}: AddTeamMemberModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    freelancer_id: '',
    role: '',
    agreed_fee: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      getFreelancers().then(setFreelancers)
    }
  }, [isOpen])

  const filteredFreelancers = freelancers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.skills?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedFreelancer = freelancers.find((f) => f.id === formData.freelancer_id)

  const handleFreelancerSelect = (freelancerId: string) => {
    setFormData({ ...formData, freelancer_id: freelancerId })
    setSearchTerm('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addProjectMember({
        project_id: projectId,
        freelancer_id: formData.freelancer_id,
        role: formData.role,
        agreed_fee: formData.agreed_fee ? parseFloat(formData.agreed_fee) : undefined,
        notes: formData.notes || undefined,
      })

      setFormData({
        freelancer_id: '',
        role: '',
        agreed_fee: '',
        notes: '',
      })

      router.refresh()
      onClose()
    } catch (error) {
      alert('Erro ao adicionar membro')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Membro à Equipe">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Buscar Freelancer */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Freelancer *
          </label>

          {!formData.freelancer_id ? (
            <>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="Buscar freelancer..."
                />
              </div>

              {/* Search Results */}
              {searchTerm && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-black/40">
                  {filteredFreelancers.length > 0 ? (
                    filteredFreelancers.map((freelancer) => (
                      <button
                        key={freelancer.id}
                        type="button"
                        onClick={() => handleFreelancerSelect(freelancer.id)}
                        className="flex w-full items-center gap-3 border-b border-white/5 p-3 text-left transition-all hover:bg-white/5 last:border-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                          {freelancer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{freelancer.name}</p>
                          <p className="text-xs text-zinc-500">
                            {freelancer.email || freelancer.phone || 'Sem contato'}
                          </p>
                          {freelancer.skills && (
                            <p className="text-xs text-zinc-600">{freelancer.skills}</p>
                          )}
                        </div>
                        {freelancer.daily_rate && (
                          <p className="text-sm text-zinc-400">
                            R$ {freelancer.daily_rate.toFixed(2)}/dia
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-zinc-500">
                      Nenhum freelancer encontrado
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!searchTerm && (
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/5 p-8 text-center">
                  <User className="mb-3 h-12 w-12 text-zinc-600" />
                  <p className="text-sm text-zinc-400">
                    Digite para buscar um freelancer
                  </p>
                </div>
              )}
            </>
          ) : (
            // Selected Freelancer
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                  {selectedFreelancer?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{selectedFreelancer?.name}</p>
                  <p className="text-xs text-zinc-500">
                    {selectedFreelancer?.email || 'Sem email'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, freelancer_id: '' })}
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Alterar
              </button>
            </div>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Função no Projeto *
          </label>
          <input
            type="text"
            required
            list="role-suggestions"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Ex: Diretor, Câmera, Editor..."
          />
          <datalist id="role-suggestions">
            {FREELANCER_ROLES.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>
        </div>

        {/* Agreed Fee */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Cachê Combinado (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.agreed_fee}
            onChange={(e) => setFormData({ ...formData, agreed_fee: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder={
              selectedFreelancer?.daily_rate
                ? `Sugestão: ${selectedFreelancer.daily_rate.toFixed(2)}`
                : '2500.00'
            }
          />
          {selectedFreelancer?.daily_rate && (
            <p className="mt-1 text-xs text-zinc-500">
              Diária padrão: R$ {selectedFreelancer.daily_rate.toFixed(2)}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Informações adicionais sobre esta contratação..."
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
            disabled={isLoading || !formData.freelancer_id || !formData.role}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {isLoading ? 'Adicionando...' : 'Adicionar à Equipe'}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
