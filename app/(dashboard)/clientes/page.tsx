import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page || '1')
  const perPage = 20
  const query = params.q || ''

  const where = {
    active: true,
    ...(query
      ? {
          OR: [
            { businessName: { contains: query, mode: 'insensitive' as const } },
            { documentNumber: { contains: query } },
            { tradeName: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { businessName: 'asc' },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.client.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{total} clientes registrados</p>
        </div>
        <Link href="/clientes/nuevo">
          <Button>
            <PlusIcon className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <form className="flex gap-3">
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Buscar por nombre o documento..."
          className="flex h-10 w-full max-w-sm rounded-lg border border-border bg-card-bg px-3 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {clients.length === 0 ? (
        <EmptyState
          icon={UserGroupIcon}
          title="No hay clientes"
          description={
            query
              ? 'No se encontraron clientes con esa busqueda'
              : 'Comienza agregando tu primer cliente'
          }
          action={
            !query && (
              <Link href="/clientes/nuevo">
                <Button>
                  <PlusIcon className="h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Documento</TableHead>
                <TableHead>Razon Social</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Credito</TableHead>
                <TableHead></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Badge>{DOCUMENT_TYPE_LABELS[client.documentType]}</Badge>
                    <span className="ml-2 font-mono text-xs">
                      {client.documentNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.businessName}</p>
                      {client.tradeName && (
                        <p className="text-xs text-muted">{client.tradeName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {client.email && <p>{client.email}</p>}
                      {client.phone && (
                        <p className="text-muted">{client.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.creditDays > 0
                      ? `${client.creditDays} dias`
                      : 'Contado'}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/clientes/${client.id}`}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      Ver detalle
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <Link
                  key={i + 1}
                  href={`/clientes?page=${i + 1}${query ? `&q=${query}` : ''}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                    page === i + 1
                      ? 'bg-primary text-white'
                      : 'border border-border hover:bg-background'
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
