import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContactForm } from '@/components/clients/contact-form'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { DeleteClientButton } from './delete-button'

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { isPrimary: 'desc' } },
      quotes: { orderBy: { createdAt: 'desc' }, take: 5 },
      invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!client) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{client.businessName}</h2>
          {client.tradeName && (
            <p className="text-sm text-muted">{client.tradeName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/clientes/${id}/editar`}>
            <Button variant="secondary" size="sm">
              <PencilIcon className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <DeleteClientButton clientId={id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informacion General</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Documento</dt>
              <dd>
                <Badge>{DOCUMENT_TYPE_LABELS[client.documentType]}</Badge>
                <span className="ml-2 font-mono">{client.documentNumber}</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tipo</dt>
              <dd>{client.clientType === 'PERSONA_JURIDICA' ? 'Persona Juridica' : 'Persona Natural'}</dd>
            </div>
            {client.email && (
              <div className="flex justify-between">
                <dt className="text-muted">Email</dt>
                <dd>{client.email}</dd>
              </div>
            )}
            {client.phone && (
              <div className="flex justify-between">
                <dt className="text-muted">Telefono</dt>
                <dd>{client.phone}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Credito</dt>
              <dd>
                {client.creditDays > 0
                  ? `${client.creditDays} dias`
                  : 'Contado'}
                {client.creditLimit && (
                  <span className="ml-2 text-muted">
                    (Limite: {formatCurrency(Number(client.creditLimit))})
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Registrado</dt>
              <dd>{formatDate(client.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direccion</CardTitle>
          </CardHeader>
          <div className="text-sm">
            {client.address && <p>{client.address}</p>}
            <p className="text-muted">
              {[client.district, client.city, client.department]
                .filter(Boolean)
                .join(', ') || 'Sin direccion registrada'}
            </p>
          </div>
          {client.notes && (
            <div className="mt-4 rounded-lg bg-background p-3">
              <p className="text-xs font-medium text-muted">Notas</p>
              <p className="mt-1 text-sm">{client.notes}</p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contactos</CardTitle>
        </CardHeader>
        {client.contacts.length > 0 && (
          <div className="mb-4 divide-y divide-border rounded-lg border border-border">
            {client.contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">
                    {contact.name}
                    {contact.isPrimary && (
                      <Badge variant="info" className="ml-2">
                        Principal
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {[contact.position, contact.email, contact.phone]
                      .filter(Boolean)
                      .join(' - ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <ContactForm clientId={id} />
      </Card>
    </div>
  )
}
