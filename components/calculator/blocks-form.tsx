'use client'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PAPER_SIZE_OPTIONS } from '@/lib/constants'
import type { BlocksInput } from '@/lib/calculator/types'

interface Props {
  value: BlocksInput
  onChange: (value: BlocksInput) => void
}

export function BlocksForm({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        id="blk-paperSize"
        label="Tamano de papel"
        value={value.paperSize}
        onChange={(e) => onChange({ ...value, paperSize: e.target.value as BlocksInput['paperSize'] })}
        options={PAPER_SIZE_OPTIONS.filter((o) => ['A4', 'A5', 'MEDIA_CARTA'].includes(o.value))}
      />
      <Input
        id="blk-quantity"
        label="Cantidad (unidades)"
        type="number"
        min={1}
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: Number(e.target.value) || 0 })}
      />
      <div className="flex flex-col gap-3 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.isColor}
            onChange={(e) => onChange({ ...value, isColor: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          A color (sin marcar = blanco y negro)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.doubleSided}
            onChange={(e) => onChange({ ...value, doubleSided: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Tira y Retira (doble cara)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.numbered}
            onChange={(e) => onChange({ ...value, numbered: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Numerado
        </label>
      </div>
    </div>
  )
}
