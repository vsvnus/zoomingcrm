'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createFreelancer, updateFreelancer, type CreateFreelancerData } from '@/actions/freelancers'

import { FREELANCER_ROLES, FREELANCER_SPECIALTIES } from '@/constants/freelancers'

interface AddFreelancerDialogProps {
  onSuccess?: (freelancer: any) => void
  freelancer?: any
  trigger?: React.ReactNode
}

export function AddFreelancerDialog({ onSuccess, freelancer, trigger }: AddFreelancerDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  const [formData, setFormData] = useState<CreateFreelancerData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    specialty: [],
    portfolio: '',
    notes: '',
    status: 'AVAILABLE',
  })

  useEffect(() => {
    if (freelancer && open) {
      setFormData({
        name: freelancer.name || '',
        email: freelancer.email || '',
        phone: freelancer.phone || '',
        role: freelancer.role || '',
        specialty: freelancer.specialty || [],
        portfolio: freelancer.portfolio || '',
        notes: freelancer.notes || '',
        status: freelancer.status || 'AVAILABLE',
      })
      setSelectedSpecialties(freelancer.specialty || [])
    } else if (!freelancer && open) {
      // Reset logic for new freelancer
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        specialty: [],
        portfolio: '',
        notes: '',
        status: 'AVAILABLE',
      })
      setSelectedSpecialties([])
    }
  }, [freelancer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result

      if (freelancer) {
        result = await updateFreelancer(freelancer.id, {
          ...formData,
          specialty: selectedSpecialties,
        })
      } else {
        result = await createFreelancer({
          ...formData,
          specialty: selectedSpecialties,
        })
      }

      setOpen(false)
      // Reset form
      if (!freelancer) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: '',
          specialty: [],
          portfolio: '',
          notes: '',
          status: 'AVAILABLE',
        })
        setSelectedSpecialties([])
      }

      // Atualizar UI imediatamente via callback (optimistic update)
      if (onSuccess && result) {
        onSuccess(result)
      }

      router.refresh()
    } catch (error) {
      console.error('Error saving freelancer:', error)
      alert('Erro ao salvar freelancer. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    )
  }

  const isEditing = !!freelancer

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
            <Plus className="h-4 w-4" />
            Novo Freelancer
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[rgb(var(--border))] bg-card sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">
            {isEditing ? 'Editar Freelancer' : 'Adicionar Freelancer'}
          </DialogTitle>
          <DialogDescription className="text-text-tertiary">
            {isEditing ? 'Atualize as informações do freelancer' : 'Preencha as informações do novo freelancer'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-text-secondary">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="Nome completo"
            />
          </div>

          {/* Email e Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text-secondary">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-text-secondary">
                Telefone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-text-secondary">
              Função Principal *
            </label>
            <select
              id="role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-text-primary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              <option value="" className="bg-card">
                Selecione uma função
              </option>
              {FREELANCER_ROLES.map((role) => (
                <option key={role} value={role} className="bg-card">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Especialidades</label>
            <div className="flex flex-wrap gap-2">
              {FREELANCER_SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedSpecialties.includes(specialty)
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-[rgb(var(--border))] bg-secondary text-text-tertiary hover:bg-bg-hover'
                    }`}
                >
                  {specialty}
                  {selectedSpecialties.includes(specialty) && (
                    <X className="ml-1 inline h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="space-y-2">
            <label htmlFor="portfolio" className="text-sm font-medium text-text-secondary">
              Portfólio (URL)
            </label>
            <input
              id="portfolio"
              type="url"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="https://portfolio.com"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-text-secondary">
              Observações
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="Notas adicionais sobre o freelancer..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 py-3 text-sm font-medium text-text-primary transition-all hover:bg-bg-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Salvar' : isEditing ? 'Atualizar Freelancer' : 'Criar Freelancer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
