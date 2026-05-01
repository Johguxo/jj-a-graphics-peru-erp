import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import {
  UserGroupIcon,
  CalculatorIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'

async function getStats() {
  const [clientCount, quoteCount, invoiceCount, pendingPayments] =
    await Promise.all([
      prisma.client.count({ where: { active: true } }),
      prisma.quote.count(),
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        where: { status: { in: ['EMITIDA', 'PARCIAL', 'VENCIDA'] } },
        _sum: { total: true, amountPaid: true },
      }),
    ])

  const totalPending =
    Number(pendingPayments._sum.total || 0) -
    Number(pendingPayments._sum.amountPaid || 0)

  return { clientCount, quoteCount, invoiceCount, totalPending }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      title: 'Clientes',
      value: stats.clientCount.toString(),
      icon: UserGroupIcon,
      href: '/clientes',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Cotizaciones',
      value: stats.quoteCount.toString(),
      icon: CalculatorIcon,
      href: '/cotizaciones',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'Facturas',
      value: stats.invoiceCount.toString(),
      icon: DocumentTextIcon,
      href: '/facturacion',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Por Cobrar',
      value: formatCurrency(stats.totalPending),
      icon: BanknotesIcon,
      href: '/facturacion/cuentas-por-cobrar',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bienvenido</h2>
        <p className="text-muted">Resumen general del sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="flex items-center gap-4 rounded-xl border border-border bg-card-bg p-5 transition-shadow hover:shadow-md"
          >
            <div className={`rounded-lg ${card.bgColor} p-3`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
