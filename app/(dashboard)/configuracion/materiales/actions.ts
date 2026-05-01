'use server'

import { prisma } from '@/lib/prisma'

export async function getVersionHistory(costItemId: string) {
  const versions = await prisma.costItemVersion.findMany({
    where: { costItemId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return versions.map((v) => ({
    id: v.id,
    totalPrice: v.totalPrice?.toString() ?? null,
    quantityBase: v.quantityBase,
    unitCost: v.unitCost?.toString() ?? null,
    fixedCost: v.fixedCost?.toString() ?? null,
    reason: v.reason,
    createdAt: v.createdAt.toISOString(),
  }))
}
