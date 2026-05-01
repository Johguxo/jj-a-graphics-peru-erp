import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { PaymentForm } from '@/components/invoices/payment-form'
import { InvoiceActions } from '@/components/invoices/invoice-actions'

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      quote: { select: { id: true, quoteNumber: true } },
      items: { orderBy: { sortOrder: 'asc' } },
      payments: { orderBy: { paymentDate: 'desc' } },
    },
  })

  if (!invoice) notFound()

  const total = Number(invoice.total)
  const paid = Number(invoice.amountPaid)
  const pending = Math.max(0, Math.round((total - paid) * 100) / 100)
  const canRegisterPayment =
    invoice.status !== 'ANULADA' && invoice.status !== 'PAGADA' && pending > 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono">
              {invoice.invoiceNumber}
            </h2>
            <Badge variant={invoice.invoiceType === 'FACTURA' ? 'info' : 'default'}>
              {invoice.invoiceType}
            </Badge>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            Emitido el {formatDate(invoice.issueDate)} — Vence el{' '}
            {formatDate(invoice.dueDate)}
            {invoice.quote && (
              <>
                {' '}
                — Cotizacion{' '}
                <Link
                  href={`/cotizaciones/${invoice.quote.id}`}
                  className="text-primary hover:text-primary-hover"
                >
                  {invoice.quote.quoteNumber}
                </Link>
              </>
            )}
          </p>
        </div>
        <InvoiceActions
          invoiceId={invoice.id}
          status={invoice.status}
          hasPayments={invoice.payments.length > 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-muted">Total</p>
          <p className="text-2xl font-bold font-mono">
            {formatCurrency(total)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Pagado</p>
          <p className="text-2xl font-bold font-mono text-success">
            {formatCurrency(paid)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Pendiente</p>
          <p className="text-2xl font-bold font-mono text-danger">
            {formatCurrency(pending)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <div className="text-sm">
          <p className="font-medium">{invoice.client.businessName}</p>
          <p className="text-muted">
            {invoice.client.documentType} {invoice.client.documentNumber}
          </p>
          {invoice.client.email && (
            <p className="text-muted">{invoice.client.email}</p>
          )}
          {invoice.client.address && (
            <p className="text-muted">{invoice.client.address}</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items ({invoice.items.length})</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Descripcion</TableHead>
              <TableHead>Cant.</TableHead>
              <TableHead>P. Unit.</TableHead>
              <TableHead>Total</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
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
            <span className="font-mono w-32">
              {formatCurrency(Number(invoice.subtotal))}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-sm">
            <span className="text-muted">IGV (18%)</span>
            <span className="font-mono w-32">
              {formatCurrency(Number(invoice.igv))}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-lg font-bold border-t border-border pt-2">
            <span>Total</span>
            <span className="font-mono w-32 text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagos ({invoice.payments.length})</CardTitle>
        </CardHeader>
        {invoice.payments.length === 0 ? (
          <p className="text-sm text-muted">No hay pagos registrados.</p>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Fecha</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Monto</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {invoice.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted">
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">
                    {payment.reference || '-'}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-success">
                    {formatCurrency(Number(payment.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {canRegisterPayment && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Pago</CardTitle>
          </CardHeader>
          <PaymentForm invoiceId={invoice.id} pendingAmount={pending} />
        </Card>
      )}

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
        </Card>
      )}
    </div>
  )
}
