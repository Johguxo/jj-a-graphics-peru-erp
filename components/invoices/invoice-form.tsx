'use client'

import { useActionState, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { createInvoice, type ActionResult } from '@/lib/actions/invoices'
import { formatCurrency } from '@/lib/utils'
import { IGV_RATE } from '@/lib/constants'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

interface ClientOption {
  id: string
  businessName: string
  documentNumber: string
  creditDays: number
}

interface QuoteOption {
  id: string
  quoteNumber: string
  clientId: string
  total: string
  items: {
    description: string
    quantity: number
    unitPrice: string
  }[]
}

interface ItemRow {
  description: string
  quantity: number
  unitPrice: number
}

interface Props {
  clients: ClientOption[]
  quotes: QuoteOption[]
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(base: string, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function InvoiceForm({ clients, quotes }: Props) {
  const [invoiceType, setInvoiceType] = useState<'BOLETA' | 'FACTURA'>('FACTURA')
  const [clientId, setClientId] = useState<string>('')
  const [quoteId, setQuoteId] = useState<string>('')
  const [issueDate, setIssueDate] = useState<string>(todayStr())
  const [dueDate, setDueDate] = useState<string>(todayStr())
  const [items, setItems] = useState<ItemRow[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ])

  const filteredQuotes = useMemo(
    () => (clientId ? quotes.filter((q) => q.clientId === clientId) : []),
    [clientId, quotes]
  )

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
      0
    )
    const sub = Math.round(subtotal * 100) / 100
    const igv = Math.round(sub * IGV_RATE * 100) / 100
    const total = Math.round((sub + igv) * 100) / 100
    return { subtotal: sub, igv, total }
  }, [items])

  function handleClientChange(id: string) {
    setClientId(id)
    setQuoteId('')
    const c = clients.find((x) => x.id === id)
    if (c) setDueDate(addDays(issueDate, c.creditDays || 0))
  }

  function handleQuoteChange(id: string) {
    setQuoteId(id)
    if (!id) return
    const q = quotes.find((x) => x.id === id)
    if (q) {
      setItems(
        q.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
        }))
      )
    }
  }

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    )
  }

  function addItem() {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(
    _prev: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    formData.set('items', JSON.stringify(items))
    return createInvoice(formData)
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger dark:bg-red-950">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comprobante</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            id="invoiceType"
            name="invoiceType"
            label="Tipo"
            value={invoiceType}
            onChange={(e) =>
              setInvoiceType(e.target.value as 'BOLETA' | 'FACTURA')
            }
            options={[
              { value: 'FACTURA', label: 'Factura' },
              { value: 'BOLETA', label: 'Boleta' },
            ]}
          />
          <Input
            id="series"
            name="series"
            label="Serie SUNAT"
            placeholder={invoiceType === 'FACTURA' ? 'E001' : 'B001'}
            defaultValue={invoiceType === 'FACTURA' ? 'E001' : 'B001'}
            required
          />
          <Input
            id="correlative"
            name="correlative"
            label="Correlativo"
            type="number"
            min={1}
            placeholder="1"
            required
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="clientId"
            name="clientId"
            label="Cliente"
            value={clientId}
            onChange={(e) => handleClientChange(e.target.value)}
            placeholder="Seleccionar cliente..."
            options={clients.map((c) => ({
              value: c.id,
              label: `${c.businessName} (${c.documentNumber})`,
            }))}
            required
          />
          <Select
            id="quoteId"
            name="quoteId"
            label="Cotizacion (opcional)"
            value={quoteId}
            onChange={(e) => handleQuoteChange(e.target.value)}
            placeholder={
              clientId
                ? filteredQuotes.length === 0
                  ? 'Sin cotizaciones aprobadas'
                  : 'Seleccionar cotizacion...'
                : 'Selecciona un cliente primero'
            }
            disabled={!clientId || filteredQuotes.length === 0}
            options={filteredQuotes.map((q) => ({
              value: q.id,
              label: `${q.quoteNumber} — ${formatCurrency(Number(q.total))}`,
            }))}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            id="issueDate"
            name="issueDate"
            type="date"
            label="Fecha de Emision"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            label="Fecha de Vencimiento"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <PlusIcon className="h-4 w-4" />
            Agregar
          </Button>
        </CardHeader>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-2 sm:grid-cols-[1fr_100px_140px_140px_auto] sm:items-end"
            >
              <Input
                label={index === 0 ? 'Descripcion' : undefined}
                value={item.description}
                onChange={(e) =>
                  updateItem(index, { description: e.target.value })
                }
                placeholder="Detalle del item"
                required
              />
              <Input
                label={index === 0 ? 'Cantidad' : undefined}
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, { quantity: Number(e.target.value) })
                }
                required
              />
              <Input
                label={index === 0 ? 'P. Unitario' : undefined}
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(index, { unitPrice: Number(e.target.value) })
                }
                required
              />
              <div className="text-sm font-mono text-right">
                {index === 0 && (
                  <span className="block text-xs font-sans font-medium text-foreground mb-2">
                    Total
                  </span>
                )}
                {formatCurrency(
                  (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                aria-label="Eliminar item"
              >
                <TrashIcon className="h-4 w-4 text-danger" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-border pt-4 text-right">
          <div className="flex justify-end gap-8 text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-mono w-32">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-end gap-8 text-sm">
            <span className="text-muted">IGV (18%)</span>
            <span className="font-mono w-32">{formatCurrency(totals.igv)}</span>
          </div>
          <div className="flex justify-end gap-8 text-lg font-bold border-t border-border pt-2">
            <span>Total</span>
            <span className="font-mono w-32 text-primary">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Observaciones, condiciones de pago, etc."
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Emitiendo...' : 'Emitir Comprobante'}
        </Button>
      </div>
    </form>
  )
}
