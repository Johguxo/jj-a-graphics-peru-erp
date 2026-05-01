import { prisma } from '@/lib/prisma'
import type { ServiceCalcInput, CalcResult, CostItemMap, CostItemData } from './types'
import { calculateEstampado } from './estampado'
import { calculateBlocks } from './blocks'
import { calculateAnillado } from './anillado'

async function loadCostItems(serviceType: string): Promise<CostItemMap> {
  const items = await prisma.costItem.findMany({
    where: { serviceType: serviceType as 'ESTAMPADO' | 'BLOCKS' | 'ANILLADO', active: true },
    orderBy: { sortOrder: 'asc' },
  })

  const map: CostItemMap = new Map()
  for (const item of items) {
    map.set(item.key, {
      key: item.key,
      name: item.name,
      costType: item.costType,
      totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
      quantityBase: item.quantityBase,
      unitCost: item.unitCost ? Number(item.unitCost) : null,
      fixedCost: item.fixedCost ? Number(item.fixedCost) : null,
    })
  }

  return map
}

async function loadMargin(): Promise<number> {
  const config = await prisma.pricingConfig.findUnique({
    where: { key: 'default_margin' },
  })
  return config ? Number(config.value) / 100 : 0.3
}

export async function calculate(input: ServiceCalcInput): Promise<CalcResult> {
  const [costs, margin] = await Promise.all([
    loadCostItems(input.type),
    loadMargin(),
  ])

  let result: CalcResult

  switch (input.type) {
    case 'ESTAMPADO':
      result = calculateEstampado(input.data, costs)
      break
    case 'BLOCKS':
      result = calculateBlocks(input.data, costs)
      break
    case 'ANILLADO':
      result = calculateAnillado(input.data, costs)
      break
  }

  // Apply margin
  const marginAmount = Math.round(result.subtotal * margin * 100) / 100
  result.margin = margin
  result.marginAmount = marginAmount
  result.total = Math.round((result.subtotal + marginAmount) * 100) / 100

  return result
}
