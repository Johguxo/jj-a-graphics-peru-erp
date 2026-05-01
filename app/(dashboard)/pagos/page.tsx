import { prisma } from '@/lib/prisma'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { BanknotesIcon } from '@heroicons/react/24/outline'

export default async function PagosPage() {
  const payments = await prisma.payment.findMany({
    include: { invoice: { include: { client: true } } },
    orderBy: { paymentDate: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{payments.length} pagos registrados</p>

      {payments.length === 0 ? (
        <EmptyState
          icon={BanknotesIcon}
          title="No hay pagos registrados"
          description="Los pagos apareceran aqui cuando se registren en las facturas"
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Fecha</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Metodo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Referencia</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-muted">
                  {formatDate(payment.paymentDate)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {payment.invoice.invoiceNumber}
                </TableCell>
                <TableCell className="font-medium">
                  {payment.invoice.client.businessName}
                </TableCell>
                <TableCell>
                  <Badge>
                    {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-success">
                  {formatCurrency(Number(payment.amount))}
                </TableCell>
                <TableCell className="text-muted">
                  {payment.reference || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
