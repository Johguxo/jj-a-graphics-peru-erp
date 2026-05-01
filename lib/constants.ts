export const IGV_RATE = 0.18

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  ESTAMPADO: 'Estampado',
  BLOCKS: 'Blocks / Talonarios',
  ANILLADO: 'Anillado (Doble Ring)',
}

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida',
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  EMITIDA: 'Emitida',
  PAGADA: 'Pagada',
  PARCIAL: 'Pago Parcial',
  ANULADA: 'Anulada',
  VENCIDA: 'Vencida',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  YAPE: 'Yape',
  PLIN: 'Plin',
  OTRO: 'Otro',
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  RUC: 'RUC',
  DNI: 'DNI',
  CE: 'Carnet de Extranjeria',
}

export const PAPER_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4' },
  { value: 'A5', label: 'A5' },
  { value: 'A3', label: 'A3' },
  { value: 'MEDIA_CARTA', label: 'Media Carta' },
]

export const RING_SIZE_OPTIONS = [
  { value: 'PEQUENO', label: 'Pequeno (hasta 20mm)' },
  { value: 'MEDIANO', label: 'Mediano (25-32mm)' },
  { value: 'GRANDE', label: 'Grande (38mm+)' },
]

export const BOOK_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4' },
  { value: 'A5', label: 'A5' },
  { value: 'A3', label: 'A3' },
]
