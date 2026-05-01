import type { EstampadoInput, CalcResult, CalcBreakdownLine, CostItemMap } from './types'

export function calculateEstampado(input: EstampadoInput, costs: CostItemMap): CalcResult {
  const lines: CalcBreakdownLine[] = []

  // Base cost per book * quantity
  const baseCost = costs.get('estampado_base_libro')
  if (baseCost && baseCost.unitCost) {
    const amount = baseCost.unitCost * input.quantity
    lines.push({
      concept: `${baseCost.name} x ${input.quantity}`,
      type: 'variable',
      quantity: input.quantity,
      unitCost: baseCost.unitCost,
      amount,
    })
  }

  // Logo (fixed per job, not per book)
  if (input.includesLogo) {
    const logoCost = costs.get('estampado_logo')
    if (logoCost && logoCost.fixedCost) {
      lines.push({
        concept: logoCost.name,
        type: 'fixed',
        unitCost: logoCost.fixedCost,
        amount: logoCost.fixedCost,
      })
    }
  }

  // Phrases * quantity
  if (input.phraseCount > 0) {
    const phraseCost = costs.get('estampado_frase')
    if (phraseCost && phraseCost.unitCost) {
      const amount = phraseCost.unitCost * input.phraseCount * input.quantity
      lines.push({
        concept: `${phraseCost.name} x ${input.phraseCount} x ${input.quantity}`,
        type: 'variable',
        quantity: input.phraseCount * input.quantity,
        unitCost: phraseCost.unitCost,
        amount,
      })
    }
  }

  // Details (lines, decorations) * quantity
  if (input.detailCount > 0) {
    const detailCost = costs.get('estampado_detalle')
    if (detailCost && detailCost.unitCost) {
      const amount = detailCost.unitCost * input.detailCount * input.quantity
      lines.push({
        concept: `${detailCost.name} x ${input.detailCount} x ${input.quantity}`,
        type: 'variable',
        quantity: input.detailCount * input.quantity,
        unitCost: detailCost.unitCost,
        amount,
      })
    }
  }

  // Size surcharge
  if (input.bookSize === 'A3') {
    const surcharge = costs.get('estampado_recargo_a3')
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

  // Design (fixed)
  const designCost = costs.get('estampado_diseno')
  if (designCost && designCost.fixedCost) {
    lines.push({
      concept: designCost.name,
      type: 'fixed',
      unitCost: designCost.fixedCost,
      amount: designCost.fixedCost,
    })
  }

  // Transport (fixed)
  const transportCost = costs.get('estampado_transporte')
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
