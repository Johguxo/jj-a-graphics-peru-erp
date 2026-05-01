import { cn } from '@/lib/utils'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn('bg-background text-left', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn('divide-y divide-border', className)}>{children}</tbody>
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('bg-card-bg transition-colors hover:bg-background/50', className)}>
      {children}
    </tr>
  )
}

export function TableHead({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted',
        className
      )}
    >
      {children}
    </th>
  )
}

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <td className={cn('px-4 py-3', className)}>{children}</td>
}
