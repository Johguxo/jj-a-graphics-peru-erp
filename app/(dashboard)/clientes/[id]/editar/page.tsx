import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ClientForm } from '@/components/clients/client-form'

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <ClientForm
        client={{
          ...client,
          creditLimit: client.creditLimit?.toString() ?? null,
        }}
      />
    </div>
  )
}
