import { z } from 'zod'

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Descripcion es requerida'),
  quantity: z.coerce.number().int().min(1, 'Cantidad debe ser mayor a 0'),
  unitPrice: z.coerce.number().min(0, 'Precio unitario invalido'),
})

export const invoiceSchema = z.object({
  invoiceType: z.enum(['BOLETA', 'FACTURA']),
  clientId: z.string().min(1, 'Cliente es requerido'),
  quoteId: z.string().optional(),
  series: z
    .string()
    .min(1, 'Serie es requerida')
    .max(8, 'Serie demasiado larga')
    .regex(/^[A-Z0-9]+$/, 'Serie invalida (solo letras y numeros)'),
  correlative: z.coerce.number().int().min(1, 'Correlativo debe ser mayor a 0'),
  issueDate: z.string().min(1, 'Fecha de emision es requerida'),
  dueDate: z.string().min(1, 'Fecha de vencimiento es requerida'),
  notes: z.string().optional().default(''),
  items: z.array(invoiceItemSchema).min(1, 'Debe agregar al menos un item'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Monto debe ser mayor a 0'),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'YAPE', 'PLIN', 'OTRO']),
  reference: z.string().optional().default(''),
  paymentDate: z.string().min(1, 'Fecha de pago es requerida'),
  notes: z.string().optional().default(''),
})

export type PaymentFormData = z.infer<typeof paymentSchema>
