'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Camera,
  Mic,
  Sun,
  Video,
  Wrench,
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'
import { EquipmentDetailModal } from './equipment-detail-modal'
import { EquipmentFormModal } from './equipment-form-modal'

interface EquipmentData {
  id: string
  name: string
  brand?: string
  model?: string
  category: string
  status: string
  serial_number?: string
  purchase_date?: string
  purchase_price?: number
  daily_rate?: number
  qr_code_hash?: string
  photo_url?: string
  currently_booked?: boolean
  next_booking_date?: string
  total_days_booked?: number
  total_revenue_generated?: number
  roi_percent?: number
  organization_id: string
}

interface EquipmentInventoryProps {
  initialData: {
    equipments: EquipmentData[]
  }
}

const categoryIcons: Record<string, any> = {
  CAMERA: Camera,
  LENS: Camera,
  AUDIO: Mic,
  LIGHTING: Sun,
  GRIP: Video,
  DRONE: Video,
  ACCESSORY: Package,
  OTHER: Wrench,
}

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

const statusColors: Record<string, string> = {
  AVAILABLE: 'default',
  IN_USE: 'secondary',
  MAINTENANCE: 'destructive',
  RETIRED: 'outline',
  LOST: 'destructive',
}

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Disponível',
  IN_USE: 'Em Uso',
  MAINTENANCE: 'Manutenção',
  RETIRED: 'Desativado',
  LOST: 'Perdido',
}

export function EquipmentInventory({ initialData }: EquipmentInventoryProps) {
  const [equipments, setEquipments] = useState<EquipmentData[]>(initialData.equipments)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<EquipmentData | null>(null)

  // Filter equipments
  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.serial_number?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || equipment.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || equipment.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleViewDetails = (equipment: EquipmentData) => {
    setSelectedEquipment(equipment)
    setIsDetailModalOpen(true)
  }

  const handleEdit = (equipment: EquipmentData) => {
    setEditingEquipment(equipment)
    setIsFormModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingEquipment(null)
    setIsFormModalOpen(true)
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipments.filter((e) => e.status === 'AVAILABLE').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipments.filter((e) => e.status === 'IN_USE' || e.currently_booked).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
              <Wrench className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipments.filter((e) => e.status === 'MAINTENANCE').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventário de Equipamentos</CardTitle>
                <CardDescription>Gestão completa de equipamentos e disponibilidade</CardDescription>
              </div>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Equipamento
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, marca, modelo ou serial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Diária</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum equipamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipments.map((equipment) => {
                    const Icon = categoryIcons[equipment.category] || Package
                    return (
                      <TableRow
                        key={equipment.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(equipment)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{equipment.name}</div>
                              {equipment.brand && equipment.model && (
                                <div className="text-sm text-muted-foreground">
                                  {equipment.brand} {equipment.model}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoryLabels[equipment.category]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[equipment.status] as any}>
                            {statusLabels[equipment.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {equipment.serial_number || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(equipment.daily_rate)}</TableCell>
                        <TableCell>
                          {equipment.roi_percent !== null && equipment.roi_percent !== undefined ? (
                            <span
                              className={
                                equipment.roi_percent >= 100
                                  ? 'font-semibold text-green-600'
                                  : 'text-muted-foreground'
                              }
                            >
                              {equipment.roi_percent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDetails(equipment)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(equipment)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
        />
      )}

      {/* Form Modal */}
      <EquipmentFormModal
        equipment={editingEquipment}
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSuccess={(updatedEquipment) => {
          if (editingEquipment) {
            // Update existing
            setEquipments((prev) =>
              prev.map((e) => (e.id === updatedEquipment.id ? updatedEquipment : e))
            )
          } else {
            // Add new
            setEquipments((prev) => [...prev, updatedEquipment])
          }
          setIsFormModalOpen(false)
        }}
      />
    </>
  )
}
