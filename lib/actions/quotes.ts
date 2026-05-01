'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { IGV_RATE } from '@/lib/constants'

interface QuoteItemInput {
  serviceType: 'ESTAMPADO' | 'BLOCKS' | 'ANILLADO'
  description: string
  calcInput: Record<string, unknown>
  calcDetail: Record<string, unknown>
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type ActionResult = {
  success: boolean
  error?: string
  data?: { id: string }
}

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.quote.count({
    where: {
      quoteNumber: { startsWith: `COT-${year}` },
    },
  })
  const num = String(count + 1).padStart(4, '0')
  return `COT-${year}-${num}`
}

export async function createQuote(
  clientId: string,
  items: QuoteItemInput[],
  notes?: string
): Promise<ActionResult> {
  if (!clientId) return { success: false, error: 'Cliente es requerido' }
  if (items.length === 0) return { success: false, error: 'Debe agregar al menos un item' }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const igv = Math.round(subtotal * IGV_RATE * 100) / 100
  const total = Math.round((subtotal + igv) * 100) / 100

  const quoteNumber = await generateQuoteNumber()

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      clientId,
      subtotal,
      igv,
      total,
      notes: notes || null,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      items: {
        create: items.map((item, index) => ({
          serviceType: item.serviceType,
          description: item.description,
          calcInput: item.calcInput as object,
          calcDetail: item.calcDetail as object,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sortOrder: index,
        })),
      },
    },
  })

  revalidatePath('/cotizaciones')
  return { success: true, data: { id: quote.id } }
}

export async function updateQuoteStatus(
  id: string,
  status: 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA'
): Promise<ActionResult> {
  await prisma.quote.update({
    where: { id },
    data: { status },
  })
  revalidatePath('/cotizaciones')
  revalidatePath(`/cotizaciones/${id}`)
  return { success: true }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  await prisma.quote.delete({ where: { id } })
  revalidatePath('/cotizaciones')
  redirect('/cotizaciones')
}
