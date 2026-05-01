import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  CubeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

const settingsLinks = [
  {
    title: 'Costos por Servicio',
    description: 'Gestionar costos de materiales, mano de obra y tarifas fijas por servicio. Incluye historial de cambios.',
    href: '/configuracion/materiales',
    icon: CubeIcon,
  },
  {
    title: 'Precios Generales',
    description: 'Margenes, IGV y configuraciones generales de precios',
    href: '/configuracion/precios',
    icon: CurrencyDollarIcon,
  },
]

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {settingsLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
            <div className="rounded-lg bg-primary-light p-3">
              <link.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{link.title}</h3>
              <p className="text-sm text-muted">{link.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
