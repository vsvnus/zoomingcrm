'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Calculator,
  Package,
  UserCircle,
  Truck,
  TrendingUp,
  Plus,
  Trash2,
  ChevronDown,
  Utensils,
  Fuel,
  MoreHorizontal,
  DollarSign,
  Percent,
  FileText,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────────────────────

interface EquipmentRow {
  id: string
  equipmentId: string
  equipmentName: string
  category: string
  dailyRate: number
  days: number
}

interface FreelancerRow {
  id: string
  freelancerId: string
  freelancerName: string
  role: string
  dailyRate: number
  customRate: number
  days: number
}

interface LogisticsRow {
  id: string
  type: 'FOOD' | 'FUEL' | 'OTHER'
  description: string
  quantity: number
  unitValue: number
}

type ProfitMode = 'percentage' | 'fixed'

interface Props {
  equipments: any[]
  freelancers: any[]
}

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const uid = () => Math.random().toString(36).slice(2)

const CATEGORY_LABELS: Record<string, string> = {
  CAMERA: 'Câmera',
  LENS: 'Lente',
  AUDIO: 'Áudio',
  LIGHTING: 'Iluminação',
  GRIP: 'Grip',
  DRONE: 'Drone',
  ACCESSORY: 'Acessório',
  OTHER: 'Outro',
}

const LOGISTICS_TYPE_LABELS = {
  FOOD: { label: 'Alimentação', Icon: Utensils, color: 'text-red-500' },
  FUEL: { label: 'Combustível', Icon: Fuel, color: 'text-orange-500' },
  OTHER: { label: 'Outros', Icon: MoreHorizontal, color: 'text-zinc-400' },
}

// ──────────────────────────────────────────────────────────────
// SUBCOMPONENTES
// ──────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  total,
  onAdd,
  addLabel,
}: {
  icon: any
  title: string
  subtitle: string
  total: number
  onAdd: () => void
  addLabel: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-border p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-tertiary">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-text-tertiary">Subtotal</p>
          <p className="text-base font-bold text-text-primary">{formatCurrency(total)}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
    </div>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <AlertCircle className="h-8 w-8 text-text-tertiary opacity-40" />
      <p className="text-sm text-text-tertiary">{message}</p>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────

export function BudgetCalculatorClient({ equipments, freelancers }: Props) {
  const [projectName, setProjectName] = useState('')

  // Equipamentos
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([])

  // Equipe
  const [freelancerRows, setFreelancerRows] = useState<FreelancerRow[]>([])

  // Logística
  const [logisticsRows, setLogisticsRows] = useState<LogisticsRow[]>([])

  // Lucro
  const [profitMode, setProfitMode] = useState<ProfitMode>('percentage')
  const [profitValue, setProfitValue] = useState<number>(20)

  // ── Equipamentos handlers ──

  const addEquipmentRow = useCallback(() => {
    setEquipmentRows((prev) => [
      ...prev,
      {
        id: uid(),
        equipmentId: '',
        equipmentName: '',
        category: '',
        dailyRate: 0,
        days: 1,
      },
    ])
  }, [])

  const updateEquipmentRow = useCallback(
    (id: string, field: keyof EquipmentRow, value: any) => {
      setEquipmentRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row
          if (field === 'equipmentId' && value) {
            const eq = equipments.find((e) => e.id === value)
            if (eq) {
              return {
                ...row,
                equipmentId: eq.id,
                equipmentName: eq.name,
                category: eq.category,
                dailyRate: Number(eq.daily_rate) || 0,
              }
            }
          }
          return { ...row, [field]: value }
        })
      )
    },
    [equipments]
  )

  const removeEquipmentRow = useCallback((id: string) => {
    setEquipmentRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // ── Freelancers handlers ──

  const addFreelancerRow = useCallback(() => {
    setFreelancerRows((prev) => [
      ...prev,
      {
        id: uid(),
        freelancerId: '',
        freelancerName: '',
        role: '',
        dailyRate: 0,
        customRate: 0,
        days: 1,
      },
    ])
  }, [])

  const updateFreelancerRow = useCallback(
    (id: string, field: keyof FreelancerRow, value: any) => {
      setFreelancerRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row
          if (field === 'freelancerId' && value) {
            const fl = freelancers.find((f) => f.id === value)
            if (fl) {
              return {
                ...row,
                freelancerId: fl.id,
                freelancerName: fl.name,
                dailyRate: Number(fl.daily_rate) || 0,
                customRate: Number(fl.daily_rate) || 0,
              }
            }
          }
          return { ...row, [field]: value }
        })
      )
    },
    [freelancers]
  )

  const removeFreelancerRow = useCallback((id: string) => {
    setFreelancerRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // ── Logística handlers ──

  const addLogisticsRow = useCallback((type: LogisticsRow['type'] = 'OTHER') => {
    setLogisticsRows((prev) => [
      ...prev,
      { id: uid(), type, description: '', quantity: 1, unitValue: 0 },
    ])
  }, [])

  const updateLogisticsRow = useCallback(
    (id: string, field: keyof LogisticsRow, value: any) => {
      setLogisticsRows((prev) =>
        prev.map((row) => (row.id !== id ? row : { ...row, [field]: value }))
      )
    },
    []
  )

  const removeLogisticsRow = useCallback((id: string) => {
    setLogisticsRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // ── Cálculos ──

  const equipmentTotal = useMemo(
    () => equipmentRows.reduce((acc, r) => acc + r.dailyRate * Math.max(r.days, 0), 0),
    [equipmentRows]
  )

  const freelancerTotal = useMemo(
    () => freelancerRows.reduce((acc, r) => acc + r.customRate * Math.max(r.days, 0), 0),
    [freelancerRows]
  )

  const logisticsTotal = useMemo(
    () => logisticsRows.reduce((acc, r) => acc + r.unitValue * Math.max(r.quantity, 0), 0),
    [logisticsRows]
  )

  const baseCost = equipmentTotal + freelancerTotal + logisticsTotal

  const profitAmount = useMemo(() => {
    if (profitMode === 'percentage') return baseCost * (profitValue / 100)
    return profitValue
  }, [profitMode, profitValue, baseCost])

  const totalProjectValue = baseCost + profitAmount
  const profitMargin = totalProjectValue > 0 ? (profitAmount / totalProjectValue) * 100 : 0

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Calculadora de Orçamento</h1>
              <p className="text-sm text-text-tertiary">
                Calcule custos detalhados de equipamentos, equipe e logística
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-accent-500/30 bg-accent-500/10 px-3 py-1.5">
          <Lock className="h-3.5 w-3.5 text-accent-500" />
          <span className="text-xs font-semibold text-accent-500">Assinatura Pro</span>
        </div>
      </div>

      {/* Nome do Projeto */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Nome do orçamento (opcional)..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="flex-1 bg-transparent text-lg font-medium text-text-primary placeholder-text-tertiary outline-none"
          />
        </div>
      </div>

      {/* ── EQUIPAMENTOS ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <SectionHeader
          icon={Package}
          title="Equipamentos"
          subtitle="Selecione os equipamentos e defina a quantidade de diárias"
          total={equipmentTotal}
          onAdd={addEquipmentRow}
          addLabel="Adicionar"
        />

        <div className="p-5 space-y-3">
          {equipmentRows.length === 0 ? (
            <EmptyRow message="Nenhum equipamento adicionado" />
          ) : (
            equipmentRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_150px_100px_120px_40px] items-center gap-3 rounded-lg border border-border bg-bg-secondary p-3"
              >
                {/* Select equipamento */}
                <div className="relative">
                  <select
                    value={row.equipmentId}
                    onChange={(e) => updateEquipmentRow(row.id, 'equipmentId', e.target.value)}
                    className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-sm text-text-primary outline-none focus:border-primary"
                  >
                    <option value="">Selecionar equipamento...</option>
                    {equipments
                      .filter((eq) => eq.status !== 'RETIRED' && eq.status !== 'LOST')
                      .map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                          {eq.brand ? ` (${eq.brand})` : ''}
                          {' — '}
                          {CATEGORY_LABELS[eq.category] || eq.category}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-text-tertiary" />
                </div>

                {/* Diária */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-text-tertiary">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.dailyRate || ''}
                    onChange={(e) =>
                      updateEquipmentRow(row.id, 'dailyRate', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Diária"
                    className="w-full rounded-md border border-border bg-card py-2 pl-8 pr-3 text-sm text-text-primary outline-none focus:border-primary"
                  />
                </div>

                {/* Dias */}
                <input
                  type="number"
                  min="1"
                  value={row.days}
                  onChange={(e) =>
                    updateEquipmentRow(row.id, 'days', parseInt(e.target.value) || 1)
                  }
                  placeholder="Dias"
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                />

                {/* Total */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">
                    {formatCurrency(row.dailyRate * row.days)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {row.days} {row.days === 1 ? 'dia' : 'dias'}
                  </p>
                </div>

                {/* Remover */}
                <button
                  onClick={() => removeEquipmentRow(row.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── EQUIPE / FREELANCERS ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <SectionHeader
          icon={UserCircle}
          title="Equipe & Freelancers"
          subtitle="Selecione os profissionais e defina cachê e quantidade de dias"
          total={freelancerTotal}
          onAdd={addFreelancerRow}
          addLabel="Adicionar"
        />

        <div className="p-5 space-y-3">
          {freelancerRows.length === 0 ? (
            <EmptyRow message="Nenhum profissional adicionado" />
          ) : (
            freelancerRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_140px_140px_100px_120px_40px] items-center gap-3 rounded-lg border border-border bg-bg-secondary p-3"
              >
                {/* Select freelancer */}
                <div className="relative">
                  <select
                    value={row.freelancerId}
                    onChange={(e) => updateFreelancerRow(row.id, 'freelancerId', e.target.value)}
                    className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-sm text-text-primary outline-none focus:border-primary"
                  >
                    <option value="">Selecionar profissional...</option>
                    {freelancers
                      .filter((fl) => fl.status !== 'BLACKLISTED')
                      .map((fl) => (
                        <option key={fl.id} value={fl.id}>
                          {fl.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-text-tertiary" />
                </div>

                {/* Função */}
                <input
                  type="text"
                  value={row.role}
                  onChange={(e) => updateFreelancerRow(row.id, 'role', e.target.value)}
                  placeholder="Função..."
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                />

                {/* Cachê (customizável) */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-text-tertiary">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.customRate || ''}
                    onChange={(e) =>
                      updateFreelancerRow(row.id, 'customRate', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Cachê/dia"
                    className="w-full rounded-md border border-border bg-card py-2 pl-8 pr-3 text-sm text-text-primary outline-none focus:border-primary"
                  />
                </div>

                {/* Dias */}
                <input
                  type="number"
                  min="1"
                  value={row.days}
                  onChange={(e) =>
                    updateFreelancerRow(row.id, 'days', parseInt(e.target.value) || 1)
                  }
                  placeholder="Dias"
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                />

                {/* Total */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">
                    {formatCurrency(row.customRate * row.days)}
                  </p>
                  {row.dailyRate > 0 && row.customRate !== row.dailyRate && (
                    <p className="text-xs text-text-tertiary line-through">
                      {formatCurrency(row.dailyRate)}/dia padrão
                    </p>
                  )}
                </div>

                {/* Remover */}
                <button
                  onClick={() => removeFreelancerRow(row.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── LOGÍSTICA ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Logística</h3>
              <p className="text-xs text-text-tertiary">
                Alimentação, combustível e outros custos operacionais
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-text-tertiary">Subtotal</p>
              <p className="text-base font-bold text-text-primary">
                {formatCurrency(logisticsTotal)}
              </p>
            </div>
            <div className="flex gap-1.5">
              {(['FOOD', 'FUEL', 'OTHER'] as const).map((type) => {
                const { label, Icon } = LOGISTICS_TYPE_LABELS[type]
                return (
                  <button
                    key={type}
                    onClick={() => addLogisticsRow(type)}
                    className="flex items-center gap-1 rounded-lg border border-border bg-bg-secondary px-2.5 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {logisticsRows.length === 0 ? (
            <EmptyRow message="Nenhum item de logística adicionado" />
          ) : (
            logisticsRows.map((row) => {
              const { Icon, color } = LOGISTICS_TYPE_LABELS[row.type]
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[36px_1fr_130px_110px_110px_120px_40px] items-center gap-3 rounded-lg border border-border bg-bg-secondary p-3"
                >
                  {/* Ícone tipo */}
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-md bg-bg-tertiary', color)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Descrição */}
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => updateLogisticsRow(row.id, 'description', e.target.value)}
                    placeholder={`${LOGISTICS_TYPE_LABELS[row.type].label}...`}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                  />

                  {/* Tipo */}
                  <div className="relative">
                    <select
                      value={row.type}
                      onChange={(e) =>
                        updateLogisticsRow(row.id, 'type', e.target.value as LogisticsRow['type'])
                      }
                      className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-7 text-sm text-text-primary outline-none focus:border-primary"
                    >
                      <option value="FOOD">Alimentação</option>
                      <option value="FUEL">Combustível</option>
                      <option value="OTHER">Outros</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-text-tertiary" />
                  </div>

                  {/* Quantidade */}
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) =>
                      updateLogisticsRow(row.id, 'quantity', parseInt(e.target.value) || 1)
                    }
                    placeholder="Qtd"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                  />

                  {/* Valor unitário */}
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-text-tertiary">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unitValue || ''}
                      onChange={(e) =>
                        updateLogisticsRow(row.id, 'unitValue', parseFloat(e.target.value) || 0)
                      }
                      placeholder="Valor unit."
                      className="w-full rounded-md border border-border bg-card py-2 pl-8 pr-3 text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatCurrency(row.unitValue * row.quantity)}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {row.quantity}x {formatCurrency(row.unitValue)}
                    </p>
                  </div>

                  {/* Remover */}
                  <button
                    onClick={() => removeLogisticsRow(row.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── LUCRO ESTIMADO ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Lucro Estimado</h3>
            <p className="text-xs text-text-tertiary">
              Defina sua margem de lucro em porcentagem ou valor fixo
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            {/* Toggle modo */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setProfitMode('percentage')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors',
                  profitMode === 'percentage'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-text-secondary hover:bg-bg-hover'
                )}
              >
                <Percent className="h-4 w-4" />
                Porcentagem
              </button>
              <button
                onClick={() => setProfitMode('fixed')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors',
                  profitMode === 'fixed'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-text-secondary hover:bg-bg-hover'
                )}
              >
                <DollarSign className="h-4 w-4" />
                Valor Fixo
              </button>
            </div>

            {/* Input do valor */}
            <div className="relative flex-1 max-w-[220px]">
              <span className="absolute left-3 top-2.5 text-sm text-text-tertiary">
                {profitMode === 'percentage' ? '%' : 'R$'}
              </span>
              <input
                type="number"
                min="0"
                step={profitMode === 'percentage' ? '1' : '0.01'}
                value={profitValue || ''}
                onChange={(e) => setProfitValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            {/* Preview do lucro */}
            {baseCost > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2.5">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-text-tertiary">Lucro calculado</p>
                  <p className="text-sm font-bold text-green-500">{formatCurrency(profitAmount)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RESUMO FINAL ── */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card to-bg-secondary p-6">
        <h3 className="mb-5 text-lg font-bold text-text-primary">
          Resumo do Orçamento
          {projectName && (
            <span className="ml-2 text-base font-normal text-text-tertiary">
              — {projectName}
            </span>
          )}
        </h3>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-text-tertiary mb-1">
              <Package className="h-4 w-4" />
              <span className="text-xs">Equipamentos</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{formatCurrency(equipmentTotal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-text-tertiary mb-1">
              <UserCircle className="h-4 w-4" />
              <span className="text-xs">Equipe</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{formatCurrency(freelancerTotal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-text-tertiary mb-1">
              <Truck className="h-4 w-4" />
              <span className="text-xs">Logística</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{formatCurrency(logisticsTotal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-text-tertiary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Lucro Estimado</span>
            </div>
            <p className="text-xl font-bold text-green-500">{formatCurrency(profitAmount)}</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Custo de Equipamentos</span>
            <span className="font-medium text-text-primary">{formatCurrency(equipmentTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Custo de Equipe</span>
            <span className="font-medium text-text-primary">{formatCurrency(freelancerTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Custo de Logística</span>
            <span className="font-medium text-text-primary">{formatCurrency(logisticsTotal)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
            <span className="text-text-primary">Custo Total</span>
            <span className="text-red-400">{formatCurrency(baseCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              (+) Lucro {profitMode === 'percentage' ? `(${profitValue}%)` : 'Fixo'}
            </span>
            <span className="font-medium text-green-500">{formatCurrency(profitAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 mt-2">
            <span className="text-lg font-bold text-text-primary">Valor Total do Projeto</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(totalProjectValue)}</span>
          </div>
          {totalProjectValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Margem de Lucro</span>
              <span className={cn('font-medium', profitMargin >= 20 ? 'text-green-500' : profitMargin >= 10 ? 'text-yellow-500' : 'text-red-400')}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
