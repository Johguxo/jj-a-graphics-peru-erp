import type { AnilladoInput, CalcResult, CalcBreakdownLine, CostItemMap } from './types'

export function calculateAnillado(input: AnilladoInput, costs: CostItemMap): CalcResult {
  const lines: CalcBreakdownLine[] = []
  const totalPages = input.pageCount * input.quantity

  // Printing per page
  const printCost = costs.get('anillado_impresion')
  if (printCost && printCost.unitCost) {
    const amount = printCost.unitCost * totalPages
    lines.push({
      concept: `${printCost.name} x ${totalPages} hojas (${input.pageCount} pag x ${input.quantity})`,
      type: 'variable',
      quantity: totalPages,
      unitCost: printCost.unitCost,
      amount,
    })
  }

  // Ring cost based on size
  const ringKeyMap: Record<string, string> = {
    PEQUENO: 'anillado_anillo_peq',
    MEDIANO: 'anillado_anillo_med',
    GRANDE: 'anillado_anillo_gra',
  }
  const ringKey = ringKeyMap[input.ringSize]
  if (ringKey) {
    const ringCost = costs.get(ringKey)
    if (ringCost && ringCost.unitCost) {
      const amount = ringCost.unitCost * input.quantity
      lines.push({
        concept: `${ringCost.name} x ${input.quantity}`,
        type: 'variable',
        quantity: input.quantity,
        unitCost: ringCost.unitCost,
        amount,
      })
    }
  }

  // Cover/binding (2 covers per document)
  const coverCost = costs.get('anillado_tapa')
  if (coverCost && coverCost.unitCost) {
    const coverQty = input.quantity * 2
    const amount = coverCost.unitCost * coverQty
    lines.push({
      concept: `${coverCost.name} x ${coverQty} (2 por documento)`,
      type: 'variable',
      quantity: coverQty,
      unitCost: coverCost.unitCost,
      amount,
    })
  }

  // Collating (per page if collated)
  if (input.collated) {
    const collateCost = costs.get('anillado_compaginado')
    if (collateCost && collateCost.unitCost) {
      const amount = collateCost.unitCost * totalPages
      lines.push({
        concept: `${collateCost.name} x ${totalPages} hojas`,
        type: 'variable',
        quantity: totalPages,
        unitCost: collateCost.unitCost,
        amount,
      })
    }
  }

  // Size surcharge for A3
  if (input.size === 'A3') {
    const surcharge = costs.get('anillado_recargo_a3')
    if (surcharge && surcharge.fixedCost) {
      const amount = surcharge.fixedCost * input.quantity
      lines.push({
        concept: `${surcharge.name} x ${input.quantity}`,
        type: 'variable',
        quantity: input.quantity,
        unitCost: surcharge.fixedCost,
        amount,
      })
    }
  }

  // Transport (fixed)
  const transportCost = costs.get('anillado_transporte')
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
