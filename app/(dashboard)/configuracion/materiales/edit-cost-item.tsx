'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateCostItemPrice } from '@/lib/actions/settings'
import { toast } from 'sonner'
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CostItemProps {
  item: {
    id: string
    name: string
    costType: string
    totalPrice: number | null
    quantityBase: number | null
    unitCost: number | null
    fixedCost: number | null
  }
}

export function EditCostItemButton({ item }: CostItemProps) {
  const [open, setOpen] = useState(false)
  const [totalPrice, setTotalPrice] = useState(item.totalPrice?.toString() || '')
  const [quantityBase, setQuantityBase] = useState(item.quantityBase?.toString() || '')
  const [unitCost, setUnitCost] = useState(item.unitCost?.toString() || '')
  const [fixedCost, setFixedCost] = useState(item.fixedCost?.toString() || '')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  // Auto-calculate unit cost when totalPrice or quantityBase changes
  function handleTotalPriceChange(val: string) {
    setTotalPrice(val)
    const tp = parseFloat(val)
    const qb = parseInt(quantityBase)
    if (tp && qb) {
      setUnitCost((tp / qb).toFixed(6))
    }
  }

  function handleQuantityBaseChange(val: string) {
    setQuantityBase(val)
    const tp = parseFloat(totalPrice)
    const qb = parseInt(val)
    if (tp && qb) {
      setUnitCost((tp / qb).toFixed(6))
    }
  }

  async function handleSave() {
    if (!reason.trim()) {
      toast.error('Ingresa el motivo del cambio')
      return
    }

    setSaving(true)
    try {
      const result = await updateCostItemPrice(item.id, {
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        quantityBase: quantityBase ? parseInt(quantityBase) : null,
        unitCost: unitCost ? parseFloat(unitCost) : null,
        fixedCost: fixedCost ? parseFloat(fixedCost) : null,
        reason,
      })

      if (result.success) {
        toast.success('Precio actualizado')
        setOpen(false)
        setReason('')
      } else {
        toast.error(result.error || 'Error al actualizar')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        <PencilIcon className="h-3.5 w-3.5" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border bg-card-bg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Editar: {item.name}</h3>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {item.costType === 'variable' ? (
            <>
              <Input
                id="edit-totalPrice"
                label="Precio Total (para base)"
                type="number"
                step="0.01"
                value={totalPrice}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
              />
              <Input
                id="edit-quantityBase"
                label="Cantidad Base"
                type="number"
                value={quantityBase}
                onChange={(e) => handleQuantityBaseChange(e.target.value)}
              />
              <Input
                id="edit-unitCost"
                label="Costo Unitario (calculado)"
                type="number"
                step="0.000001"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
              />
            </>
          ) : (
            <Input
              id="edit-fixedCost"
              label="Costo Fijo"
              type="number"
              step="0.01"
              value={fixedCost}
              onChange={(e) => setFixedCost(e.target.value)}
            />
          )}

          <Input
            id="edit-reason"
            label="Motivo del cambio"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Aumento de proveedor, ajuste de mercado..."
            required
          />

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
