'use client'

import { useState, useEffect } from 'react'
import { Plus, X, DollarSign, Calendar, Percent, FileText, Video, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProposalItem, ProposalOptional, PaymentScheduleItem } from '@/types/proposal'

interface ProposalBuilderProps {
  clientId?: string
  onSave: (proposal: any) => Promise<void>
  onCancel: () => void
}

export function ProposalBuilder({ clientId, onSave, onCancel }: ProposalBuilderProps) {
  const [currentTab, setCurrentTab] = useState<'items' | 'schedule' | 'optionals'>('items')
  const [isLoading, setIsLoading] = useState(false)

  // Dados principais
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [discount, setDiscount] = useState(0)
  const [validUntil, setValidUntil] = useState('')

  // Itens da proposta
  const [items, setItems] = useState<ProposalItem[]>([])
  const [showItemForm, setShowItemForm] = useState(false)
  const [newItem, setNewItem] = useState<ProposalItem>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    order: 1,
    date: null, // SPRINT 2: Data opcional do item
  })

  // Cronograma de pagamento
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>([])
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [newPayment, setNewPayment] = useState<PaymentScheduleItem>({
    description: '',
    dueDate: '',
    amount: 0,
    percentage: 0,
    order: 1,
  })

  // Opcionais
  const [optionals, setOptionals] = useState<ProposalOptional[]>([])
  const [showOptionalForm, setShowOptionalForm] = useState(false)
  const [newOptional, setNewOptional] = useState<ProposalOptional>({
    title: '',
    description: '',
    price: 0,
  })

  // Cálculos automáticos
  const baseValue = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (baseValue * discount) / 100
  const totalValue = baseValue - discountAmount

  // Atualizar total do item ao mudar quantidade ou preço unitário
  useEffect(() => {
    setNewItem((prev) => ({
      ...prev,
      total: prev.quantity * prev.unitPrice,
    }))
  }, [newItem.quantity, newItem.unitPrice])

  // Atualizar amount do pagamento baseado na porcentagem
  useEffect(() => {
    if (newPayment.percentage && totalValue > 0) {
      setNewPayment((prev) => ({
        ...prev,
        amount: (totalValue * (prev.percentage || 0)) / 100,
      }))
    }
  }, [newPayment.percentage, totalValue])

  const addItem = () => {
    if (newItem.description && newItem.unitPrice > 0) {
      setItems([...items, { ...newItem, order: items.length + 1 }])
      setNewItem({ description: '', quantity: 1, unitPrice: 0, total: 0, order: 1, date: null })
      setShowItemForm(false)
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addPayment = () => {
    if (newPayment.description && newPayment.dueDate && newPayment.amount > 0) {
      setPaymentSchedule([...paymentSchedule, { ...newPayment, order: paymentSchedule.length + 1 }])
      setNewPayment({ description: '', dueDate: '', amount: 0, percentage: 0, order: 1 })
      setShowPaymentForm(false)
    }
  }

  const removePayment = (index: number) => {
    setPaymentSchedule(paymentSchedule.filter((_, i) => i !== index))
  }

  const addOptional = () => {
    if (newOptional.title && newOptional.price > 0) {
      setOptionals([...optionals, { ...newOptional }])
      setNewOptional({ title: '', description: '', price: 0 })
      setShowOptionalForm(false)
    }
  }

  const removeOptional = (index: number) => {
    setOptionals(optionals.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title || items.length === 0) {
      alert('Preencha o título e adicione pelo menos um item')
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        title,
        description,
        clientId,
        baseValue,
        discount,
        totalValue,
        validUntil,
        items,
        paymentSchedule,
        optionals,
      })
    } catch (error) {
      alert('Erro ao salvar proposta')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'items', label: 'Itens', icon: Package },
    { id: 'schedule', label: 'Pagamento', icon: Calendar },
    { id: 'optionals', label: 'Opcionais', icon: FileText },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Construtor de Orçamento</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Monte sua proposta adicionando itens, cronograma e opcionais
        </p>
      </div>

      {/* Informações Básicas */}
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Título da Proposta *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vídeo Institucional - Empresa XYZ"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Válido Até
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Descreva brevemente o projeto..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'items' && items.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400">
                  {items.length}
                </span>
              )}
              {tab.id === 'schedule' && paymentSchedule.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
                  {paymentSchedule.length}
                </span>
              )}
              {tab.id === 'optionals' && optionals.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-400">
                  {optionals.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Itens Tab */}
        {currentTab === 'items' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Itens da Proposta</h3>
              <Button
                onClick={() => setShowItemForm(!showItemForm)}
                className="h-9 gap-2 rounded-lg bg-blue-600 px-4 text-sm hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            <AnimatePresence>
              {showItemForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden rounded-lg border border-blue-500/20 bg-blue-500/5 p-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Descrição *
                    </label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Ex: Filmagem e edição de vídeo institucional"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Valor Unit. (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newItem.unitPrice}
                        onChange={(e) =>
                          setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Total (R$)
                      </label>
                      <input
                        type="number"
                        value={newItem.total.toFixed(2)}
                        disabled
                        className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-zinc-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        Data
                      </label>
                      <input
                        type="date"
                        value={newItem.date ? String(newItem.date).split('T')[0] : ''}
                        onChange={(e) =>
                          setNewItem({ ...newItem, date: e.target.value || null })
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={addItem}
                      disabled={!newItem.description || newItem.unitPrice <= 0}
                      className="flex-1 h-9 rounded-lg bg-blue-600 text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Adicionar
                    </Button>
                    <Button
                      onClick={() => setShowItemForm(false)}
                      className="h-9 rounded-lg bg-white/5 px-4 text-sm hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.description}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-zinc-400">
                        <span>
                          {item.quantity}x R$ {item.unitPrice.toFixed(2)} = R${' '}
                          {item.total.toFixed(2)}
                        </span>
                        {item.date && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="ml-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-3 text-sm text-zinc-500">
                    Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cronograma de Pagamento Tab */}
        {currentTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Cronograma de Recebimento</h3>
              <Button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="h-9 gap-2 rounded-lg bg-green-600 px-4 text-sm hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Adicionar Parcela
              </Button>
            </div>

            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
              <p className="text-xs text-yellow-300">
                💡 <strong>Valor Total:</strong> R$ {totalValue.toFixed(2)} - Use porcentagens
                para facilitar (ex: 50% entrada, 25% em 30 dias, 25% em 60 dias)
              </p>
            </div>

            <AnimatePresence>
              {showPaymentForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden rounded-lg border border-green-500/20 bg-green-500/5 p-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Descrição *
                    </label>
                    <input
                      type="text"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                      placeholder="Ex: Entrada (50%), 30 dias (25%), 60 dias (25%)"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Data Prevista *
                      </label>
                      <input
                        type="date"
                        value={newPayment.dueDate as string}
                        onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Porcentagem (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={newPayment.percentage}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            percentage: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPayment.amount}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={addPayment}
                      disabled={!newPayment.description || !newPayment.dueDate || newPayment.amount <= 0}
                      className="flex-1 h-9 rounded-lg bg-green-600 text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Adicionar
                    </Button>
                    <Button
                      onClick={() => setShowPaymentForm(false)}
                      className="h-9 rounded-lg bg-white/5 px-4 text-sm hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {paymentSchedule.length > 0 ? (
                paymentSchedule.map((payment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{payment.description}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(payment.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          R$ {payment.amount.toFixed(2)}
                        </span>
                        {payment.percentage && payment.percentage > 0 && (
                          <span className="flex items-center gap-1">
                            <Percent className="h-3.5 w-3.5" />
                            {payment.percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removePayment(index)}
                      className="ml-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-3 text-sm text-zinc-500">
                    Nenhuma parcela configurada. Clique em "Adicionar Parcela" para criar o
                    cronograma.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Opcionais Tab */}
        {currentTab === 'optionals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Serviços Opcionais</h3>
              <Button
                onClick={() => setShowOptionalForm(!showOptionalForm)}
                className="h-9 gap-2 rounded-lg bg-purple-600 px-4 text-sm hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Adicionar Opcional
              </Button>
            </div>

            <AnimatePresence>
              {showOptionalForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden rounded-lg border border-purple-500/20 bg-purple-500/5 p-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={newOptional.title}
                      onChange={(e) => setNewOptional({ ...newOptional, title: e.target.value })}
                      placeholder="Ex: Filmagem com Drone"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Descrição
                    </label>
                    <textarea
                      value={newOptional.description}
                      onChange={(e) =>
                        setNewOptional({ ...newOptional, description: e.target.value })
                      }
                      rows={2}
                      placeholder="Detalhes do serviço opcional..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Preço (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newOptional.price}
                      onChange={(e) =>
                        setNewOptional({ ...newOptional, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={addOptional}
                      disabled={!newOptional.title || newOptional.price <= 0}
                      className="flex-1 h-9 rounded-lg bg-purple-600 text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      Adicionar
                    </Button>
                    <Button
                      onClick={() => setShowOptionalForm(false)}
                      className="h-9 rounded-lg bg-white/5 px-4 text-sm hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {optionals.length > 0 ? (
                optionals.map((optional, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{optional.title}</p>
                      {optional.description && (
                        <p className="mt-1 text-sm text-zinc-400">{optional.description}</p>
                      )}
                      <p className="mt-2 text-sm font-medium text-green-400">
                        + R$ {optional.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeOptional(index)}
                      className="ml-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-3 text-sm text-zinc-500">
                    Nenhum opcional adicionado. Opcionais permitem que o cliente escolha serviços
                    extras.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Resumo Financeiro</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-zinc-300">
            <span>Valor Base:</span>
            <span className="font-mono">R$ {baseValue.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Desconto ({discount}%):</span>
            <span className="font-mono text-red-400">- R$ {discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-zinc-400" />
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
            />
            <span className="text-xs text-zinc-500">Ajuste o desconto (%)</span>
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between text-xl font-bold text-white">
              <span>Valor Total:</span>
              <span className="font-mono text-green-400">R$ {totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          className="flex-1 h-12 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || !title || items.length === 0}
          className="flex-1 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Proposta'}
        </Button>
      </div>
    </div>
  )
}
