import { prisma } from '@/lib/prisma'
import { InvoiceForm } from '@/components/invoices/invoice-form'

export default async function NuevaFacturaPage() {
  const [clients, quotes] = await Promise.all([
    prisma.client.findMany({
      where: { active: true },
      orderBy: { businessName: 'asc' },
      select: {
        id: true,
        businessName: true,
        documentNumber: true,
        creditDays: true,
      },
    }),
    prisma.quote.findMany({
      where: { status: 'APROBADA', invoices: { none: {} } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        quoteNumber: true,
        clientId: true,
        total: true,
        items: {
          orderBy: { sortOrder: 'asc' },
          select: {
            description: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    }),
  ])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Nuevo Comprobante</h2>
        <p className="text-sm text-muted">
          Emite una boleta o factura. El codigo SUNAT se ingresa manualmente.
        </p>
      </div>
      <InvoiceForm
        clients={clients}
        quotes={quotes.map((q) => ({
          ...q,
          total: q.total.toString(),
          items: q.items.map((it) => ({
            ...it,
            unitPrice: it.unitPrice.toString(),
          })),
        }))}
      />
    </div>
  )
}
