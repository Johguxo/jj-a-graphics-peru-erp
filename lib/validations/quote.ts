import { z } from 'zod'

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Cliente es requerido'),
  validUntil: z.string().optional(),
  notes: z.string().optional().default(''),
})

export type QuoteFormData = z.infer<typeof quoteSchema>

export const quoteItemSchema = z.object({
  serviceType: z.enum(['ESTAMPADO', 'BLOCKS', 'ANILLADO']),
  description: z.string().min(1, 'Descripcion es requerida'),
  calcInput: z.record(z.string(), z.unknown()),
  calcDetail: z.record(z.string(), z.unknown()),
  quantity: z.coerce.number().int().min(1, 'Minimo 1'),
  unitPrice: z.coerce.number().min(0),
  totalPrice: z.coerce.number().min(0),
})

export type QuoteItemFormData = z.infer<typeof quoteItemSchema>
