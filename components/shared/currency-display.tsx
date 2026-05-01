import { formatCurrency } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number | string
  className?: string
}

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  return <span className={className}>{formatCurrency(amount)}</span>
}
