'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type ActionResult = {
  success: boolean
  error?: string
}

export async function updateCostItemPrice(
  costItemId: string,
  data: {
    totalPrice?: number | null
    quantityBase?: number | null
    unitCost?: number | null
    fixedCost?: number | null
    reason: string
  }
): Promise<ActionResult> {
  if (!data.reason.trim()) {
    return { success: false, error: 'Motivo del cambio es requerido' }
  }

  // Create version history entry
  await prisma.costItemVersion.create({
    data: {
      costItemId,
      totalPrice: data.totalPrice ?? null,
      quantityBase: data.quantityBase ?? null,
      unitCost: data.unitCost ?? null,
      fixedCost: data.fixedCost ?? null,
      reason: data.reason,
    },
  })

  // Update current prices on the cost item
  await prisma.costItem.update({
    where: { id: costItemId },
    data: {
      totalPrice: data.totalPrice ?? null,
      quantityBase: data.quantityBase ?? null,
      unitCost: data.unitCost ?? null,
      fixedCost: data.fixedCost ?? null,
    },
  })

  revalidatePath('/configuracion/materiales')
  return { success: true }
}

export async function updatePricingConfig(
  key: string,
  value: string
): Promise<ActionResult> {
  await prisma.pricingConfig.update({
    where: { key },
    data: { value },
  })
  revalidatePath('/configuracion/precios')
  return { success: true }
}
