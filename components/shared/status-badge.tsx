import { Badge } from '@/components/ui/badge'
import {
  QUOTE_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
} from '@/lib/constants'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const quoteStatusVariant: Record<string, BadgeVariant> = {
  BORRADOR: 'default',
  ENVIADA: 'info',
  APROBADA: 'success',
  RECHAZADA: 'danger',
  VENCIDA: 'warning',
}

const invoiceStatusVariant: Record<string, BadgeVariant> = {
  EMITIDA: 'info',
  PAGADA: 'success',
  PARCIAL: 'warning',
  ANULADA: 'danger',
  VENCIDA: 'danger',
}

export function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={quoteStatusVariant[status] || 'default'}>
      {QUOTE_STATUS_LABELS[status] || status}
    </Badge>
  )
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={invoiceStatusVariant[status] || 'default'}>
      {INVOICE_STATUS_LABELS[status] || status}
    </Badge>
  )
}
