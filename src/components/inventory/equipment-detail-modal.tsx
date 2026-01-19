'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QrCode, Printer, TrendingUp, Calendar, Wrench, DollarSign } from 'lucide-react'
import {
  getEquipmentProjectHistory,
  getMaintenanceLogs,
} from '@/actions/equipments'

interface Equipment {
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
  notes?: string
  currently_booked?: boolean
  next_booking_date?: string
  total_days_booked?: number
  total_revenue_generated?: number
  roi_percent?: number
}

interface EquipmentDetailModalProps {
  equipment: Equipment
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Disponível',
  IN_USE: 'Em Uso',
  MAINTENANCE: 'Manutenção',
  RETIRED: 'Desativado',
  LOST: 'Perdido',
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

export function EquipmentDetailModal({
  equipment,
  open,
  onOpenChange,
}: EquipmentDetailModalProps) {
  const [projectHistory, setProjectHistory] = useState<any[]>([])
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && equipment.id) {
      loadData()
    }
  }, [open, equipment.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [history, logs] = await Promise.all([
        getEquipmentProjectHistory(equipment.id),
        getMaintenanceLogs(equipment.id),
      ])
      setProjectHistory(history)
      setMaintenanceLogs(logs)
    } catch (error) {
      console.error('Error loading equipment details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const handlePrintQRCode = () => {
    if (!equipment.qr_code_hash) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=600,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${equipment.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
              border: 2px solid #000;
            }
            h2 { margin: 0 0 10px 0; }
            .details { margin: 10px 0; font-size: 14px; }
            .hash { font-family: monospace; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${equipment.name}</h2>
            <div class="details">
              ${equipment.brand && equipment.model ? `<p>${equipment.brand} ${equipment.model}</p>` : ''}
              ${equipment.serial_number ? `<p>S/N: ${equipment.serial_number}</p>` : ''}
            </div>
            <div id="qrcode"></div>
            <div class="hash">${equipment.qr_code_hash}</div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qrcode"), {
              text: "${equipment.qr_code_hash}",
              width: 256,
              height: 256
            });
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const roiPercent = equipment.roi_percent || 0
  const isPositiveROI = roiPercent >= 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{equipment.name}</DialogTitle>
              <DialogDescription>
                {equipment.brand && equipment.model && (
                  <span className="mr-2">
                    {equipment.brand} {equipment.model}
                  </span>
                )}
                {equipment.serial_number && (
                  <span className="font-mono text-xs">S/N: {equipment.serial_number}</span>
                )}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge>{categoryLabels[equipment.category]}</Badge>
              <Badge variant="outline">{statusLabels[equipment.status]}</Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Equipment Photo */}
            {equipment.photo_url && (
              <Card>
                <CardContent className="p-4">
                  <img
                    src={equipment.photo_url}
                    alt={equipment.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Financial Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor de Compra</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(equipment.purchase_price)}
                  </div>
                  {equipment.purchase_date && (
                    <p className="text-xs text-muted-foreground">
                      Comprado em {formatDate(equipment.purchase_date)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diária</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(equipment.daily_rate)}</div>
                  <p className="text-xs text-muted-foreground">Valor de aluguel interno</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Gerada</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(equipment.total_revenue_generated)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {equipment.total_days_booked || 0} dias de uso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${isPositiveROI ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {roiPercent.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPositiveROI ? 'Equipamento rentável' : 'Ainda em recuperação'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ROI Progress Bar */}
            {equipment.purchase_price && equipment.purchase_price > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Progresso de ROI</CardTitle>
                  <CardDescription>
                    Comparativo entre investimento e retorno gerado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Investimento: {formatCurrency(equipment.purchase_price)}</span>
                      <span>
                        Retorno: {formatCurrency(equipment.total_revenue_generated)}
                      </span>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isPositiveROI ? 'bg-green-600' : 'bg-orange-500'}`}
                        style={{ width: `${Math.min(roiPercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {isPositiveROI
                        ? `Equipamento já se pagou! ${(roiPercent - 100).toFixed(1)}% de lucro adicional`
                        : `Faltam ${formatCurrency((equipment.purchase_price || 0) - (equipment.total_revenue_generated || 0))} para recuperar investimento`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {equipment.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{equipment.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Disponibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                {equipment.currently_booked ? (
                  <div className="text-sm">
                    <Badge variant="warning" className="mb-2">
                      Atualmente em uso
                    </Badge>
                    {equipment.next_booking_date && (
                      <p className="text-muted-foreground">
                        Próxima reserva: {formatDate(equipment.next_booking_date)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    <Badge className="mb-2">Disponível</Badge>
                    {equipment.next_booking_date && (
                      <p className="text-muted-foreground">
                        Próxima reserva: {formatDate(equipment.next_booking_date)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Projetos</CardTitle>
                <CardDescription>Projetos em que este equipamento foi utilizado</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground">Carregando...</p>
                ) : projectHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Nenhum projeto registrado ainda
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectHistory.map((item) => (
                        <TableRow key={item.project_id}>
                          <TableCell className="font-medium">{item.project_title}</TableCell>
                          <TableCell>{item.client_name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(item.start_date)}</div>
                              <div className="text-muted-foreground">
                                até {formatDate(item.end_date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.days_used || 0}</TableCell>
                          <TableCell>{formatCurrency(item.estimated_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Manutenção</CardTitle>
                <CardDescription>Registros de manutenções e reparos</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground">Carregando...</p>
                ) : maintenanceLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Nenhuma manutenção registrada
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Custo</TableHead>
                        <TableHead>Técnico</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.description}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(log.date_start)}</div>
                              {log.date_end && (
                                <div className="text-muted-foreground">
                                  até {formatDate(log.date_end)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.status === 'COMPLETED'
                                  ? 'success'
                                  : log.status === 'IN_PROGRESS'
                                    ? 'warning'
                                    : 'outline'
                              }
                            >
                              {log.status === 'COMPLETED'
                                ? 'Concluída'
                                : log.status === 'IN_PROGRESS'
                                  ? 'Em Andamento'
                                  : 'Cancelada'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(log.cost)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{log.technician_name || 'N/A'}</div>
                              {log.external_service && (
                                <div className="text-xs text-muted-foreground">Externo</div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>QR Code de Rastreamento</CardTitle>
                <CardDescription>
                  Use este QR Code para identificação e rastreamento rápido
                </CardDescription>
              </CardHeader>
              <CardContent>
                {equipment.qr_code_hash ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div id="qrcode-display" className="p-4 bg-white rounded-lg">
                      {/* QR Code will be rendered here */}
                      <div className="h-64 w-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                        <div className="text-center">
                          <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            QR Code: {equipment.qr_code_hash}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handlePrintQRCode} variant="secondary">
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir QR Code
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Hash: <span className="font-mono">{equipment.qr_code_hash}</span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    QR Code não disponível para este equipamento
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
