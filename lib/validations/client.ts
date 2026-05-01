import { z } from 'zod'

export const clientSchema = z.object({
  documentType: z.enum(['RUC', 'DNI', 'CE']),
  documentNumber: z
    .string()
    .min(8, 'Minimo 8 caracteres')
    .max(11, 'Maximo 11 caracteres'),
  clientType: z.enum(['PERSONA_NATURAL', 'PERSONA_JURIDICA']),
  businessName: z.string().min(2, 'Razon social es requerida'),
  tradeName: z.string().optional().default(''),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  district: z.string().optional().default(''),
  city: z.string().optional().default(''),
  department: z.string().optional().default(''),
  creditDays: z.coerce.number().int().min(0).default(0),
  creditLimit: z.coerce.number().min(0).optional(),
  notes: z.string().optional().default(''),
})

export type ClientFormData = z.infer<typeof clientSchema>

export const contactSchema = z.object({
  name: z.string().min(2, 'Nombre es requerido'),
  position: z.string().optional().default(''),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  isPrimary: z.boolean().default(false),
})

export type ContactFormData = z.infer<typeof contactSchema>
