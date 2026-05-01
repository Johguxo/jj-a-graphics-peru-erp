import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SERVICE_TYPE_LABELS } from '@/lib/constants'
import { EditCostItemButton } from './edit-cost-item'
import { VersionHistoryButton } from './version-history'

export default async function MaterialesPage() {
  const costItems = await prisma.costItem.findMany({
    where: { active: true },
    orderBy: [{ serviceType: 'asc' }, { sortOrder: 'asc' }],
  })

  const grouped = costItems.reduce(
    (acc, item) => {
      const key = item.serviceType
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<string, typeof costItems>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Costos por Servicio</h2>
        <p className="text-sm text-muted">
          Gestiona los costos base de cada servicio. Los cambios se registran en el historial.
        </p>
      </div>

      {Object.entries(grouped).map(([serviceType, items]) => (
        <Card key={serviceType}>
          <CardHeader>
            <CardTitle>{SERVICE_TYPE_LABELS[serviceType] || serviceType}</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Precio Total</TableHead>
                <TableHead>Base Cant.</TableHead>
                <TableHead>Costo Unit.</TableHead>
                <TableHead>Costo Fijo</TableHead>
                <TableHead></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant={item.costType === 'fixed' ? 'info' : 'default'}>
                      {item.costType === 'fixed' ? 'Fijo' : 'Variable'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.totalPrice ? `S/ ${Number(item.totalPrice).toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.quantityBase || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.unitCost ? `S/ ${Number(item.unitCost).toFixed(4)}` : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.fixedCost ? `S/ ${Number(item.fixedCost).toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <EditCostItemButton
                        item={{
                          id: item.id,
                          name: item.name,
                          costType: item.costType,
                          totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
                          quantityBase: item.quantityBase,
                          unitCost: item.unitCost ? Number(item.unitCost) : null,
                          fixedCost: item.fixedCost ? Number(item.fixedCost) : null,
                        }}
                      />
                      <VersionHistoryButton costItemId={item.id} itemName={item.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}

      {costItems.length === 0 && (
        <p className="text-center text-muted py-8">
          No hay costos configurados. Ejecuta el seed para cargar datos iniciales.
        </p>
      )}
    </div>
  )
}
