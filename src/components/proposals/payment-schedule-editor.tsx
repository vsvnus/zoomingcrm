'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, GripVertical, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface PaymentScheduleItem {
    id?: string
    description: string
    due_date: string // YYYY-MM-DD
    amount: number
    percentage: number
    order: number
}

interface PaymentScheduleEditorProps {
    totalValue: number
    installments: number
    initialSchedule: PaymentScheduleItem[]
    onScheduleChange: (schedule: PaymentScheduleItem[]) => void
}

export function PaymentScheduleEditor({
    totalValue,
    installments,
    initialSchedule,
    onScheduleChange,
}: PaymentScheduleEditorProps) {
    const [schedule, setSchedule] = useState<PaymentScheduleItem[]>(initialSchedule)
    const [useCustomMode, setUseCustomMode] = useState(false)

    // Initialize schedule based on installments if empty or meaningful change in installments
    useEffect(() => {
        // Determine if we should be in custom mode
        // If we have items and they don't look like auto-generated ones (simple division)
        if (initialSchedule && initialSchedule.length > 0) {
            // Simple heuristic: if we have schedule items, assume we might be editing them
            setSchedule(initialSchedule.sort((a, b) => a.order - b.order))
            setUseCustomMode(true)
        }
    }, [initialSchedule])

    // React to installments change from parent
    useEffect(() => {
        if (!useCustomMode) {
            generateDefaultSchedule(installments)
        }
    }, [installments, totalValue])

    const generateDefaultSchedule = (count: number) => {
        if (count <= 0) return

        const baseAmount = Math.floor((totalValue / count) * 100) / 100
        const remainder = Math.round((totalValue - baseAmount * count) * 100) / 100

        const newSchedule: PaymentScheduleItem[] = []
        const today = new Date()

        for (let i = 0; i < count; i++) {
            const date = new Date(today)
            date.setMonth(date.getMonth() + i)

            let amount = baseAmount
            if (i === 0) amount += remainder // Add remainder to first installment

            newSchedule.push({
                description: count === 1 ? 'À vista' : `Parcela ${i + 1}/${count}`,
                due_date: date.toISOString().split('T')[0],
                amount: amount,
                percentage: (amount / totalValue) * 100,
                order: i + 1
            })
        }
        setSchedule(newSchedule)
        onScheduleChange(newSchedule)
    }

    const handleUpdateItem = (index: number, field: keyof PaymentScheduleItem, value: any) => {
        const newSchedule = [...schedule]
        newSchedule[index] = { ...newSchedule[index], [field]: value }

        // Recalculate percentage if amount changes
        if (field === 'amount') {
            newSchedule[index].percentage = (Number(value) / totalValue) * 100
        }

        setSchedule(newSchedule)
        onScheduleChange(newSchedule)
        setUseCustomMode(true) // Switch to custom mode on manual edit
    }

    const handleAddInstallment = () => {
        setUseCustomMode(true)
        const nextDate = new Date()
        if (schedule.length > 0) {
            const lastDate = new Date(schedule[schedule.length - 1].due_date)
            nextDate.setTime(lastDate.getTime())
            nextDate.setMonth(nextDate.getMonth() + 1)
        }

        const newItem: PaymentScheduleItem = {
            description: `Parcela ${schedule.length + 1}`,
            due_date: nextDate.toISOString().split('T')[0],
            amount: 0,
            percentage: 0,
            order: schedule.length + 1
        }

        const newSchedule = [...schedule, newItem]
        setSchedule(newSchedule)
        onScheduleChange(newSchedule)
    }

    const handleRemoveInstallment = (index: number) => {
        setUseCustomMode(true)
        const newSchedule = schedule.filter((_, i) => i !== index)
        // Reorder
        newSchedule.forEach((item, i) => {
            item.order = i + 1
        })
        setSchedule(newSchedule)
        onScheduleChange(newSchedule)
    }

    const currentTotal = schedule.reduce((sum, item) => sum + Number(item.amount), 0)
    const difference = totalValue - currentTotal
    const isValid = Math.abs(difference) < 0.05 // Tolerance for float errors

    return (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-primary">Cronograma de Pagamentos</h3>
                <div className="text-xs text-text-secondary">
                    Total Configurado: <span className={isValid ? 'text-green-400' : 'text-red-400 font-bold'}>{formatCurrency(currentTotal)}</span>
                    {!isValid && <span className="ml-2">(Faltam {formatCurrency(difference)})</span>}
                </div>
            </div>

            <div className="space-y-2">
                <AnimatePresence>
                    {schedule.map((item, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            key={index}
                            className="flex gap-2 items-center"
                        >
                            <div className="w-8 flex justify-center text-text-tertiary text-xs">
                                {index + 1}x
                            </div>
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                                className="flex-1 min-w-[120px] rounded border border-border bg-card px-2 py-1 text-sm text-text-primary focus:border-purple-500 focus:outline-none"
                                placeholder="Descrição"
                            />
                            <input
                                type="date"
                                value={item.due_date}
                                onChange={(e) => handleUpdateItem(index, 'due_date', e.target.value)}
                                className="w-32 rounded border border-border bg-card px-2 py-1 text-sm text-text-primary focus:border-purple-500 focus:outline-none"
                            />
                            <div className="relative w-32">
                                <span className="absolute left-2 top-1.5 text-xs text-text-tertiary">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.amount}
                                    onChange={(e) => handleUpdateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                    className="w-full rounded border border-border bg-card pl-6 pr-2 py-1 text-sm text-text-primary focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveInstallment(index)}
                                className="p-1 text-text-tertiary hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="pt-2 flex justify-between">
                <button
                    onClick={handleAddInstallment}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                    <Plus className="h-3 w-3" />
                    Adicionar Parcela
                </button>

                {useCustomMode && (
                    <button
                        onClick={() => {
                            setUseCustomMode(false)
                            generateDefaultSchedule(installments)
                        }}
                        className="text-xs text-text-tertiary hover:text-text-secondary underline"
                    >
                        Resetar para Padrão
                    </button>
                )}
            </div>
        </div>
    )
}
