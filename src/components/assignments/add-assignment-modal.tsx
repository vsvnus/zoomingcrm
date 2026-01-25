'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { motion } from 'framer-motion'
import { Plus, User, DollarSign, Clock, Calendar } from 'lucide-react'
import { addItemAssignment } from '@/actions/assignments'
import { getFreelancers } from '@/actions/freelancers'
import { COMMON_ROLES } from '@/types/assignments'

interface AddAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    itemId: string
    itemType: 'proposal' | 'project'
    itemDescription?: string
    onSuccess?: () => void
}

type Freelancer = {
    id: string
    name: string
    email?: string
    daily_rate?: number
}

export function AddAssignmentModal({
    isOpen,
    onClose,
    itemId,
    itemType,
    itemDescription,
    onSuccess,
}: AddAssignmentModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [freelancers, setFreelancers] = useState<Freelancer[]>([])
    const [formData, setFormData] = useState({
        freelancer_id: '',
        role: '',
        agreed_fee: '',
        estimated_hours: '',
        scheduled_date: '',
        notes: '',
    })

    useEffect(() => {
        if (isOpen) {
            getFreelancers().then(setFreelancers)
        }
    }, [isOpen])

    // Auto-preencher cachê com diária do freelancer selecionado
    useEffect(() => {
        if (formData.freelancer_id) {
            const freelancer = freelancers.find(f => f.id === formData.freelancer_id)
            if (freelancer?.daily_rate && !formData.agreed_fee) {
                setFormData(prev => ({
                    ...prev,
                    agreed_fee: String(freelancer.daily_rate),
                }))
            }
        }
    }, [formData.freelancer_id, freelancers])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.freelancer_id) {
            alert('Selecione um freelancer')
            return
        }

        setIsLoading(true)

        try {
            await addItemAssignment({
                freelancer_id: formData.freelancer_id,
                proposal_item_id: itemType === 'proposal' ? itemId : undefined,
                project_item_id: itemType === 'project' ? itemId : undefined,
                role: formData.role || undefined,
                agreed_fee: formData.agreed_fee ? parseFloat(formData.agreed_fee) : undefined,
                estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
                scheduled_date: formData.scheduled_date || undefined,
                notes: formData.notes || undefined,
            })

            // Limpar formulário
            setFormData({
                freelancer_id: '',
                role: '',
                agreed_fee: '',
                estimated_hours: '',
                scheduled_date: '',
                notes: '',
            })

            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Erro ao adicionar assignment:', error)
            alert('Erro ao adicionar freelancer ao item')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adicionar Freelancer ao Item"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Item info */}
                {itemDescription && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-zinc-500">Item</p>
                        <p className="text-sm text-white">{itemDescription}</p>
                    </div>
                )}

                {/* Freelancer */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <User className="h-4 w-4" />
                        Freelancer <span className="text-red-400">*</span>
                    </label>
                    <select
                        required
                        value={formData.freelancer_id}
                        onChange={(e) => setFormData({ ...formData, freelancer_id: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                    >
                        <option value="">Selecione um freelancer</option>
                        {freelancers.map((freelancer) => (
                            <option key={freelancer.id} value={freelancer.id} className="bg-zinc-900">
                                {freelancer.name}
                                {freelancer.daily_rate && ` - R$ ${freelancer.daily_rate}/dia`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Função */}
                <div>
                    <label className="mb-2 text-sm font-medium text-zinc-300">
                        Função/Cargo
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            list="roles-list"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                            placeholder="Ex: Câmera, Editor, Roteirista..."
                        />
                        <datalist id="roles-list">
                            {COMMON_ROLES.map((role) => (
                                <option key={role} value={role} />
                            ))}
                        </datalist>
                    </div>
                </div>

                {/* Cachê e Horas - Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Cachê */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                            <DollarSign className="h-4 w-4" />
                            Cachê (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.agreed_fee}
                            onChange={(e) => setFormData({ ...formData, agreed_fee: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                            placeholder="500.00"
                        />
                    </div>

                    {/* Horas estimadas */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                            <Clock className="h-4 w-4" />
                            Horas Estimadas
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            value={formData.estimated_hours}
                            onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                            placeholder="8"
                        />
                    </div>
                </div>

                {/* Data prevista */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <Calendar className="h-4 w-4" />
                        Data Prevista
                    </label>
                    <input
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                    />
                </div>

                {/* Observações */}
                <div>
                    <label className="mb-2 text-sm font-medium text-zinc-300">
                        Observações
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="Notas sobre o trabalho..."
                    />
                </div>

                {/* Buttons */}
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
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-600 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Salvando...
                            </span>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Adicionar
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </Modal>
    )
}
