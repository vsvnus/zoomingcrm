'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { addProjectItem, updateProjectItem } from '@/actions/projects'

import { useRouter } from 'next/navigation'

interface ManageProjectItemModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    item?: {
        id: string
        description: string
        quantity: number
        unit_price: number
        due_date?: string | null
    } | null
}

export function ManageProjectItemModal({
    isOpen,
    onClose,
    projectId,
    item,
}: ManageProjectItemModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        description: '',
        quantity: 1,
        unit_price: 0,
        due_date: '',
    })

    // Carregar dados se for edição
    useEffect(() => {
        if (isOpen) {
            if (item) {
                setFormData({
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
                })
            } else {
                setFormData({
                    description: '',
                    quantity: 1,
                    unit_price: 0,
                    due_date: '',
                })
            }
        }
    }, [isOpen, item])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (item) {
                // Atualizar
                await updateProjectItem(item.id, projectId, {
                    description: formData.description,
                    quantity: Number(formData.quantity),
                    unit_price: Number(formData.unit_price),
                    due_date: formData.due_date || null,
                })
                // toast.success('Item atualizado com sucesso')
            } else {
                // Adicionar
                await addProjectItem(projectId, {
                    description: formData.description,
                    quantity: Number(formData.quantity),
                    unit_price: Number(formData.unit_price),
                    due_date: formData.due_date || null,
                })
                // toast.success('Item adicionado com sucesso')
            }

            router.refresh()
            onClose()
        } catch (error) {
            console.error(error)
            alert('Erro ao salvar item')
        } finally {
            setIsLoading(false)
        }
    }

    const isEditing = !!item

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Item do Escopo' : 'Adicionar Item ao Escopo'}
        >
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
                        placeholder="Ex: Vídeo Institucional 30s"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Quantidade */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Quantidade *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                        />
                    </div>

                    {/* Valor Unitário */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Valor Unitário (R$) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.unit_price}
                            onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                        />
                    </div>
                </div>

                {/* Prazo */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Prazo de Entrega (Opcional)
                    </label>
                    <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                </div>

                {/* Total Preview */}
                <div className="rounded-lg bg-white/5 p-4 text-right">
                    <p className="text-sm text-zinc-400">Total Estimado</p>
                    <p className="text-xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        }).format(formData.quantity * formData.unit_price)}
                    </p>
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
                        {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Item' : 'Adicionar Item'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
