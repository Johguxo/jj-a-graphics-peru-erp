import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function createCostItemWithVersion(data: {
  serviceType: 'ESTAMPADO' | 'BLOCKS' | 'ANILLADO'
  name: string
  key: string
  costType: string
  totalPrice?: number
  quantityBase?: number
  unitCost?: number
  fixedCost?: number
  sortOrder?: number
}) {
  const item = await prisma.costItem.create({
    data: {
      serviceType: data.serviceType,
      name: data.name,
      key: data.key,
      costType: data.costType,
      totalPrice: data.totalPrice ?? null,
      quantityBase: data.quantityBase ?? null,
      unitCost: data.unitCost ?? null,
      fixedCost: data.fixedCost ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  })

  // Create initial version
  await prisma.costItemVersion.create({
    data: {
      costItemId: item.id,
      totalPrice: data.totalPrice ?? null,
      quantityBase: data.quantityBase ?? null,
      unitCost: data.unitCost ?? null,
      fixedCost: data.fixedCost ?? null,
      reason: 'Precio inicial',
    },
  })

  return item
}

async function main() {
  console.log('Seeding database...')

  // ═══ BLOCKS (Printing Blocks / Talonarios) ═══
  // Based on the user's exact pricing table
  const blocksItems = [
    { name: 'Impresion Tira y Retira', key: 'blocks_doble_impresion', costType: 'variable', totalPrice: 12, quantityBase: 1000, unitCost: 0.012 },
    { name: 'Impresion (una cara)', key: 'blocks_impresion', costType: 'variable', totalPrice: 6, quantityBase: 1000, unitCost: 0.006 },
    { name: 'Bond A4', key: 'blocks_bond_a4', costType: 'variable', totalPrice: 26, quantityBase: 1000, unitCost: 0.026 },
    { name: 'Bond A5', key: 'blocks_bond_a5', costType: 'variable', totalPrice: 13, quantityBase: 1000, unitCost: 0.013 },
    { name: 'Bond Media Carta', key: 'blocks_bond_media', costType: 'variable', totalPrice: 13, quantityBase: 1000, unitCost: 0.013 },
    { name: 'Corte', key: 'blocks_corte', costType: 'variable', totalPrice: 2, quantityBase: 1000, unitCost: 0.002 },
    { name: 'Empaquetado', key: 'blocks_empaquetado', costType: 'variable', totalPrice: 2, quantityBase: 500, unitCost: 0.004 },
    { name: 'Numerado', key: 'blocks_numerado', costType: 'variable', totalPrice: 3, quantityBase: 1000, unitCost: 0.003 },
    { name: 'Diseno', key: 'blocks_diseno', costType: 'fixed', fixedCost: 10 },
    { name: 'Placa', key: 'blocks_placa', costType: 'fixed', fixedCost: 5 },
    { name: 'Transporte', key: 'blocks_transporte', costType: 'fixed', fixedCost: 30 },
  ]

  for (let i = 0; i < blocksItems.length; i++) {
    await createCostItemWithVersion({
      serviceType: 'BLOCKS',
      ...blocksItems[i],
      sortOrder: i,
    })
  }

  // ═══ ESTAMPADO ═══
  const estampadoItems = [
    { name: 'Costo base por libro', key: 'estampado_base_libro', costType: 'variable', totalPrice: 5, quantityBase: 1, unitCost: 5 },
    { name: 'Logo', key: 'estampado_logo', costType: 'fixed', fixedCost: 15 },
    { name: 'Frase / Palabra', key: 'estampado_frase', costType: 'variable', totalPrice: 3, quantityBase: 1, unitCost: 3 },
    { name: 'Detalle de acabado (linea/decoracion)', key: 'estampado_detalle', costType: 'variable', totalPrice: 2, quantityBase: 1, unitCost: 2 },
    { name: 'Recargo tamano A3', key: 'estampado_recargo_a3', costType: 'fixed', fixedCost: 3 },
    { name: 'Recargo tamano A5', key: 'estampado_recargo_a5', costType: 'fixed', fixedCost: 0 },
    { name: 'Diseno', key: 'estampado_diseno', costType: 'fixed', fixedCost: 10 },
    { name: 'Transporte', key: 'estampado_transporte', costType: 'fixed', fixedCost: 30 },
  ]

  for (let i = 0; i < estampadoItems.length; i++) {
    await createCostItemWithVersion({
      serviceType: 'ESTAMPADO',
      ...estampadoItems[i],
      sortOrder: i,
    })
  }

  // ═══ ANILLADO (Double Ring Binding) ═══
  const anilladoItems = [
    { name: 'Impresion por hoja', key: 'anillado_impresion', costType: 'variable', totalPrice: 0.10, quantityBase: 1, unitCost: 0.10 },
    { name: 'Anillo pequeno (hasta 20mm)', key: 'anillado_anillo_peq', costType: 'variable', totalPrice: 1.50, quantityBase: 1, unitCost: 1.50 },
    { name: 'Anillo mediano (25-32mm)', key: 'anillado_anillo_med', costType: 'variable', totalPrice: 2.00, quantityBase: 1, unitCost: 2.00 },
    { name: 'Anillo grande (38mm+)', key: 'anillado_anillo_gra', costType: 'variable', totalPrice: 3.00, quantityBase: 1, unitCost: 3.00 },
    { name: 'Tapa (mica/cartulina)', key: 'anillado_tapa', costType: 'variable', totalPrice: 1.00, quantityBase: 1, unitCost: 1.00 },
    { name: 'Compaginado', key: 'anillado_compaginado', costType: 'variable', totalPrice: 0.05, quantityBase: 1, unitCost: 0.05 },
    { name: 'Recargo tamano A3', key: 'anillado_recargo_a3', costType: 'fixed', fixedCost: 2 },
    { name: 'Transporte', key: 'anillado_transporte', costType: 'fixed', fixedCost: 30 },
  ]

  for (let i = 0; i < anilladoItems.length; i++) {
    await createCostItemWithVersion({
      serviceType: 'ANILLADO',
      ...anilladoItems[i],
      sortOrder: i,
    })
  }

  // ═══ Pricing Config ═══
  await prisma.pricingConfig.createMany({
    data: [
      { key: 'default_margin', value: '30', label: 'Margen por defecto (%)' },
      { key: 'igv_rate', value: '18', label: 'Tasa de IGV (%)' },
      { key: 'factura_series', value: 'F001', label: 'Serie de Facturas' },
      { key: 'boleta_series', value: 'B001', label: 'Serie de Boletas' },
    ],
    skipDuplicates: true,
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
