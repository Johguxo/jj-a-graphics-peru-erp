'use client'

import { Button } from '@/components/ui/button'
import { updateQuoteStatus, deleteQuote } from '@/lib/actions/quotes'
import { toast } from 'sonner'

interface Props {
  quoteId: string
  currentStatus: string
}

export function QuoteActions({ quoteId, currentStatus }: Props) {
  async function handleStatusChange(status: 'ENVIADA' | 'APROBADA' | 'RECHAZADA') {
    const result = await updateQuoteStatus(quoteId, status)
    if (result.success) {
      toast.success('Estado actualizado')
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta cotizacion?')) return
    await deleteQuote(quoteId)
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'BORRADOR' && (
        <Button size="sm" onClick={() => handleStatusChange('ENVIADA')}>
          Marcar como Enviada
        </Button>
      )}
      {(currentStatus === 'BORRADOR' || currentStatus === 'ENVIADA') && (
        <>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleStatusChange('APROBADA')}
          >
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleStatusChange('RECHAZADA')}
          >
            Rechazar
          </Button>
        </>
      )}
      {currentStatus === 'BORRADOR' && (
        <Button size="sm" variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
      )}
    </div>
  )
}
