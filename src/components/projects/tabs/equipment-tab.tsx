'use client'

import {
  Package,
  Plus,
} from 'lucide-react'

export interface EquipmentTabProps {
  equipmentBookings: any[]
  onAddEquipment: () => void
}

export function EquipmentTab({
  equipmentBookings,
  onAddEquipment,
}: EquipmentTabProps) {
  return (
    <div className="rounded-xl border border-border bg-card backdrop-blur-sm">
      <div className="border-b border-border p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Equipamentos Reservados
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Lista de equipamentos reservados para este projeto
            </p>
          </div>
          <button
            onClick={onAddEquipment}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 md:px-4 text-sm font-medium text-white transition-all hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Adicionar Equipamento</span>
            <span className="md:hidden">Adicionar</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {equipmentBookings && equipmentBookings.length > 0 ? (
          <div className="space-y-3">
            {equipmentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-lg border border-border bg-card p-3 md:p-4"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Package className="h-5 w-5 text-text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {booking.equipments?.name || 'Equipamento'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {booking.equipments?.category || 'Sem categoria'}
                    </p>
                  </div>
                </div>
                <div className="text-left md:text-right pl-13 md:pl-0">
                  <p className="text-sm text-text-primary">
                    {new Date(booking.start_date).toLocaleDateString(
                      'pt-BR'
                    )}{' '}
                    -{' '}
                    {new Date(booking.end_date).toLocaleDateString(
                      'pt-BR'
                    )}
                  </p>
                  {booking.equipments?.serial_number && (
                    <p className="text-xs text-text-tertiary">
                      S/N: {booking.equipments.serial_number}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
            <p className="mb-2 text-lg font-medium text-text-primary">
              Nenhum equipamento reservado
            </p>
            <p className="text-sm text-text-secondary">
              Reservas de equipamentos aparecerão aqui
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
