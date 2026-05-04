import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  DocumentTextIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import type { Prisma } from '@/app/generated/prisma/client'

type SortField =
  | 'invoiceNumber'
  | 'invoiceType'
  | 'client'
  | 'status'
  | 'total'
  | 'amountPaid'
  | 'issueDate'
  | 'dueDate'

const SORT_FIELDS: SortField[] = [
  'invoiceNumber',
  'invoiceType',
  'client',
  'status',
  'total',
  'amountPaid',
  'issueDate',
  'dueDate',
]

function buildOrderBy(
  sort: SortField,
  dir: 'asc' | 'desc'
): Prisma.InvoiceOrderByWithRelationInput {
  if (sort === 'client') return { client: { businessName: dir } }
  return { [sort]: dir } as Prisma.InvoiceOrderByWithRelationInput
}

function SortHeader({
  field,
  label,
  currentSort,
  currentDir,
}: {
  field: SortField
  label: string
  currentSort: SortField
  currentDir: 'asc' | 'desc'
}) {
  const active = currentSort === field
  const nextDir = active && currentDir === 'desc' ? 'asc' : 'desc'
  const params = new URLSearchParams({ sort: field, dir: nextDir })
  return (
    <TableHead>
      <Link
        href={`?${params.toString()}`}
        className={cn(
          'inline-flex items-center gap-1 hover:text-foreground transition-colors',
          active && 'text-foreground'
        )}
      >
        {label}
        {!active && <ChevronUpDownIcon className="h-3.5 w-3.5 opacity-60" />}
        {active && currentDir === 'desc' && (
          <ChevronDownIcon className="h-3.5 w-3.5" />
        )}
        {active && currentDir === 'asc' && (
          <ChevronUpIcon className="h-3.5 w-3.5" />
        )}
      </Link>
    </TableHead>
  )
}

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; dir?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page || '1')
  const perPage = 20

  const sort: SortField = SORT_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : 'issueDate'
  const dir: 'asc' | 'desc' = params.dir === 'asc' ? 'asc' : 'desc'

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: true },
      orderBy: buildOrderBy(sort, dir),
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
              <SortHeader field="invoiceNumber" label="Numero" currentSort={sort} currentDir={dir} />
              <SortHeader field="invoiceType" label="Tipo" currentSort={sort} currentDir={dir} />
              <SortHeader field="client" label="Cliente" currentSort={sort} currentDir={dir} />
              <SortHeader field="status" label="Estado" currentSort={sort} currentDir={dir} />
              <SortHeader field="total" label="Total" currentSort={sort} currentDir={dir} />
              <SortHeader field="amountPaid" label="Pagado" currentSort={sort} currentDir={dir} />
              <SortHeader field="issueDate" label="Emision" currentSort={sort} currentDir={dir} />
              <SortHeader field="dueDate" label="Vencimiento" currentSort={sort} currentDir={dir} />
              <TableHead></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const isOverdue =
                invoice.dueDate < new Date() &&
                invoice.status !== 'PAGADA' &&
                invoice.status !== 'ANULADA'
              return (
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
                    {formatDate(invoice.issueDate)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      isOverdue ? 'font-medium text-danger' : 'text-muted'
                    )}
                  >
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
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
