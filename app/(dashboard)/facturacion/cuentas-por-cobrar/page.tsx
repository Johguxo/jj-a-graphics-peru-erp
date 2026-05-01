import { prisma } from '@/lib/prisma'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BanknotesIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default async function CuentasPorCobrarPage() {
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ['EMITIDA', 'PARCIAL', 'VENCIDA'] } },
    include: { client: true },
    orderBy: { dueDate: 'asc' },
  })

  const totalPending = invoices.reduce(
    (sum, inv) => sum + Number(inv.total) - Number(inv.amountPaid),
    0
  )

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card-bg p-6">
        <p className="text-sm text-muted">Total por cobrar</p>
        <p className="text-3xl font-bold text-danger">
          {formatCurrency(totalPending)}
        </p>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={BanknotesIcon}
          title="No hay cuentas por cobrar"
          description="Todas las facturas estan al dia"
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Comprobante</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Pendiente</TableHead>
              <TableHead>Vencimiento</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const pending = Number(invoice.total) - Number(invoice.amountPaid)
              return (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link
                      href={`/facturacion/${invoice.id}`}
                      className="font-mono text-xs text-primary hover:text-primary-hover"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {invoice.client.businessName}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(Number(invoice.total))}</TableCell>
                  <TableCell>{formatCurrency(Number(invoice.amountPaid))}</TableCell>
                  <TableCell className="font-medium text-danger">
                    {formatCurrency(pending)}
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
