import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { QuoteStatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CalculatorIcon, PlusIcon } from '@heroicons/react/24/outline'

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page || '1')
  const perPage = 20

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.quote.count(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{total} cotizaciones</p>
        <Link href="/cotizaciones/nueva">
          <Button>
            <PlusIcon className="h-4 w-4" />
            Nueva Cotizacion
          </Button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          icon={CalculatorIcon}
          title="No hay cotizaciones"
          description="Crea tu primera cotizacion usando la calculadora de costos"
          action={
            <Link href="/cotizaciones/nueva">
              <Button>
                <PlusIcon className="h-4 w-4" />
                Nueva Cotizacion
              </Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Numero</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-mono text-xs">
                  {quote.quoteNumber}
                </TableCell>
                <TableCell className="font-medium">
                  {quote.client.businessName}
                </TableCell>
                <TableCell>
                  <QuoteStatusBadge status={quote.status} />
                </TableCell>
                <TableCell>{formatCurrency(Number(quote.total))}</TableCell>
                <TableCell className="text-muted">
                  {formatDate(quote.createdAt)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/cotizaciones/${quote.id}`}
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
