import { prisma } from '@/lib/prisma'
import { QuoteBuilder } from '@/components/calculator/quote-builder'

export default async function NuevaCotizacionPage() {
  const clients = await prisma.client.findMany({
    where: { active: true },
    orderBy: { businessName: 'asc' },
    select: { id: true, businessName: true, documentNumber: true },
  })

  const clientOptions = clients.map((c) => ({
    id: c.id,
    label: `${c.businessName} (${c.documentNumber})`,
  }))

  return (
    <div className="mx-auto max-w-6xl">
      <QuoteBuilder clients={clientOptions} />
    </div>
  )
}
