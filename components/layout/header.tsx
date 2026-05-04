'use client'

import { usePathname } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useMobileNav } from './shell'

const pageTitles: Record<string, string> = {
  '/': 'Inicio',
  '/clientes': 'Clientes',
  '/cotizaciones': 'Cotizaciones',
  '/facturacion': 'Facturacion',
  '/pagos': 'Pagos',
  '/configuracion': 'Configuracion',
  '/configuracion/materiales': 'Materiales',
  '/configuracion/mano-de-obra': 'Mano de Obra',
  '/configuracion/precios': 'Precios',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/clientes/nuevo')) return 'Nuevo Cliente'
  if (pathname.startsWith('/clientes/') && pathname.endsWith('/editar')) return 'Editar Cliente'
  if (pathname.startsWith('/clientes/')) return 'Detalle de Cliente'
  if (pathname.startsWith('/cotizaciones/nueva')) return 'Nueva Cotizacion'
  if (pathname.startsWith('/cotizaciones/')) return 'Detalle de Cotizacion'
  if (pathname.startsWith('/facturacion/nueva')) return 'Nueva Factura'
  if (pathname.startsWith('/facturacion/cuentas-por-cobrar')) return 'Cuentas por Cobrar'
  if (pathname.startsWith('/facturacion/')) return 'Detalle de Factura'
  return 'JJ&A Graphics'
}

export function Header() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const { toggle } = useMobileNav()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-card-bg px-4 sm:px-6">
      <button
        type="button"
        onClick={toggle}
        className="lg:hidden -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-border/50"
        aria-label="Abrir menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
        {title}
      </h1>
    </header>
  )
}
