import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { QuoteStatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SERVICE_TYPE_LABELS, IGV_RATE } from '@/lib/constants'
import { QuoteActions } from './quote-actions'

export default async function CotizacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      items: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!quote) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono">{quote.quoteNumber}</h2>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            Creada el {formatDate(quote.createdAt)}
            {quote.validUntil && ` — Valida hasta ${formatDate(quote.validUntil)}`}
          </p>
        </div>
        <QuoteActions quoteId={id} currentStatus={quote.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <div className="text-sm">
          <p className="font-medium">{quote.client.businessName}</p>
          <p className="text-muted">{quote.client.documentNumber}</p>
          {quote.client.email && <p className="text-muted">{quote.client.email}</p>}
          {quote.client.phone && <p className="text-muted">{quote.client.phone}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items ({quote.items.length})</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Servicio</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Cant.</TableHead>
              <TableHead>P. Unit.</TableHead>
              <TableHead>Total</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {quote.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge>{SERVICE_TYPE_LABELS[item.serviceType]}</Badge>
                </TableCell>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="font-mono">
                  {formatCurrency(Number(item.unitPrice))}
                </TableCell>
                <TableCell className="font-mono font-medium">
                  {formatCurrency(Number(item.totalPrice))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 space-y-2 border-t border-border pt-4 text-right">
          <div className="flex justify-end gap-8 text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-mono w-28">{formatCurrency(Number(quote.subtotal))}</span>
          </div>
          <div className="flex justify-end gap-8 text-sm">
            <span className="text-muted">IGV (18%)</span>
            <span className="font-mono w-28">{formatCurrency(Number(quote.igv))}</span>
          </div>
          <div className="flex justify-end gap-8 text-lg font-bold border-t border-border pt-2">
            <span>Total</span>
            <span className="font-mono w-28 text-primary">
              {formatCurrency(Number(quote.total))}
            </span>
          </div>
        </div>
      </Card>

      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <p className="text-sm">{quote.notes}</p>
        </Card>
      )}
    </div>
  )
}
