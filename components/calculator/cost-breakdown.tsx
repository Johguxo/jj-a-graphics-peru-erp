import type { CalcResult } from '@/lib/calculator/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Props {
  result: CalcResult | null
  loading?: boolean
}

export function CostBreakdown({ result, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card-bg p-6 text-center">
        <p className="text-sm text-muted">Calculando...</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted">
          Ingresa los datos del servicio para ver el desglose de costos
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card-bg overflow-hidden">
      <div className="border-b border-border bg-background px-4 py-3">
        <h4 className="text-sm font-semibold">Desglose de Costos</h4>
      </div>
      <div className="divide-y divide-border">
        {result.lines.map((line, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={line.type === 'fixed' ? 'info' : 'default'}>
                {line.type === 'fixed' ? 'Fijo' : 'Variable'}
              </Badge>
              <span>{line.concept}</span>
            </div>
            <span className="font-mono font-medium">{formatCurrency(line.amount)}</span>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-border bg-background px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-mono">{formatCurrency(result.subtotal)}</span>
        </div>
        {result.marginAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Margen ({Math.round(result.margin * 100)}%)</span>
            <span className="font-mono">{formatCurrency(result.marginAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
          <span>Total</span>
          <span className="font-mono text-primary">{formatCurrency(result.total)}</span>
        </div>
      </div>
    </div>
  )
}
