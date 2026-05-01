import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'

export default async function PreciosPage() {
  const configs = await prisma.pricingConfig.findMany({
    orderBy: { key: 'asc' },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuracion de Precios</CardTitle>
        </CardHeader>
        {configs.length === 0 ? (
          <p className="text-center text-muted">
            No hay configuraciones. Ejecuta el seed para cargar datos iniciales.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Configuracion</TableHead>
                <TableHead>Clave</TableHead>
                <TableHead>Valor</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted">
                    {config.key}
                  </TableCell>
                  <TableCell className="font-mono">{config.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
