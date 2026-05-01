import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page || '1')
  const perPage = 20

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.invoice.count(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{total} comprobantes</p>
        <div className="flex gap-2">
          <Link href="/facturacion/cuentas-por-cobrar">
            <Button variant="secondary">Cuentas por Cobrar</Button>
          </Link>
          <Link href="/facturacion/nueva">
            <Button>
              <PlusIcon className="h-4 w-4" />
              Nuevo Comprobante
            </Button>
          </Link>
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={DocumentTextIcon}
          title="No hay comprobantes"
          description="Emite tu primera boleta o factura"
          action={
            <Link href="/facturacion/nueva">
              <Button>
                <PlusIcon className="h-4 w-4" />
                Nuevo Comprobante
              </Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Numero</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-mono text-xs">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>
                  <Badge variant={invoice.invoiceType === 'FACTURA' ? 'info' : 'default'}>
                    {invoice.invoiceType}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {invoice.client.businessName}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>{formatCurrency(Number(invoice.total))}</TableCell>
                <TableCell>{formatCurrency(Number(invoice.amountPaid))}</TableCell>
                <TableCell className="text-muted">
                  {formatDate(invoice.dueDate)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/facturacion/${invoice.id}`}
                    className="text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    Ver
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
