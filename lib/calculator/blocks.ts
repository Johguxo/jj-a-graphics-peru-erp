import type { BlocksInput, CalcResult, CalcBreakdownLine, CostItemMap } from './types'

export function calculateBlocks(input: BlocksInput, costs: CostItemMap): CalcResult {
  const lines: CalcBreakdownLine[] = []

  // Printing: double-sided or single-sided
  if (input.doubleSided) {
    const printCost = costs.get('blocks_doble_impresion')
    if (printCost && printCost.unitCost) {
      const amount = printCost.unitCost * input.quantity
      lines.push({
        concept: `${printCost.name} x ${input.quantity}`,
        type: 'variable',
        quantity: input.quantity,
        unitCost: printCost.unitCost,
        amount,
      })
    }
  } else {
    const printCost = costs.get('blocks_impresion')
    if (printCost && printCost.unitCost) {
      const amount = printCost.unitCost * input.quantity
      lines.push({
        concept: `${printCost.name} x ${input.quantity}`,
        type: 'variable',
        quantity: input.quantity,
        unitCost: printCost.unitCost,
        amount,
      })
    }
  }

  // Paper cost based on size
  const paperKeyMap: Record<string, string> = {
    A4: 'blocks_bond_a4',
    A5: 'blocks_bond_a5',
    MEDIA_CARTA: 'blocks_bond_media',
  }
  const paperKey = paperKeyMap[input.paperSize]
  if (paperKey) {
    const paperCost = costs.get(paperKey)
    if (paperCost && paperCost.unitCost) {
      const amount = paperCost.unitCost * input.quantity
      lines.push({
        concept: `${paperCost.name} x ${input.quantity}`,
        type: 'variable',
        quantity: input.quantity,
        unitCost: paperCost.unitCost,
        amount,
      })
    }
  }

  // Cutting
  const cuttingCost = costs.get('blocks_corte')
  if (cuttingCost && cuttingCost.unitCost) {
    const amount = cuttingCost.unitCost * input.quantity
    lines.push({
      concept: `${cuttingCost.name} x ${input.quantity}`,
      type: 'variable',
      quantity: input.quantity,
      unitCost: cuttingCost.unitCost,
      amount,
    })
  }

  // Packaging
  const packCost = costs.get('blocks_empaquetado')
  if (packCost && packCost.unitCost) {
    const amount = packCost.unitCost * input.quantity
    lines.push({
      concept: `${packCost.name} x ${input.quantity}`,
      type: 'variable',
      quantity: input.quantity,
      unitCost: packCost.unitCost,
      amount,
    })
  }

  // Numbering (optional)
  if (input.numbered) {
    const numCost = costs.get('blocks_numerado')
    if (numCost && numCost.unitCost) {
      const amount = numCost.unitCost * input.quantity
      lines.push({
        concept: `${numCost.name} x ${input.quantity}`,
        type: 'variable',
        quantity: input.quantity,
        unitCost: numCost.unitCost,
        amount,
      })
    }
  }

  // Design (fixed)
  const designCost = costs.get('blocks_diseno')
  if (designCost && designCost.fixedCost) {
    lines.push({
      concept: designCost.name,
      type: 'fixed',
      unitCost: designCost.fixedCost,
      amount: designCost.fixedCost,
    })
  }

  // Plate (fixed)
  const plateCost = costs.get('blocks_placa')
  if (plateCost && plateCost.fixedCost) {
    lines.push({
      concept: plateCost.name,
      type: 'fixed',
      unitCost: plateCost.fixedCost,
      amount: plateCost.fixedCost,
    })
  }

  // Transport (fixed)
  const transportCost = costs.get('blocks_transporte')
  if (transportCost && transportCost.fixedCost) {
    lines.push({
      concept: transportCost.name,
      type: 'fixed',
      unitCost: transportCost.fixedCost,
      amount: transportCost.fixedCost,
    })
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0)

  return {
    lines,
    subtotal: Math.round(subtotal * 100) / 100,
    margin: 0,
    marginAmount: 0,
    total: Math.round(subtotal * 100) / 100,
  }
}
