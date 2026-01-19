'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addEquipment, updateEquipment } from '@/actions/equipments'
import { Loader2 } from 'lucide-react'

interface Equipment {
  id?: string
  name: string
  brand?: string
  model?: string
  category: string
  status?: string
  serial_number?: string
  purchase_date?: string
  purchase_price?: number
  daily_rate?: number
  photo_url?: string
  notes?: string
}

interface EquipmentFormModalProps {
  equipment: Equipment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (equipment: any) => void
}

const categoryOptions = [
  { value: 'CAMERA', label: 'Câmera' },
  { value: 'LENS', label: 'Lente' },
  { value: 'AUDIO', label: 'Áudio' },
  { value: 'LIGHTING', label: 'Iluminação' },
  { value: 'GRIP', label: 'Grip' },
  { value: 'DRONE', label: 'Drone' },
  { value: 'ACCESSORY', label: 'Acessório' },
  { value: 'OTHER', label: 'Outro' },
]

const statusOptions = [
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'IN_USE', label: 'Em Uso' },
  { value: 'MAINTENANCE', label: 'Manutenção' },
  { value: 'RETIRED', label: 'Desativado' },
  { value: 'LOST', label: 'Perdido' },
]

export function EquipmentFormModal({
  equipment,
  open,
  onOpenChange,
  onSuccess,
}: EquipmentFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!equipment?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Equipment>({
    defaultValues: equipment || {
      name: '',
      brand: '',
      model: '',
      category: 'CAMERA',
      status: 'AVAILABLE',
      serial_number: '',
      purchase_date: '',
      purchase_price: undefined,
      daily_rate: undefined,
      photo_url: '',
      notes: '',
    },
  })

  const selectedCategory = watch('category')
  const selectedStatus = watch('status')

  const onSubmit = async (data: Equipment) => {
    setLoading(true)
    setError(null)

    try {
      const equipmentData: any = {
        name: data.name,
        brand: data.brand || null,
        model: data.model || null,
        category: data.category,
        status: data.status || 'AVAILABLE',
        serial_number: data.serial_number || null,
        purchase_date: data.purchase_date || null,
        purchase_price: data.purchase_price ? parseFloat(String(data.purchase_price)) : null,
        daily_rate: data.daily_rate ? parseFloat(String(data.daily_rate)) : null,
        photo_url: data.photo_url || null,
        notes: data.notes || null,
      }

      let result
      if (isEditing && equipment?.id) {
        result = await updateEquipment(equipment.id, equipmentData)
      } else {
        result = await addEquipment(equipmentData)
      }

      onSuccess(result)
      reset()
    } catch (err: any) {
      console.error('Equipment form error:', err)
      setError(err.message || 'Erro ao salvar equipamento')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do equipamento'
              : 'Adicione um novo equipamento ao inventário'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Sony FX3"
                  {...register('name', { required: 'Nome é obrigatório' })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setValue('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" placeholder="Ex: Sony" {...register('brand')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" placeholder="Ex: ILME-FX3" {...register('model')} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serial_number">Número de Série</Label>
                <Input
                  id="serial_number"
                  placeholder="Ex: SN123456789"
                  {...register('serial_number')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Informações Financeiras</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Data de Compra</Label>
                <Input id="purchase_date" type="date" {...register('purchase_date')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_price">Valor de Compra (R$)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('purchase_price')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_rate">Diária (R$)</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('daily_rate')}
                />
                <p className="text-xs text-muted-foreground">Valor de aluguel interno</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Informações Adicionais</h3>

            <div className="space-y-2">
              <Label htmlFor="photo_url">URL da Foto</Label>
              <Input
                id="photo_url"
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                {...register('photo_url')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Notas sobre o equipamento, condições, etc."
                rows={3}
                {...register('notes')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Adicionar Equipamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
