'use client'

import { Button } from '@/components/ui/button'
import { voidInvoice, deleteInvoice } from '@/lib/actions/invoices'
import { toast } from 'sonner'

interface Props {
  invoiceId: string
  status: string
  hasPayments: boolean
}

export function InvoiceActions({ invoiceId, status, hasPayments }: Props) {
  async function handleVoid() {
    if (!confirm('¿Anular este comprobante? Esta accion no se puede deshacer.')) return
    const result = await voidInvoice(invoiceId)
    if (result.success) toast.success('Comprobante anulado')
    else toast.error(result.error || 'Error al anular')
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar permanentemente este comprobante?')) return
    await deleteInvoice(invoiceId)
  }

  return (
    <div className="flex gap-2">
      {status !== 'ANULADA' && status !== 'PAGADA' && (
        <Button size="sm" variant="secondary" onClick={handleVoid}>
          Anular
        </Button>
      )}
      {!hasPayments && (
        <Button size="sm" variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
      )}
    </div>
  )
}
