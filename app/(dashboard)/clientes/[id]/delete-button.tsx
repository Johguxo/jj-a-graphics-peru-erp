'use client'

import { Button } from '@/components/ui/button'
import { deleteClient } from '@/lib/actions/clients'
import { TrashIcon } from '@heroicons/react/24/outline'

export function DeleteClientButton({ clientId }: { clientId: string }) {
  async function handleDelete() {
    if (!confirm('¿Estas seguro de que deseas eliminar este cliente?')) return
    await deleteClient(clientId)
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      <TrashIcon className="h-4 w-4" />
      Eliminar
    </Button>
  )
}
