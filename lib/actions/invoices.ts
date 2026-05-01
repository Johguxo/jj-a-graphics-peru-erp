'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { IGV_RATE } from '@/lib/constants'
import {
  invoiceSchema,
  paymentSchema,
  type InvoiceItemInput,
} from '@/lib/validations/invoice'

export type ActionResult = {
  success: boolean
  error?: string
  data?: { id: string }
}

function buildInvoiceNumber(series: string, correlative: number): string {
  return `${series}-${String(correlative).padStart(8, '0')}`
}

function computeTotals(items: InvoiceItemInput[]) {
  const subtotal = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice,
    0
  )
  const subtotalRounded = Math.round(subtotal * 100) / 100
  const igv = Math.round(subtotalRounded * IGV_RATE * 100) / 100
  const total = Math.round((subtotalRounded + igv) * 100) / 100
  return { subtotal: subtotalRounded, igv, total }
}

export async function createInvoice(formData: FormData): Promise<ActionResult> {
  const rawItems = formData.get('items')
  let parsedItems: unknown = []
  if (typeof rawItems === 'string' && rawItems.length > 0) {
    try {
      parsedItems = JSON.parse(rawItems)
    } catch {
      return { success: false, error: 'Items invalidos' }
    }
  }

  const raw = {
    invoiceType: formData.get('invoiceType'),
    clientId: formData.get('clientId'),
    quoteId: formData.get('quoteId') || undefined,
    series: formData.get('series'),
    correlative: formData.get('correlative'),
    issueDate: formData.get('issueDate'),
    dueDate: formData.get('dueDate'),
    notes: formData.get('notes') || '',
    items: parsedItems,
  }

  const parsed = invoiceSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data = parsed.data
  const invoiceNumber = buildInvoiceNumber(data.series, data.correlative)

  const existing = await prisma.invoice.findUnique({
    where: { invoiceNumber },
  })
  if (existing) {
    return {
      success: false,
      error: `Ya existe un comprobante con el numero ${invoiceNumber}`,
    }
  }

  const { subtotal, igv, total } = computeTotals(data.items)

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceType: data.invoiceType,
      series: data.series,
      correlative: data.correlative,
      clientId: data.clientId,
      quoteId: data.quoteId || null,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      subtotal,
      igv,
      total,
      notes: data.notes || null,
      items: {
        create: data.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice:
            Math.round(item.quantity * item.unitPrice * 100) / 100,
          sortOrder: index,
        })),
      },
    },
  })

  revalidatePath('/facturacion')
  revalidatePath('/facturacion/cuentas-por-cobrar')
  redirect(`/facturacion/${invoice.id}`)
}

export async function addPayment(
  invoiceId: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = paymentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data = parsed.data

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })
  if (!invoice) return { success: false, error: 'Factura no encontrada' }
  if (invoice.status === 'ANULADA') {
    return { success: false, error: 'No se pueden registrar pagos en una factura anulada' }
  }

  const newPaid =
    Math.round((Number(invoice.amountPaid) + data.amount) * 100) / 100
  const total = Number(invoice.total)
  if (newPaid > total + 0.001) {
    return {
      success: false,
      error: 'El monto excede el saldo pendiente',
    }
  }

  let nextStatus = invoice.status
  if (newPaid >= total - 0.001) nextStatus = 'PAGADA'
  else if (newPaid > 0) nextStatus = 'PARCIAL'

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference || null,
        paymentDate: new Date(data.paymentDate),
        notes: data.notes || null,
      },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: { amountPaid: newPaid, status: nextStatus },
    }),
  ])

  revalidatePath('/facturacion')
  revalidatePath('/facturacion/cuentas-por-cobrar')
  revalidatePath(`/facturacion/${invoiceId}`)
  revalidatePath('/pagos')
  return { success: true }
}

export async function deletePayment(
  paymentId: string,
  invoiceId: string
): Promise<ActionResult> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) return { success: false, error: 'Pago no encontrado' }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })
  if (!invoice) return { success: false, error: 'Factura no encontrada' }

  const newPaid =
    Math.round((Number(invoice.amountPaid) - Number(payment.amount)) * 100) / 100
  const total = Number(invoice.total)
  let nextStatus = invoice.status
  if (invoice.status !== 'ANULADA') {
    if (newPaid <= 0.001) nextStatus = 'EMITIDA'
    else if (newPaid >= total - 0.001) nextStatus = 'PAGADA'
    else nextStatus = 'PARCIAL'
  }

  await prisma.$transaction([
    prisma.payment.delete({ where: { id: paymentId } }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: { amountPaid: Math.max(0, newPaid), status: nextStatus },
    }),
  ])

  revalidatePath('/facturacion')
  revalidatePath(`/facturacion/${invoiceId}`)
  revalidatePath('/pagos')
  return { success: true }
}

export async function voidInvoice(id: string): Promise<ActionResult> {
  await prisma.invoice.update({
    where: { id },
    data: { status: 'ANULADA' },
  })
  revalidatePath('/facturacion')
  revalidatePath('/facturacion/cuentas-por-cobrar')
  revalidatePath(`/facturacion/${id}`)
  return { success: true }
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  await prisma.invoice.delete({ where: { id } })
  revalidatePath('/facturacion')
  revalidatePath('/facturacion/cuentas-por-cobrar')
  redirect('/facturacion')
}
