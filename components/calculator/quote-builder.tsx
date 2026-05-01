'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalculatorShell } from './calculator-shell'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { SERVICE_TYPE_LABELS, IGV_RATE } from '@/lib/constants'
import { createQuote } from '@/lib/actions/quotes'
import { TrashIcon } from '@heroicons/react/24/outline'

interface QuoteItemDraft {
  serviceType: 'ESTAMPADO' | 'BLOCKS' | 'ANILLADO'
  description: string
  calcInput: Record<string, unknown>
  calcDetail: Record<string, unknown>
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface ClientOption {
  id: string
  label: string
}

interface Props {
  clients: ClientOption[]
}

export function QuoteBuilder({ clients }: Props) {
  const router = useRouter()
  const [clientId, setClientId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<QuoteItemDraft[]>([])
  const [saving, setSaving] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const igv = Math.round(subtotal * IGV_RATE * 100) / 100
  const total = Math.round((subtotal + igv) * 100) / 100

  function handleAddItem(item: QuoteItemDraft) {
    setItems((prev) => [...prev, item])
    toast.success('Item agregado a la cotizacion')
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!clientId) {
      toast.error('Selecciona un cliente')
      return
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un item')
      return
    }

    setSaving(true)
    try {
      const result = await createQuote(clientId, items, notes)
      if (result.success && result.data) {
        toast.success('Cotizacion creada exitosamente')
        router.push(`/cotizaciones/${result.data.id}`)
      } else {
        toast.error(result.error || 'Error al crear la cotizacion')
      }
    } catch {
      toast.error('Error al crear la cotizacion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Calculator */}
      <div>
        <CalculatorShell onAddItem={handleAddItem} />
      </div>

      {/* Right: Quote summary */}
      <div className="space-y-6">
        <Card>
          <h3 className="mb-4 text-base font-semibold">Datos de la Cotizacion</h3>
          <div className="space-y-4">
            <Select
              id="clientId"
              label="Cliente"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Seleccionar cliente..."
              options={clients.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Textarea
              id="notes"
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones para la cotizacion..."
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items ({items.length})</CardTitle>
          </CardHeader>

          {items.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">
              Usa la calculadora para agregar items
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge>{SERVICE_TYPE_LABELS[item.serviceType]}</Badge>
                      <span className="text-sm font-medium">{item.description}</span>
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-muted">
                      <span>Cant: {item.quantity}</span>
                      <span>Unit: {formatCurrency(item.unitPrice)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">
                      {formatCurrency(item.totalPrice)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="rounded p-1 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">IGV (18%)</span>
                <span className="font-mono">{formatCurrency(igv)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span>Total</span>
                <span className="font-mono text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </Card>

        {items.length > 0 && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={saving || !clientId}
          >
            {saving ? 'Guardando...' : 'Guardar Cotizacion'}
          </Button>
        )}
      </div>
    </div>
  )
}
