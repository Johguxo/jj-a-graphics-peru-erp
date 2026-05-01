'use client'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BOOK_SIZE_OPTIONS } from '@/lib/constants'
import type { EstampadoInput } from '@/lib/calculator/types'

interface Props {
  value: EstampadoInput
  onChange: (value: EstampadoInput) => void
}

export function EstampadoForm({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        id="est-quantity"
        label="Cantidad de libros"
        type="number"
        min={1}
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: Number(e.target.value) || 0 })}
      />
      <Select
        id="est-bookSize"
        label="Tamano del libro"
        value={value.bookSize}
        onChange={(e) => onChange({ ...value, bookSize: e.target.value as EstampadoInput['bookSize'] })}
        options={BOOK_SIZE_OPTIONS}
      />
      <div className="flex items-center gap-3 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.includesLogo}
            onChange={(e) => onChange({ ...value, includesLogo: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Incluye logo
        </label>
      </div>
      <Input
        id="est-phrases"
        label="Cantidad de frases / palabras"
        type="number"
        min={0}
        value={value.phraseCount}
        onChange={(e) => onChange({ ...value, phraseCount: Number(e.target.value) || 0 })}
      />
      <Input
        id="est-details"
        label="Detalles de acabado (lineas, decoraciones)"
        type="number"
        min={0}
        value={value.detailCount}
        onChange={(e) => onChange({ ...value, detailCount: Number(e.target.value) || 0 })}
      />
    </div>
  )
}
