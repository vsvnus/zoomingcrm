import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EquipmentInventory } from '@/components/inventory/equipment-inventory'
import { getEquipmentsWithAvailability } from '@/actions/equipments'

export const metadata = {
  title: 'Equipamentos - Zooming CRM',
  description: 'Gestão de inventário e reservas de equipamentos',
}

async function getInventoryData() {
  const equipments = await getEquipmentsWithAvailability()

  return {
    equipments: equipments || [],
  }
}

export default async function InventoryPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const data = await getInventoryData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Gestão de inventário, reservas e manutenção de equipamentos
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <EquipmentInventory initialData={data} />
      </Suspense>
    </div>
  )
}
