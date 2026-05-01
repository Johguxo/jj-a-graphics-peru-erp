'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  UserGroupIcon,
  CalculatorIcon,
  DocumentTextIcon,
  BanknotesIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Inicio', href: '/', icon: HomeIcon },
  { name: 'Clientes', href: '/clientes', icon: UserGroupIcon },
  { name: 'Cotizaciones', href: '/cotizaciones', icon: CalculatorIcon },
  { name: 'Facturacion', href: '/facturacion', icon: DocumentTextIcon },
  { name: 'Pagos', href: '/pagos', icon: BanknotesIcon },
  { name: 'Configuracion', href: '/configuracion', icon: Cog6ToothIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col bg-sidebar-bg">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
          JJ
        </div>
        <div>
          <p className="text-sm font-semibold text-white">JJ&A Graphics</p>
          <p className="text-xs text-sidebar-text">Sistema ERP</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-sidebar-text">JJ&A Graphics Peru</p>
        <p className="text-xs text-sidebar-text/60">v1.0.0</p>
      </div>
    </aside>
  )
}
